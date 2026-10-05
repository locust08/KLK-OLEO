# RiseSolutions Specification

## Overview
- Target file: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/RiseSolutions.tsx`
- Screenshots: `prototype-desktop-scroll-03.png`, `prototype-desktop-scroll-04.png`
- Interaction: hover/focus/click-driven RISE flip cards and infinitely looping industry carousel (IndustrySolutions.tsx).

## Layout and values
- RISE: full-bleed nature background under a pale white/grey veil, min-height 610px, 64px 38px.
- Heading white, 36px/1.2; active panel dark green, 43% width, radius 10px, padding 34px.
- The selected principle expands to the 43% active panel while the other three tiles share the remainder. Tile faces use the prototype's frosted white-to-pale-lime wash; letters are 142px/700; R magenta, I pink, S lime, E teal.
- Active content eyebrow lime, title white 26px, body 13px/1.8.
- Solutions: #004f2d background; 3.625rem top and 4.5rem bottom padding, 2.5rem horizontal padding; white heading 2.375rem.
- Cards: horizontal track, 31:30 aspect ratio, 2.5rem gaps and rounded corners. Exact prototype photographs stay clear in the upper half, fading through #004f2d at 55% opacity at 82% height to #7bbf2a at 85% opacity at the bottom.
- At a 1920px CSS viewport, cards measure approximately 620 x 600px. At 1536px (the CSS viewport equivalent of 1920px at 125%), cards measure approximately 496 x 480px, retaining the same displayed proportions.
- Card title 1.875rem/600, CTA 0.8125rem uppercase.

## States
- Hovering, keyboard-focusing, or clicking R/I/S/E selects that principle. The selected card expands and turns 180 degrees to reveal its explanation; the previous card turns back. Width and face transitions run about 650ms with reduced-motion fallback.
- Seven industries follow the prototype order: Beauty, Food, Cleaning, Life Science, Lubricants, Oleo Basics, Polymers. Mouse dragging, touch swiping, horizontal scrolling and arrow keys move the track; dots select starting cards 1, 4 and 7. Duplicate cycles rebase after scrolling settles to allow continuous movement in either direction.

## Responsive
- <900: active panel is full width above four compact selector tiles; hover/focus/click still switches the explanation.
- 900–1199: flip cards use a 440px minimum height so longer explanations retain the clean prototype proportion without a visible internal scrollbar; wide desktop returns to 360px.
- <768: selector tiles four equal columns; carousel cards 82vw wide with a preview of the next card; padding 48px 20px.

