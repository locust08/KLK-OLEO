# RiseSolutions Specification

## Overview
- Target file: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/RiseSolutions.tsx`
- Screenshots: `prototype-desktop-scroll-03.png`, `prototype-desktop-scroll-04.png`
- Interaction: hover/focus/click-driven RISE flip cards and click-driven industry carousel

## Layout and values
- RISE: full-bleed nature background under a pale white/grey veil, min-height 610px, 64px 38px.
- Heading white, 36px/1.2; active panel dark green, 43% width, radius 10px, padding 34px.
- The selected principle expands to the 43% active panel while the other three tiles share the remainder. Tile faces use the prototype's frosted white-to-pale-lime wash; letters are 142px/700; R magenta, I pink, S lime, E teal.
- Active content eyebrow lime, title white 26px, body 13px/1.8.
- Solutions: deep green background, 58px 38px 72px; white heading 36px.
- Cards: 3 columns, gap 36px, aspect ratio 1.25, radius 10px, image cover. A strong prototype-matched overlay runs from near-opaque deep green at the top to saturated lime at the bottom, leaving the photography deliberately subdued.
- Card title 25px/600, CTA 12px uppercase.

## States
- Hovering, keyboard-focusing, or clicking R/I/S/E selects that principle. The selected card expands and turns 180 degrees to reveal its explanation; the previous card turns back. Width and face transitions run about 650ms with reduced-motion fallback.
- Carousel page displays three cards desktop and one mobile; dots switch pages.

## Responsive
- <900: active panel is full width above four compact selector tiles; hover/focus/click still switches the explanation.
- 900–1199: flip cards use a 440px minimum height so longer explanations retain the clean prototype proportion without a visible internal scrollbar; wide desktop returns to 360px.
- <=768: selector tiles four equal columns; carousel one card; padding 48px 20px.

