# KLK OLEO web-design and content-mapping specification

## Authority and purpose

You are receiving this file without conversational context. Treat it as the controlling specification for mapping the supplied KLK OLEO content into a redesigned website. The original crawl is evidence only. The normalized files in this handoff directory control structure, record identity, relationships, and placement.

When instructions conflict, use this order: this specification → `information-architecture.json` → `component-content-map.json` → collection records → original crawl evidence.

## Required outcome

Build a responsive corporate website that preserves approved KLK OLEO source copy, exposes repeatable material through CMS collections, and keeps page-specific editorial copy in static pages. Do not silently rewrite claims, dates, product names, certifications, addresses, or metrics. Do not fill missing data by inference.

## Product boundary

Products are limited to these eight main Products-tab families:

1. Amides → `/products/amides/`
2. Anionic Surfactants → `/products/anionic-surfactants/`
3. Esters → `/products/esters/`
4. Fatty Acids → `/products/fatty-acids/`
5. Fatty Alcohols → `/products/fatty-alcohols/`
6. Glycerine → `/products/glycerine/`
7. Nonionic Surfactants → `/products/nonionic-surfactants/`
8. Phytonutrients → `/products/phytonutrients/`

The normalized handoff contains 26 brand records linked from those family pages. Markets, Life Science/Oleo Basics market landings, market taxonomies, and market product records are excluded. The redesigned navigation must not contain a Markets item. Embedded market links were removed from normalized Markdown.

## Information architecture

The definitive hierarchy is in `information-architecture.json`. Use its `primary_navigation` as the default redesign navigation. It is a recommended design default rather than evidence of client approval, so preserve paths for other retained pages unless `migration-decisions.csv` provides a destination.

## Template and component rules

- `page-templates.json` defines the ordered component slots for each template.
- `component-content-map.json` defines exact CMS field-to-component bindings.
- A component may bind only to named fields. Do not recover missing values from unrelated prose.
- Optional components should be omitted when their bound content is empty.
- Related records must resolve through IDs in `relationships.json` or explicit `*_ids` arrays.
- Use `asset_ids` to resolve media through `assets/asset-manifest.csv`; do not choose unrelated media by filename similarity.

## CMS collections

The canonical schemas are in `cms/schemas.json`. The main collections are banners, product families, brands, news/events, and careers. Additional structured collections cover resources, milestones, locations, reports, knowledge hubs, and accreditations.

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
- `review_collection_scope`: import only if related to an in-scope product family.
- `manual_recovery`: recover the failed page before deciding.
- `exclude`: omit entirely.

Do not migrate a URL without consulting its ledger row.

## Design direction inferred from content—not a new brand standard

The source supports a global industrial/technical brand presentation: clear corporate authority, restrained use of sustainability claims, strong product-family discovery, prominent proof points, accessible technical downloads, and regional facility visibility. Keep dense technical content scannable through cards, accordions, filters, and download metadata. Treat this paragraph as design interpretation, not approved visual-brand guidance.

## Quality gates before implementation is considered complete

1. All eight product families render, and every linked brand resolves.
2. No Markets navigation, route, imported record, or market-page CTA exists.
3. Every rendered CMS card/detail uses stable IDs and declared relationships.
4. No `null` value is replaced with invented copy or data.
5. Every image has reviewed alt text or is explicitly decorative.
6. Every remote asset and document link is validated and localized as required.
7. Events have editorially verified dates; titles alone are not accepted as date evidence.
8. Location addresses, coordinates, capabilities, and certifications are editorially verified.
9. System pages and forms are implemented as behavior, not copied as content pages.
10. Redirects are created for any source path changed by the new IA.
11. `validation-report.json` passes, and every listed known gap has an owner or accepted exception.

## Source provenance

- Website: `https://www.klkoleo.com/`
- Crawl captured: `2026-09-25T02:08:37+00:00`
- Normalized collections: 421 records plus static pages
- Original crawl files: `../docs/klkoleo-copywriting-content.md`, `../docs/klkoleo-cms-content.md`, and `../docs/klkoleo-crawl-inventory.json`
