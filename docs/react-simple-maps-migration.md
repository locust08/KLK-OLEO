# World Map renderer migration — 12 October 2026

The Agrochemical About Us page continues to use the shared `WorldMap` client component. React Simple Maps 5.0.5 now provides `ComposableMap`, `Marker` and the projection context; the core entry point avoids unused zoom dependencies. No other map consumers were found in the available repositories. Other market pages in this application can import this same component and pass the existing `MapPoint[]` contract.

## Design preservation

The original textured outline, mask and SVG sales-network artwork remain unchanged. Replacing them with a generic geographic dataset would change the shapes and texture. Four geographic region anchors replace the previous percentage constants. They represent the existing regional selectors, not new facility addresses. The custom D3 Miller projection uses the existing illustrated extent (170°W–190°E, 85°N–55°S) and horizontal stretch.

Original HTML buttons are rendered through a compatible overlay using the React Simple Maps projection context. SVG foreignObject rendering was trialled but changed icon edge anti-aliasing; the HTML overlay eliminates those differences. CSS lays out the projected buttons; it no longer defines geographic positions. Browser layout quantization to 1/64 pixel preserves the former positions. ResizeObserver updates the projection when the canvas changes size, preserving the 3.18% pin size and 24px minimum. Rounded projection output avoids server/browser floating-point hydration mismatches.

The existing 18 labels, four region controls, legend, selection/pulse, hover, keyboard controls, collapse behavior and location links remain. All existing unnamed network dots stay in their SVG artwork; no location records were invented. The `MapPoint` latitude/longitude fields, server query and existing Payload integration are unchanged. Individual facility markers have not been added because that would change the design. CMS point coordinates remain available for future facility-level presentation.

## Validation

Playwright tested `http://127.0.0.1:4173/about-us` at 1440×1000, 768×1000 and 390×1000. Before/after section screenshots are in `apps/cms/output/playwright/react-simple-maps/`. Reduced motion stabilized screenshots. Screenshot-only styles hide the unrelated sticky header and Next.js development overlay so different scroll positions cannot obscure the section; application styles are unchanged.

Raw RGB comparisons of the full section screenshots found **zero changed pixels at each width**. This includes the artwork, pins, legend, typography, background and region panels. Hover, click, keyboard Enter, panel visibility and collapse/reopen passed at every width; every region's labels were read and all 18 retained. No document overflow or new browser console/page errors were found. `npm run typecheck` passed; `npm test` passed all 39 tests, including geographic registration and CMS projection agreement.

The artwork has inferred registration rather than authoritative georeferencing. Preserving it is intentional. No other market deployment or external repository was changed, and no production deployment was performed.
