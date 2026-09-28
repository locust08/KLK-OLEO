# KLK OLEO project skills

Repository-specific guidance for developers and AI agents working on the website revamp and shared Payload CMS. This is a project guide, not an automatically installed Codex `SKILL.md` package. Paths below are relative to the repository root.

## Choose the correct scope

- Main-site design and content: start with `handoff/KLK-OLEO-WEB-DESIGN-HANDOFF.md`, then follow the loading order in `handoff/README.md`. Use `docs/` as source evidence, not as the implementation specification.
- Agrochemical minisite and CMS: read `apps/cms/README.md`, `apps/cms/AGENTS.md`, and the relevant implementation files.
- Research and content regeneration: inspect the existing scripts in `scripts/research/` before creating another extraction workflow.

Markets are in scope as subsidiary minisites. There is exactly one shared backend CMS for the main site and all market minisites, and RBAC is mandatory. This approved clarification supersedes the earlier Markets exclusion. Read `handoff/cms/shared-cms-requirements.json` before changing site structure, access, catalogues, or lead routing.

The main Products catalogue retains its eight families and linked brands. Each market has a separate site-scoped ingredient/product catalogue in the same CMS. The agrochemical catalogue currently has 99 spreadsheet products; do not relabel these as main-site product families. The legacy handoff is not a complete market content import. Recover and review missing content instead of inventing it.

The old crawl script still excludes market paths and product/category sitemaps. Revise that capture scope before a requested market-recovery crawl; do not use its `--prune-markets` mode for the reconciled project. Updating the handoff does not restore records absent from the pruned source inventory.

## Shared CMS and subsidiary sites

The application lives in `apps/cms`. Its installed stack is Next.js, Payload CMS, and React; check `package.json` and the lockfile for current versions. Local storage uses SQLite unless `DATABASE_URL` selects PostgreSQL.

Use these implementation entry points:

- `src/payload.config.ts`: Payload configuration, database adapter, and server URL.
- `src/collections.ts`: collections, field permissions, drafts, and integrity hooks.
- `src/access.ts`: role checks and assigned-site access.
- `src/app/(frontend)/api/enquiries/route.ts`: public enquiry intake.
- `scripts/seed.ts` and `data/`: initial agrochemical content and source snapshots.
- `src/payload-types.ts`: generated types; regenerate after schema changes.

Represent each minisite through a `sites` record with a parent relationship to the main site. Access to the main site does not imply access to its subsidiaries. Retain site ownership and validate related records against the same site; only a super admin may move records between sites.

Do not create a separate CMS installation, admin user store, or CMS database for each market. Configure market-specific navigation, layouts, products, filters, resources, and forms inside the shared CMS. Render global navigation alongside the market's second-tier navigation. Resolve approved destinations from the site registry; `/agrochemical` is the brief's target, not a route already implemented by the preview.

Market isolation means explicit site-scoped queries and separately configured filters/layouts. Test that changes to one market do not alter another. It does not mean separate backend CMS applications. Existing main-site IDs and market product IDs remain distinct; cross-links require reviewed relationships.

Before changing Next.js code, follow `apps/cms/AGENTS.md` and read the relevant documentation shipped with the installed Next.js version.

## Roles and publication

RBAC remains mandatory even though the PDF removes its earlier multiple-editor requirement. Preserve the implemented permission boundaries:

| Role | Capabilities |
| --- | --- |
| Super admin | All sites, users, role assignments, hierarchy, and routing configuration |
| Site admin | Assigned-site content, publication, deletion, and leads |
| Editor | Assigned-site content and draft changes; no publication or deletion |
| Publisher | Assigned-site content and publication; no deletion |
| Lead manager | Assigned-site leads and routing-profile visibility |
| Viewer | Assigned-site content visibility |

Anonymous access is limited to published public content and active site metadata. Keep users, leads, internal provenance fields, and routing configuration protected. Account role and site assignments must not be editable by ordinary users.

Enforce role, operation, and assigned-site permissions on the server, not only through hidden admin controls. Section-level grants are an extension where the agreed permission matrix requires them; do not claim that the current site-level roles implement section-level assignments. Test cross-site reads/writes, unauthorized publication, and privilege escalation.

Payload Local API operations may bypass access checks. For user-facing operations, pass the authenticated request/user and explicitly enforce access where applicable. Trusted seed or intake writes need their own validation boundary; do not generalize their elevated access to other endpoints.

## Source content and resources

Keep imported product descriptions and CAS strings traceable to their source. A checked spreadsheet cell is a source-reported association; an empty cell is unspecified, not a negative claim. Do not convert regulatory labels into independently verified certifications.

There is a known editorial conflict for Aidigro GA2425: the homepage mentions glufosinate ammonium, while spreadsheet row 83 mentions glyphosate and paraquat. Preserve the evidence and obtain approved wording before publication.

Resource placeholders must say that materials are coming soon and must not offer fabricated downloads. Source document filenames are provenance, not available files. To make a resource available, attach approved media, set its public visibility deliberately, update availability, and publish through an authorized role. Do not fabricate careers records or fill unknown handoff values with guesses.

## Forms, leads, and CRM integration

Use the server-side enquiry endpoint rather than allowing anonymous writes to the leads collection. Preserve consent validation, idempotency, published form/product checks, and site ownership checks.

The target includes one enquiry/cart with products from multiple markets. The current single `productId` intake does not support it. Implement explicit validated enquiry items carrying product/site ownership and server-side routing, with assigned-team access to only authorized items and customer data. Do not weaken same-site editorial relationships or expose all cross-market leads to every market editor to accommodate the cart.

Resolve routing profiles on the server. Clients must not select CRM destinations or receive provider credentials. The initial implementation persists leads for manual review; it does not deliver emails or submit to a CRM. CRM mode and reserved routing-rule fields are not working integrations.

For a requested CRM integration, establish the approved form-to-destination mappings and implement explicit connector behavior, retry/idempotency handling, delivery tracking, spam/rate controls, and an allowed-origin policy. Do not report successful delivery based only on successful local lead storage.

The brief's visible Company Website field must not map to the current `website` honeypot: a non-empty value returns success without storing a lead. Add a distinct validated business field when implementing the brief. Retaining Contact Form 7 or replacing it with an equivalent still requires stakeholder agreement; one shared CMS and RBAC do not settle that choice.

## Local origin and publishing diagnostics

Use the same scheme, hostname, and port for the browser and `NEXT_PUBLIC_SERVER_URL`. `localhost` and `127.0.0.1` are different origins even when they reach the same server. Check the actual `.env` and startup port rather than copying an assumed development URL.

A previous bulk publish returned HTTP 403, with an adjacent admin-preferences request returning HTTP 401, because the browser used `localhost:3010` while the configured server URL was `127.0.0.1:3010`. Payload rejected cookie authentication for the untrusted origin even though the account had super-admin permissions. This was diagnosed, not fixed as part of that analysis.

For similar errors, compare browser origin, configured server URL, session validity, account role, and assigned sites before changing RBAC. Keep CSRF protection enabled. Token-authenticated HTTP tests alone do not establish that browser-cookie publishing works. A diagnosis request does not authorize publishing records or changing permissions.

## Verification and repository hygiene

Run commands from `apps/cms`:

```sh
npm test
npm run typecheck
npm run build
```

After schema changes, run `npm run generate:types` and, when needed, `npm run generate:importmap`. For database/access changes, inspect and run `npm run test:integration` against an appropriate local or test database. For endpoint changes, run `npm run test:http` with the app running and the correct `TEST_SERVER_URL`; inspect the script before running it against any non-local environment. These broader checks create test records, so do not point them at production casually.

Verify browser-cookie workflows separately when changing authentication or publication behavior. Do not publish real draft content just to test an unrelated change. Generate and apply reviewed PostgreSQL migrations before production deployment; a working local SQLite schema is not a production migration plan.

Keep `.env`, credentials, databases, uploads, dependency folders, and build artifacts out of Git. Preserve the original spreadsheet CSV as evidence even if its exported whitespace is flagged. Commit and push only when requested; do not treat a prior push request as continuing authorization for future pushes.
