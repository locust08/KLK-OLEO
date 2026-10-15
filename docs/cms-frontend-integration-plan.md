# CMS to frontend integration plan

Status: implementation authorized 2026-10-15. Agrochemical integration is implemented on an isolated branch and undergoing preview acceptance; see cms-integration-verification.md. Production migration and activation require separate approval of the verified release.

## Confirmed scope

- Complete content integration for the Agrochemical frontend in this phase.
- Support future inclusion of the KLK OLEO main frontend through the shared CMS model; its frontend is outside this phase.
- Editors can manage all visitor-facing text, images, links, cards, FAQs, navigation, and footer content using structured section fields.
- Layouts, styling, responsive behavior, and animations remain controlled in code. Preserve the current approved presentation.
- Retain manual sales follow-up. Email notifications, CRM delivery, and automatic PDF delivery are separate work.
- Section order stays fixed. Editors can hide optional sections; required sections remain visible.
- Each page's sections publish together. Navigation and footer are managed separately as site-wide content.
- Populate new fields from existing approved content before switching frontend consumption, preserving existing editorial changes. After migration, intentionally empty fields remain empty rather than restoring hardcoded marketing copy.
- Content belongs to its individual site by default. Share content only explicitly, including the existing shared world map. Reusable section structures do not imply shared content.
- Provide secure frontend draft preview for authorized editors, respecting site assignments; visitors see published content.
- Block publication when required content is absent or displayed images are missing, private, or lack alternative text. Optional sections can be hidden or omitted.
- Homepage innovations and product-finder cards use editor-selected catalogue relationships with independently curated marketing headings, descriptions, and images. Unpublished selections block section publication.
- Editors manage header/footer link labels, destinations, and ordering inside the existing layouts. This phase does not create arbitrary routes or new templates; validate internal destinations and external link formats.
- Connect page/product SEO titles, descriptions, social-sharing images, and canonical URLs, with defaults from published content for optional empty SEO fields.
- Editors manage form headings, help text, labels, consent wording, and success messages. Required fields and server submission validation stay fixed.
- Prevent unpublishing or deleting content/media required by published pages; identify dependent usages so editors can replace or remove references first.
- Preserve displayed GA2425 copy during migration and flag conflicting claims for editorial review without automatically resolving or approving them.
- Published edits appear on the next page load without a rebuild or deployment; drafts remain private.
- Prefer plain text; allow restricted rich text where paragraphs, lists, emphasis, and links are needed. Exclude arbitrary HTML, styling, and scripts.
- Intentionally empty resource libraries display an editable empty state, without production placeholder resurrection. Fetch all published catalogue/resource records rather than silently truncating query results.
- Acceptance requires field-to-screen coverage, preview/publication/permission verification, responsive checks, and preservation of leads, media, and existing editorial changes.
- Rehearse migration against a production-data copy, verify a Cloudflare preview, then apply the production migration and activate the release. Prepare a backup and schema-aware rollback procedure.
- This phase covers English content only; multilingual publishing is future work.
- Navigation/footer have a separate draft, preview, and publish workflow. Preview includes proposed site-wide content with the selected page.
- Preserve existing page/product URLs and fixed templates. Restrict product slug changes to administrators and create redirects for permitted changes.
- Catalogue descriptions, labels, filter headings, and empty-state wording become editable without changing filtering rules or technical values.
- Routine interface wording is editable; security errors, validation behavior, and copyright-year calculation stay code-controlled.
- Present the verified preview, migration results, and acceptance checklist for explicit production approval before migration/activation. This supersedes routine frontend deployment authorization for this integration release.

## Product brochure decision

- Product brochure downloads are generated PDFs of product-page content, excluding header, footer, buttons, and interactive controls. They do not open a resource enquiry form.
- Public downloads use currently published product content, including image, descriptions, technical values, and taxonomy labels, arranged for readable A4 printing. Omit empty fields; published edits appear in the next generated PDF.
- Authorized editors can generate clearly marked draft PDFs from product preview; public downloads never use drafts.
- Resource-library requests retain manual sales follow-up without automatic PDF delivery.
- Use a dedicated A4 layout with existing fonts and green/gold palette, without a separate marketing cover or website header/footer. Repeat table headings and keep headings with their content where needed.
- Use the same visible product content as the page; exclude SEO metadata, internal review/source records, and resource-request controls. Do not maintain separate brochure copy.
- Generate PDFs server-side with loading, repeat-click prevention, and explicit retry on failure; report readiness only after generation succeeds. Cloudflare-compatible implementation investigation is pending.
- Filenames use the product name. Include generation date and published revision within the document; draft output is clearly marked.
- Verify long descriptions, missing optional fields, multipage output, published/draft isolation, omitted UI, and rendered PDF appearance.

## Media and optional content

- Provide desktop/mobile image selection where appropriate, alternative text, and focal-point cropping. Preserve migrated crops and use desktop images when no mobile alternative exists.
- Newly added optional sections start hidden until populated and explicitly enabled; migrated sections preserve current visibility.
- Draft uploads stay private until explicitly approved for public visibility. Page publication does not automatically change media access. Authorized previews can display private media.
- Define required/optional sections per page for review before implementation; heroes and core content are required, promotional sections may be optional.
- Required CMS query failures show a clear unavailable state and are logged; never restore hardcoded marketing copy. Distinguish query failure from intentionally empty content.
- Delivery order: schema/migration and preview foundations; site-wide content; page sections; catalogue/SEO; product PDF generation; full acceptance verification. Present one complete release for production approval.
- Product PDFs begin with the product name, without an additional logo, contact block, or promotional material.
- PDF revision identifies the exact published content snapshot, separately from generation date; unchanged content keeps the same revision.
- Fixed-layout card sections retain their required card counts; FAQs and catalogue lists allow variable entries. Card order within a section is editable.
- Editable links allow validated internal paths, HTTPS, email, and telephone destinations, rejecting scripts/unsupported protocols. Editors choose external new-tab behavior; internal links stay in the same tab.
- Publishing is manual in this phase; scheduling and expiry are deferred.
- Public brochure downloads provide only the current published content, without a historical PDF archive.
- Prove the dedicated PDF library on Cloudflare with realistic fonts/images/pagination/cost before adopting it. Return any paid-service or infrastructure change for a user decision.
- Prepare PDF-compatible variants from approved artwork during migration and automate future variants where supported; retain one editorial image selection and validate unsupported formats clearly.

## Confirmed findings

- Existing Pages fields provide hero content and generic heading/body sections, which cannot represent every current frontend section.
- The About route loads CMS page content, but AboutPage currently ignores that content. Its shared map is separately connected.

## Final editorial safeguards

- Required public pages stay published. Administrators can unpublish products/resources only after clearing required inbound references.
- Publishing independently managed taxonomy/shared records updates published consumers. Show affected usages before publication; page publication groups its sections but does not freeze independent records.
- Prefer existing CMS values when they differ from hardcoded content. Report every difference; resolve any public-presentation change before activation. Preserve currently displayed GA2425 claims and flag their source conflict without approving new claims.
- PDF conversion failures do not prevent website use of an otherwise valid image. Block brochure enablement/publication when its required image variant is unavailable; expose processing status and retry. Never silently omit a displayed product image.

## Required and optional sections

| Page | Required | Optional / hideable |
| --- | --- | --- |
| Home | Hero, About introduction | What We Do, innovations, product finder promotion, FAQ, contact promotion |
| About Us | Hero, Agriculture Solutions | Brand Story, R&D, global presence map |
| Products | Hero, introduction, catalogue and filters | Additional promotional content |
| Product detail | Name, chemical description, description | Image, populated technical fields, brochure action, related resources |
| Resources | Hero, introduction, library or empty state | Individual published resources |
| Contact | Hero, introduction, contact information, enquiry form | Additional promotional content |

Optional does not bypass validation: enabled/populated sections must be complete. Fixed-layout card counts follow the approved design, with editable card order. Do not create new promotional sections or routes merely because the model could support them.

## Target architecture

- Keep existing fixed frontend templates and the server-side CMS query/view-model boundary. Introduce named, typed section fields rather than relying on positional `sections[0]` or an unrestricted page builder.
- Store page-specific content with its page so one publication governs its sections. Reuse field definitions across site templates; content remains site-owned.
- Add versioned site presentation content for branding, navigation, footer, and shared interface wording. Keep operational site identity separate so presentation drafts cannot disable intake or alter site scope.
- Keep catalogue products/taxonomies, resources, forms, and map records in their existing collections. Innovations select products; finder cards select appropriate catalogue categories. Marketing overrides are separate from authoritative technical fields.
- Resolve public records with published filters and access enforcement. Resolve previews through authenticated, site-scoped draft reads, with no shared public caching of draft content. Media preview authorization must cover actual file responses as well as metadata.
- Extend publication validation and inbound-reference protection across nested sections, site presentation, product/taxonomy/resource relationships, and media. Draft saves remain possible without changing the published snapshot.
- Keep SEO defaults distinct from forbidden marketing fallbacks: derive optional metadata from published page/product content, but never resurrect omitted sections or placeholder resources.
- Preserve URLs. Restricted product slug changes create validated redirects without loops or destination conflicts.

## Implementation stages

### 1. Inventory, schema, migration and preview foundations

Create a field-to-screen inventory of every visible text, image, link, repeated entry, and state. Capture baseline screenshots and production record/media counts. Define named sections, site presentation, constrained rich text, media variants, publication validation, and reference tracking.

Prepare additive D1 migrations and an idempotent content backfill with dry-run output. Backfill only missing fields; preserve CMS edits, visibility, roles, relationships, leads, and file identities. Import approved code-owned assets into appropriate CMS media records with alt/focal metadata. Record conflicts and stop release when unresolved changes affect presentation.

Implement authenticated page/product and site-presentation preview, private media access, exit-preview behavior, and preview indicators. Required pages cannot be unpublished accidentally. Test publication guards using published snapshots rather than newest drafts.

Exit evidence: schema/backfill rehearsal passes on an isolated production-data copy; draft isolation and site permissions pass; migration difference report is reviewable.

### 2. Site-wide presentation

Connect brand text/assets, header links, footer descriptions/navigation/product links/legal/social links, contact information, and routine interface wording. Preserve layout and computed copyright year. Provide separate draft/preview/publish behavior. Validate destinations and identify dependent usages.

Exit evidence: each site-wide field maps to a rendered element; current appearance is preserved; draft changes stay private.

### 3. Page sections

Connect all Home sections, FAQ, and CTAs; make About consume its page record for hero, Agriculture Solutions, Brand Story and R&D, while preserving explicit map sharing. Connect Resources and Contact introduction/form wording. Add per-section visibility and fixed-card constraints. Wire desktop/mobile media, alt text, and focal points consistently.

Remove production marketing/resource placeholders only after data backfill. Distinguish empty content from failed queries; provide editable empty-state wording and code-controlled unavailable handling/logging.

Exit evidence: every page field is editable and renders correctly; hiding optional sections removes their space; required content validation passes; existing responsive presentation remains intact.

### 4. Catalogue, resource relationships, URLs and SEO

Connect curated homepage relationships, taxonomy descriptions/labels, catalogue interface text, product images/technical values and related resources. Fetch all published results through complete pagination without changing search/filter semantics. Restrict unpublishing/deletion of required references. Add route metadata, social images, canonical defaults and safe slug redirects.

Exit evidence: catalogue counts match published CMS records, including datasets beyond current limits; combined filters and URLs work; related unpublished/private content stays protected; SEO fields reach rendered metadata.

### 5. Product PDF and media variants

First prove a dedicated JavaScript PDF library on a Cloudflare preview with realistic fonts, media, descriptions and multiple pages. Candidate: `pdf-lib` plus `@pdf-lib/fontkit`; these are not installed and Worker compatibility/performance are not yet verified. Use existing approved Poppins fonts and constrained asset sources. If a paid rendering service or infrastructure change is needed, return for a decision before adoption.

Create one product content snapshot consumed by the page/PDF, with public published resolution and separately authorized draft resolution. Identify the exact snapshot through a stable digest covering visible text, related labels, image identity/content, and template revision; generation time is separate. Do not rely solely on product `updatedAt` or expiring Payload version IDs.

Generate A4 PDFs without website header/footer, buttons, logo/contact additions or internal data. Add wrapping, pagination, repeated table headings, sanitized product-name filenames, revision/date identification and clear draft marking. Downloads use loading/retry handling and prevent duplicate clicks. Serve current content only; optional caching must track the full snapshot and never reuse drafts publicly.

Prepare image variants for existing approved assets and future uploads without runtime Sharp on Workers. Prove conversion support, expose failures/retry, and validate unsupported formats. Bound asset size/content length/page count and generation concurrency based on measured platform limits; guard every product/media read by visibility and site scope.

Exit evidence: Worker generation works within measured limits; multipage PDFs render correctly; revision changes when any visible dependency changes; public/draft separation and failure recovery pass.

### 6. Acceptance and release preparation

Rehearse the complete migration against isolated production data. Verify a Cloudflare preview using isolated database/media bindings, not production writes. Compile the field coverage checklist, migration differences, tests, screenshots, sample PDFs, record counts and rollback runbook.

Present one complete release for explicit production approval. Only after approval: back up D1/media as needed, apply reviewed migration/backfill, deploy the verified version, and smoke-test public pages, admin, forms, media, PDFs and published edits. Preserve the main frontend outside this release.

## Acceptance checklist

- Every in-scope visitor-facing element has an identified CMS field or documented code-controlled behavior; no unexplained marketing fallback remains.
- Required/optional rules, card counts, hidden sections, links, rich text, draft/publication and role/site boundaries pass.
- Published edits appear on the next load without deployment; core pages remain available. Shared-record publications show usages and update consumers predictably.
- Header/footer preview and page/product preview do not leak drafts or private media to anonymous visitors or other-site users.
- Test 320, 390, 768, 1023, 1024, 1199, 1200, 1440 and 1920px: no overflow, broken media, clipped text or unintended layout/animation changes; verify keyboard access and focus behavior.
- Preserve product search/filter/pagination, published counts, consent/idempotency and manual leads. Resource requests still do not expose PDFs or send automatic email.
- Empty resources show the editable empty state; failed queries show unavailable handling. Catalogue/resource query limits do not truncate records.
- Page/product metadata and redirects are correct; internal fields never enter public props or PDFs.
- Visually inspect A4 PDFs with long text, optional omissions, supported image variants, taxonomy changes, multiple pages and drafts. Header/footer/buttons are absent; date/revision and download/retry behavior are correct.
- Migration dry-run/backfill rerun preserve editorial changes, users, roles, leads, media and relationships. Conflicts are resolved explicitly; backup and rollback procedures are tested and documented.
- Run relevant type checks, production build, existing regression checks and meaningful integration tests for new publication/preview/reference/PDF behavior. Present observed results, not assumed passes.

## Technical gates and deferred work

Editorial decisions are settled. Technical validation still must establish Cloudflare PDF/conversion capability and cost, published-snapshot semantics for reference guards, secure file preview behavior, and migration/rollback correctness. These are implementation investigations, not missing user preferences.

Deferred: main-site frontend integration, multilingual content, arbitrary page builders/new routes, scheduled publishing, email/CRM notifications, automatic resource delivery, and historical brochure archives.

## Next approval

Confirm that this consolidated plan reflects the shared understanding before implementation. Production migration and deployment remain a separate final approval after concrete verification evidence is available.

## Additional inventory findings

- Existing templates and a server-side query/view-model layer provide the integration seam; no page-builder renderer exists.
- Draft preview and frontend SEO metadata are currently absent.
- Production resource fallbacks can resurrect placeholder records after editors remove or unpublish all resources.
- Catalogue queries currently cap results rather than fetching every page.
- Homepage and spreadsheet sources contain conflicting GA2425 claims; migration must not silently resolve or approve these claims.

