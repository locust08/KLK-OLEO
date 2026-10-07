import "dotenv/config";
import { getPayload } from "payload";
import config from "../src/payload.config";
import countries from "../data/shared-map-locations.json";
import type { MapRegion } from "../src/lib/maps/model";

const payload = await getPayload({ config });
try {
  const owner = (await payload.find({ collection: "sites", where: { slug: { equals: process.env.SHARED_MAP_SITE_SLUG || "klk-oleo" } }, limit: 1, overrideAccess: true })).docs[0];
  if (!owner || owner.kind !== "main") throw new Error("Seed the main site before seeding shared map locations.");
  let created = 0;
  let order = 0;
  for (const country of countries) for (const label of country.labels) {
    const key = `${country.country}-${label}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/g, "");
    if (!(await payload.count({ collection: "map-locations", where: { key: { equals: key } }, overrideAccess: true })).totalDocs) {
      await payload.create({ collection: "map-locations", overrideAccess: true, data: {
        site: owner.id, key, label, country: country.country, region: country.region as MapRegion,
        latitude: country.latitude, longitude: country.longitude, displayOrder: order, enabled: true, _status: "published",
      } });
      created++;
    }
    order++;
  }
  console.log(`Created ${created} shared locations; existing records were preserved.`);
} finally { await payload.destroy(); }
process.exit(0);
