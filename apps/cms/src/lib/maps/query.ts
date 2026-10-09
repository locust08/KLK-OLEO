import "server-only";
import { getPayload } from "payload";
import config from "@payload-config";
import type { MapPoint } from "./model";
import locations from "../../../data/shared-map-locations.json";
import type { MapRegion } from "./model";

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
  // A fresh CMS has no shared locations yet. Preserve an intentionally
  // unpublished/disabled collection rather than replacing it with defaults.
  if (!result.docs.length && (await payload.count({ collection: "map-locations", overrideAccess: true })).totalDocs === 0) {
    return locations.flatMap(location => location.labels.map(label => ({
      id: -(locations.indexOf(location) * 100 + location.labels.indexOf(label) + 1),
      label, country: location.country, region: location.region as MapRegion,
      latitude: location.latitude, longitude: location.longitude,
      displayOrder: locations.indexOf(location) * 100 + location.labels.indexOf(label),
    })));
  }
  return result.docs.map(({ id, label, country, region, latitude, longitude, description, url, displayOrder }) =>
    ({ id, label, country, region, latitude, longitude, description, url, displayOrder }));
}
