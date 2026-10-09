# Careers implementation and validation

Source inspected with Playwright on 8 October 2026: https://www.klkoleo.com/careers/
Design authority: local redesigned home/About pages, globals.css and PrototypePageShell.

## Scope and files

- `src/app/careers/page.tsx`: explicit route and metadata.
- `src/components/careers/CareersPage.tsx`: Careers layout and interactions.
- `public/images/careers/hero.png`, `world-map.png`, and `why-background.png`: original background assets used by this page.
- This report and `output/playwright/careers-*`: source/design references and responsive screenshots. Playwright also generated inspection snapshots in `.playwright-cli/`.
- No global styles, existing page components, backend, or CMS were changed. No deployment or Git push.

## Content and assets

Implemented original introduction, four section shortcuts, all three Why Choose Us tabs, Life at KLK OLEO introduction and Meaningful Work/People First panels, Global Presence copy and six counters, Explore Careers introduction, current vacancy empty state, and resume CTA.

Original statistics preserved verbatim: 100+ Years; 4,000+ Employees; 8 Countries; 16 Operating Facilities; 4 R&D Centres; 6 Global Sales Offices. These are Careers-page figures, not substituted with the different homepage figures.

Reused existing source assets in `public/images/generated/company/`: Global Impact (f44dd769f0), Career Growth (d88d6f27c5), Work Culture (73ca5c4bb8), Meaningful Work (efcbadd7e2), and People First (45be1688a5). New hero: original `2026-05-13-Website-Career-page-Link-3c-Web-scaled.png`. Global section: original `green-map-greennnn-9.png`.

The original secondary background (`2026-05-13-Website-Career-page-Link-Global-Impact-R3c-scaled.png`) is used behind Why Choose Us as `why-background.png`, with a light readability layer and centered tabs/content. An inspection copy remains in `output/playwright/careers-original-section-background.png`. Original Rectangle-314/315 and framework artwork were discoverable but not needed for the new visual treatment. Icons use the site's existing Lucide dependency.

Core Values links point to `/about-us#core-values`. Resume submission retains the authoritative https://www.klkoleo.com/cv-form/ destination; no form/backend was duplicated.

## Design system reuse

PrototypePageShell, HeaderHero, SiteFooter, CookieBanner, ProductExperience and PrototypeBreadcrumbs are reused unchanged. Following the annotated refinement, the hero contains the original introduction and accommodates overlapping section shortcut cards; it uses 23rem mobile / 28rem tablet-desktop minimum content heights.

Uses Poppins, klk-h1/h2/h3, klk-body/body-large/body-small, klk-button/link, klk-container, klk-section, existing color/radius tokens and sm/md/lg/xl breakpoints. No duplicate global scale or new global CSS. Section padding: 80px at 1440px; 64px at 768px/390px. Containers: 1340px / 704px / 350px. Primary: #016836. H1: 76px / 51.2px / 41.75px. H2: approximately 60px / 40px / 32.12px, matching existing fluid classes.

Why images retain approximately 3:2 ratio; Life images retain 16:9. Hero uses cover with centered desktop/tablet crop and 70% horizontal positioning on mobile to retain the engineers. Map remains decorative behind transparent statistic groups. Its tablet/desktop treatment fits the complete wide map to the section; mobile uses a centered cover crop.

## Annotated refinement — 9 October 2026

- Hero introduction moved onto the photograph. Four green shortcut cards overlap the hero by 48–80px depending on viewport, with hand-heart, shield, globe and briefcase icons.
- Why heading, tabs and panel copy centered. Original aerial background restored; content placed in a readable translucent panel. All three original tab panels retained.
- Life heading/introduction centered. Cards constrained to 60rem combined width and arranged side by side from the existing md breakpoint. Titles use klk-h5, descriptions use klk-body-small, with leaf/team icon badges.
- Global heading/copy centered. Six stat groups have computed background rgba(0,0,0,0), no borders, smaller klk-h4 numbers and compact circular icon badges. Three columns from md; two on mobile. Wide map remains visible at both edges on tablet/desktop.
- Playwright checked 1440 / 920 / 768 / 390px; no horizontal overflow at any size. Life card widths: 585 / 409 / 340 / 350px. Global section heights: 611 / 547 / 475 / 782px. The 768px Life section is now 728px tall versus 1567px in the initial implementation.
- Revised screenshots: `output/playwright/careers-refined-{width}.png`, plus section screenshots at 920px. Repeatable inspection script: `output/playwright/careers-refinement-check.js`.
- Keyboard tab switching, responsive overlap, transparent backgrounds, source photo crops, and mobile stacking checked. TypeScript and targeted ESLint pass; production build passes. No globals, shared components or unrelated pages edited.

## Validation

- Playwright screenshots reviewed at 1440px desktop, 768px tablet, and 390px mobile. All have scrollWidth equal to viewport width.
- Checked section spacing, banner height, alignment, typography, surface colors, card radii, image crops and loaded images. Mobile Life photographs were checked separately after lazy loading; final full-page captures scroll through the page first.
- Tabs verified with click, ArrowRight/ArrowLeft, Home/End; only selected tabpanel is exposed. Focus and selection follow keyboard activation.
- Section shortcuts verified; Explore Careers reaches #JL with shared sticky-header offset (68px on mobile).
- Counters animate once on intersection over two seconds. Values remain stable for screen readers. Negative elapsed time is clamped. Reduced-motion initial loading preserves final values; hover transitions use existing reduced-motion overrides.
- Resume link verified against original source. No form submitted.
- TypeScript and Careers-targeted ESLint pass. Production build passes with `/careers` included, alongside existing routes.

## Extraction limits

### Photo-card overlay refinement

Follow-up: removed the standalone white spacer below the hero. The shortcut wrapper now has zero layout height and sits over the Why background; responsive top padding keeps the heading clear of the cards. A white-to-transparent fade blends the aerial background under the row. Checked at 1440/920/768/390px with no horizontal overflow; TypeScript and targeted lint pass.

The section shortcut row now follows the supplied second image: four landscape photo cards, pale circular icons at the upper left, circular arrow controls at the lower right, white borders and green image overlays. Visible titles were removed to match the reference; each link retains its accessible name. Existing tree-planting, facility, aerial-complex and engineer photographs are reused. No decorative waves, floating leaves, slogans or other hero elements were introduced.

Positioned offsets replace collapsing negative top margins, so the row visually straddles the hero boundary without the following white section hiding the overlap. Validated at 1440/920/768/390px with no horizontal overflow; TypeScript and targeted lint pass. Screenshot: `output/playwright/careers-photo-cards-desktop.png`.

The live source rendered “No posts found.” Country and location selects contained only their prompt options, and Clear Filters was disabled. No vacancy records or filter taxonomy could reliably be extracted. Local filters are therefore disabled in the verified empty state; a link to the live opportunities section lets visitors check newer listings. This is a static snapshot, not a CMS/jobs integration.

All main Careers copy, tab content, numbers and meaningful images/backgrounds were extractable. Original icon-font artwork was replaced by existing Lucide icons to fit the redesigned website. A development-only LCP advisory can appear when scrolling directly to the lazy map; it is not a broken image or runtime error.
