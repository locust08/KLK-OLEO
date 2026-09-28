import "dotenv/config";
import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import sharp from "sharp";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collections } from "./collections";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
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
  db: process.env.DATABASE_URL
    ? postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL } })
    : sqliteAdapter({
        client: { url: process.env.SQLITE_URL || "file:./cms.db" },
      }),
  sharp,
  typescript: { outputFile: resolve(root, "src/payload-types.ts") },
});
