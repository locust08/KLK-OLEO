import test from "node:test";
import assert from "node:assert/strict";
import * as seo from "../src/lib/content/seo";
test("metadata defaults derive from visible content and canonical retains the existing path", () => {
  const result = seo.contentMetadata(
    {
      title: "Products",
      heroHeading: "Published heading",
      heroBody: "Published body",
    },
    "/products",
    "https://agrochemicals.example",
  );
  assert.equal(result.title, "Published heading");
  assert.equal(result.description, "Published body");
  assert.deepEqual(result.alternates, {
    canonical: "https://agrochemicals.example/products",
  });
});
