import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
const template = createHash("sha256");
for (const file of ["src/components/products/ProductDetailPage.tsx", ...readdirSync("src/app/(frontend)").filter((name) => name.endsWith(".css") || name === "layout.tsx").sort().map((name) => `src/app/(frontend)/${name}`), ...readdirSync("public/fonts").sort().map((name) => `public/fonts/${name}`)]) {
  template.update(file).update(readFileSync(file));
}
const templateVersion = template.digest("hex").slice(0, 20);
const result = spawnSync(process.execPath, ["node_modules/@opennextjs/cloudflare/dist/cli/index.js", "build"], {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_PRODUCT_PDF_TEMPLATE_VERSION: templateVersion, CMS_CLOUDFLARE: "1", KLK_CLOUDFLARE_BUILD: "1", NEXT_PRIVATE_MINIMAL_MODE: "1", NEXT_PUBLIC_SERVER_URL: "https://agrochemicals.easondev.workers.dev" },
});
process.exit(result.status ?? 1);
