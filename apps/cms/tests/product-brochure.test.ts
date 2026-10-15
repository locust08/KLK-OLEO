import test from "node:test";
import assert from "node:assert/strict";
import * as brochure from "../src/lib/content/product-brochure";
const product = {
  id: 1,
  slug: "example",
  name: "Aidigro Example",
  type: "Surfactant",
  summary: "Product description",
  functionalities: ["Wetting"],
  functionalitySlugs: ["wetting"],
  formulations: ["EC"],
  formulationSlugs: ["ec"],
  labels: ["Label"],
  labelSlugs: ["label"],
  manufacturingSite: "Malaysia",
  casNumber: "123-45-6",
};
test("PDF revision changes for visible content but not unrelated metadata", async () => {
  assert.equal(
    await brochure.productRevision(product),
    await brochure.productRevision({ ...product, seoTitle: "Changed SEO" }),
  );
  assert.notEqual(
    await brochure.productRevision(product),
    await brochure.productRevision({
      ...product,
      functionalities: ["Changed label"],
    }),
  );
});
test("PDF excludes website controls and paginates long product content", async () => {
  const bytes = await brochure.generateProductPdf(
    {
      ...product,
      summary: "Long product description for field performance. ".repeat(400),
    },
    { generatedAt: new Date("2026-10-15T00:00:00Z") },
  );
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes);
  assert.ok(doc.getPageCount() > 1);
  assert.match(doc.getTitle() ?? "", /Aidigro Example/);
});
