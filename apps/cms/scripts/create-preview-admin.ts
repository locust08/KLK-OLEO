import { getPayload } from "payload";
import config from "../src/payload.config";
if (
  process.env.CMS_CLOUDFLARE === "1" ||
  !process.env.SQLITE_URL?.includes("klk-cms-integration")
)
  throw Error("Isolated preview only.");
const payload = await getPayload({ config });
const email = process.env.CMS_ADMIN_EMAIL!,
  password = process.env.CMS_ADMIN_PASSWORD!;
const found = await payload.find({
  collection: "users",
  where: { email: { equals: email } },
  limit: 1,
});
if (!found.docs.length)
  await payload.create({
    collection: "users",
    data: { email, password, role: "super-admin" },
  });
await payload.destroy();
console.log("Isolated preview account ready.");
