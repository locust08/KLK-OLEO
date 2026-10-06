# KLK OLEO Visual Refinement — Design QA

Date: 2026-10-06  
Reference: supplied Figma archive, `DESIGN.md`, linked-page captures, and homepage captures under `docs/design-references/`  
Implementation: Next.js routes rendered at 1440, 768, and 390 CSS pixels

## Final result

final result: passed

No open P0, P1, or P2 visual, interaction, accessibility, or responsive findings remain.

## Evidence set

Full-page screenshots are stored in `output/playwright/klk-visual-refinement/` for these routes at 1440, 768, and 390 CSS pixels:

- `/`
- `/about-us`
- `/products`
- `/products/fatty-acids`
- `/products/fatty-acids/palmera`
- `/products/search`
- `/news-events`
- `/contact-us`

Every route/viewport combination passed:

- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`
- all rendered images completed with a positive natural width after the page state was exercised
- zero browser application errors
- required headings, links, and controls remained present

The browser emitted development-only React/HMR logging and non-blocking Next Image performance/aspect-ratio warnings. These were not application failures and the production build was verified separately.

## Comparison normalization

The source captures use mixed export dimensions, so each source was proportionally normalized to 1440 pixels wide. The implementation side uses a 1440 CSS-pixel Playwright capture at device scale 1 and the same normalized top-region height.

| Comparison | Source pixels | Normalized source | Implementation pixels | CSS viewport | Density |
| --- | ---: | ---: | ---: | ---: | ---: |
| Homepage | 1778 × 1234 | 1440 × 999 | 1440 × 6424 | 1440 × 1000 | 1× |
| About | 1905 × 848 | 1440 × 641 | 1440 × 4856 | 1440 × 1000 | 1× |
| Products | 1265 × 791 | 1440 × 900 | 1440 × 2249 | 1440 × 1000 | 1× |
| News | 1265 × 791 | 1440 × 900 | 1440 × 3226 | 1440 × 1000 | 1× |
| Contact | 1265 × 791 | 1440 × 900 | 1440 × 2504 | 1440 × 1000 | 1× |

Combined comparisons:

- `compare-home-1440.png`
- `compare-about-1440.png`
- `compare-products-1440.png`
- `compare-news-1440.png`
- `compare-contact-1440.png`

## Review rubric

### Typography

Passed. Poppins is used consistently through the supplied font setup. Responsive H1–H6, body, caption, overline, link, and button utilities establish a clear hierarchy without viewport-dependent root scaling.

### Spacing and layout rhythm

Passed. Shared 40/20-pixel gutters, 1440-pixel content maximum, section padding, card spacing, and internal-page split layouts remain stable at desktop, tablet, and mobile widths. No horizontal page overflow was detected.

### Colours and tokens

Passed. Core green, lime, background, border, text, blue, and magenta values are supplied through semantic KLK tokens. Shared cards, forms, banners, dialogs, and footer surfaces no longer depend on the legacy core palette literals.

### Imagery

Passed. Existing project images and supplied reference assets are retained. Image crops preserve focal content across the tested widths. The looping industry carousel and fixed header logo are explicitly loaded early enough for deterministic full-page capture.

### Copy and content

Passed. Existing copy, product records, news entries, office details, links, product routes, brochure actions, and category/detail data remain intact.

### Icons and controls

Passed. Existing Lucide controls remain consistent, touch targets meet the 44-pixel minimum on navigation and primary actions, and active/expanded states remain visually distinct.

### Interactions

Passed. Playwright smoke coverage verified desktop product navigation, mobile navigation, hero tabs, RISE selection, core-value reveal, product-list filtering, product-detail accordions, product search/detail/enquiry dialogs, news filtering, regional accordion behavior, contact `tel:`/`mailto:` destinations without transmission, and cookie dismissal.

### Accessibility

Passed. Focus-visible treatment is retained, dialogs have accessible names and close controls, stateful controls expose `aria-selected`, `aria-pressed`, or `aria-expanded`, and unavailable News/Contact actions remain disabled with explanatory `aria-describedby` content.

### Responsive behavior

Passed. The eight representative routes passed at 1440, 768, and 390 CSS pixels with no clipped content, page-level horizontal overflow, or failed images. Rich product tables remain horizontally contained within their content region.

## Resolved findings

| Priority | Location | Evidence and impact | Resolution |
| --- | --- | --- | --- |
| P1 | News featured card | The supplied filename did not exist, producing a failed Next Image request and a blank featured image. | Corrected the record to the existing 1080px Vitafoods Asia asset and re-ran the image integrity matrix. |
| P2 | Industry carousel | Off-screen loop clones remained lazy and could be blank when a full interactive track state was captured. | Marked the seven cached carousel assets eager so every clone resolves deterministically. |
| P2 | Shared header | The fixed brand mark could remain incomplete during immediate route capture. | Preloaded the header logo and re-ran the full matrix. |

## Residual P3 differences

- Some supplied reference captures show a different homepage carousel frame or an open navigation state; the implementation preserves the existing eight-slide content and verified controls rather than hard-coding a screenshot-only state.
- Mixed source-export dimensions require proportional normalization, so small crop differences remain in the combined comparison files.
- Development mode reports advisory Next Image warnings for the shared logo and an LCP candidate during synthetic full-page scrolling; no broken image, layout shift, production error, or build failure was observed.

