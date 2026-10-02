# PresenceNewsEsg Specification

## Overview
- Target file: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/PresenceNewsEsg.tsx`
- Screenshots: `prototype-desktop-scroll-05.png`, `06`, `07`, `08`
- Interaction: click-driven region accordion; link/card hover

## Layout and values
- Presence white, 66px 38px; two-column 68/32 split.
- Map object-fit contain; region panel deep green with white text and radius 8px.
- Closed rows pale mint, 58px high, 16px gap, 26px title.
- News pale mint, 62px 38px; 3 cards, 24px gap, white radius 10px, 14px padding.
- News images ratio 1.52, radius 8px; titles green 14px/600.
- ESG deep green, 62px 38px; two image cards 1:1 and 1.55:1, 20px gap.

## States
- One accordion region open at a time; 260ms grid-row animation.
- Image cards scale 1.035 on hover; CTA arrow translates 4px.

## Responsive
- <=900: presence stacks; news two columns; ESG two equal columns.
- <=640: news and ESG single column; regional legend wraps.

