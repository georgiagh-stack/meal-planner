#!/usr/bin/env node
// Run this on your Mac to process a pending Sainsbury's shop run.
// Usage: node shop-local.js
// Opens a visible Chrome window — you log in manually, then it adds all items automatically.

require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const readline = require("readline");
const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");
const { chromium } = require("playwright");
const { addItemToTrolley } = require("./automation");

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in sainsburys-bot/.env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { transport: ws },
});

function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(prompt, () => { rl.close(); resolve(); }));
}

async function main() {
  const { data: runs, error } = await supabase
    .from("shop_runs")
    .select("*")
    .eq("run_status", "running")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Supabase error:", error.message);
    process.exit(1);
  }
  if (!runs?.length) {
    console.log("No pending shop runs found. Click 'Start Sainsbury's shop' in the app first.");
    process.exit(0);
  }

  const run = runs[0];
  console.log(`\nFound run ${run.id} — ${run.items.length} items\n`);

  let browser;
  try {
    const SESSION_FILE = require("path").join(__dirname, ".sainsburys-session.json");
    const fs = require("fs");

    const contextOptions = {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      ...(fs.existsSync(SESSION_FILE) && { storageState: SESSION_FILE }),
    };

    browser = await chromium.launch({ headless: false, channel: "chrome" });
    const context = await browser.newContext(contextOptions);
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });

    const page = await context.newPage();
    await page.goto("https://www.sainsburys.co.uk", { waitUntil: "domcontentloaded" });

    // Check if already logged in (session file worked)
    const loggedIn = await page.locator(
      '[data-testid="header-my-account"], [aria-label*="My account"], a[href*="my-account"]'
    ).count() > 0;

    if (!loggedIn) {
      console.log("=".repeat(60));
      console.log("Please sign in to Sainsbury's in the browser window.");
      console.log("Come back here and press Enter once you're logged in.");
      console.log("(You'll only need to do this once — session will be saved.)");
      console.log("=".repeat(60));
      await waitForEnter("\nPress Enter when you're logged in > ");

      // Save session so next run skips login
      await context.storageState({ path: SESSION_FILE });
      console.log("Session saved — you won't need to log in next time.\n");
    } else {
      console.log("Already logged in (using saved session).\n");
    }

    console.log("\nStarting to add items...\n");

    const updatedItems = [...run.items];

    for (let i = 0; i < run.items.length; i++) {
      const item = run.items[i];
      process.stdout.write(`[${i + 1}/${run.items.length}] ${item.text} ... `);
      const result = await addItemToTrolley(page, item.text);
      updatedItems[i] = { ...item, status: result.success ? "success" : "error", error: result.error };
      console.log(result.success ? "✓" : `✗ (${result.error})`);

      await supabase.from("shop_runs").update({ items: updatedItems }).eq("id", run.id);
    }

    await supabase.from("shop_runs").update({ run_status: "complete" }).eq("id", run.id);
    console.log("\nAll done! Your trolley is ready.");
  } catch (err) {
    console.error("\nFailed:", err.message);
    await supabase.from("shop_runs").update({ run_status: "failed" }).eq("id", run.id);
  } finally {
    if (browser) await browser.close();
  }
}

main();
