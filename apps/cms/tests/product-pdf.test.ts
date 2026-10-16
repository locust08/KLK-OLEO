import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import type { D1Database } from "@cloudflare/workers-types";
import { PdfCache, validPdf } from "../src/lib/product-pdf/cache";
import { downloadProductPdf, generateProductPdf } from "../src/lib/product-pdf/worker";
import { contentHash, pdfFilename, shouldSchedulePdf, type PdfSnapshot } from "../src/lib/product-pdf/version";

function fixture() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync(new URL("../migrations/cloudflare/20261015-product-pdf-cache.sql", import.meta.url), "utf8"));
  const db = { prepare(sql: string) {
    let params: Array<string | number | null> = [];
    const statement = {
      bind(...values: typeof params) { params = values; return statement; },
      async first() { return sqlite.prepare(sql).get(...params) ?? null; },
      async run() { const result = sqlite.prepare(sql).run(...params); return { meta: { changes: Number(result.changes) } }; },
    }; return statement;
  } } as unknown as D1Database;
  const source: PdfSnapshot = { productId: 1, slug: "aidigro-test", revision: "2026-10-15T00:00:00.000Z", version: "v1", templateVersion: "t1",
    product: { id: 1, slug: "aidigro-test", name: "Aidigro Test", type: "Chemical", summary: "Published description", functionalities: [], functionalitySlugs: [], formulations: [], formulationSlugs: [], labels: [], labelSlugs: [], manufacturingSite: "Europe", casNumber: "123" } };
  let current: PdfSnapshot | null = source;
  const objects = new Map<string, Uint8Array>();
  const sent: unknown[] = [];
  const env = { D1: db, NEXT_PUBLIC_SERVER_URL: "https://example.com", PDF_APP: { async fetch() { return Response.json(current, { status: current ? 200 : 404 }); } },
    PRODUCT_PDF_QUEUE: { async send(job: unknown) { sent.push(job); } },
    R2: {
      async get(key: string) { const bytes = objects.get(key); return bytes ? { body: new Blob([new Uint8Array(bytes).buffer]).stream() } : null; },
      async put(key: string, value: Uint8Array) { objects.set(key, value); },
      async delete(key: string) { objects.delete(key); },
    },
  } as unknown as CloudflareEnv;
  return { source, env, db, sqlite, objects, sent, cache: new PdfCache(db), setSource(value: PdfSnapshot | null) { current = value; } };
}
const pdf = new TextEncoder().encode("%PDF-1.7\nTest rendering");
const request = () => new Request("https://example.com/api/product-pdf/aidigro-test");

test("simultaneous cold downloads reserve exactly one queue job", async () => {
  const f = fixture();
  const responses = await Promise.all(Array.from({ length: 20 }, () => downloadProductPdf(request(), f.env, f.source.slug)));
  assert.ok(responses.every((response) => response.status === 202));
  assert.equal(f.sent.length, 1);
  assert.equal((await f.cache.get(1))?.object_key, null);
  f.sqlite.close();
});

test("generated PDFs are reused with attachment and no-store headers", async () => {
  const f = fixture(); let renders = 0;
  await generateProductPdf(f.env, { slug: f.source.slug }, async () => { renders++; return pdf; });
  await generateProductPdf(f.env, { slug: f.source.slug }, async () => { renders++; return pdf; });
  const response = await downloadProductPdf(request(), f.env, f.source.slug);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Disposition"), 'attachment; filename="Aidigro-Test.pdf"');
  assert.match(response.headers.get("Cache-Control")!, /no-store/);
  assert.equal(await response.text(), new TextDecoder().decode(pdf));
  assert.equal(renders, 1);
  assert.equal(f.objects.size, 1);
  f.sqlite.close();
});

test("a newer publication immediately blocks the old brochure, retaining its file until success", async () => {
  const f = fixture();
  await generateProductPdf(f.env, { slug: f.source.slug }, async () => pdf);
  const oldKey = (await f.cache.get(1))!.object_key!;
  f.setSource({ ...f.source, revision: "2026-10-15T01:00:00.000Z", version: "v2" });
  assert.equal((await downloadProductPdf(request(), f.env, f.source.slug)).status, 202);
  assert.ok(f.objects.has(oldKey));
  await generateProductPdf(f.env, { slug: f.source.slug }, async () => pdf);
  assert.equal((await f.cache.get(1))!.ready_version, "v2");
  assert.ok(!f.objects.has(oldKey));
  f.sqlite.close();
});

test("publishing during rendering prevents promotion of older content", async () => {
  const f = fixture();
  await assert.rejects(generateProductPdf(f.env, { slug: f.source.slug }, async () => {
    f.setSource({ ...f.source, version: "v2", revision: "2026-10-15T01:00:00.000Z" }); return pdf;
  }), /PRODUCT_CHANGED/);
  assert.equal(f.objects.size, 0);
  assert.equal((await f.cache.get(1))!.status, "failed");
  f.sqlite.close();
});

test("concurrent consumers render once, and duplicate deliveries can retry", async () => {
  const f = fixture(); let renders = 0;
  const results = await Promise.allSettled(Array.from({ length: 8 }, () => generateProductPdf(f.env, { slug: f.source.slug }, async () => { renders++; return pdf; })));
  assert.equal(renders, 1);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal((await f.cache.get(1))!.status, "ready");
  f.sqlite.close();
});

test("expired lease tokens and older snapshots cannot overwrite a newer cache version", async () => {
  const f = fixture();
  await f.cache.observe(f.source);
  assert.ok(await f.cache.claim(f.source, "expired"));
  f.sqlite.exec("UPDATE product_pdf_cache SET lease_until=0");
  assert.ok(await f.cache.claim(f.source, "replacement"));
  assert.equal(await f.cache.complete(f.source, "expired", "wrong.pdf"), false);
  const newer = { ...f.source, version: "v2", revision: "2026-10-15T01:00:00.000Z" };
  await f.cache.observe(newer);
  await f.cache.observe(f.source);
  assert.equal((await f.cache.get(1))!.content_version, "v2");
  assert.equal(await f.cache.complete(f.source, "replacement", "wrong.pdf"), false);
  f.sqlite.close();
});

test("generation failure preserves the old object internally and is safely retryable", async () => {
  const f = fixture();
  await generateProductPdf(f.env, { slug: f.source.slug }, async () => pdf);
  const oldKey = (await f.cache.get(1))!.object_key!;
  f.setSource({ ...f.source, version: "v2", revision: "2026-10-15T01:00:00.000Z" });
  await assert.rejects(generateProductPdf(f.env, { slug: f.source.slug }, async () => { throw new Error("Browser failed"); }));
  assert.ok(f.objects.has(oldKey));
  assert.equal((await downloadProductPdf(request(), f.env, f.source.slug)).status, 202);
  await generateProductPdf(f.env, { slug: f.source.slug }, async () => pdf);
  assert.equal((await f.cache.get(1))!.status, "ready");
  f.sqlite.close();
});

test("missing R2 objects regenerate and unpublished or missing products never return cached files", async () => {
  const f = fixture();
  await generateProductPdf(f.env, { slug: f.source.slug }, async () => pdf);
  f.objects.clear();
  assert.equal((await downloadProductPdf(request(), f.env, f.source.slug)).status, 202);
  f.setSource(null);
  assert.equal((await downloadProductPdf(request(), f.env, f.source.slug)).status, 404);
  await generateProductPdf(f.env, { slug: f.source.slug });
  assert.equal((await f.cache.get(1))!.status, "unavailable");
  f.sqlite.close();
});

test("a publication during cached R2 reads is detected before download", async () => {
  const f = fixture();
  await generateProductPdf(f.env, { slug: f.source.slug }, async () => pdf);
  const get = f.env.R2.get.bind(f.env.R2);
  f.env.R2.get = (async (key: string) => { f.setSource({ ...f.source, version: "v2", revision: "2026-10-15T01:00:00.000Z" }); return get(key); }) as typeof f.env.R2.get;
  assert.equal((await downloadProductPdf(request(), f.env, f.source.slug)).status, 202);
  assert.equal((await f.cache.get(1))!.content_version, "v2");
  f.sqlite.close();
});

test("R2 upload failure never promotes a cache entry", async () => {
  const f = fixture();
  f.env.R2.put = (async () => { throw new Error("R2 secret details"); }) as typeof f.env.R2.put;
  await assert.rejects(generateProductPdf(f.env, { slug: f.source.slug }, async () => pdf));
  assert.equal((await f.cache.get(1))!.ready_version, null);
  assert.equal((await f.cache.get(1))!.error_code, "GENERATION_FAILED");
  f.sqlite.close();
});

test("D1 and source failures expose only a generic unavailable state", async () => {
  const f = fixture();
  f.sqlite.close();
  const response = await downloadProductPdf(request(), f.env, f.source.slug);
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes("database"));
});

test("template changes invalidate otherwise identical PDF content", async () => {
  const f = fixture();
  await generateProductPdf(f.env, { slug: f.source.slug }, async () => pdf);
  assert.equal(validPdf(await f.cache.get(1), { ...f.source, templateVersion: "t2" }), false);
  f.setSource({ ...f.source, templateVersion: "t2", version: "template-v2" });
  assert.equal((await downloadProductPdf(request(), f.env, f.source.slug)).status, 202);
  f.sqlite.close();
});

test("drafts are excluded and content, image and template changes alter fingerprints", async () => {
  assert.equal(shouldSchedulePdf({ _status: "draft" }, false), false);
  assert.equal(shouldSchedulePdf({ _status: "published" }, true), false);
  assert.equal(shouldSchedulePdf({ _status: "published" }, "true"), false);
  assert.equal(shouldSchedulePdf({ _status: "published" }, false), true);
  assert.notEqual(await contentHash({ text: "old" }), await contentHash({ text: "new" }));
  assert.notEqual(await contentHash({ imageRevision: 1 }), await contentHash({ imageRevision: 2 }));
  assert.equal(pdfFilename('bad"\r\nslug'), "bad---slug.pdf");
});
