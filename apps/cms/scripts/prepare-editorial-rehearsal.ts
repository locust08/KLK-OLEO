import { getPayload } from "payload";
import config from "../src/payload.config";
if (
  process.env.CMS_CLOUDFLARE === "1" ||
  process.env.DATABASE_URL ||
  !process.env.SQLITE_URL?.includes("klk-editorial-schema")
)
  throw Error(
    "Schema initialization only allowed on named isolated scratch database.",
  );
const payload = await getPayload({ config });
await payload.destroy();
console.log("Scratch schema initialized.");
