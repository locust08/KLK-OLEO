# KLK OLEO Visual Refinement Design

## Context and intent

The existing KLK OLEO Next.js site contains a homepage, informational pages, product category and product detail routes, product search, responsive navigation, forms, filters, accordions, carousels, and local product data. The supplied Figma file, `DESIGN.md`, and design-system `SKILL.md` define the visual benchmark for refining those existing experiences.

The implementation must make the complete site feel like one coherent KLK OLEO product while preserving all current routes, content, data, assets, behavior, and integrations. This is an incremental visual-system migration, not a rebuild.

## Goals

- Establish one reusable set of KLK OLEO colour, typography, radius, spacing, container, and interaction tokens.
- Apply those foundations consistently to the homepage, shared chrome, informational pages, product pages, product search, cards, buttons, and forms.
- Match the reference hierarchy and proportions at 1440px, 768px, and 390px.
- Preserve every existing route, content block, product record, link destination, form, and interaction.
- Meet WCAG 2.2 AA expectations for contrast, keyboard access, visible focus, semantics, and practical touch targets.
- Prevent horizontal document overflow and broken image presentation at the required breakpoints.

## Non-goals

- Rebuilding the website or replacing its component architecture wholesale.
- Removing or hiding routes, pages, data, content, or functionality that are not shown in Figma.
- Replacing working images merely to resemble the reference more closely.
- Changing backend, CMS, API, or product-data behavior.
- Inventing new pages, interactions, or arbitrary visual styles.
- Deploying, pushing, or publishing the site.

## Existing implementation constraints

- The working tree already contains substantial uncommitted page, component, data, asset, research, and screenshot work. Those changes must be preserved.
- Next.js 16.3.5, React 19, Tailwind CSS 4, TypeScript strict mode, Poppins, `next/image`, and App Router conventions remain in place.
- Existing client-side behavior in the header, hero carousel, product finder, product filters, dialogs, RISE cards, core-value cards, news filter, regional accordion, and cookie banner remains intact.
- The supplied `.fig` package is a valid Figma archive. Its thumbnail, metadata, extracted design guidance, and existing reference screenshots are the visual source of truth.

## Chosen approach

Use a token-first incremental migration.

1. Define exact design foundations globally.
2. Refine shared shells and controls so downstream pages inherit the same rules.
3. Replace component-level one-off values with semantic tokens or shared utility patterns.
4. Adjust page-specific geometry only where the shared system cannot express the reference composition.
5. Verify the rendered result at all required breakpoints and iterate against the reference.

This approach is preferred over a global override layer because it keeps ownership clear and avoids specificity problems. It is preferred over a component rewrite because it minimizes functional risk and respects the requirement to preserve the site.

## Design foundations

### Colour tokens

The implementation must expose semantic CSS variables and Tailwind-compatible theme tokens for:

- Brand pink: `#E11282`
- Brand blue: `#008995`
- Primary green: `#016836`
- Dark green: `#014E29`
- Darker green: `#002F18`
- Darkest green: `#002413`
- Lime green: `#79B829`
- Light green background: `#E6F0EB`
- Subtle green background: `#D9E8E1`
- Subtle border: `#B0D0C1`
- White: `#FFFFFF`
- Dark text: `#212529`
- Secondary text: `#414141`
- Disabled text: `#ADB5BD`
- Light body text: `#F1F3F5`

Interaction-state tokens must use the supplied normal, hover, and active green values rather than newly invented shades. Alpha variants must derive from semantic tokens where practical. Existing functional colours such as cookie-consent blue may remain only where they represent a distinct semantic action and meet contrast requirements.

### Typography

Poppins remains the sole primary family and continues to load through `next/font/google`.

Desktop type tokens must match the reference:

- H1: 64px, 110%, 600, -1.5px
- H2: 48px, 112%, 600, -0.5px
- H3: 36px, 115%, 600
- H4: 28px, 120%, 600, 0.25px
- H5: 22px, 125%, 600
- H6: 18px, 130%, 600, 0.15px
- Body large: 18px, 160%, 400
- Body: 16px, readable page-copy line height, 400, 0.15px
- Body small: 14px, 155%, 400
- Caption/overline: 12px, 150%, 400/500
- Buttons and primary links: 16px, 600/500 with the reference tracking

Responsive type tokens must use bounded `clamp()` values so headings reduce deliberately on tablet and mobile. The current desktop-wide root `font-size` scaling must be removed because it changes every rem-based component and causes inconsistent proportions on wide screens.

### Layout and spacing

- Introduce one shared content container with a desktop maximum width and fluid gutters.
- Use 20px mobile gutters, 32px tablet gutters, and approximately 40px desktop gutters unless a full-bleed reference section requires otherwise.
- Define reusable section padding tokens for compact, standard, and large sections.
- Use consistent content widths for display headings, body-copy columns, forms, and cards.
- Full-bleed media may extend to the viewport edge while its text content remains aligned to the shared container.
- Maintain a stable fixed-header offset for anchors and page banners.

### Radius, borders, and elevation

Only the reference radius scale may be used: 0, 4, 8, 12, 16, 24, and full/pill.

Cards should use borders, backgrounds, and shadows only when the reference indicates separation. Default content sections must not become generic elevated cards. The reference shadow is reserved for overlays, menus, and intentional raised surfaces.

### Motion and focus

- Preserve existing meaningful transitions and respect `prefers-reduced-motion`.
- Hover transforms must be subtle and must not shift surrounding layout.
- Every interactive control must retain a visible token-based `:focus-visible` state.
- Disabled controls must remain visibly disabled and retain their accessible explanation.

## Shared component design

### Header and navigation

- Preserve all current destinations, product menu contents, language choices, search trigger, active-route state, and mobile navigation behavior.
- Align header height, logo scale, navigation spacing, label sizing, search control, and language control with the reference.
- Use the dark-green state consistently on hover, scroll, and open mobile navigation.
- Keep touch targets at least 44px where practical on mobile.
- Ensure desktop dropdown and mobile menus remain keyboard operable and do not overflow the viewport.

### Page shell, breadcrumbs, and banners

- Keep one shared shell for compact header, page content, footer, product experience, and cookie banner.
- Place breadcrumbs within the shared gutter and tokenise their gradient, type, height, and spacing.
- Standardize internal-page hero height, text alignment, image treatment, overlay, and responsive crop.
- Preserve each page's existing hero image and title.

### Buttons and links

- Provide consistent primary, secondary/teal, underline, arrow-link, icon, and disabled treatments.
- Button type must use the reference 16px semibold token when space permits; compact utility controls may use the body-small token.
- State changes must cover hover, focus-visible, active, disabled, and loading-compatible presentation.
- Existing navigation and form semantics must not be replaced with non-semantic elements.

### Cards

- Standardize content padding, title/body scale, radii, borders, image aspect ratios, and footer/action spacing across industry, news, ESG, office, product, RISE, and mission cards.
- Card variants may differ by purpose, but each variant must use the shared foundations.
- Long titles and descriptions must wrap without clipping or forcing horizontal overflow.

### Forms, filters, dialogs, and accordions

- Standardize labels, fields, selects, search inputs, text areas, validation-ready states, and form actions.
- Preserve all existing search, filtering, dialog, enquiry, accordion, and cookie-consent behavior.
- Dialogs must remain scrollable within the viewport and usable by keyboard.
- Tables and product-detail HTML must remain horizontally contained on small screens.

### Footer

- Preserve every current column, destination, contact detail, legal link, and copyright line.
- Use the reference dark background, spacing, heading hierarchy, body contrast, and responsive stacking.
- Keep the footer visually separate from the product-experience section and cookie banner.

## Page application

### Homepage

Refine the hero, About metrics, RISE section, industry carousel, global-presence section, news cards, ESG cards, product experience, footer, and cookie banner using the shared tokens. Preserve content, slide count, autoplay behavior, carousel behavior, map data, and links.

### About Us

Preserve the supplied imagery and all background, vision, mission, core-value, and global-presence content. Correct type scaling, two-column proportions, mission-card rhythm, core-value sizing, section transitions, and mobile stacking without changing interactive reveals.

### Products overview

Preserve all categories, copy, links, and background imagery. Reduce mobile text density and excessive vertical space through responsive type, copy width, section spacing, and card sizing rather than content deletion.

### Product category pages

Preserve category navigation, product search, product data, brochure actions, and links. Standardize the sidebar, list cards, body copy, actions, and responsive stacking.

### Product detail pages

Preserve every generated route, product record, HTML section, brochure, accordion, back link, and enquiry route. Standardize the detail header, rich text, tables, accordions, CTA, media, and mobile overflow handling.

### Product search

Preserve query, filters, result cards, product dialog, enquiry form, empty state, and modal behavior. Apply the shared control, card, button, and dialog system.

### News and Events

Preserve every news item, category filter, card, date, and disabled detail action. Align featured cards, archive grid, filter bar, text density, and responsive card flow with the reference.

### Contact Us

Preserve office records, address, telephone and email links, flags, hero, and disabled product-enquiry behavior. Standardize office cards, headquarters composition, controls, and responsive stacking.

## Responsive behavior

### 1440px desktop

- Use the full reference hierarchy, desktop container, multi-column grids, and measured hero/header proportions.
- Avoid font-size changes caused by viewport-wide root scaling.
- Ensure content does not become excessively wide; body-copy measure remains readable.

### 768px tablet

- Collapse navigation to the existing mobile/tablet menu.
- Shift dense three-column grids to two columns where appropriate.
- Preserve hierarchy through intermediate typography and spacing rather than shrinking the desktop layout uniformly.
- Ensure sidebars, media/text layouts, and cards stack without cramped columns.

### 390px mobile

- Use 20px page gutters and practical touch targets.
- Stack cards and split layouts into one column unless the existing interaction specifically benefits from a compact multi-item control.
- Reduce headings with responsive tokens while preserving clear hierarchy.
- Keep images visually substantial with controlled aspect ratios and object positioning.
- Prevent document-level horizontal overflow, clipped text, and controls outside the viewport.

## Data flow and behavior preservation

The refinement must not alter data ownership or route generation. Product catalog data remains in the existing library files. Page components continue consuming the same props and data. Visual refactors may introduce shared class constants or presentational wrappers, but public component behavior and route parameters remain unchanged.

If a visual change exposes an existing functional defect, that defect must first be captured with a failing regression test before it is corrected. Unrelated behavior changes are out of scope.

## Testing and verification

### Test-first safeguards

Before production styling changes, add a failing design-system regression test that verifies:

- Required semantic tokens exist with exact reference values.
- Legacy primary colour aliases no longer define competing design values.
- Shared route files still exist.
- Selected shared components use semantic design foundations instead of banned legacy colour literals.

Run the test and confirm it fails for the expected missing-token or legacy-literal reason. Implement the smallest foundation needed to pass, then continue migration with the test kept green.

### Static verification

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Full project check through `npm run check`
- Review generated route output and confirm all original routes remain present.

### Browser verification

Use Playwright CLI at 1440px, 768px, and 390px to verify:

- Homepage
- About Us
- Products overview
- At least one product category
- At least one product detail
- Product search
- News and Events
- Contact Us

At each breakpoint check document width, broken images, header/menu behavior, typography, wrapping, spacing, card geometry, image scale, and console errors.

Smoke-test the primary existing interactions: desktop product menu, mobile menu, hero controls, RISE selection, core-value reveal, product filtering, product detail accordion, product/enquiry dialogs, news filter, regional accordion, contact links without transmission, and cookie dismissal.

### Design QA

Capture same-viewport reference and implementation evidence and place them in a combined comparison image before judging fidelity. Record findings and iterations in project-root `design-qa.md`. The final result may be `passed` only when no actionable P0, P1, or P2 mismatch remains. Any remaining P3 polish must be documented.

## Acceptance criteria

- All existing pages, routes, content, product data, navigation destinations, forms, and interactions remain available.
- The site uses the reference colour tokens without arbitrary competing greens.
- Typography follows the reference hierarchy and scales deliberately across desktop, tablet, and mobile.
- Shared header, navigation, banners, buttons, cards, forms, and footer use one consistent visual system.
- Image containers and crops have appropriate visual weight at all required breakpoints.
- No tested route has document-level horizontal overflow or a broken local image.
- Keyboard focus remains visible and tested interactions remain keyboard reachable.
- Lint, TypeScript, production build, regression tests, and browser smoke checks pass, or any pre-existing failure is reported precisely.
- `design-qa.md` records the evidence, iteration history, remaining P3 differences, and a final result of `passed` or `blocked`.
- No deployment or push is performed.
