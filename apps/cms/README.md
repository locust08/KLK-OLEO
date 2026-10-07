# KLK OLEO Payload CMS

An initial shared Payload CMS for the KLK OLEO main site and its agrochemical minisite. The site hierarchy is stored in `sites`: `agrochemical` is a minisite whose parent is `klk-oleo`.

## Local setup

Use Node.js 22 or newer.

```sh
npm ci
cp .env.example .env
# Set PAYLOAD_SECRET, CMS_ADMIN_EMAIL, and CMS_ADMIN_PASSWORD in .env.
# Generate each secret with: openssl rand -hex 32
npm run seed
npm run dev
```

Open `http://localhost:3000/admin`. The seed creates a super admin using the email and password in your local `.env`. It inserts missing records only; rerunning it preserves editorial changes.

The supplied local setup uses SQLite. Set `DATABASE_URL` to use PostgreSQL, which is the intended deployment database. Generate and apply Payload database migrations against PostgreSQL before production. The ignored SQLite database, local credentials, uploads, and dependencies are not committed.

## Imported content

- 99 products from the supplied spreadsheet tab, with exact source descriptions and CAS strings.
- 12 product functions, 9 formulation types, and 7 regulatory labels.
- Five minisite pages: Home, About Us, Products, Resources, and Contact.
- A homepage banner.
- Three published resource placeholders with no uploaded files.
- Four form definitions and separate routing profiles: general enquiry, product enquiry, sample request, and technical support.

Products, pages, forms, and banners start as drafts. Taxonomies and resource placeholders are published. Product finder preview: `/products`. Publish reviewed products in the admin to make them visible. The catalogue supports search, function/formulation filters, and pagination.

Sources:

- Minisite: https://klkoleo.dev.malaysiaweb.my/
- Product list: https://docs.google.com/spreadsheets/d/1tzbxQfyaBCUGgpBA2qAx2q56yJCz805m/edit?gid=1648841370

`data/` contains normalized snapshots. A tick is a source-reported association; a blank cell means unspecified, rather than proof that a function or certification does not apply. Document filenames are retained as provenance only; they are not downloadable resources.

## Permissions

| Role         | Scope and capabilities                                                    |
| ------------ | ------------------------------------------------------------------------- |
| Super admin  | All sites, site hierarchy, users, role assignments, routing configuration |
| Site admin   | Assigned-site content, publication, deletion, and leads                   |
| Editor       | Assigned-site content, drafts; cannot publish or delete                   |
| Publisher    | Assigned-site content and publication; cannot delete                      |
| Lead manager | Assigned-site leads and routing-profile visibility                        |
| Viewer       | Assigned-site content visibility                                          |

Membership in the main site does not automatically grant access to minisites. Assign each subsidiary explicitly. Only super admins can change roles, site assignments, or routing profiles. Editors can save draft versions of published content. Anonymous users can read published content and active site metadata; leads, users, internal source cells, and routing configuration stay protected.

## Resources

Agrochemical Resources use **Form → Sales Follow-up**. Download opens a prefilled resource request form; neither the page nor a successful submission provides a PDF URL or automatically downloads a file. Published resources can be requested even while their material is being prepared. Requests use the existing CMS Leads queue and manual Agrochemical sales routing. User confirmation email is not enabled.

Configure the dedicated resource form after the normal CMS seed:

```sh
npx tsx scripts/seed-resource-request-form.ts
```

The script preserves existing records and connects the new form to the existing sales routing profile. See [`../../docs/resources-request-flow.md`](../../docs/resources-request-flow.md) for validation, lead context, deferred email configuration, and verification. CMS files remain optional for placeholder resources; the existing `available` validation still requires an approved uploaded file. Upload access and publication permissions remain unchanged.

### Shared world map

Map presentation consumes the main-site-owned `map-locations` collection. After applying the schema/migrations in a configured environment, run `npm run seed:map` to initialize the existing locations without overwriting editor changes. See [`../../docs/shared-world-map.md`](../../docs/shared-world-map.md) for shared-site consumption and CMS editing.

### Deployment prerequisites

The application root is `apps/cms`; use `npm ci`, `npm run build`, and `npm start` on a Node.js 22+ host. Configure `PAYLOAD_SECRET`, the public server URL, and a durable database before deploying. Production PostgreSQL requires reviewed Payload migrations, including the shared map collection. Persist uploaded media through the hosting platform's durable storage rather than an ephemeral filesystem. Seed the CMS/site first, then shared map locations and the resource-request form. The ignored local SQLite database and uploads are not transferred by a Git push. Publish reviewed CMS content in the target environment; local development's product preview fallback does not publish products in production.

### Supplied agrochemical PDFs

`data/agrochemical-resources.json` records the four PDFs supplied in the September 29, 2026 Drive export, including original filenames, SHA-256 checksums, cover titles, and editorial review notes. All four are brochures, not safety data sheets. The formulation-partner PDF's filename says “Biologicals,” while its cover says “Agrochemicals”; the CMS title follows the cover.

Import into the existing local SQLite CMS from an extracted directory:

```sh
npm run import:resources -- "/absolute/path/to/Download Material"
# Back up the local database before applying.
npm run import:resources -- "/absolute/path/to/Download Material" --apply
```

The first command validates every source file without writing. The apply command uses the existing super-admin account configured by `CMS_ADMIN_EMAIL`, creates site-scoped draft resources and private media, checks stored checksums and anonymous visibility, and preserves matching records on reruns. It refuses PostgreSQL/remote database configuration. It does not publish, overwrite existing placeholders, change product relationships, or update source claims. Review the manifest notes before making media public and publishing through an authorized account. PDFs and the database remain ignored by Git; the manifest and importer do not transfer uploaded files to another environment.

### Document thumbnails

Each resource has a separate optional `thumbnail` upload referencing same-site image Media. It is independent of the downloadable PDF (`file`). The public page uses only a public image thumbnail, with a neutral document icon when none is available; it never rotates unrelated Home/About images. Thumbnails fill the preview box using centered cover cropping.

Generate first-page covers for the supplied four PDFs with Poppler (`pdftoppm`) installed. Apply the updated schema through the dev server (or reviewed migrations) first; the data-only importer disables automatic schema pushing to avoid concurrent SQLite schema synchronization:

```sh
npm run import:resource-thumbnails -- "/absolute/path/to/Download Material"
# Back up the local database before applying.
npm run import:resource-thumbnails -- "/absolute/path/to/Download Material" --apply
```

The script checks source and attached-PDF hashes, uploads WebP covers, and attaches them to existing records in local SQLite. New covers are public for already-published resources and private for drafts. Existing thumbnails, resource publication state, and PDF visibility are preserved. Draft cover Media must be made public deliberately when publishing. You can replace a cover in the Resource's Thumbnail field; PDF uploads and cross-site images are rejected. Generated uploads remain ignored by Git. Deploy the schema with reviewed PostgreSQL migrations before using this field in production.

## Form intake and CRM boundary

`POST /api/enquiries` validates submissions, records consent, verifies published form/product/site ownership, and persists each accepted enquiry with an idempotency key. Routing profiles are resolved on the server; the client cannot select a CRM or destination.

Example body:

```json
{
  "siteSlug": "agrochemical",
  "formSlug": "general-enquiry",
  "firstName": "Example",
  "email": "person@example.com",
  "company": "Example company",
  "country": "Malaysia",
  "message": "Please contact me about agrochemical formulation ingredients.",
  "consent": true,
  "idempotencyKey": "7e692013-4206-4c63-a731-5b7b0a28a9da"
}
```

Forms are drafts initially; publish a reviewed form before enabling intake. Accepted leads appear as `manual-review`. No email or CRM delivery runs in this release. `crm` mode returns a service-unavailable response until a connector is implemented. The reserved rules field does not execute logic. Configure durable delivery jobs, provider credentials, spam/rate controls, and destination mappings when integrating the actual CRMs. Hosting forms on a separate domain also requires an explicit allowed-origin policy; cross-origin requests are currently rejected.

## Editorial review

The source homepage describes Aidigro GA2425 as improving glufosinate ammonium applications. Spreadsheet row 83 describes Aidigro GA 2425 for glyphosate and paraquat. Both snapshots are preserved; confirm the approved claim before publishing. Source typos and existing marketing claims remain in drafts for review. No certification claim is independently verified by this import.

## Verification

```sh
npm run generate:types
npm run generate:importmap
npm run typecheck
npm test
npm run seed
npm run test:integration
npm run test:http # while the app is running; TEST_SERVER_URL defaults to http://127.0.0.1:3010
npm run build
```

Integration tests use temporary records and remove them afterward. They verify the 99-product import, parent relationship, draft visibility, resource placeholders, scoped permissions, blocked privilege escalation, and publishing restrictions.

The dependency audit has six moderate findings inherited from Payload's Drizzle development tooling and no high/critical findings after upgrading Sharp. These currently have no supported upstream fix in the installed Payload release.
