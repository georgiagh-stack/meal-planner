const express = require("express");
const cors = require("cors");
const https = require("https");
const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");
const { chromium } = require("playwright");
const { loginToSainsburys, addItemToTrolley } = require("./automation");

const app = express();
app.use(cors());
app.use(express.json());

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set as environment variables");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { transport: ws },
});

// Reject requests that don't carry the shared secret
function requireSecret(req, res, next) {
  const secret = process.env.BOT_SECRET;
  if (secret && req.headers["x-bot-secret"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/health", (_req, res) => res.json({ ok: true }));

// Resolve a hostname to an IP via Google's DoH JSON API, connecting by IP so
// we never touch the broken system DNS resolver inside Railway's container.
// Follows CNAME chains automatically (groceries.sainsburys.co.uk uses Akamai).
function resolveViaDoH(hostname, depth = 0) {
  if (depth > 5) return Promise.reject(new Error("CNAME chain too deep"));
  return new Promise((resolve, reject) => {
    const path = `/resolve?name=${encodeURIComponent(hostname)}&type=A`;
    const req = https.get(
      { hostname: "8.8.8.8", path, headers: { Host: "dns.google" } },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            const json = JSON.parse(raw);
            const answers = json.Answer || [];
            const aRecord = answers.find((r) => r.type === 1);
            if (aRecord) {
              resolve(aRecord.data);
              return;
            }
            // Follow CNAME chain if present
            const cnames = answers.filter((r) => r.type === 5);
            if (cnames.length > 0) {
              const target = cnames[cnames.length - 1].data.replace(/\.$/, "");
              console.log(`DoH following CNAME ${hostname} → ${target}`);
              resolveViaDoH(target, depth + 1).then(resolve).catch(reject);
            } else {
              console.warn(`DoH no A record for ${hostname}, status=${json.Status}, answers=${JSON.stringify(answers).slice(0, 200)}`);
              reject(new Error(`No A record for ${hostname}`));
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.setTimeout(8000, () => { req.destroy(); reject(new Error("DoH timeout")); });
    req.on("error", reject);
  });
}

// POST /shop
// Body: { items: [{ text, status, section }] }
// Returns: { runId } immediately — processing continues in background
app.post("/shop", requireSecret, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items array required" });
  }

  const initialItems = items.map((item) => ({ ...item, status: "pending" }));

  const { data, error } = await supabase
    .from("shop_runs")
    .insert({ items: initialItems, run_status: "running" })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ runId: data.id });

  // Process in background after responding
  processRun(data.id, initialItems).catch(console.error);
});

async function processRun(runId, items) {
  let browser;

  try {
    // Pre-resolve sainsburys hostnames via DoH (connecting to 8.8.8.8 by IP so
    // we never touch Railway's broken system DNS resolver).
    const hostsToResolve = [
      "groceries.sainsburys.co.uk",
      "account.sainsburys.co.uk",
    ];
    const resolverRules = [];
    for (const host of hostsToResolve) {
      try {
        const ip = await resolveViaDoH(host);
        resolverRules.push(`MAP ${host} ${ip}`);
        console.log(`DoH resolved ${host} → ${ip}`);
      } catch (err) {
        console.warn(`DoH failed for ${host}: ${err.message}`);
      }
    }

    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        ...(resolverRules.length > 0
          ? [`--host-resolver-rules=${resolverRules.join(", ")}`]
          : []),
      ],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
    });

    // Mask webdriver flag to reduce bot detection
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    const page = await context.newPage();

    await loginToSainsburys(
      page,
      process.env.SAINSBURYS_EMAIL,
      process.env.SAINSBURYS_PASSWORD
    );

    const updatedItems = [...items];

    for (let i = 0; i < items.length; i++) {
      const result = await addItemToTrolley(page, items[i].text);
      updatedItems[i] = {
        ...items[i],
        status: result.success ? "success" : "error",
        error: result.error,
      };

      await supabase
        .from("shop_runs")
        .update({ items: updatedItems })
        .eq("id", runId);
    }

    await supabase
      .from("shop_runs")
      .update({ run_status: "complete" })
      .eq("id", runId);

    console.log(`Run ${runId} complete`);
  } catch (err) {
    console.error(`Run ${runId} failed:`, err.message);
    await supabase
      .from("shop_runs")
      .update({ run_status: "failed" })
      .eq("id", runId);
  } finally {
    if (browser) await browser.close();
  }
}

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Sainsbury's bot listening on port ${PORT}`));
