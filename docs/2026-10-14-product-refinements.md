# Product page refinements

The approved changes use the existing product catalogue, taxonomy slugs and filter URL contract. No CMS records or product descriptions were edited.

- Filter group headings match the main menu: Functionality, Formulation Type, Regulatory/Labels.
- Product names in listing/category results are 32px and remain `#016836`; chemical descriptions use `#414141` with their existing font sizes and weights.
- Listing arrow buttons use the existing gold `#A99767` on hover and keyboard focus.
- All three category pages omit the category-tab navigation and its wrapper.
- Product details use the full available width with the existing desktop/mobile side padding.
- Attribute values link to their category page with the corresponding `function`, `formulation` or `label` parameter selected. Slugs come from the existing CMS view model, rather than being inferred from display names. Missing attributes retain the accessible existing placeholders.
- Request buttons retain their destinations, filled green appearance and existing gold/dark-green hover treatment, with icons and borders removed. Focus is visibly outlined.

## Verification before publication

Playwright checked Products, all three category pages and a product detail at 1440, 963, 768 and 390px: 20 layout checks, no horizontal overflow, correct computed typography, full-width detail geometry and no category tabs. Screenshots are in `apps/cms/output/playwright/product-refinements/`. Screenshot-only styles hide `.site-header` and the Next.js development overlay, retaining the product's own semantic header.

All six attributes on Aidigro EM1225 were clicked at 1440, 768 and 390px. Each destination had exactly one corresponding filter selected and included Aidigro EM1225 in the results. Both request buttons and the listing arrow passed hover and keyboard-focus checks against the gold colour.

The new regression test verifies all three category links use the canonical CMS slugs and correct URL parameters. Its initial run failed without the links; after implementation all 40 tests and `npm run typecheck` passed. The pre-existing local product-list motion hydration warning was observed; unrelated animation behavior was not changed.
