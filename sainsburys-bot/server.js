const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { chromium } = require("playwright");
const { loginToSainsburys, addItemToTrolley } = require("./automation");

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Reject requests that don't carry the shared secret
function requireSecret(req, res, next) {
  const secret = process.env.BOT_SECRET;
  if (secret && req.headers["x-bot-secret"] !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/health", (_req, res) => res.json({ ok: true }));

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
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
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
