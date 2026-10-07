# Shared world map investigation and integration

## Findings

The previous map lived inside `apps/cms/src/components/about/AboutPage.tsx`. It used `/images/about/klk-oleo-global-presence.png`, a flattened image containing map labels, alongside a hardcoded region/country/facility list in JSX. There was no reusable map component or CMS location collection.

This repository contains one frontend/CMS application (`apps/cms`). Its Payload `sites` collection models a main site and directly related market sites with scoped publishing permissions. The seed defines `klk-oleo` and `agrochemical`. No main-site frontend, additional market frontend, existing shared package, or evidence of external repositories/deployment connections is available here. Sharing a CMS is supported by this architecture; existing public websites' actual backend connections remain unverified.

## Implemented source of truth

`MapLocations` in `src/collections.ts` is a versioned collection owned by a `kind: main` site. The existing site-assignment and publishing permissions apply. Market-site editors cannot edit the main site's locations. Main-site publishers/site admins and super admins can manage them. Editors can prepare drafts using the existing workflow.

Each record supports a stable key, label, country, one of the four existing regions, latitude, longitude, optional description/HTTP(S) URL, display order, enabled flag and draft/published state. The illustration excludes Antarctica: supported latitudes are 55°S–85°N. Coordinates are manually edited decimal degrees; there is no geocoding.

Anonymous REST reads expose only enabled, published records. The Agrochemical server query also filters by the main-site slug (`SHARED_MAP_SITE_SLUG`, default `klk-oleo`), avoiding local frontend location arrays. `components/maps/WorldMap.tsx` accepts plain `MapPoint[]`; the model/projection and server data query live separately in `lib/maps`.

`data/shared-map-locations.json` is a one-time seed/import fixture, not a runtime fallback. `scripts/seed-map.ts` creates missing keys and never overwrites edited records or repopulates disabled records during frontend rendering. It preserves all 18 previous facility labels. Its coordinates represent approximate country/city positions, not verified facility addresses; editors should confirm exact coordinates when available. Identical coordinates share a selectable marker and retain every label in the region panel.

## Synchronization

CMS feasibility: **Implemented in this repository's existing backend.**

Adding or publishing a CMS pin automatically makes it available to every site consuming this same shared data source on its next fetch/page request. Agrochemical fetches it for every About page request. Open browser pages are not pushed live updates; reload fetches the latest data. No rebuild or frontend location edit is necessary.

The main website and external market deployments have **not** been connected by this change. Their repositories/backend URLs were not provided. They must adopt this collection's source and a renderer before they participate in synchronization. This does not claim that the existing public main website already propagates its data here.

Other frontends in the same CMS application can reuse `getMapPoints()` and `WorldMap`. Separate frontends should fetch the existing Payload REST endpoint anonymously from their server:

```text
GET <shared-cms-origin>/api/map-locations
  ?where[site.slug][equals]=klk-oleo
  &sort=displayOrder&depth=0&limit=100&page=1
```

Follow `hasNextPage`/`nextPage` until all records are loaded. Do not send market-editor credentials to a public data request: authenticated CMS requests intentionally use site-scoped visibility. Server-to-server fetching avoids widening browser CORS settings. Cache with explicit revalidation if needed; cache duration determines propagation delay. A future shared frontend package can export this presentation/model when the other frontend repositories and build systems are known; a new service is unnecessary.

For a future production release, apply the normal Payload database schema/migration workflow for its configured database and run `npx tsx scripts/seed-map.ts` once from `apps/cms`. No deployment, production migration or push was performed. Local SQLite schema was updated by the existing development adapter.

## Visual treatment and limits

The map outline was exported from the supplied Figma `Mask group` (8346:1975), retaining its roughly 2:1 proportions and grey texture. The reference region section (8346:1970) shows green ring pins, small green points, an open dark green region and pale inactive rows with lime arrow controls. Those states are implemented, along with pointer/focus feedback and click/keyboard region selection. Existing map entrance animations remain. Mobile keeps a scrollable overview with readable region controls below it.

The inspected Figma did not expose map-specific prototype transition timing, tooltip content, or mobile frames. No custom tooltip, street zoom, directions or automatic address search was added. Exact prototype animation parity cannot be claimed. The coordinate registration is a Miller cylindrical approximation calibrated against the illustration's landmarks, not verified georeferencing metadata. The standard projection is described in [PROJ's documentation](https://proj4.org/en/stable/operations/projections/mill.html); the illustration crop is inferred visually. Rendering rounds transforms to prevent Node/browser floating-point hydration differences.

Unlabelled sales-network dots in the previous/reference raster have no supplied structured names or coordinates. They were not converted into invented CMS records; importing them needs the source location dataset. All 18 identifiable facility labels from the existing JSX are retained. The original annotated PNG remains available in the repository.

Only the shared footer's bottom copyright/legal strip was changed: centered two-row arrangement, regular 12px text, 10px row spacing, a lighter existing separator and tighter bottom spacing. The existing content, links and the rest of the footer are untouched. Fine-grained footer typography matching could not be confirmed after the reference browser became unavailable; the implementation follows the visible reference's compact centered treatment.

The About Introduction uses the existing agriculture image, homepage plant image and tailored-agriculture image in three staggered rounded frames. The section has full-width equal columns at desktop/large tablet sizes, then stacks below 992px. All original copy remains. R&D changed only from pale blue to white.

## Verification

All 32 tests and `npm run typecheck` passed. `npx tsx scripts/verify-map.ts` verified main-site ownership, coordinate validation, market editor isolation, add/edit/disable, published visibility, public API and frontend transform updates. Its temporary location and two users were removed in `finally`. A frontend reload picks up both label and coordinate changes. Re-running the seed created zero records. SQLite integrity check passed; product/page/resource/site/user/banner/form counts match the pre-seed backup.

Responsive checks passed at 1440×900, 1024×768, 768×1024, 390×844 and 320×740, including equal desktop columns, three images, stacking, white R&D, footer text, pin selection, image loads and no document overflow. Pointer hover, click, keyboard selection and mobile region controls passed. Bottom footer formatting/content/links matched across `/`, `/about-us`, `/products`, `/resources` and `/contact`. Screenshots are kept outside the repository. No new About console errors were found. The existing catalogue animation/hydration warning was reproduced on `/products`; new map rounding warnings were resolved.

A layout-shift observer recorded no initial-load shifts on About Us at 1440px and 390px during the local verification window.

## Separate future work

Manual city-level additions can already use labels and known coordinates inside the illustrated extent. Reliable dense city-level mapping would require a map with documented geographic projection, verified coordinates, overlapping-pin grouping, accessible selection and label collision handling. The current overview is intentionally approximate.

Address lookup requires a separately selected geocoding provider, API/key management, usage/privacy terms, costs, rate limiting and editor review of returned coordinates. A Google Maps-style editor would additionally require an approved mapping SDK/provider, zoom/tile handling, draggable editing, persistent coordinates, accessibility and deployment/key restrictions. None of those features or paid services were implemented.

## Files involved

- `apps/cms/src/collections.ts`, `src/payload-types.ts`: shared collection and generated CMS types.
- `apps/cms/src/lib/maps/model.ts`, `query.ts`: presentation-independent contract/projection and published main-site query.
- `apps/cms/src/components/maps/WorldMap.tsx`, `WorldMap.module.css`: reusable presentation and interaction.
- `apps/cms/src/components/about/AboutPage.tsx`, `AboutPage.module.css`, `src/app/(frontend)/about-us/page.tsx`: Introduction, R&D background and map integration.
- `apps/cms/src/app/(frontend)/typography.css`: only bottom-footer treatment in this refinement, plus the map panel colour token.
- `apps/cms/public/images/about/shared-world-map.png`: Figma-exported map outline.
- `apps/cms/data/shared-map-locations.json`, `scripts/seed-map.ts`, `scripts/verify-map.ts`, `tests/map-projection.test.ts`, `package.json`: one-time seed, lifecycle/projection verification and commands.
- This report and `docs/superpowers/plans/2026-10-07-shared-world-map.md`: investigation and implementation record.

Earlier requested hero/card/eyebrow changes remain in `HomePage.tsx`, `site-assets.ts`, `motion.css`, `typography.css` and `public/images/home/agrochemical-spraying-hero.webp`. No main-site or external market repository was modified.
