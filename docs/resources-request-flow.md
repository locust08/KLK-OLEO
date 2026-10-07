# Agrochemical Resources request flow

Agrochemical Resources use Method 2: **Form → Sales Follow-up**. No file is downloaded or emailed. Other method names (`direct_download`, `form_auto_download`) are reserved in `resource-delivery.ts`; their flows are not implemented.

## Content and CMS

- Resources remain in the existing versioned Resources collection: title, slug, description, document type, thumbnail, optional file, availability, and draft/published state.
- The Resources introduction reuses Products' `catalog-intro` styles. The concise AI-generated fallback is explicitly marked temporary in `ResourcesPage.tsx`. Replace it using CMS Pages → Resources → first Sections heading/body.
- Keep the existing banner. Replace through CMS Pages → Resources → Hero image, or change the existing `siteAssets.resourcesHero` fallback. There is no new banner asset.
- Delivery mode and form slug are centralized in `src/lib/resource-delivery.ts`, rather than spread across cards. They are site configuration, not new CMS fields. A resource-specific delivery-method field can be added when another site actually needs the other methods.

## Submission and sales destination

Download opens an accessible native modal dialog with Full Name, Company, Email, Phone / Contact Number, Country, prefilled read-only Requested Resource, optional Message, and consent. Escape/close returns focus to the triggering card. Loading, error/retry and thank-you states are explicit.

POST `/api/enquiries` reuses the existing origin checks, payload limits, honeypot, consent recording, idempotency and CMS Leads persistence. Resource requests receive additional server validation and a same-site published resource lookup. Title and associated products are resolved server-side. File URLs are not serialized into Resources page props or returned by submission.

The existing four enquiry forms were drafts. `scripts/seed-resource-request-form.ts` creates a dedicated published `resource-request` form, connected to the existing `general-enquiry` routing profile. That profile uses manual routing to **Agrochemical sales and technical team**. Other forms remain untouched. Run the idempotent script in each environment after the existing CMS/site seed:

```powershell
cd apps/cms
npx tsx scripts/seed-resource-request-form.ts
```

Success wording/consent can be edited in this CMS Forms record. If it is unpublished or missing, Resources displays an unavailable state and the existing contact email; it does not substitute a fake form.

Leads contain customer fields and consent timestamps in existing columns. Resource title/ID/slug, delivery method, phone, source URL and associated product names/IDs are recorded as labeled lines in the existing Message field. Created At supplies the submission timestamp. A single associated product is also stored in the existing Product relationship. Multiple associated products remain in the message. Leads are queued as `manual-review` for authorized CMS lead managers; **no email/CRM notification is currently sent**.

## Deferred user confirmation email

**User confirmation email is NOT enabled yet because client SMTP/domain no-reply access is still required.**

Add a provider adapter in Payload configuration and a notification integration after successful durable lead creation in `/api/enquiries`. Keep email failure separate from accepted lead persistence; use the existing routing/delivery status model for retries and ensure idempotency prevents duplicate confirmations. Do not send on honeypot responses or duplicate-request retries. No external sending function is invoked today.

Required later: approved client no-reply address, client SMTP host/port/TLS and authenticated credentials (or an approved transactional provider API key), domain access for verification, and environment secrets. SPF/DKIM and any provider-required verification records generally require client DNS access; coordinate DMARC policy with the client's mail administrator. No personal Gmail or unofficial domain is configured.

## Verification

`tests/resource-requests.test.ts` covers request validation, unchanged Contact requirements and context formatting. Existing product-filtering tests continue to cover the product logic. `scripts/verify-resource-requests.ts --prepare` creates clearly named temporary CMS fixtures; browser verification uses those for form submission. Running the script without `--prepare` verifies server rejection cases, canonical resource/product context, manual sales routing, timestamp/consent, and retry idempotency, then removes fixtures and QA leads. Run the cleanup phase even when browser verification fails.

Browser verification passed at 1440, 1024, 768, 390 and 320px: no overflow/broken images; prefill, validation, server-error retry, successful submission, thank-you, Escape, close/focus restoration and repeated open/close. Zero PDF requests and zero download events occurred. The temporary fixtures and leads were removed.

## Product filters (corrected scope)

The three vertical accordions belong to **Products**, not Resources. `ProductListing.tsx` and `ProductFilters.module.css` wrap the existing Product Function, Formulation, and Regulation / Labels fieldsets in independent native details/summary controls. Existing taxonomy options, facet counts, disabled states, URL selections, combined AND matching, search and pagination remain unchanged. Selected counts stay visible when collapsed. Existing mobile show/hide filters and Clear filters remain; a desktop Clear filters control is also available. Resources has its original responsive card grid and no filter sidebar.

## Files involved

- Resources: `apps/cms/src/app/(frontend)/resources/page.tsx`, `src/components/resources/ResourcesPage.tsx`, `ResourceListing.tsx`, `ResourceRequestForm.tsx`, `Resources.module.css`.
- Products: `apps/cms/src/components/products/ProductListing.tsx`, `ProductFilters.module.css`.
- Existing backend and CMS queries: `apps/cms/src/app/(frontend)/api/enquiries/route.ts`, `src/lib/cms/queries.ts`.
- Request configuration/validation: `apps/cms/src/lib/resource-delivery.ts`, `enquiry-validation.ts`.
- Setup and verification: `apps/cms/scripts/seed-resource-request-form.ts`, `verify-resource-requests.ts`, `tests/resource-requests.test.ts`.

No Resources schema migration was made. Related-product context in sales leads reuses Products' existing Resources relationship and is resolved on the server.

Final corrected-scope verification: type checking and all 35 tests passed. Products retains all 12 Function, 9 Formulation and 7 Regulation/Label options. Browser selection of Adjuvants + Emulsifiable Concentrates produced 30 products; reload retained both selections and Clear restored 99. Keyboard expansion, collapsed selections and both pages' layouts were checked at 1440, 1024, 768, 390 and 320px without horizontal overflow. Resources retains its three cards and prefilled request modal without filters. Resources console is clear. Products still reports the pre-existing hydration warning caused by the row entrance animation mutating `catalog-product-row` classes before hydration; that unrelated animation was preserved.
