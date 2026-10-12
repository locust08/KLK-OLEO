import { geoProjection } from "d3-geo";
import type { MapRegion } from "./model";

export const mapWidth = 2518;
export const mapHeight = 1246;

// Geographic anchors for the four existing region selectors, registered to
// the original illustration. These are region controls, not facility addresses.
export const regionAnchors: Record<MapRegion, [number, number]> = {
  "South East Asia": [106.804, 7.407370709668522],
  Asia: [95.356, 39.16800369389987],
  Europe: [8.992, 52.2598367739813],
  Americas: [-105.668, 45.829445640747515],
};

/** Preserve the cropped, horizontally stretched Miller artwork registration. */
export function createWorldMapProjection(width = mapWidth, height = mapHeight, snapToLayout = false) {
  const miller = (radians: number) => 1.25 * Math.log(Math.tan(Math.PI / 4 + .4 * radians));
  const north = miller(85 * Math.PI / 180);
  const south = miller(-55 * Math.PI / 180);
  const scale = height / (north - south);
  const horizontalStretch = width / (2 * Math.PI) / scale;
  const projection = geoProjection((longitude, latitude) => [longitude * horizontalStretch, miller(latitude)])
    .rotate([-10, 0])
    .scale(scale)
    .translate([width / 2, north * scale]);
  // Node and browser transcendental math can differ in the last decimal.
  // Keep the projection methods while stabilizing Marker SSR transforms.
  return Object.assign((coordinates: [number, number]) => {
    const point = projection(coordinates);
    return point && point.map(value => snapToLayout
      ? Math.floor((Math.round(value * 1e8) / 1e8) * 64) / 64
      : Math.round(value * 1e8) / 1e8) as [number, number] | null;
  }, projection);
}
