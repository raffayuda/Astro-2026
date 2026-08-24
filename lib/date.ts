/**
 * Date helpers for competition schedules.
 *
 * Dates arrive from many places — Drizzle `Date` objects, ISO strings from the
 * API, `<input type="date">` values, or `null` when a schedule is not set yet.
 * These helpers accept all of them and never throw on an invalid value; they
 * return an empty string instead so the UI degrades to a dash.
 */

export type DateInput = string | number | Date | null | undefined;

const TIME_ZONE = 'Asia/Jakarta';

/** Parse any accepted input into a valid Date, or null when unusable. */
export function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function format(value: DateInput, options: Intl.DateTimeFormatOptions, locale = 'id-ID') {
  const date = toDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, { timeZone: TIME_ZONE, ...options }).format(date);
}

/** `12 Mar` — compact label for cards and chips. */
export function formatDateShort(value: DateInput) {
  return format(value, { day: 'numeric', month: 'short' });
}

/** `12 Maret 2026` — full label for detail pages. */
export function formatDateLong(value: DateInput) {
  return format(value, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** `12/03/2026` — numeric label for dense admin tables. */
export function formatDateNumeric(value: DateInput) {
  return format(value, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** `2026-03-12` — value for `<input type="date">` (Jakarta calendar day). */
export function toDateInputValue(value: DateInput) {
  return format(value, { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en-CA');
}

/** ISO 8601 string for API payloads, or null when there is no usable date. */
export function toIsoOrNull(value: DateInput) {
  return toDate(value)?.toISOString() ?? null;
}

/** ISO 8601 string for API payloads, or '' — for non-nullable string fields. */
export function toIsoString(value: DateInput) {
  return toIsoOrNull(value) ?? '';
}
