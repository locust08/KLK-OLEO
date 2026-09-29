import test from "node:test";
import assert from "node:assert/strict";
import { mapResource } from "../src/lib/cms/resource-view-model";
import type { Media, Resource } from "../src/payload-types";
import { checkRelatedSites } from "../src/access";
import { Resources } from "../src/collections";

const pdf = { id: 1, isPublic: true, mimeType: "application/pdf", url: "/api/media/file/document.pdf" } as Media;
const cover = { id: 2, isPublic: true, mimeType: "image/webp", alt: "Actual document cover", url: "/api/media/file/cover.webp" } as Media;
const resource = { id: 1, slug: "brochure", title: "Brochure", type: "brochure", availability: "available", file: pdf, thumbnail: cover } as Resource;

test("resource cover comes from its thumbnail, independently of its PDF", () => {
  const mapped = mapResource(resource);
  assert.equal(mapped.imageUrl, cover.url);
  assert.equal(mapped.imageAlt, cover.alt);
  assert.equal(mapped.fileUrl, pdf.url);
});
test("public cover does not expose a private PDF download", () => {
  const mapped = mapResource({ ...resource, file: { ...pdf, isPublic: false } });
  assert.equal(mapped.imageUrl, cover.url);
  assert.equal(mapped.fileUrl, undefined);
});
test("private, missing and unpopulated thumbnails are not shown", () => {
  for (const thumbnail of [null, 2, { ...cover, isPublic: false }])
    assert.equal(mapResource({ ...resource, thumbnail }).imageUrl, undefined);
});
test("PDFs cannot act as thumbnails, and placeholder downloads stay hidden", () => {
  assert.equal(mapResource({ ...resource, thumbnail: pdf }).imageUrl, undefined);
  assert.equal(mapResource({ ...resource, availability: "placeholder" }).fileUrl, undefined);
});
test("reordering resources preserves their document-specific covers", () => {
  const second = { ...resource, id: 2, thumbnail: { ...cover, url: "/api/media/file/second.webp" } };
  assert.deepEqual([second, resource].map(mapResource).map((item) => item.imageUrl),
    ["/api/media/file/second.webp", cover.url]);
});

test("resource thumbnail relationships reject cross-site media", async () => {
  await assert.rejects(checkRelatedSites({
    data: { site: 1, thumbnail: 8 }, collection: { slug: "resources" },
    req: { payload: { findByID: async () => ({ site: 2 }) } },
  } as any), /thumbnail must belong to the same site/);
  await checkRelatedSites({
    data: { site: 1, thumbnail: 8 }, collection: { slug: "resources" },
    req: { payload: { findByID: async () => ({ site: 1 }) } },
  } as any);
});
test("resource thumbnail validation rejects PDFs and allows clearing the image", async () => {
  const hook = Resources.hooks!.beforeChange!.at(-1)!;
  await assert.rejects(Promise.resolve(hook({
    data: { availability: "placeholder", thumbnail: 8 },
    req: { payload: { findByID: async () => pdf } },
  } as any)), /thumbnails must be uploaded images/);
  const cleared = await hook({ data: { thumbnail: null }, originalDoc: { thumbnail: 8 },
    req: { payload: { findByID: async () => { throw new Error("No lookup expected"); } } },
  } as any);
  assert.equal(cleared.thumbnail, null);
});
