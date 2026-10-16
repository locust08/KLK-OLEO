# Agrochemical CMS integration — preview handover

Implementation is on `codex/cms-frontend-integration`, based on `44af96b`. The user authorized implementation on 15 October 2026, preserving the current design and limiting frontend changes to Agrochemical. Production activation requires approval of the verified preview. No production database write, production deployment, or main-branch push has been performed.

Preview: https://agrochemicals-cms-preview-20261015.easondev.workers.dev

Verified Worker version: `83ccaf87-df28-46ff-8aec-ebc8d7e63942`. Final public smoke checks returned 200 with rendered content and noindex on all five core pages, a product detail and all three category routes.

The preview has its own Worker, D1 database and R2 bucket. It contains public content, one disposable test administrator, and zero customer enquiries. Original account records and credentials were removed before importing the preview database. Preview responses have `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`.

## Field-to-screen coverage

| CMS source | Rendered consumer |
| --- | --- |
| Pages → hero heading, eyebrow, body, image/mobileImage | Fixed Home/About/Products/Resources/Contact heroes |
| Home → content.introduction | About introduction heading, body, bullets, image, CTA |
| Home → content.capabilities | Four What We Do cards, headings, bodies and images |
| Home → content.innovations | Image, two curated cards, labels, descriptions and selected-product destinations |
| Home → content.finder | Heading/body, three category cards and selected functionality destinations, CTA |
| Home → content.faq | Ordered FAQ questions and answers |
| Home → content.contact | Image, heading, copy and CTA |
| About → content.agriculture | Agriculture Solutions image, heading and paragraphs |
| About → content.brandStory | Brand Story image, heading and paragraphs |
| About → content.research | Three images, three headings/descriptions |
| About → content.globalPresence | Section visibility/heading; existing shared Map Locations remain authoritative |
| Products/Resources/Contact → content.introduction | Page introduction heading/body |
| Site Presentation → brandName/contactEmail | Header branding, footer branding and contact links |
| Site Presentation → navigation | Header/dropdown labels, destinations, order and external target behavior |
| Site Presentation → footer | Logo, description, social link, quick/product/legal links and order |
| Site Presentation → catalogue | Category names, optional descriptions (explicit showDescription toggle) |
| Site Presentation → copy | Named interface labels for search, catalogue filters/counts/pagination, product information/actions, forms, resources and empty/success/loading/error states |
| Products → name, chemicalDescription, description, image | Product rows, detail page and generated brochure |
| Product Functions/Formulation Types/Regulatory Labels | Filter options, taxonomy descriptions, selected values and detail/PDF labels |
| Products → manufacturingSite/casNumber/resources | Populated technical fields and related resource links |
| Products → brochureEnabled | Immediate PDF generation action, separate from resource requests |
| Resources → title/thumbnail/availability/file | Four-column resource library, previews, request availability; private source PDF remains protected |
| Forms → consentLabel/successMessage | Contact/resource consent and receipt wording; routing/validation remain fixed |
| Pages/Products → seo | Title, description, social image, canonical; optional defaults derive from visible content |
| Media → alt/mobile selection/customCrop/focal coordinates | Accessible media and optional custom focal positioning; template crop retained unless explicitly enabled |

Section order, layouts, card geometry/hover styles, animations, filter algorithms, security errors, required form fields, country values, map symbols, and computed copyright year remain code-controlled. Text fields are plain text and do not accept arbitrary HTML. Optional sections can be disabled; required sections and fixed card counts are enforced at publication.

Public reads use published snapshots. An authenticated, site-assigned editor can enter draft preview from the CMS Preview action and exit via the preview bar. Site Presentation drafts are included. Draft pages/PDFs are marked and excluded from indexing. Editors save drafts; publishers/administrators publish. Shared-record changes apply independently to published consumers. Dependency errors identify published records that must be adjusted before unpublishing/deleting referenced content.

## Migration evidence

The final additive SQL migration was applied to a fresh copy of the production export, followed by the content backfill with schema push disabled. Foreign-key checks passed. Counts were preserved: 99 products, 4 resources, 2 sites, 5 forms, 1 original user, 0 existing leads. All 8 original media IDs, filenames, object keys, site assignments and visibility values were unchanged. New approved template assets and PDF variants are additional records.

A separate regression fixture proved that a published page and its pending draft retain independent titles, SEO and section text after backfill. The backfill can be rerun; an explicit blank/null/false in already integrated content is preserved.

Products and Contact had unpublished CMS records while their public routes rendered approved template defaults. Migration creates their approved public baseline and restores their existing draft separately. Home migration resolves legacy Banner/Page precedence to retain the displayed hero heading. The private migration difference report must be reviewed before activation; GA2425 source claims remain flagged rather than silently corrected. The Resource introduction retains existing CMS wording, including its current “will be added” sentence despite the four available records; this is preserved editorial copy, not a generated empty state.

Exports, SQLite copies, test credentials and detailed reports are under private temporary storage, outside Git. Do not commit them. The preview export is sanitized; never use it as production data.

## Verification

- 49 regression tests passed, including publication rules, safe links, section counts, migration merge semantics, metadata defaults, PDF revisions/pagination, and existing responsive/catalogue checks.
- 14 real Payload checks passed against the isolated migrated copy: public/draft isolation, editor/publisher boundaries, required content, core page protection, referenced media/product protection, Site Presentation drafts, other-site denial and anonymous user denial.
- 10 additional real safeguards passed: private PDF resources, regenerated image bytes after replacement, invalid variant rejection, published brochure image replacement/variant-removal protection, validation-marker bypass rejection and redirect site scope.
- Type checking and the optimized Cloudflare build passed. The isolated Worker also generated a five-page Poppins PDF with an image. Public/draft HTTP checks use disposable fixtures in scripts/verify-editorial-preview.mjs.
- Home, About, Products, Resources, Contact and Product Detail were checked at 320, 390, 768, 1023, 1024, 1199, 1200, 1440 and 1920px: no horizontal overflow or broken loaded images. Desktop About image/text heights match; smaller widths stack. Resource enquiry dialog opens and product filtering resolves the selected functionality.
- Resource requests still require manual follow-up; no automatic email or PDF delivery was added.

Cloudflare HTTP acceptance passed with cookie-based authentication: anonymous preview entry is denied, published pages exclude pending draft text, authorized draft page/PDF include it, private artwork is denied anonymously and embedded successfully in authorized draft PDFs, and exit-preview clears preview mode. Disposable product/media fixtures were deleted. A generated image brochure spans five A4 pages; the first/last pages and a normal product brochure were rendered and visually inspected.

## Brochure operation

Cloudflare brochures now use the reconciled Browser Rendering implementation and shared print layout. Public PDFs use published-only snapshots and D1/Queue/R2 caching; authenticated draft PDFs render directly, visibly marked, and never enter the public cache. Both include CMS interface copy and the CMS contact banner in their version digest. Product-name attachment filenames are retained. Website chrome and product action buttons are omitted. The approved contact banner/link remains in the PDF.

The older pdf-lib renderer and PNG/JPEG conversion guidance apply only to the local Node fallback. Cloudflare renders browser-supported artwork directly and requires its images/fonts to load successfully. Browser Rendering and Queue usage are subject to the Cloudflare account's service limits.

## Production cutover and rollback — approval required

1. Obtain approval of this preview and any content differences. Keep the KLK OLEO main frontend outside the deployment.
2. Take a fresh production D1 export and record Worker version, bindings, deployment configuration and R2 inventory. Keep secrets out of logs. Pause editorial writes and intake briefly for the final snapshot, or implement/reconcile an explicit delta before switching bindings; never overwrite enquiries received after the snapshot.
3. Apply `apps/cms/migrations/cloudflare/20261015-editorial-integration.sql` to an isolated copy of that fresh export. Run the backfill with `CMS_SCHEMA_PUSH=0` and an explicit local SQLite path. Run dry-run first, inspect differences, then `--apply`. Never enable automatic schema push against production.
4. Import the verified, unsanitized result into a new production D1 database using parent-first foreign-key ordering; keep the old database intact for rollback. Preview accounts/fixtures must not enter it. Upload only new approved assets to production R2, retaining original object keys/files.
5. Recheck users/roles/sites/leads/relationships, published and draft snapshots, media identities, catalogue totals, foreign keys and representative private files. Point only the Agrochemical Worker to the new database, retain its production authentication secret, omit CMS_PREVIEW, and build with the production origin.
6. Deploy the approved revision; verify public pages, admin sign-in, real published changes on next load, draft privacy, resource/contact intake and product PDFs. Reopen intake and editorial writes after smoke checks.
7. Rollback: restore the recorded Worker version and old D1 binding. Reconcile any new enquiries or accepted editorial writes from the new database before rollback/reopening; do not discard post-cutover data. Retain additive assets until no version references them. Do not blindly reverse schema or restore an old database over live writes.

Production cutover, backup reconciliation, and rollback execution have not been performed; they are release actions following approval, not preview claims.

## Reproduce checks

From `apps/cms`:

- `node --import tsx --test tests/*.test.ts`
- `npm run typecheck` and `npm run build:cloudflare` (with the intended preview origin set)
- `scripts/verify-editorial-integration.ts`, `scripts/verify-editorial-safeguards.ts`, and `scripts/verify-editorial-migration.ts` require an explicit isolated SQLite rehearsal database and secret; they refuse Cloudflare/production execution.
- `TEST_SERVER_URL=https://agrochemicals-cms-preview-20261015.easondev.workers.dev node scripts/verify-editorial-preview.mjs` requires preview-only test credentials in environment. It refuses production origins and creates/deletes disposable product/media fixtures.

Do not use the old seed-oriented HTTP smoke script as this release's acceptance test: it expects the former three placeholder resources, whereas this database has four real resource records.

## Homepage publishing correction — 15 October 2026

The first preview's homepage publication exceeded D1's 100 bound-parameter limit: Payload generated a 67-column insert/upsert with the same values bound again in the conflict-update clause (134 bindings). Product-only runtime publishing tests did not cover this case. The D1 adapter now references identical inserted values through SQLite `excluded` columns, retaining the existing update semantics without duplicate bindings. It does not modify dependency files or schema.

Regression: the 67-column query failed the new parameter-limit test before the fix; afterward all 51 tests and typecheck/build passed. The expanded isolated-preview smoke test creates and updates a full homepage-shaped record, including nested sections/arrays, then deletes the fixture. Existing private-image/draft/PDF checks also pass. The actual saved homepage edit was published through the CMS UI, its status became Published, and the changed body appeared on frontend reload. Production remains unchanged. Corrected preview Worker version: `22fe1966-c663-46d5-b58c-48ae623d56a2`.

## Main reconciliation — 15 October 2026

Reconciled `origin/main` at `c304cbec4b9f5f2f0a372cbfcae6bfb7a8610ca5` into the integration branch. Retained CMS-backed content, draft privacy, the D1 homepage publishing fix, and main's responsive artwork, contact layout, product filters/attribute links, British catalogue wording and shared browser PDF layout. No KLK OLEO main frontend changes were introduced. Empty navigation has no hardcoded fallback: publication requires a nonempty CMS menu.

Verified isolated preview Worker: `38d4b2b2-df0b-4458-8f73-a65f27d508d9`. All 74 tests, typecheck and Cloudflare build pass. Fresh read-only review found no remaining critical blockers. Actual Cloudflare checks passed full homepage-shaped publication, a 3,869,166-byte seven-page product PDF, authenticated draft PDF with private artwork, anonymous private-file rejection, published-content isolation and preview exit. Main pages were checked at mobile/tablet/desktop widths without horizontal overflow; Contact was checked across nine widths from 320 through 1920. Filter search “Anti Drift” selects the matching filter and returns two products.

Preview reconciliation updated 76 eligible records, preserving independent edits and the current homepage wording. Private API snapshots were taken before these content changes. A fresh full D1 export attempt failed with Cloudflare authorization error 10000; no successful fresh database export is claimed. Schema changes were additive. Preview uses its own PDF queues and self-service binding; eager publish regeneration and scheduled reconciliation are disabled there, while on-demand generation remains enabled.

For a fresh migration, apply the editorial integration SQL, `20261015-reconcile-main.sql` (tablet artwork columns), and the idempotent `20261015-product-pdf-cache.sql`. The preview-only `reconcile-preview-main.mjs` snapshots content and updates baseline-matching fields without overwriting independent editorial changes. Production cutover still requires its fresh backup/reconciliation and user approval. This reconciliation did not deploy production or push GitHub main.
