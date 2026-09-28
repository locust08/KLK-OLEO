# KLK OLEO web-design and content-mapping specification

## Authority and purpose

You are receiving this file without conversational context. Treat it as the controlling specification for mapping the supplied KLK OLEO content into a redesigned website. The original crawl is evidence only. The normalized files in this handoff directory control structure, record identity, relationships, and placement.

When instructions conflict, use this order: this specification → `cms/shared-cms-requirements.json` → `information-architecture.json` → `component-content-map.json` → collection records → original crawl evidence. The scope reconciliation below supersedes the earlier Markets exclusion.

## Required outcome

Build the main corporate website and its market minisites using one shared backend CMS with mandatory RBAC. Preserve approved source copy and manage repeatable material through site-scoped collections. Static-page records are a content classification, not a requirement for a separate CMS or hardcoded editorial copy. Do not silently rewrite claims, dates, product names, certifications, addresses, or metrics. Do not fill missing data by inference.

## Product boundary

The main Products catalogue contains these eight families; market catalogues are separately scoped within the same CMS:

1. Amides → `/products/amides/`
2. Anionic Surfactants → `/products/anionic-surfactants/`
3. Esters → `/products/esters/`
4. Fatty Acids → `/products/fatty-acids/`
5. Fatty Alcohols → `/products/fatty-alcohols/`
6. Glycerine → `/products/glycerine/`
7. Nonionic Surfactants → `/products/nonionic-surfactants/`
8. Phytonutrients → `/products/phytonutrients/`

The legacy normalized snapshot contains 26 brand records linked from those family pages. Markets, market landing pages, taxonomies, and market product records are now in scope as subsidiary minisites. Include Markets discovery in the global navigation. The old snapshot omitted market pages and stripped embedded market links: this is a recovery gap, not an instruction to remove Markets. Restore only reviewed links to mapped destinations.

## Reconciled shared-CMS architecture

Approved clarification: there is exactly one backend CMS for the main website and every market minisite, and RBAC is mandatory. `cms/shared-cms-requirements.json` is the machine-readable architecture contract. A minisite is a distinct website section with its own content and configuration, not a separate CMS installation.

- Model each market as a `sites` record whose parent is the main site. Give it its own navigation, layout, catalogue, filter configuration, resources, and forms.
- Display global navigation plus market-specific second-tier navigation. Resolve routes through the approved site registry. The agrochemical brief specifies `/agrochemical`; the current preview at `/` does not implement that mounting.
- Keep main product families/brands distinct from market ingredients/products. Cross-link only through reviewed relationships, never name matching or inferred taxonomy.
- Isolate each market's filtering and configuration while retaining the shared CMS. Test that changes to one market do not alter another; separate CMS installations are not the requested isolation mechanism.
- Enforce server-side access by role, operation, and explicit assigned sites. Main-site access does not implicitly grant subsidiary access. Add section-level grants where the approved permission matrix requires them; these are not implemented by the initial app.
- Preserve the six current roles: super admin, site admin, editor, publisher, lead manager, and viewer. Editors save drafts; publication requires a publication role. Only super admins manage role assignments and routing configuration.
- Support one customer enquiry containing products from multiple markets. Resolve product ownership and routing on the server; sales teams see only authorized market items and lead data. This workflow must not bypass ordinary content isolation.

The existing Payload app in `../apps/cms` provides initial site hierarchy, site-scoped roles, and 99 agrochemical product records. Full market content, configurable layouts/filters, cross-market enquiries, conditional routing, CRM delivery, gated downloads, localization, and remaining main-site collections are pending. Stored routing rules are not executed, and CRM mode returns a service-unavailable response. Do not present this architecture contract as completed functionality.

The source inventory was pruned under the old scope. The legacy crawl script still excludes market paths and product/category sitemaps: revise that capture scope before recovering market content and do not run `--prune-markets` for this reconciled project. This handoff update does not perform a new crawl or restore missing source records.

## Information architecture

The definitive hierarchy is in `information-architecture.json`. Use its `primary_navigation` as the default redesign navigation. It is a recommended design default rather than evidence of client approval, so preserve paths for other retained pages unless `migration-decisions.csv` provides a destination.

## Template and component rules

- `page-templates.json` defines default component slots, not a compulsory identical design for every brand or market. Market-specific layouts may vary through approved CMS configuration.
- `component-content-map.json` defines exact CMS field-to-component bindings.
- A component may bind only to named fields. Do not recover missing values from unrelated prose.
- Optional components should be omitted when their bound content is empty.
- Related records must resolve through IDs in `relationships.json` or explicit `*_ids` arrays.
- Use `asset_ids` to resolve media through `assets/asset-manifest.csv`; do not choose unrelated media by filename similarity.

## CMS collections

`cms/schemas.json` describes legacy migration-record fields; `cms/shared-cms-requirements.json` defines the shared-CMS target. Neither is proof that every collection exists in Payload. The main collections are banners, product families, brands, news/events, and careers. Additional structured collections cover resources, milestones, locations, reports, knowledge hubs, and accreditations. Extend the shared CMS with site ownership and market catalogue/configuration models while preserving stable source IDs.

Important states:

- `draft_migrated`: recovered source content, still subject to editorial QA.
- `needs_manual_recovery`: the source record was identified but the page could not be reliably captured.
- `needs_editorial_review`: placement or source fields are incomplete.
- `review_required: true`: do not publish without resolving the accompanying reason.

`cms/careers.json` is empty because the public CMS returned no live jobs. `cms/career-landing.json` contains the careers landing-page content and template mapping. Do not fabricate vacancies.

## Static pages

`pages/static-pages.json` contains one-off editorial pages. Each record has a destination path, template, source URL, normalized Markdown, SEO fields, asset IDs, and a review flag. Forms, checkout, account, staging/test pages, and generated archives are deliberately absent; their handling is specified in `migration-decisions.csv`.

## Media

`assets/asset-manifest.csv` is the only asset-selection index. It records 2168 source assets, likely role, dimensions when available, page usage, alt text, and review status. `binary_copied` is false because files were not downloaded. Before production, download approved originals, optimize responsive variants, validate rights, and replace missing or filename-like alt text.

## Migration ledger

`migration-decisions.csv` assigns every inventoried URL one action:

- `cms_import`: create a collection record.
- `keep_page`: create a one-off editorial page.
- `generate`: generate the archive from CMS metadata.
- `system_config`: implement as form/commerce/system behavior, not editorial content.
- `review_collection_scope`: verify main-family or market ownership before importing; records outside the main eight-family catalogue may belong to a market minisite.
- `review_market_scope`: recover and map the market to a subsidiary site in the shared CMS; approve its destination before importing.
- `manual_recovery`: recover the failed page before deciding.
- `exclude`: omit entirely.

Do not migrate a URL without consulting its ledger row.

## Design direction inferred from content—not a new brand standard

The source supports a global industrial/technical brand presentation: clear corporate authority, restrained use of sustainability claims, strong product-family discovery, prominent proof points, accessible technical downloads, and regional facility visibility. Keep dense technical content scannable through cards, accordions, filters, and download metadata. Treat this paragraph as design interpretation, not approved visual-brand guidance.

## Quality gates before implementation is considered complete

1. All eight product families render, and every linked brand resolves.
2. Markets discovery, approved market routes, subsidiary relationships, and both navigation levels exist without creating separate backend CMS installations.
3. Every rendered CMS card/detail uses stable IDs and declared relationships.
4. No `null` value is replaced with invented copy or data.
5. Every image has reviewed alt text or is explicitly decorative.
6. Every remote asset and document link is validated and localized as required.
7. Events have editorially verified dates; titles alone are not accepted as date evidence.
8. Location addresses, coordinates, capabilities, and certifications are editorially verified.
9. System pages and forms are implemented as behavior, not copied as content pages.
10. Redirects are created for any source path changed by the new IA.
11. The structural checks in `validation-report.json` pass, and every known gap has an owner or accepted exception. Structural validation alone does not establish full-scope readiness.
12. RBAC tests prove assigned-site isolation, blocked privilege escalation, and draft/publication boundaries; any required section grants are tested explicitly.
13. Market configurations and filters are isolated, and one cross-market enquiry is routed without exposing unauthorized lead items or CRM credentials.
14. Required CRM and gated-download workflows are verified end to end, not inferred from form/resource records.

## Source provenance

- Website: `https://www.klkoleo.com/`
- Crawl captured: `2026-09-25T02:08:37+00:00`
- Normalized collections: 421 records plus static pages
- Original crawl files: `../docs/klkoleo-copywriting-content.md`, `../docs/klkoleo-cms-content.md`, and `../docs/klkoleo-crawl-inventory.json`
