# KLK OLEO Website Revamp

Research, normalized content, CMS models, and implementation handoff materials for the KLK OLEO website revamp.

## Start here

1. Read [`handoff/KLK-OLEO-WEB-DESIGN-HANDOFF.md`](handoff/KLK-OLEO-WEB-DESIGN-HANDOFF.md).
2. Follow the loading order in [`handoff/README.md`](handoff/README.md).
3. Treat the files under `docs/` as source evidence rather than implementation specifications.
4. For the agrochemical minisite, read [`apps/cms/README.md`](apps/cms/README.md) and use its site-scoped CMS and seed data.

## Repository structure

- `handoff/` — normalized, context-free website and CMS specification.
- `docs/` — source-preserving crawl and content inventories.
- `scripts/research/` — reproducible crawl and handoff generators.
- `apps/cms/` — shared Payload CMS with the initial agrochemical minisite, 99 spreadsheet products, scoped roles, and resource placeholders.

## Product scope

The redesign covers the eight families under the main Products navigation. Market pages, market landing pages, and market product records are intentionally excluded from the normalized handoff.

The agrochemical catalogue is managed separately under its subsidiary site in `apps/cms`. Its spreadsheet products extend the CMS for that minisite and do not alter the main-site handoff's product scope.

## Important limitations

- Media files are referenced by source URL and have not been copied into this repository.
- CMS records marked `review_required` need editorial verification before publication.
- The public source returned no active job records, so careers data must not be fabricated.
