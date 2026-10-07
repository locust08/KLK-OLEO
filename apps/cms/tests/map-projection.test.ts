import test from "node:test";
import assert from "node:assert/strict";
import { projectPoint } from "../src/lib/maps/model";

test("map registration aligns known landmarks with the supplied illustration", () => {
  for (const [latitude, longitude, x, y] of [[51.83, 6.24, 49, 34], [31.3, 121.1, 81, 48], [3.1, 101.5, 75, 64]]) {
    const actual = projectPoint(latitude, longitude);
    assert(Math.abs(actual.x - x) < 1);
    assert(Math.abs(actual.y - y) < 1);
  }
});

test("longitude and latitude changes move a pin in the expected directions", () => {
  const origin = projectPoint(0, 0);
  assert(projectPoint(10, 0).y < origin.y);
  assert(projectPoint(-10, 0).y > origin.y);
  assert(projectPoint(0, 20).x > origin.x);
  assert(projectPoint(0, -20).x < origin.x);
});
