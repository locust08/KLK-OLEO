/** Only absent keys are backfilled. Explicit blanks, false, null and arrays are editorial decisions. */
export function fillMissing<T extends Record<string, unknown>>(
  existing: T,
  baseline: Record<string, unknown>,
): T {
  const result = { ...existing } as Record<string, unknown>;
  for (const [key, value] of Object.entries(baseline)) {
    if (!Object.hasOwn(existing, key) || existing[key] === undefined)
      result[key] = value;
    else if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      existing[key] &&
      typeof existing[key] === "object" &&
      !Array.isArray(existing[key])
    )
      result[key] = fillMissing(
        existing[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      );
  }
  return result as T;
}
