import { spawnSync } from "node:child_process";
const result = spawnSync(process.execPath, ["node_modules/@opennextjs/cloudflare/dist/cli/index.js", "build"], {
  stdio: "inherit",
  env: { ...process.env, CMS_CLOUDFLARE: "1", KLK_CLOUDFLARE_BUILD: "1", NEXT_PRIVATE_MINIMAL_MODE: "1", NEXT_PUBLIC_SERVER_URL: "https://agrochemicals.easondev.workers.dev" },
});
process.exit(result.status ?? 1);
