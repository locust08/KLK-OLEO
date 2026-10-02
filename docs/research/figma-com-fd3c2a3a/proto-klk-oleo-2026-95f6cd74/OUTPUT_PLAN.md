# Output Plan

- Source: `https://www.figma.com/proto/f1sjoz6VoqHYabMOxFh41Z/KLK-Oleo-2026?...`
- Application root: repository root (`.`)
- Site key: `figma-com-fd3c2a3a`
- Page key: `proto-klk-oleo-2026-95f6cd74`
- Destination route: `/`
- Artifact root: `docs/research/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/`
- Screenshot root: `docs/design-references/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/`
- Component root: `src/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/`
- Shared component root: `src/components/sites/figma-com-fd3c2a3a/shared/`
- Asset root: `public/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/`
- Shared asset root: `public/sites/figma-com-fd3c2a3a/shared/`

## Route decision

The repository contains only the untouched cloner placeholder at `src/app/page.tsx`, so the prototype replaces that scaffold at `/`. No user-authored route or backend integration is present in the working tree.

## Planned screens and states

1. Homepage (all vertical sections)
2. Products overview
3. Product discovery/results state (local implementation driven by the brief because the prototype control is visual-only)
4. Product detail modal/state
5. Enquiry modal/flow
6. Search overlay and coordinated filters
7. Desktop, tablet, and mobile navigation states
8. Cookie consent banner and dismissal state

## Shared foundation changes

- `src/app/layout.tsx`: KLK OLEO metadata and target typography.
- `src/app/globals.css`: scoped KLK design tokens, motion primitives, and responsive defaults.
- `src/app/page.tsx`: replace only the untouched placeholder route.

