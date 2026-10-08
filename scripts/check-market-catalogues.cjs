/* eslint-disable @typescript-eslint/no-unused-expressions -- playwright-cli evaluates this function directly. */
async (page) => {
  const counts = {};
  for (const [slug, expected] of Object.entries({ "beauty-personal-care": 143, "food-nutrition": 35, "home-care-industries-institutional-ii-cleaning": 84, "lubricants": 150, "polymers": 54 })) {
    await page.goto(`http://localhost:3001/markets/${slug}`);
    const catalogue = page.locator("#ingredient-catalogue");
    const status = catalogue.getByRole("status");
    if (!await status.textContent().then(text => text.startsWith(`${expected} ingredients`))) throw new Error(`${slug} ingredient count mismatch`);
    const initial = await catalogue.locator("article h3").first().textContent();
    await catalogue.getByRole("button", { name: "Next", exact: true }).click();
    if (initial === await catalogue.locator("article h3").first().textContent()) throw new Error(`${slug} pagination failed`);
    await catalogue.getByLabel("Search Ingredients", { exact: true }).fill("zzzz-no-matching-ingredient");
    if (await catalogue.locator("article").count()) throw new Error(`${slug} empty search failed`);
    await catalogue.getByRole("button", { name: "Clear filters" }).click();
    await catalogue.getByLabel("Functionality", { exact: true }).selectOption({ index: 1 });
    if (!await catalogue.locator("article").count()) throw new Error(`${slug} functionality filter failed`);
    await catalogue.getByRole("button", { name: "Clear filters" }).click();
    await catalogue.getByLabel("Application", { exact: true }).selectOption({ index: 1 });
    if (!await catalogue.locator("article").count()) throw new Error(`${slug} application filter failed`);
    await catalogue.getByRole("button", { name: "Clear filters" }).click();
    await catalogue.locator("article a").first().click();
    await page.waitForURL(/product-enquiry\?product=/);
    const ingredient = await page.locator('input[name="Requested Ingredient"]').inputValue();
    if (ingredient !== initial) throw new Error(`${slug} enquiry product wasn't carried across`);
    counts[slug] = expected;
  }
  return { ingredientCounts: counts, search: true, emptySearch: true, functionalityFilter: true, applicationFilter: true, pagination: true, productEnquiryPrefill: true };
}
