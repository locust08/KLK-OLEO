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

The main Products catalogue covers eight families. Markets are also in scope: each is a subsidiary minisite managed, together with the main website, by one shared backend CMS with mandatory RBAC. See [`handoff/cms/shared-cms-requirements.json`](handoff/cms/shared-cms-requirements.json).

Market catalogues remain separate from the main Products classification within the shared CMS. The initial agrochemical catalogue lives in `apps/cms`; the legacy handoff does not yet contain a complete recovery of every market's content. These requirements describe the target architecture, not completed implementation.

## Important limitations

- Media files are referenced by source URL and have not been copied into this repository.
- CMS records marked `review_required` need editorial verification before publication.
- The public source returned no active job records, so careers data must not be fabricated.
