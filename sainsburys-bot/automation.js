// ─── Sainsbury's browser automation ──────────────────────────────────────────
// If selectors break after a Sainsbury's website update, the functions below
// are the only things you need to change. Each uses text/role selectors which
// are more resilient than CSS class names.

const GROCERIES_URL = "https://groceries.sainsburys.co.uk";
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

async function loginToSainsburys(page, email, password) {
  await page.goto(GROCERIES_URL, { waitUntil: "domcontentloaded", timeout: 20000 });
  await acceptCookies(page);

  if (await isLoggedIn(page)) return;

  // Navigate to sign-in page
  await page.goto(SIGNIN_URL, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(1000);

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

  // Wait until we're back on the groceries domain
  try {
    await page.waitForURL(`**${GROCERIES_URL}**`, { timeout: 15000 });
  } catch {
    await page.waitForLoadState("networkidle", { timeout: 15000 });
  }

  await acceptCookies(page);
}

async function addItemToTrolley(page, itemText) {
  const term = cleanSearchTerm(itemText);

  try {
    await page.goto(
      `${GROCERIES_URL}/search?query=${encodeURIComponent(term)}`,
      { waitUntil: "domcontentloaded", timeout: 20000 }
    );
    await page.waitForTimeout(800);

    // Try to find the first "Add to trolley" button on the page
    const addBtn = page.locator(
      'button:has-text("Add to trolley"), button[aria-label*="Add to trolley"], [data-test-id*="add-to-trolley"]'
    ).first();

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
