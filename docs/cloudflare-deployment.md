# Cloudflare Workers deployment

Worker: `klk-oleo-main` in the Eason CF Main account.

The Next.js application uses the OpenNext Cloudflare adapter. The deployment preserves server-rendered routes, including product enquiry query parameters; it is not a static export.

## Build and publish

```sh
npm ci
npm run lint
npm run typecheck
npm run build:worker
npx wrangler deploy --dry-run
npm run deploy
```

Authenticate with `npx wrangler login` when necessary. Do not commit credentials or `.dev.vars` files. Run `npm run cf-typegen` after changing Worker bindings. `npm run preview:worker` previews an existing Worker build locally; `npm run dev` remains the normal Next.js development server.

OpenNext recommends Linux or WSL for builds. Worker output and local browser-testing artifacts are excluded from Git.

The existing Palmerol and Palmester JPEG backgrounds were recompressed at their original dimensions to fit Cloudflare's per-asset upload limit.
