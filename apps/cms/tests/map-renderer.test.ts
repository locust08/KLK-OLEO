import test from "node:test";
import assert from "node:assert/strict";
import { createWorldMapProjection, regionAnchors } from "../src/lib/maps/projection";
import { projectPoint } from "../src/lib/maps/model";

test("geographic region anchors retain the existing artwork positions", () => {
  const projection = createWorldMapProjection();
  const expected = [[76.89, 61.50], [73.71, 42.55], [49.72, 33.40], [17.87, 38.05]];
  Object.values(regionAnchors).forEach((coordinates, i) => {
    const position = projection(coordinates)!;
    assert(Math.abs(position[0] / 2518 * 100 - expected[i][0]) < 0.000001);
    assert(Math.abs(position[1] / 1246 * 100 - expected[i][1]) < 0.000001);
  });
});

test("renderer projection agrees with the CMS coordinate contract", () => {
  const projection = createWorldMapProjection();
  for (const [latitude, longitude] of [[51.83, 6.24], [31.3, 121.1], [3.1, 101.5], [-40, -100]]) {
    const actual = projection([longitude, latitude])!;
    const expected = projectPoint(latitude, longitude);
    assert(Math.abs(actual[0] / 2518 * 100 - expected.x) < 0.000001);
    assert(Math.abs(actual[1] / 1246 * 100 - expected.y) < 0.000001);
  }
});
