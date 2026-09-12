/** DB and API flags arrive as boolean, `'0'`/`'1'`, or `'true'`/`'false'`. */

export type FlagLike = boolean | string | null | undefined;

export function isFlagOn(value: FlagLike | number): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry == null) continue;
    out[key] = String(entry);
  }
  return out;
}

export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (isRecord(err) && typeof err.message === "string" && err.message) {
    return err.message;
  }
  return fallback;
}
