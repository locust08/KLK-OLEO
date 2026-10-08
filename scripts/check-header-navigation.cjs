/* eslint-disable @typescript-eslint/no-unused-expressions -- playwright-cli evaluates this function directly. */
async (page) => {
  page.setDefaultNavigationTimeout(120000);
  await page.setViewportSize({ width: 940, height: 764 });
  await page.goto("http://localhost:3001/", { waitUntil: "domcontentloaded" });
  const language = page.getByLabel("Change language", { exact: true });
  for (const [name, path, code] of [["Deutsch", "/de", "DE"], ["中文", "/cn", "中文"], ["English", "/", "EN"]]) {
    await language.click();
    await page.locator("header details").getByRole("link", { name, exact: true }).click();
    await page.waitForURL(`http://localhost:3001${path}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(code => document.querySelector('[aria-label="Change language"]').textContent.trim() === code, code);
    if (await language.locator("..").getAttribute("open") !== null) throw new Error("Language menu did not close");
  }
  const widths = [320, 390, 640, 940, 1280, 1440, 1920];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForFunction(() => Object.keys(document.querySelector('[aria-controls="mobile-navigation"]')).some(key => key.startsWith("__reactProps")));
    if (await page.getByRole("button", { name: "Open navigation", exact: true }).isVisible()) {
      await page.getByRole("button", { name: "Open navigation", exact: true }).click();
      const menu = page.getByRole("navigation", { name: "Mobile navigation", exact: true });
      await menu.locator("summary").filter({ hasText: "Markets" }).click();
      const list = menu.locator("details").filter({ has: page.locator("summary").filter({ hasText: "Markets" }) });
      if (await list.locator("li a").count() !== 7) throw new Error("Missing mobile market category");
      await list.getByRole("link", { name: "Food & Nutrition", exact: true }).click();
      await page.waitForURL("**/markets/food-nutrition", { waitUntil: "domcontentloaded" });
      if (await page.getByRole("button", { name: "Close navigation", exact: true }).count()) throw new Error("Mobile menu didn't close after selection");
    } else {
      const menu = page.getByRole("navigation", { name: "Primary navigation", exact: true });
      await menu.getByRole("link", { name: "Markets", exact: true }).hover();
      const category = menu.getByRole("link", { name: "Food & Nutrition", exact: true });
      await category.waitFor({ state: "visible" });
      await category.click();
      await page.waitForURL("**/markets/food-nutrition", { waitUntil: "domcontentloaded" });
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (overflow) throw new Error(`Horizontal overflow at ${width}`);
    await page.goto("http://localhost:3001/", { waitUntil: "domcontentloaded" });
  }
  return { languageCodes: ["EN", "DE", "中文"], marketCategories: 7, widths, navigation: "passed" };
}
