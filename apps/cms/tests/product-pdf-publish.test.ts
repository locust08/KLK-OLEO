import assert from "node:assert/strict";
import test from "node:test";
import { buildConfig, getPayload } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { collections } from "../src/collections";
import { createProductPdfPublishHook } from "../src/lib/product-pdf/hooks";

test("real Payload publish hooks schedule new and updated publications, never draft-only edits", async () => {
  const sent: unknown[] = [];
  const env = { D1: { prepare() { return { bind() { return { async run() {} }; } }; } },
    PRODUCT_PDF_QUEUE: { async send(message: unknown) { sent.push(message); } } } as unknown as CloudflareEnv;
  const config = buildConfig({ secret: "isolated-product-pdf-publish-test-secret", admin: { user: "users" },
    db: sqliteAdapter({ client: { url: "file::memory:" }, push: true }),
    collections: collections.map((collection) => collection.slug === "products" ? {
      ...collection, hooks: { ...collection.hooks, afterChange: [createProductPdfPublishHook(async () => env)] },
    } : collection),
    typescript: { autoGenerate: false },
  });
  const payload = await getPayload({ config, key: "pdf-publish-test" });
  try {
    const main = await payload.create({ collection: "sites", data: { name: "Test parent", slug: "parent", kind: "main", domain: "https://example.com" }, overrideAccess: true });
    const site = await payload.create({ collection: "sites", data: { name: "Test", slug: "agrochemical", kind: "minisite", parentSite: main.id, domain: "https://example.com" }, overrideAccess: true });
    const product = await payload.create({ collection: "products", draft: true, data: { site: site.id, name: "PDF test", slug: "pdf-hook-test", chemicalDescription: "Chemical", description: "First published content", _status: "draft" }, overrideAccess: true });
    assert.equal(sent.length, 0);
    await payload.update({ collection: "products", id: product.id, data: { _status: "published" }, overrideAccess: true });
    assert.equal(sent.length, 1);
    await payload.update({ collection: "products", id: product.id, draft: true, data: { description: "Unpublished draft content", _status: "draft" }, overrideAccess: true });
    assert.equal(sent.length, 1, "draft edit must not queue regeneration");
    const published = await payload.findByID({ collection: "products", id: product.id, draft: false, overrideAccess: true });
    assert.equal(published.description, "First published content");
    await payload.update({ collection: "products", id: product.id, data: { description: "Latest published content", _status: "published" }, overrideAccess: true });
    assert.equal(sent.length, 2);
    const latest = await payload.findByID({ collection: "products", id: product.id, draft: false, overrideAccess: true });
    assert.equal(latest.description, "Latest published content");
  } finally { await payload.destroy(); }
});
