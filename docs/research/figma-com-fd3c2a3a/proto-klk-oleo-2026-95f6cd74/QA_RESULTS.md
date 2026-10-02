# Visual QA Results

## Viewports checked

- Figma: 1440x1000 desktop, 390x844 mobile, nine desktop scroll states, two mobile scroll states.
- Local: 1440x1000 desktop hero/mid/lower states and 390x844 mobile hero/menu/mid states.

## Interactions checked

- Fixed/scrolled header and desktop navigation
- Mobile menu open/close
- Hero carousel controls
- RISE state switching
- Product search overlay
- Combined name + regulatory/label filtering (verified one-result Glycerine + Halal state)
- Product detail dialog
- Enquiry dialog
- Regional accordion
- Cookie consent dismissal

## Corrections made during QA

- Replaced the scaffold route and established correct Poppins typography and KLK palette.
- Fixed mobile navigation layout and page-level horizontal clipping.
- Added working anchor targets for About, Products, Markets, News, and Contact.
- Added image sizing/eager-loading hints for the fixed hero and footer logo.
- Preserved mobile-specific card stacking instead of shrinking the desktop composition.

## Known visual differences

- The Figma canvas does not expose its original raster files or computed CSS. The exact riverside hero, plantation-aerial metric, and community-children ESG photographs were not downloadable; closest official KLK OLEO assets are used while preserving the extracted geometry, crop treatment, overlays, spacing, and typography.
- The Figma prototype scales its desktop frame at narrow widths. The implementation intentionally follows the user brief by providing a true responsive mobile navigation, stacked grids, and touch-friendly controls.
- Product search, detail, and enquiry behavior is implemented locally from typed demo records because this repository does not contain the Payload CMS/backend described in the brief.

