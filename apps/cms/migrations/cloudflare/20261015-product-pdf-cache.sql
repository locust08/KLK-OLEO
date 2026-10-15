-- Additive, independent of Payload's generated schema; no PDF binaries in D1.
CREATE TABLE IF NOT EXISTS product_pdf_cache (
  product_id INTEGER PRIMARY KEY,
  product_slug TEXT NOT NULL,
  content_version TEXT NOT NULL,
  template_version TEXT NOT NULL,
  published_revision TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','generating','ready','outdated','failed','unavailable')),
  object_key TEXT,
  ready_version TEXT,
  generated_at INTEGER,
  updated_at INTEGER NOT NULL,
  lease_token TEXT,
  lease_until INTEGER NOT NULL DEFAULT 0,
  queued_until INTEGER NOT NULL DEFAULT 0,
  retry_after INTEGER NOT NULL DEFAULT 0,
  error_code TEXT
);
CREATE INDEX IF NOT EXISTS product_pdf_cache_status ON product_pdf_cache(status, updated_at);
