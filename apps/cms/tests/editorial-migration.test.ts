import test from "node:test";
import assert from "node:assert/strict";
import * as migration from "../src/lib/content/migration";
test("backfill preserves explicit empty fields, arrays and existing edits", () => {
  const result = migration.fillMissing(
    { heading: "Edited", body: "", items: [] },
    {
      heading: "Old",
      body: "Old copy",
      items: [{ heading: "Old" }],
      eyebrow: "About",
    },
  );
  assert.deepEqual(result, {
    heading: "Edited",
    body: "",
    items: [],
    eyebrow: "About",
  });
});
