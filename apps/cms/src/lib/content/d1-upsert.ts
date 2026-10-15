import {
  sql,
  sqliteD1Adapter,
  type SQLiteAdapter,
} from "@payloadcms/db-d1-sqlite";
/** Reuse the inserted column for identical update values instead of binding every value twice. */
export function d1ConflictValues<T extends Record<string, unknown>>(
  table: Record<string, { name: string }>,
  values: Record<string, unknown>,
  set: T,
) {
  return Object.fromEntries(
    Object.entries(set).map(([key, value]) => [
      key,
      Object.hasOwn(values, key) && values[key] === value && table[key]
        ? sql`excluded.${sql.identifier(table[key].name)}`
        : value,
    ]),
  ) as { [K in keyof T]: T[K] | ReturnType<typeof sql> };
}
export function editorialD1Adapter(
  args: Parameters<typeof sqliteD1Adapter>[0],
) {
  const database = sqliteD1Adapter(args);
  const initialize = database.init;
  database.init = (args) => {
    const adapter = initialize(args) as SQLiteAdapter;
    const insert = adapter.insert;
    adapter.insert = async function (args) {
      const { values, onConflictDoUpdate, tableName } = args;
      if (onConflictDoUpdate && !Array.isArray(values))
        return insert.call(this, {
          ...args,
          onConflictDoUpdate: {
            ...onConflictDoUpdate,
            set: d1ConflictValues(
              this.tables[tableName],
              values,
              onConflictDoUpdate.set,
            ),
          },
        });
      return insert.call(this, args);
    };
    return adapter;
  };
  return database;
}
