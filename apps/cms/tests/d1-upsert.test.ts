import test from "node:test";
import assert from "node:assert/strict";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { d1ConflictValues } from "../src/lib/content/d1-upsert";
test("full editorial page upserts stay within D1 100 bound parameters", () => {
  const columns = Object.fromEntries(
    Array.from({ length: 67 }, (_, i) => [`field${i}`, text(`field_${i}`)]),
  );
  const table = sqliteTable("pages", columns);
  const values = Object.fromEntries(
    Object.keys(columns).map((key, i) => [key, `value ${i}`]),
  );
  const db = drizzle(async () => ({ rows: [] }));
  const query = db
    .insert(table)
    .values(values)
    .onConflictDoUpdate({
      target: table.field0,
      set: d1ConflictValues(table, values, values),
    })
    .toSQL();
  assert.ok(
    query.params.length <= 100,
    `D1 rejects ${query.params.length} parameters`,
  );
  assert.match(query.sql, /excluded\."field_66"/);
});
test("unrelated conflict values keep their original semantics", () => {
  const set = { field: "different" };
  assert.deepEqual(
    d1ConflictValues({ field: { name: "field" } }, { field: "inserted" }, set),
    set,
  );
});
