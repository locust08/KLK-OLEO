# ProductExperienceFooter Specification

## Overview
- Target file: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ProductExperienceFooter.tsx`
- Screenshots: `screen-products-overview-02.png`, `state-cookie-dismissed.png`, `prototype-desktop-scroll-08.png`
- Interaction: search/filter, product detail, enquiry dialog, cookie consent

## Product search
- Inline discovery section before Presence; pale mint background, 72px 38px.
- Search input 52px high, white, 1px green border, radius 999px.
- Four filter controls: category/functionality/formulation/labels; filters combine with AND across groups.
- Results use 4-column cards desktop, white, radius 12px, 22px padding.
- Empty state provides clear filters action.
- Product click opens detail modal; “Make an enquiry” opens form dialog.

## Footer
- Deep green `#003f27`, white/muted text, padding 42px 38px 90px.
- Four columns: brand/contact, quick links, products, markets.
- Logo white treatment via CSS brightness/invert; headings 14px/600; links 12px/1.8.
- Legal row centered with top border.

## Cookie banner
- Fixed bottom 0, dark charcoal, z-index 70, 15px vertical/16px horizontal.
- Copy left, two buttons and close right; dismiss persists in localStorage.

## Responsive
- Results 2 columns <=1000, 1 column <=640.
- Footer 2 columns <=900, 1 column <=580.
- Dialogs occupy calc(100vw - 32px) on mobile.

