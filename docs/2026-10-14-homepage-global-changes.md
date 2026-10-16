# Homepage and shared CTA changes

Approved scope: equal homepage introduction columns, dark eyebrow text, the existing contact banner on all public page types, and underlined text CTAs outside Products routes. The Figma reference is used for colours only. Existing content, images and navigation destinations remain.

## Implementation

- Homepage introduction: equal grid columns at 992px and above; stacked image and copy below 992px. Existing image crop, gutters, spacing and copy are retained.
- Eyebrow colour: `#1A1E21`, verified from Figma node `8218:1001`. This includes About Us labels and Products hero eyebrow text, independently of the CTA exemption.
- Underlined CTAs: `TextCta` uses dark text, lime `#79B829` arrow and blue `#008995` underline, verified from Figma underline-button instance `8218:1018`. Its compact layout follows the user's supplied image rather than the reference's page layout. Existing accessible link/button semantics, visible keyboard focus and a 44px minimum target are retained. Resource download buttons retain their existing request-dialog behavior.
- `ContactBanner` is shared immediately before `SiteFooter`, appearing once on Home, About Us, Resources, Contact, Products, categories and product details. Legacy resource URLs continue their existing redirects. CMS admin and API routes are untouched. Products routes use the unchanged `PrimaryButton`; existing catalogue controls and product request buttons are untouched.

## Validation before publication

Playwright inspected seven page types at 1440px, 768px and 390px. All 21 checks found one contact banner, matching eyebrow colours and no document overflow. Further homepage checks at 1138px, 1024px, 992px and 991px verified the column transition. Screenshots and raw results are under `apps/cms/output/playwright/global-changes/`.

Product, category and product-detail before/after screenshots match throughout their content. Two captures differ only in their final cropped pixel row due to fractional element boundaries; existing product CTA geometry and computed colours/padding remain unchanged. Homepage desktop/mobile introduction and banner screenshots were visually inspected. Keyboard focus, resource-dialog open/Escape close, homepage Learn More navigation and shared banner navigation passed.

`npm run typecheck` and all 39 `npm test` tests passed. The pre-existing product-list motion hydration warning was present in the baseline; unrelated product animations were not modified.
