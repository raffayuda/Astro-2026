/**
 * Link safety for values that originate from a registrant.
 *
 * Photo and file fields arrive as plain strings on the public registration
 * endpoint, so a caller can store any scheme it likes — including
 * `javascript:` or `data:`. Those strings are later rendered as `href`
 * targets in the admin detail view, where React only warns instead of
 * blocking them. Anything user-supplied that becomes an `href` must pass
 * through here first.
 */

/** True for absolute http(s) URLs and for root-relative paths. */
export function isSafeUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  // Root-relative ("/storage/…"), but not protocol-relative ("//evil.com").
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** The value when it is safe to link to, otherwise `undefined`. */
export function safeHref(value: string | null | undefined): string | undefined {
  return isSafeUrl(value) ? value : undefined;
}
