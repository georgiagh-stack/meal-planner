// ─── Sainsbury's browser automation ──────────────────────────────────────────
// If selectors break after a Sainsbury's website update, the functions below
// are the only things you need to change. Each uses text/role selectors which
// are more resilient than CSS class names.

const GROCERIES_URL = "https://www.sainsburys.co.uk";
const SIGNIN_URL = "https://account.sainsburys.co.uk/signin";

// Strip leading quantities so "200g jasmine rice" → "jasmine rice" for search
function cleanSearchTerm(text) {
  return text
    .replace(/\(.*?\)/g, "")                                                              // remove (parenthetical notes)
    .replace(/,.*$/, "")                                                                   // remove ", chopped" etc after comma
    .replace(/^\d+\s*(×\s*)?\s*[\d./]*\s*(g|ml|kg|L|tbsp|tsp|oz|lb)?\s*/i, "")          // remove leading measurements
    .replace(/^(half|quarter|small\s+bunch\s+of|large\s+bunch\s+of|small|large)\s+/i, "") // remove fraction/size words
    .trim();
}

async function acceptCookies(page) {
  try {
    await page.click("#onetrust-accept-btn-handler", { timeout: 4000 });
    await page.waitForTimeout(500);
  } catch {
    // Banner not present — fine
  }
}

async function isLoggedIn(page) {
  try {
    // Sainsbury's shows a "My account" link or similar when logged in
    await page.waitForSelector(
      '[data-testid="header-my-account"], [aria-label*="My account"], a[href*="my-account"]',
      { timeout: 3000 }
    );
    return true;
  } catch {
    return false;
  }
}

async function gotoWithRetry(page, url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000, ...options });
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Navigation to ${url} failed (attempt ${i + 1}), retrying...`);
      await page.waitForTimeout(3000);
    }
  }
}

async function loginToSainsburys(page, email, password) {
  await gotoWithRetry(page, GROCERIES_URL);
  await acceptCookies(page);

  if (await isLoggedIn(page)) return;

  // Click the sign-in link on the homepage rather than hardcoding a URL
  try {
    await page.click(
      'a[href*="signin"], a[href*="login"], a[href*="userLogin"], a:has-text("Sign in"), a:has-text("Log in")',
      { timeout: 8000 }
    );
  } catch {
    // Fallback: try direct URL patterns
    for (const url of [
      `${GROCERIES_URL}/gol-ui/userLoginView`,
      `${GROCERIES_URL}/signin`,
      SIGNIN_URL,
    ]) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        const hasForm = await page.locator('input[type="email"], input[type="password"]').count();
        if (hasForm > 0) break;
      } catch { /* try next */ }
    }
  }

  await page.waitForTimeout(1500);

  // Email step
  await page.fill('input[type="email"], input[name="email"], input[id*="email"]', email);
  await page.waitForTimeout(300);

  try {
    // Some flows split email and password across two screens
    await page.click('button:has-text("Continue"), button:has-text("Next")', { timeout: 3000 });
    await page.waitForTimeout(1500);
  } catch {
    // Single-screen form — just fall through to password
  }

  // Password step
  await page.fill('input[type="password"]', password);
  await page.waitForTimeout(300);
  await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")');

  await page.waitForLoadState("networkidle", { timeout: 20000 });
  await acceptCookies(page);
}

async function addItemToTrolley(page, itemText) {
  const term = cleanSearchTerm(itemText);

  try {
    await gotoWithRetry(page, `${GROCERIES_URL}/gol-ui/SearchResults/${encodeURIComponent(term)}`);
    await page.waitForTimeout(800);

    const landedUrl = page.url();
    const pageTitle = await page.title();
    console.log(`  [debug] searched "${term}" → ${landedUrl} | title: ${pageTitle}`);

    // Wait a bit longer for the React page to finish rendering products
    await page.waitForTimeout(1200);

    // Button text is just "Add" on the current Sainsbury's site
    const addBtn = page.locator('button:text-is("Add")').first();

    if ((await addBtn.count()) === 0) {
      return { success: false, error: "Not found" };
    }

    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();
    await page.waitForTimeout(600);

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message.split("\n")[0] };
  }
}

module.exports = { loginToSainsburys, addItemToTrolley, cleanSearchTerm };
