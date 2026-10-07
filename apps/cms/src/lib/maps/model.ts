export const mapRegions = ["South East Asia", "Asia", "Europe", "Americas"] as const;
export type MapRegion = typeof mapRegions[number];
export type MapPoint = {
  id: number;
  label: string;
  country: string;
  region: MapRegion;
  latitude: number;
  longitude: number;
  description?: string | null;
  url?: string | null;
  displayOrder: number;
};

/** Miller cylindrical registration for the supplied cropped world illustration.
 * The illustration covers 170°W–190°E and 85°N–55°S, excluding Antarctica.
 * This is an overview, not a navigable street map.
 */
export function projectPoint(latitude: number, longitude: number) {
  const miller = (degrees: number) => 1.25 * Math.log(Math.tan(Math.PI / 4 + .4 * degrees * Math.PI / 180));
  const north = miller(85);
  const south = miller(-55);
  return {
    x: Math.max(1, Math.min(99, (longitude + 170) / 360 * 100)),
    y: Math.max(1, Math.min(99, (north - miller(latitude)) / (north - south) * 100)),
  };
}

export function groupMapPoints(points: MapPoint[], region: MapRegion) {
  const groups = new Map<string, MapPoint[]>();
  for (const point of [...points].sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id)) {
    if (point.region !== region) continue;
    groups.set(point.country, [...(groups.get(point.country) ?? []), point]);
  }
  return [...groups.entries()];
}
