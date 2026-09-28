# KLK OLEO redesign handoff

This folder is the authoritative, context-free content handoff for a separate web-design or implementation LLM. Start with `KLK-OLEO-WEB-DESIGN-HANDOFF.md`; then load the JSON/CSV files it names. The original crawl documents in `../docs/` remain source evidence and are not implementation specifications.

## Non-negotiable scope

- The main Products catalogue contains eight families and 26 captured brand records. Separate market catalogues do not change that classification.
- Markets are in scope. Each market is a subsidiary minisite, not a separate CMS installation.
- One shared backend CMS manages the main website and every market minisite; RBAC is mandatory.
- Market content is not fully recovered in this legacy snapshot. Use `cms/shared-cms-requirements.json` and the agrochemical seed data; do not fabricate missing market records.
- Never invent values for `null` fields. Preserve `review_required` and resolve those fields editorially.
- Source media remain remote. Downloading, licensing, optimization, and final accessibility review are separate launch tasks.

## Loading order

1. `KLK-OLEO-WEB-DESIGN-HANDOFF.md`
2. `cms/shared-cms-requirements.json`, then `information-architecture.json`
3. `page-templates.json` and `component-content-map.json`
4. `cms/schemas.json`, followed by the required collection files
5. `pages/static-pages.json`
6. `relationships.json`
7. `assets/asset-manifest.csv`
8. `migration-decisions.csv` and `validation-report.json`

## Generated legacy snapshot record counts

These counts are not the complete reconciled website scope. The shared-CMS requirements file is maintained separately from this generated content snapshot and must be retained when regenerating the handoff.

```json
{
  "banners": 6,
  "product_families": 8,
  "brands": 26,
  "news_events": 129,
  "careers": 0,
  "resources": 79,
  "milestones": 125,
  "locations": 13,
  "reports": 7,
  "knowledge_hubs": 12,
  "accreditations": 16,
  "static_pages": 18,
  "assets": 2168,
  "relationships": 1974,
  "migration_decisions": 474
}
```

Generated from crawl captured at `2026-09-25T02:08:37+00:00`.
