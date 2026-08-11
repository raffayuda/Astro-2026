/**
 * Map a Zod/TypeBox validation error into a flat, human-readable message.
 *
 * Elysia passes a `ValidationError` instance to `onError`. It is an `Error`
 * whose `.message` is a *stringified JSON blob* shaped like
 * `{ type, on, property, message, expected, found, errors: [...] }`.
 * The blob can also arrive as the raw string (when serialized), or as the
 * parsed object, or as a plain `{ message }`.
 *
 * We flatten every shape to `"field: message; field: message"` so clients can
 * show exactly which field failed and why.
 */
type Issue = {
  path?: string | (string | number)[];
  message?: unknown;
  schema?: { errorMessage?: unknown };
};

function pathOf(issue: Issue): string {
  const p = issue.path;
  if (typeof p === 'string') return p.replace(/^\//, '');
  if (Array.isArray(p)) return p.join('.');
  return '';
}

/** Prefer Zod's custom message; translate Zod v4 generic messages to Indonesian. */
function pickReason(issue: Issue): string {
  const msg = typeof issue.message === 'string' ? issue.message : undefined;

  // Custom Zod message (from `.min(1, '...')` etc.) always wins.
  if (msg && !msg.startsWith('Invalid input:') && msg !== 'Invalid value' && msg !== 'Expected value') {
    return msg;
  }

  // TypeBox schema errorMessage (e.g. `t.String({ error: '...' })`).
  if (typeof issue.schema?.errorMessage === 'string') return issue.schema.errorMessage;

  // Zod v4 generic messages — translate to human-friendly Indonesian.
  if (msg) {
    if (msg.startsWith('Invalid input: expected string')) return 'wajib diisi';
    if (msg.startsWith('Invalid input: expected number')) return 'harus berupa angka';
    if (msg.startsWith('Invalid input: expected boolean')) return 'harus berupa boolean';
    if (msg.startsWith('Invalid input: expected')) return 'nilai tidak valid';
    if (msg.startsWith('Invalid')) return 'nilai tidak valid';
  }

  return 'nilai tidak valid';
}

/** Parse an object's `message` if it holds a JSON validation blob. */
function parseBlob(obj: Record<string, unknown>): Record<string, unknown> | null {
  const msg = obj.message;
  if (typeof msg !== 'string') return null;
  const trimmed = msg.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function formatZodError(err: unknown): string {
  // Raw string: either a JSON blob or a plain message.
  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (trimmed.startsWith('{')) {
      try {
        return formatZodError(JSON.parse(trimmed));
      } catch {
        return trimmed || 'Validation failed';
      }
    }
    return trimmed || 'Validation failed';
  }

  if (!err || typeof err !== 'object') return 'Validation failed';

  const e = err as Record<string, unknown>;

  // Elysia ValidationError instance: `.message` is the stringified blob.
  if (e.message !== undefined) {
    const blob = parseBlob(e);
    if (blob) return formatZodError(blob);
  }

  // Parsed blob / object with `errors` (plural) or `error` (singular) array.
  const issues = (Array.isArray(e.errors) ? e.errors : Array.isArray(e.error) ? e.error : []) as Issue[];

  if (issues.length > 0) {
    const parts = issues
      .map((issue) => {
        const field = pathOf(issue);
        const reason = pickReason(issue);
        return field ? `${field}: ${reason}` : reason;
      })
      .filter(Boolean);
    return parts.join('; ') || 'Validation failed';
  }

  // Bare `{ property, message }`.
  if (typeof e.property === 'string' && typeof e.message === 'string') {
    return `${e.property}: ${pickReason({ message: e.message })}`;
  }

  // Plain `{ message }` (non-JSON).
  if (typeof e.message === 'string') {
    return e.message || 'Validation failed';
  }

  return 'Validation failed';
}
