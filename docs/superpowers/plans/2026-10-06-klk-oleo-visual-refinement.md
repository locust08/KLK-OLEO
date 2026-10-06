# KLK OLEO Visual Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the supplied KLK OLEO Figma visual system consistently across every existing route without changing content, data, assets, or behavior.

**Architecture:** Introduce one semantic token and utility layer in `globals.css`, then migrate shared chrome and page components onto it in dependency order. Source-level Node tests pin exact tokens and prevent legacy palette drift, while Playwright CLI provides rendered responsive and interaction verification.

**Tech Stack:** Next.js 16.3.5 App Router, React 19, TypeScript strict, Tailwind CSS 4, Poppins through `next/font/google`, Node built-in test runner, Playwright CLI.

**Spec:** `docs/superpowers/specs/2026-10-06-klk-oleo-visual-refinement-design.md`

## Global Constraints

- Preserve every existing route, content block, product record, image, link destination, form, and interaction.
- Do not change backend, CMS, API, data ownership, or route-generation behavior.
- Use exact supplied design colours: `#E11282`, `#008995`, `#016836`, `#014E29`, `#002F18`, `#002413`, `#79B829`, `#E6F0EB`, `#D9E8E1`, `#B0D0C1`, `#FFFFFF`, `#212529`, `#414141`, `#ADB5BD`, and `#F1F3F5`.
- Use Poppins with the desktop scale 64/48/36/28/22/18px and responsive `clamp()` sizing below desktop.
- Use only 0/4/8/12/16/24/full radius tokens.
- Preserve existing reduced-motion behavior, keyboard support, visible focus, and semantic controls.
- Keep changes local; do not deploy or push.
- Preserve all pre-existing uncommitted work and stage only the files named by each task.

## Review Focus

- Long product and news titles must wrap without clipping or widening the document; Task 5 pins source containment and Task 7 checks rendered overflow.
- Product detail HTML tables must remain usable at 390px without document-level overflow; Task 5 preserves the scroll container and Task 7 measures document width.
- Header menus, dialogs, accordions, carousels, and filters must retain keyboard and pointer behavior after class migration; Tasks 2–5 preserve handlers and Task 7 smoke-tests them.
- Large images must preserve their existing sources while maintaining stable aspect ratios and useful crops at all three breakpoints; Tasks 3–5 retain source paths and Task 7 visually compares them.
- Existing disabled actions must remain visibly disabled and explained to assistive technology; Tasks 4–5 retain descriptions and Task 7 inspects their accessible state.

---

### Task 1: Semantic design foundations and regression harness

**Files:**
- Create: `tests/design-system.test.mjs`
- Modify: `package.json`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: the exact colour, typography, radius, spacing, and responsive requirements from the approved spec.
- Produces: CSS variables `--klk-brand-pink`, `--klk-brand-blue`, `--klk-primary`, `--klk-primary-hover`, `--klk-primary-active`, `--klk-dark`, `--klk-dark-hover`, `--klk-darker`, `--klk-darkest`, `--klk-lime`, `--klk-bg`, `--klk-bg-subtle`, `--klk-border`, `--klk-text`, `--klk-text-secondary`, `--klk-text-disabled`, `--klk-text-light`, gutter/container/section variables, radius variables, `.klk-container`, `.klk-section`, `.klk-h1` through `.klk-h6`, `.klk-body-large`, `.klk-body`, `.klk-body-small`, `.klk-caption`, `.klk-overline`, `.klk-button`, and `.klk-link`.

- [ ] **Step 1: Write the failing foundation tests**

Add Node tests named `defines the exact KLK colour tokens`, `defines the reference typography scale`, `defines shared container and section utilities`, and `removes viewport-wide root font scaling`. Assert exact token/value pairs, the required utility selectors, and absence of `html { font-size: clamp(16px, 1vw, 24px); }`.

- [ ] **Step 2: Run the foundation test and verify RED**

Run: `node --test tests/design-system.test.mjs`

Expected: FAIL because the new semantic token and utility names do not exist.

- [ ] **Step 3: Add the test command**

Add `"test:design": "node --test tests/design-system.test.mjs"` to `package.json` without changing other scripts or dependencies.

- [ ] **Step 4: Implement the global foundations**

In `globals.css`, map the new semantic colours into Tailwind 4 `@theme inline`, define the exact typography/radius/layout variables, add the shared utilities under `@layer components`, update base body/focus styles, and remove viewport-wide root font scaling. Keep reduced-motion and horizontal clipping safeguards.

Use exact responsive heading formulas whose desktop caps are 64/48/36/28/22/18px and whose mobile floors preserve the hierarchy.

- [ ] **Step 5: Run the foundation test and verify GREEN**

Run: `npm run test:design`

Expected: PASS for all Task 1 tests.

- [ ] **Step 6: Commit the foundation only**

Run: `git add -- package.json tests/design-system.test.mjs src/app/globals.css && git commit -m "style: establish KLK OLEO design tokens"`

Expected: only the three named files are staged.

---

### Task 2: Shared header, page shell, breadcrumbs, and banners

**Files:**
- Modify: `tests/design-system.test.mjs`
- Modify: `src/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell.tsx`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/HeaderHero.tsx`

**Interfaces:**
- Consumes: Task 1 semantic colour and typography utilities.
- Produces: one consistent shared header state, container-aligned navigation, breadcrumb bar, internal-page banner geometry, and hero typography used by all routes.

- [ ] **Step 1: Add failing shared-chrome tests**

Add tests named `shared chrome uses semantic KLK utilities` and `shared chrome contains no legacy core palette literals`. Assert both files reference the shared container/typography/token utilities and contain none of `#006b3f`, `#003f27`, `#7bbf2a`, or `#e8f3ed` case-insensitively.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm run test:design -- --test-name-pattern="shared chrome"`

Expected: FAIL on missing shared utilities and legacy literals.

- [ ] **Step 3: Refine `PrototypePageShell`**

Keep the component signatures unchanged. Apply semantic foreground/background tokens, container-aligned breadcrumbs, a tokenized breadcrumb gradient, a consistent banner overlay, and `.klk-h1` page titles. Preserve shell ordering and every child component.

- [ ] **Step 4: Refine `HeaderHero`**

Keep all state, effects, handlers, routes, menu contents, slides, controls, and accessibility attributes unchanged. Migrate colour literals, normalize the 68px/90px header heights, align inner content to `.klk-container`, use shared nav/button typography, apply semantic hover/active/focus states, and use `.klk-h1`-based hero scaling without changing slide copy or assets.

- [ ] **Step 5: Run focused and full design tests**

Run: `npm run test:design`

Expected: PASS for Tasks 1–2.

- [ ] **Step 6: Commit shared chrome**

Run: `git add -- tests/design-system.test.mjs src/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell.tsx src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/HeaderHero.tsx && git commit -m "style: refine shared KLK OLEO chrome"`

---

### Task 3: Shared footer, product search, forms, and dialogs

**Files:**
- Modify: `tests/design-system.test.mjs`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ProductExperienceFooter.tsx`

**Interfaces:**
- Consumes: Task 1 token and type utilities and Task 2 header search event contract `open-product-search`.
- Produces: consistent search controls, result cards, empty state, dialogs, enquiry form, footer, and cookie banner without changing public component signatures.

- [ ] **Step 1: Add failing footer/form tests**

Add tests named `product experience uses semantic KLK utilities`, `product experience preserves search and dialog contracts`, and `product experience contains no legacy core palette literals`. Assert exported component names and the `open-product-search` listener remain present while core legacy literals are absent.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm run test:design -- --test-name-pattern="product experience"`

Expected: FAIL on semantic utility and palette assertions, not on missing behavior contracts.

- [ ] **Step 3: Refine product experience and footer**

Keep `ProductExperience`, `SiteFooter`, and `CookieBanner` signatures and all handlers unchanged. Apply the shared container, typography, field, button, card, radius, border, and focus treatments. Keep dialogs within `100dvh`, preserve body-scroll locking, and use the reference dark footer background and spacing.

- [ ] **Step 4: Run focused and full design tests**

Run: `npm run test:design`

Expected: PASS for Tasks 1–3.

- [ ] **Step 5: Commit the shared product experience**

Run: `git add -- tests/design-system.test.mjs src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ProductExperienceFooter.tsx && git commit -m "style: unify KLK forms footer and dialogs"`

---

### Task 4: Homepage sections

**Files:**
- Modify: `tests/design-system.test.mjs`
- Modify: `src/app/page.tsx`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/AboutMetrics.tsx`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/RiseSolutions.tsx`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/IndustrySolutions.tsx`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/PresenceNewsEsg.tsx`

**Interfaces:**
- Consumes: Tasks 1–3 shared foundations and shell components.
- Produces: tokenized homepage hero-adjacent sections with consistent type, spacing, cards, imagery, and responsive grids while preserving all interaction handlers.

- [ ] **Step 1: Add failing homepage migration tests**

Add tests named `homepage sections use semantic KLK utilities`, `homepage sections contain no legacy core palette literals`, and `homepage interactions remain declared`. Assert all five files reference semantic utilities, contain no core legacy literals, and retain carousel/RISE/accordion interaction markers such as `scrollToCard`, `setActiveRise`, and `setOpenRegion`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm run test:design -- --test-name-pattern="homepage"`

Expected: FAIL on semantic migration assertions.

- [ ] **Step 3: Refine About metrics and homepage wrapper**

Migrate foreground/background colours, heading/body hierarchy, award/metric geometry, content gutters, and section spacing. Keep every item, copy string, image, link, and metric value.

- [ ] **Step 4: Refine RISE and industry carousel**

Keep all state, timers, focus handlers, pointer drag behavior, loop behavior, solution records, and links. Apply semantic colours, reference radii, heading/body tokens, balanced card sizing, and tablet/mobile spacing.

- [ ] **Step 5: Refine presence, news, and ESG sections**

Keep map data, regional accordion state, news records, ESG links, and images. Standardize container widths, heading hierarchy, accordion rows, card padding, image ratios, backgrounds, and mobile stacking.

- [ ] **Step 6: Run full design tests**

Run: `npm run test:design`

Expected: PASS for Tasks 1–4.

- [ ] **Step 7: Commit homepage refinement**

Run: `git add -- tests/design-system.test.mjs src/app/page.tsx src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/AboutMetrics.tsx src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/RiseSolutions.tsx src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/IndustrySolutions.tsx src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/PresenceNewsEsg.tsx && git commit -m "style: align homepage with KLK design system"`

---

### Task 5: About Us, News and Events, Contact Us, and product pages

**Files:**
- Modify: `tests/design-system.test.mjs`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/AboutPrototype.tsx`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/AboutPrototypeValues.tsx`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/NewsPrototype.tsx`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ContactPrototype.tsx`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ProductsPrototype.tsx`
- Modify: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ProductsPrototype.module.css`

**Interfaces:**
- Consumes: Tasks 1–3 shared foundations and shell components plus existing product-catalog APIs unchanged.
- Produces: consistently styled informational, product overview, category, detail, and search-linked page content while preserving all route/data contracts.

- [ ] **Step 1: Add failing linked-page tests**

Add tests named `linked pages use semantic KLK utilities`, `linked pages contain no legacy core palette literals`, `product page contracts remain intact`, `rich product content remains horizontally contained`, and `disabled linked-page actions remain explained`. Assert semantic utility use, absence of core legacy literals, unchanged exports `ProductsPrototypeOverview`, `ProductsPrototypeListing`, and `ProductsPrototypeDetail`, presence of `overflow-x-auto`, unchanged product route helpers, and retention of `disabled` plus `aria-describedby` on unavailable Contact Us and News and Events actions.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm run test:design -- --test-name-pattern="linked pages|product page|rich product"`

Expected: FAIL on palette and utility assertions.

- [ ] **Step 3: Refine About Us page content**

Preserve both supplied About images, every mission, core-value interaction, and global-presence reuse. Apply semantic headings/body, stable split proportions, reference section spacing, card treatments, responsive image sizing, and contained mobile descriptions.

- [ ] **Step 4: Refine News and Events and Contact Us pages**

Preserve all news records, filtering, office records, flags, telephone/mail links, and disabled-action descriptions. Apply shared container, type, card, field, button, border, image-ratio, and responsive stacking rules.

- [ ] **Step 5: Refine Products overview, listing, and detail pages**

Preserve every product category, product route, record, brochure action, search field, detail section, accordion, back link, and enquiry route. Apply responsive typography and copy measure, reduce mobile vertical excess, normalize card/action sizing, use semantic colours, and keep rich HTML/table overflow contained.

- [ ] **Step 6: Run full design tests**

Run: `npm run test:design`

Expected: PASS for Tasks 1–5.

- [ ] **Step 7: Commit linked-page refinement**

Run: `git add -- tests/design-system.test.mjs src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/AboutPrototype.tsx src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/AboutPrototypeValues.tsx src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/NewsPrototype.tsx src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ContactPrototype.tsx src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ProductsPrototype.tsx src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ProductsPrototype.module.css && git commit -m "style: align linked pages and products"`

---

### Task 6: Static verification and defect correction

**Files:**
- Modify only files implicated by a failing check.
- Test: `tests/design-system.test.mjs`

**Interfaces:**
- Consumes: the complete Tasks 1–5 implementation.
- Produces: a lint-clean, type-safe, production-buildable implementation with all statically generated routes preserved.

- [ ] **Step 1: Run the design regression suite**

Run: `npm run test:design`

Expected: PASS with zero failed tests.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit 0 with no errors.

- [ ] **Step 3: Run TypeScript**

Run: `npm run typecheck`

Expected: exit 0 with no diagnostics.

- [ ] **Step 4: Run the production build**

Run: `npm run build`

Expected: exit 0 and generated output for `/`, `/about-us`, `/contact-us`, `/news-events`, `/products`, `/products/search`, every product category, and every product detail parameter.

- [ ] **Step 5: Correct any failure test-first**

For a behavior defect, add a failing test that reproduces it, verify RED, implement the minimal correction, and rerun the focused and full suites. For formatting, type, or build-only failures, change only the implicated lines and rerun the failing command.

- [ ] **Step 6: Commit verification corrections if any**

Stage only files changed in Step 5 and commit with `fix: resolve KLK visual refinement checks`. Skip this commit when no correction was needed.

---

### Task 7: Responsive browser verification and design QA

**Files:**
- Create: `design-qa.md`
- Create: `output/playwright/klk-visual-refinement/*.png`
- Modify only source files required to resolve evidenced P0/P1/P2 findings.

**Interfaces:**
- Consumes: the source references under `docs/design-references/`, the supplied Figma archive and design guidance, and the built implementation.
- Produces: same-state screenshots at 1440px, 768px, and 390px; interaction and overflow evidence; and a blocking design-QA result.

- [ ] **Step 1: Start the local Next.js app**

Run the existing local server or `npm run dev -- --hostname 127.0.0.1 --port 3001` and confirm the homepage responds.

- [ ] **Step 2: Capture required routes at required widths**

Using Playwright CLI, capture `/`, `/about-us`, `/products`, one category, one detail page, `/products/search`, `/news-events`, and `/contact-us` at 1440, 768, and 390 CSS pixels into `output/playwright/klk-visual-refinement/`.

- [ ] **Step 3: Run responsive integrity checks**

At each route/width assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth`, all rendered `img` elements have `complete && naturalWidth > 0`, and the browser console has no application errors. Record any development-only HMR transport error separately rather than treating it as an application defect.

- [ ] **Step 4: Smoke-test preserved interactions**

Use fresh Playwright snapshots before each referenced element interaction. Exercise desktop product navigation, mobile menu, hero controls, RISE selector, core-value reveal, product filtering, product detail accordion, product search/detail/enquiry dialogs, news category filter, regional accordion, contact links without transmission, and cookie dismissal.

- [ ] **Step 5: Create combined visual comparisons**

For representative homepage, About, Products, News, and Contact states, combine the same-width source reference and implementation screenshot into one comparison image. Record source pixels, implementation pixels, CSS viewport, and density normalization.

- [ ] **Step 6: Write the first `design-qa.md` pass**

Evaluate fonts/typography, spacing/layout rhythm, colours/tokens, image quality, copy/content, icons, interactions, accessibility, and responsive behavior. Record every P0/P1/P2 with location, evidence, impact, and concrete fix. Set `final result: blocked` while any remains.

- [ ] **Step 7: Iterate on actionable findings**

For each P0/P1/P2, add a regression test when the finding is programmatically testable, verify RED, apply the smallest source fix, recapture the same viewport/state, rebuild the combined comparison, and update the comparison history. Do not loop on P3 polish.

- [ ] **Step 8: Complete the final QA report**

Set `final result: passed` only when no actionable P0/P1/P2 remains. List residual P3 differences and unavoidable source limitations such as unavailable exact imagery.

- [ ] **Step 9: Commit QA evidence and final visual fixes**

Run: `git add -- design-qa.md output/playwright/klk-visual-refinement` plus only the exact source/test files changed during QA, then `git commit -m "test: verify KLK responsive visual fidelity"`.

---

### Task 8: Final verification and handoff

**Files:**
- Modify: none unless verification exposes a defect, in which case return to the owning task's test-first loop.

**Interfaces:**
- Consumes: Tasks 1–7 and approved acceptance criteria.
- Produces: fresh evidence for final status and a concise implementation report.

- [ ] **Step 1: Run the full project check**

Run: `npm run check`

Expected: lint, typecheck, and production build all exit 0.

- [ ] **Step 2: Run the design regression suite freshly**

Run: `npm run test:design`

Expected: all tests pass with zero failures.

- [ ] **Step 3: Confirm repository scope**

Run: `git status --short` and `git diff --stat HEAD~1..HEAD`.

Expected: no unrelated file was deleted, all existing route files remain, and no deployment configuration was changed.

- [ ] **Step 4: Re-read the acceptance criteria**

Check every criterion in the approved spec against static output, browser evidence, interaction evidence, and `design-qa.md`. Report any unmet item rather than claiming completion.

- [ ] **Step 5: Deliver the requested report**

Summarize global design changes, shared components refined, pages checked, responsive sizes tested, remaining differences, and anything that could not be matched exactly and why. Provide the clickable local preview URL first and do not deploy or push.
