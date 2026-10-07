import "server-only";
import { getPayload } from "payload";
import config from "@payload-config";
import type { MapPoint } from "./model";

export async function getMapPoints(): Promise<MapPoint[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "map-locations",
    where: { and: [
      { "site.slug": { equals: process.env.SHARED_MAP_SITE_SLUG || "klk-oleo" } },
      { _status: { equals: "published" } },
      { enabled: { equals: true } },
    ] },
    sort: "displayOrder", depth: 0, pagination: false, overrideAccess: false,
  });
  return result.docs.map(({ id, label, country, region, latitude, longitude, description, url, displayOrder }) =>
    ({ id, label, country, region, latitude, longitude, description, url, displayOrder }));
}
