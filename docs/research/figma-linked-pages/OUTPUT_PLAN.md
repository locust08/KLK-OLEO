# Linked prototype integration

Source: https://www.figma.com/proto/f1sjoz6VoqHYabMOxFh41Z/KLK-Oleo-2026?node-id=8218-1936&starting-point-node-id=8218%3A1712&page-id=8218%3A693

Figma controls and page structure are authoritative. The Downloads extraction is used for images and visual styling only, not routing or page content. Connector design-context access is denied; inspected the public prototype directly. Existing homepage/image corrections stay in place. No commits or pushes.

## Confirmed linked screens

| Screen | Figma frame | Local route |
|---|---|---|
| KLK OLEO in Brief | 8218:1936 | /about-us |
| Products overview | 8259:885 | /products |
| Fatty Acids | 8218:1553 | /products/fatty-acids |
| PALMERA Fatty Acids | 8218:1712 | /products/fatty-acids/palmera |
| News & Events | 8218:1609 | /news-events |
| Contact Us | 8218:1767 | /contact-us |

The existing /products route is explicitly updated under the user's request. Preserve its finder at /products/search; homepage header search stays available. Shared shell/banner/breadcrumbs use existing header/footer and tokens. Navigation and completed-page CTAs route locally. Do not invent unfinished prototype destinations; document visual-only buttons.

## Visual foundation

Screenshots: docs/design-references/figma-linked-pages. Prototype canvas rendered at 1280 wide; scale-down-width. Header about 90px at 1600 natural canvas, banner content about 420px, main padding 40px, Poppins type, green #006b3f / dark #003f27, pale mint #e8f3ed, teal #078f96, lime #7bbf2a. Adapt fluidly to mobile; prototype itself is desktop-scaled.

## Checks

Inspect desktop/mobile screenshots; click header/footer completed routes; verify product overview → listing → detail → back, search, news filters, office contact links; lint/typecheck/production build and diff checks. No backend submission is added.
