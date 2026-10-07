import "dotenv/config";
import { buildConfig } from "payload";
import { sqliteD1Adapter } from "@payloadcms/db-d1-sqlite";
import { r2Storage } from "@payloadcms/storage-r2";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collections } from "./collections";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cloudflare = process.env.CMS_CLOUDFLARE === "1";
const platform = cloudflare ? await getPlatform() : null;
// Keep native Node database/image dependencies out of the Worker bundle.
const sharp = cloudflare ? undefined : (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ `${"__sharp".replaceAll("_", "")}`)).default;
const db = platform
  ? sqliteD1Adapter({ binding: platform.env.D1, push: false })
  : process.env.DATABASE_URL
    ? (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ `${"__@payloadcms/db-postgres".replaceAll("_", "")}`)).postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } })
    : (await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ `${"__@payloadcms/db-sqlite".replaceAll("_", "")}`)).sqliteAdapter({ client: { url: process.env.SQLITE_URL || "file:./cms.db" } });

async function getPlatform() {
  if (process.env.KLK_CLOUDFLARE_BUILD === "1") {
    const { getPlatformProxy } = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ `${"__wrangler".replaceAll("_", "")}`);
    return getPlatformProxy({ configPath: resolve(root, "wrangler.jsonc"), persist: false, remoteBindings: false });
  }
  return getCloudflareContext({ async: true });
}
if (!process.env.PAYLOAD_SECRET)
  throw new Error("Set PAYLOAD_SECRET in .env before starting the CMS.");
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  admin: {
    user: "users",
    importMap: { baseDir: root },
    meta: { titleSuffix: " | KLK OLEO CMS" },
  },
  collections,
  db,
  sharp,
  plugins: platform ? [r2Storage({ bucket: platform.env.R2, collections: { media: true } })] : [],
  typescript: { outputFile: resolve(root, "src/payload-types.ts") },
});
