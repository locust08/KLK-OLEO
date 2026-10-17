import test from "node:test";
import assert from "node:assert/strict";
import { Pages } from "../src/collections";

test("pages expose named section fields instead of relying on positional text arrays", () => {
  const field = Pages.fields.find((f) => "name" in f && f.name === "content");
  assert.ok(field && field.type === "group", "missing structured page content");
  if (field.type !== "group") return;
  for (const key of [
    "introduction",
    "capabilities",
    "innovations",
    "finder",
    "faq",
    "contact",
    "agriculture",
    "brandStory",
    "research",
    "globalPresence",
  ]) {
    assert.ok(
      field.fields.some((f) => "name" in f && f.name === key),
      `missing ${key}`,
    );
  }
});
import { publicationErrors, safeEditorialLink } from "../src/lib/content/model";
test("publication rejects missing required copy and image while allowing disabled optional sections", () => {
  assert.ok(
    publicationErrors(
      "home",
      { heading: "Home", image: 1 },
      { introduction: { enabled: true, heading: "About" } },
    ).some((e) => e.includes("body")),
  );
  assert.ok(
    publicationErrors(
      "home",
      { heading: "Home", image: 1 },
      { introduction: { enabled: true, heading: "About", body: "Text" } },
    ).some((e) => e.includes("image")),
  );
  assert.deepEqual(
    publicationErrors(
      "resources",
      { heading: "Resources", image: 1 },
      {
        introduction: {
          enabled: true,
          heading: "Materials",
          body: "Request materials",
        },
      },
    ),
    [],
  );
});
test("links reject script, protocol-relative, invented routes and backslash redirects", () => {
  for (const value of [
    "javascript:alert(1)",
    "//evil.test",
    "/invented",
    "/\\evil.test",
    "https://user:pass@example.com",
  ])
    assert.equal(safeEditorialLink(value), false, value);
  for (const value of [
    "/products/product/example",
    "/contact?product=1",
    "https://www.klkoleo.com",
    "mailto:agrochem@klkoleo.com",
  ])
    assert.equal(safeEditorialLink(value), true, value);
});
import { contentReferences } from "../src/lib/content/guards";
import { pageContentField } from "../src/lib/content/fields";
test("hidden optional section references do not prevent publication or leave false usages", () => {
  const refs = contentReferences([pageContentField], {
    content: {
      capabilities: { enabled: false, items: [{ image: 12 }] },
      introduction: { enabled: true, image: 13 },
    },
  });
  assert.deepEqual(refs, [
    { collection: "media", id: 13, path: "content.introduction.image" },
  ]);
});
test("ownership site is not a content dependency", () => {
  assert.deepEqual(
    contentReferences(
      [{ name: "site", type: "relationship", relationTo: "sites" }],
      { site: 1 },
    ),
    [],
  );
});
test("internal links only accept implemented template routes", () => {
  assert.equal(safeEditorialLink("/products/made-up"), false);
  assert.equal(safeEditorialLink("/products/category/made-up"), false);
  assert.equal(safeEditorialLink("/products/category/formulation-type"), true);
});
