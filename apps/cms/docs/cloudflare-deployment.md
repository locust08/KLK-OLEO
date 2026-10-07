# Existing Cloudflare deployment

Production: https://agrochemicals.easondev.workers.dev

The existing Worker uses OpenNext, Payload's native D1 adapter, and R2 storage. The repository now contains its recovered configuration rather than relying on an undocumented external build checkout. Local development still uses SQLite (or PostgreSQL when DATABASE_URL is configured). Next was updated from 16.3.6 to the supported 16.3.8 patch required by OpenNext 1.20.9.

## Build and deployment

From apps/cms, after npm ci and Cloudflare authentication:

```sh
npm run types:cloudflare
npm run typecheck
npm test
npm run build:cloudflare
npx wrangler versions upload --preview-alias refinements
# Verify the uploaded version before activating it:
npx wrangler versions deploy VERSION_ID@100% --yes
```

PAYLOAD_SECRET remains a Cloudflare secret. Do not replace it with a development secret or commit environment files. The build needs a local PAYLOAD_SECRET to evaluate configuration; runtime authentication uses the existing Worker secret. D1 and R2 binding identifiers are in wrangler.jsonc. The build uses webpack to preserve the existing deployment pipeline. Windows builds are supported by this checked workflow, although OpenNext recommends Linux/WSL.

cloudflare-worker.ts preserves the live Worker's PBKDF2 compatibility workaround and Secure auth-cookie handling. It retains existing Payload 600,000-iteration SHA-256 password hashes; it does not change passwords, users, or hashing cost. Compatibility tests compare its output with Node crypto.

## Database update applied on 2026-10-07

migrations/cloudflare/20261007-map-resources.sql is a **one-time additive update**, applied after validating it against a private backup of production. It adds map tables, editor-lock linkage, indexes, and missing nullable media focal coordinates. It does not drop or replace existing tables. Do not rerun the schema SQL on a database where it is already applied.

20261007-seed-map-resource-form.sql initializes missing map points and the Resources request form through existing site/routing records; it preserves records already present. No products, pages, media, user accounts, or existing forms were overwritten. Shared pins belong to the main-site record and are queried by market sites using this CMS.

Resource enquiries persist in the existing leads collection with manual-review status and requested resource context. No SMTP, CRM or automatic file delivery is enabled. Adding external email delivery still requires client credentials and approved domain/sender configuration.

## Deployment verification

37 unit tests and typecheck passed. Production /, /about-us, /products, /resources, /contact and /admin returned HTTP 200. Preview browser checks at 1440, 768 and 390 pixels found no horizontal overflow or broken loaded images across the four main content pages. A preview resource request returned 202, displayed success without a download, and persisted its context in D1; the test lead was subsequently deleted.

Worker version: 9b38c26f-6d6a-4f9f-87a0-9115725b98e1, activated at 100% traffic. Previous version retained by Cloudflare: 660108ab-5aa6-4a63-81d9-4e7129efdda3. Rollback should change Worker traffic only; the additive database update remains compatible with the previous version.
