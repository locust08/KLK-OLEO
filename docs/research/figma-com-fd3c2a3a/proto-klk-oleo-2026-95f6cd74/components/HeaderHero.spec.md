# HeaderHero Specification

## Overview
- Target file: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/HeaderHero.tsx`
- Screenshot: `prototype-desktop-1440.png`
- Interaction: sticky/scroll-driven header, click-driven mobile nav, time/click-driven hero

## DOM and exact visual values
- Header: fixed top 0, z-index 50, height 90px desktop, width 100%, padding 0 40px.
- Resting header: translucent pale white/mint with backdrop blur. Hovered, scrolled (after 24px), and open-menu states use the prototype dark green `#003f27`, with white logo/navigation and lime accents.
- Logo: 174x64 visual box, object-fit contain.
- Nav: horizontal from 900px upward so the 984px reference keeps the full navigation. Use a compact 16px gap/11px type at the lower desktop breakpoint, scaling to 32px/13px on wide screens; uppercase, weight 600, letter spacing .04em.
- Hero: starts under header; desktop height 714px in the 1440 capture.
- Hero copy: left 42px, bottom 82px; eyebrow 46px, headline 78px, white.
- Gradient: transparent at 40% to rgba(0,63,39,.86) at bottom.
- Dots: 12px circles, 8px gap, centered 26px above bottom.

## States
- Header changes to dark green after 24px scroll and while the header is hovered or its mobile menu is open; all foreground colors transition with it.
- Hero advances every 5.5s; dot click selects a slide; 600ms opacity/scale transition.
- Mobile menu opens as full-width white panel under a 68px header.
- Search button dispatches an `open-product-search` window event.

## Responsive
- <900: hide desktop nav; show menu button.
- <=768: hero height 590px; copy inset 22px; headline 42px.
- 390: logo about 126px; menu/search remain tappable; nav is stacked.

