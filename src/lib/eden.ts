import { treaty } from '@elysiajs/eden';
import ky from 'ky';
import type { App } from '@/src/server';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

/**
 * ky-backed fetch wrapper used as Eden's fetcher.
 *
 * `throwHttpErrors: false` is CRITICAL: without it ky throws on non-2xx and
 * Eden never sees the response body, so the parsed `{ error }` is lost and
 * callers only get ky's generic "Request failed with status code 400".
 *
 * Eden pre-serializes the JSON body and sets headers itself, so we only need
 * to forward the RequestInit untouched plus the ky option.
 */
function kyFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return ky(input as any, {
    ...(init as any),
    throwHttpErrors: false,
  });
}

/**
 * End-to-end type-safe API client.
 *
 * - `ky` handles HTTP (credentials, JSON, retries, timeouts) via `kyFetch`.
 * - `import type { App }` keeps server code out of the client bundle.
 */
export const api = treaty<App>(baseUrl, {
  fetcher: kyFetch,
  fetch: {
    credentials: 'include',
  },
}).api;

export { ky };
