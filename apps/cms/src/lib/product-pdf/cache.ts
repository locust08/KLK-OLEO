import type { D1Database } from "@cloudflare/workers-types";
import type { PdfSnapshot } from "./version";

export type PdfCacheRow = {
  product_id: number;
  product_slug: string;
  content_version: string;
  template_version: string;
  published_revision: string;
  status: string;
  object_key: string | null;
  ready_version: string | null;
  generated_at: number | null;
  updated_at: number;
  lease_token: string | null;
  lease_until: number;
  queued_until: number;
  retry_after: number;
  error_code: string | null;
};

export function validPdf(
  row: PdfCacheRow | null,
  snapshot: PdfSnapshot,
): row is PdfCacheRow & { object_key: string } {
  return Boolean(
    row &&
    row.status === "ready" &&
    row.object_key &&
    row.content_version === snapshot.version &&
    row.ready_version === snapshot.version &&
    row.template_version === snapshot.templateVersion,
  );
}

export class PdfCache {
  constructor(private db: D1Database) {}
  async get(id: number) {
    return this.db
      .prepare("SELECT * FROM product_pdf_cache WHERE product_id = ?")
      .bind(id)
      .first<PdfCacheRow>();
  }
  async observe(source: PdfSnapshot) {
    const now = Date.now();
    // Never let a delayed older snapshot reset a more recent published revision.
    await this.db
      .prepare(
        `INSERT INTO product_pdf_cache
      (product_id, product_slug, content_version, template_version, published_revision, status, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
      ON CONFLICT(product_id) DO UPDATE SET product_slug=excluded.product_slug,
        content_version=excluded.content_version, template_version=excluded.template_version,
        published_revision=excluded.published_revision, status='outdated', updated_at=excluded.updated_at,
        lease_token=NULL, lease_until=0, queued_until=0, retry_after=0, error_code=NULL
      WHERE excluded.published_revision >= product_pdf_cache.published_revision
        AND (excluded.content_version != product_pdf_cache.content_version OR excluded.template_version != product_pdf_cache.template_version)`,
      )
      .bind(
        source.productId,
        source.slug,
        source.version,
        source.templateVersion,
        source.revision,
        now,
      )
      .run();
    return this.get(source.productId);
  }
  async reserveQueue(source: PdfSnapshot) {
    const now = Date.now();
    return (
      (
        await this.db
          .prepare(
            `UPDATE product_pdf_cache SET queued_until=?, updated_at=?
      WHERE product_id=? AND content_version=? AND queued_until<? AND retry_after<=?
      AND (status!='generating' OR lease_until<?) AND (status!='ready' OR ready_version!=content_version)`,
          )
          .bind(
            now + 120_000,
            now,
            source.productId,
            source.version,
            now,
            now,
            now,
          )
          .run()
      ).meta.changes > 0
    );
  }
  async releaseQueue(id: number, version: string) {
    await this.db
      .prepare(
        "UPDATE product_pdf_cache SET queued_until=0 WHERE product_id=? AND content_version=?",
      )
      .bind(id, version)
      .run();
  }
  async claim(source: PdfSnapshot, token: string) {
    const now = Date.now();
    return (
      (
        await this.db
          .prepare(
            `UPDATE product_pdf_cache SET status='generating', lease_token=?, lease_until=?, updated_at=?
      WHERE product_id=? AND content_version=? AND (lease_token IS NULL OR lease_until<?)
      AND (status!='ready' OR ready_version!=content_version)`,
          )
          .bind(
            token,
            now + 180_000,
            now,
            source.productId,
            source.version,
            now,
          )
          .run()
      ).meta.changes > 0
    );
  }
  async complete(source: PdfSnapshot, token: string, key: string) {
    return (
      (
        await this.db
          .prepare(
            `UPDATE product_pdf_cache SET status='ready', object_key=?, ready_version=?,
      generated_at=?, updated_at=?, lease_token=NULL, lease_until=0, queued_until=0, retry_after=0, error_code=NULL
      WHERE product_id=? AND content_version=? AND lease_token=?`,
          )
          .bind(
            key,
            source.version,
            Date.now(),
            Date.now(),
            source.productId,
            source.version,
            token,
          )
          .run()
      ).meta.changes > 0
    );
  }
  async fail(source: PdfSnapshot, token: string, code: string) {
    await this.db
      .prepare(
        `UPDATE product_pdf_cache SET status='failed', error_code=?, updated_at=?, retry_after=?,
      lease_token=NULL, lease_until=0, queued_until=0 WHERE product_id=? AND content_version=? AND lease_token=?`,
      )
      .bind(
        code,
        Date.now(),
        Date.now() + 60_000,
        source.productId,
        source.version,
        token,
      )
      .run();
  }
  async missingObject(source: PdfSnapshot) {
    await this.db
      .prepare(
        `UPDATE product_pdf_cache SET status='outdated', updated_at=?, queued_until=0
      WHERE product_id=? AND content_version=?`,
      )
      .bind(Date.now(), source.productId, source.version)
      .run();
  }
}
