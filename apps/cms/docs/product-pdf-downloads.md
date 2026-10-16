# Product brochure PDFs

The existing **Request Brochure** label, classes, placement and responsive sizing are retained. Its click now fetches a same-origin PDF attachment and downloads `<product-name>.pdf`. There is no external viewer or redirect. A busy state polls pending generation for up to two minutes; unavailable products and failures show a short message without exposing storage keys or server errors.

## Architecture and freshness

- `GET /api/product-pdf/:slug` is intercepted by `cloudflare-worker.ts`. Only published products on the active Agrochemicals site are eligible. The public cache never uses source fixtures or authenticated draft content. Authorized drafts use `/api/products/:slug/brochure` with a marked, uncached render of the same print layout.
- The internal HTTP service binding `PDF_APP` invokes the same deployed Next application to obtain uncached published content. Its public source routes contain only already-public product content, never credentials or object keys.
- D1 `product_pdf_cache` stores product ID/slug, published revision, content and template versions, status, active R2 key, timestamps, queue reservations, render leases, retry timing and a safe error code. It stores no PDF binary.
- R2 uses private application keys under `product-pdfs/<id>/<template>/<content>/<lease-token>.pdf`, in the existing media bucket. These files are not added to Payload's public Media collection.
- A unique D1 row plus conditional queue reservations and 180-second token leases prevent duplicate rendering of the same version. Queue delivery can repeat; only the lease owner can promote a result.
- Each request reads the current published snapshot. Cache hits recheck it after reading R2, then stream the attachment with `Cache-Control: private, no-store, max-age=0`. No R2 URL or public immutable download URL is exposed. Missing files schedule repair. A stale file is never intentionally used as a fallback.
- Render jobs verify the print page's version and read the current publication again before upload and promotion. A changed/unpublished product cancels promotion. Conditional version/token updates fence late or expired workers. The previous object remains internally available through failure and is deleted only after successful promotion.
- Published product `afterChange` hooks invalidate metadata and enqueue a delayed regeneration. Draft saves are excluded. Related published taxonomy/media edits enqueue affected products. Navigation and unrelated page edits have no product hook.
- An hourly Queue reconciliation at minute 17 repairs missed jobs, exhausted retries and expired leases, and discovers template changes. Unchanged ready versions skip Browser Rendering entirely. Deleted/unpublished products are blocked immediately by source checks, regardless of retained internal metadata/files.
- `scripts/build-cloudflare.mjs` automatically fingerprints `ProductDetailPage.tsx`, the shared contact banner markup/background asset, frontend CSS/layout and local fonts into `NEXT_PUBLIC_PRODUCT_PDF_TEMPLATE_VERSION`. This is a public build identifier, not a secret. A new deployment invalidates old template PDFs at download time and schedules eager replacement on the next hourly reconciliation.

## Rendering

Cloudflare Browser Rendering uses `@cloudflare/puppeteer` against `/products/product/:slug/print`. That route reuses `ProductDetailPage` with `printOnly`, rather than maintaining a second content template. It omits site chrome, breadcrumbs and both product action buttons. The Contact Us banner is explicitly included at the end following user confirmation, with an absolute website Contact link. Its markup is shared with the website banner. Fonts, product images and the banner background must load successfully; product image URLs include their media revision to avoid stale browser assets. Third-party scripts/requests are blocked by the renderer.

Print CSS and Puppeteer agree on A4 portrait with 15mm margins, background printing and disabled browser headers/footers. The application profile is a semantic two-column table: category labels at left, values at right. Print typography retains Poppins, product colours and the metadata table. Rows, images and the complete contact banner avoid breaks; paragraphs can paginate with widow/orphan control. No fixed-height page container truncates long content. These presentation changes apply only to the PDF; the website retains its existing three-panel application layout.

## Files

Modified:

- `cloudflare-worker.ts`: download, Queue and scheduled handlers.
- `wrangler.jsonc`, `src/cloudflare-runtime.d.ts`: new bindings/runtime type aliases.
- `cloudflare-env.d.ts`: Wrangler-generated binding types, included with the implementation.
- `package.json`, `package-lock.json`: Cloudflare Puppeteer only.
- `scripts/build-cloudflare.mjs`: template fingerprint.
- `src/collections.ts`: preserve configured hooks and register product/related-content hooks.
- `src/lib/cms/queries.ts`: export the existing product view-model mapper.
- `src/components/products/ProductDetailPage.tsx`: shared print mode, PDF attribute table and download control.
- `src/components/layout/ContactBanner.tsx`: wraps shared unchanged website banner markup.
- `src/app/(frontend)/layout.tsx`: print/control stylesheet import.

Created:

- `src/lib/product-pdf/{version,published,cache,worker,hooks}.ts`.
- `src/components/products/ProductBrochureButton.tsx`.
- `src/components/layout/ContactBannerContent.tsx`: shared website/PDF banner markup.
- `src/app/(frontend)/product-print.css`.
- `src/app/(frontend)/products/product/[product]/print/page.tsx`.
- `src/app/(frontend)/api/product-pdf/[slug]/route.ts` (plain Next development unavailable response).
- `src/app/(frontend)/api/product-pdf-source/route.ts` and `[slug]/route.ts`.
- `migrations/cloudflare/20261015-product-pdf-cache.sql`.
- `tests/product-pdf.test.ts` and `tests/product-pdf-publish.test.ts`.

## Provision and deploy

Existing bindings/resources reused: D1 `agrochemicals`, R2 `agrochemicals-media`, existing `PAYLOAD_SECRET` and `NEXT_PUBLIC_SERVER_URL`.

New bindings:

| Binding | Purpose |
| --- | --- |
| `BROWSER` | Cloudflare Browser Rendering, Puppeteer |
| `PRODUCT_PDF_QUEUE` | Producer/consumer queue `agrochemicals-product-pdfs` |
| `PDF_APP` | HTTP service binding to `agrochemicals`, for current published snapshots |

The retry dead-letter queue is `agrochemicals-product-pdfs-dlq`. Consumer batch size is 1, concurrency 2, with four configured retries and per-message exponential delay. Failures log correlation via product/version; inspect Queue/DLQ and Worker logs if retries repeatedly fail.

From `apps/cms`, authenticate Wrangler to the existing account, then provision once:

```powershell
npx wrangler queues create agrochemicals-product-pdfs-dlq
npx wrangler queues create agrochemicals-product-pdfs
npx wrangler d1 execute agrochemicals --remote --file migrations/cloudflare/20261015-product-pdf-cache.sql
```

The SQL is additive/idempotent and independent of Payload migrations; no existing collection tables are altered. The two queues and D1 table were provisioned during implementation. Do not recreate existing queues on later deploys.

For subsequent releases:

```powershell
npm ci
npm run types:cloudflare
npm run typecheck
npm test
npm run build:cloudflare
npx wrangler deploy --dry-run
npm run deploy:cloudflare
```

Provide the existing Payload secret through the build environment as usual; do not commit it or change the deployed runtime secret. No new credentials or browser API token are required: the Worker uses bindings. Keep Browser Rendering/Queues available on the Cloudflare account. If application origin or Worker name changes, update `NEXT_PUBLIC_SERVER_URL` and `PDF_APP` together.

## Validation and limits

- The reconciled branch has 74 passing tests, including a real isolated Payload/SQLite publish → draft-save → republish test, the three PDF table rows and the approved contact banner/link. Concurrency/failure tests run the actual cache SQL against SQLite, with R2, Queue and browser boundaries simulated.
- Playwright verified unchanged button geometry at 1440, 768 and 390 pixels, the pending-to-download interaction, attachment filename, unavailable state and no redirect.
- Local Chromium generated and inspected one-page and five-page A4 samples from published QA products using the shared print route; required content was extracted and site chrome/action text was absent. QA products were removed afterward.
- Initial implementation Cloudflare deployment completed: Worker version `f091628f-a9bf-4400-bbbd-c043319184d8`.
- A real production button click on Aidigro EM1225 queued generation, transitioned D1 from `generating` to `ready`, and downloaded `aidigro-em1225.pdf` without navigating away. The actual Cloudflare/Chromium output is one-page A4 portrait, 20,998 bytes; extracted text includes name, chemical description, application attributes, manufacturing site and CAS number, with no site chrome or actions.
- A repeated production HTTP download returned identical bytes, correct attachment/content-type/no-store headers and an unchanged D1 `generated_at` timestamp, proving cache reuse without a second render.
- CMS publication/draft behaviour was verified against real isolated Payload/SQLite operations with the Queue boundary simulated. Existing live product content was not changed for this test.
- Table/banner refinement: local A4 samples with an unusually large product image produced two pages (short content) and five pages (stress content); the banner remained whole and the contact link was present as a PDF URI annotation. Website checks at 1440/768/390px confirmed the PDF table did not replace the website panels and the website contact banner was neither duplicated nor changed.
- The table/banner refinement is deployed and production-verified. The first EM1225 download returned HTTP 202, withholding the old cached template, then the actual button downloaded the newly rendered file. D1 is `ready` with template `6c964d9ed3b6cffba25c`. The updated production PDF is one A4 portrait page (1,433,799 bytes), visually inspected with the two-column application table and complete contact banner; its URI annotation points to `https://agrochemicals.easondev.workers.dev/contact`. Product action buttons and website chrome remain excluded.

Plain `npm run dev` has no Cloudflare browser/Queue/D1 bindings and intentionally shows an unavailable state. Test actual generation on the deployed Worker; the print route itself can be tested locally with real published CMS records. Draft fixture catalogue entries cannot produce production brochures.

Failures retain the preceding file internally, never as a downloadable fallback. A crash between R2 upload and metadata promotion can leave an unreferenced versioned object; an operator may remove such objects after comparing their keys against D1. Do not attach an age-only R2 lifecycle policy to this prefix, because an older unchanged PDF can still be current. Extremely tall individual images/rows must fit the printable page to stay unbroken; image height is capped at 90mm. Local PDF stress tests used a large original image, producing approximately 12MB PDFs; file size depends on CMS assets.

## CMS integration reconciliation

The source digest also includes CMS interface copy and the shared CMS contact banner, including media revisions. Public reads force published-only context even when the caller has a preview cookie. Draft render requests forward only the authorized same-origin request context and bypass browser caching. Preview deployment uses isolated `agrochemicals-cms-preview-pdfs` and `agrochemicals-cms-preview-pdfs-dlq` queues and its own PDF_APP binding. Preview skips eager publication regeneration and has no scheduled trigger; on-demand downloads still enqueue. Production configuration retains eager regeneration and its scheduled repair.

The production observations above describe the inherited main implementation, not a production deployment of this integration. Current integration verification and release limitations are recorded in `docs/cms-integration-verification.md` at repository root.
