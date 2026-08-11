import { api } from '@/src/lib/eden';

/** Parse a server error payload into a clean, human-readable message. */
export function getApiError(err: unknown, fallback = 'Request failed'): string {
  const e = err as {
    message?: string;
    value?: { error?: string; message?: string };
    name?: string;
  };
  const raw = e?.value?.error ?? e?.value?.message ?? e?.message;
  if (!raw) return fallback;

  // Server may return the validation error as a stringified JSON blob.
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const issues = Array.isArray(parsed.errors)
          ? parsed.errors
          : Array.isArray(parsed.error)
            ? parsed.error
            : [];
        if (issues.length > 0) {
          return issues
            .map((i: any) => {
              const field = Array.isArray(i.path) ? i.path.join('.') : (i.path ?? '').replace(/^\//, '');
              const msg =
                typeof i.message === 'string' && !i.message.startsWith('Invalid input:')
                  ? i.message
                  : undefined;
              const reason = msg ?? i.schema?.errorMessage ?? 'nilai tidak valid';
              return field ? `${field}: ${reason}` : reason;
            })
            .join('; ');
        }
      }
    } catch {
      return raw || fallback;
    }
  }
  return raw || fallback;
}

/** Await an Eden result, throw on error, return `data`. */
export async function unwrap<T>(res: Promise<{ data: T | null; error: unknown }>): Promise<T> {
  const result = await res;
  if (result.error) {
    throw new Error(getApiError(result.error));
  }
  if (result.data === null || result.data === undefined) {
    throw new Error('Empty response');
  }
  return result.data;
}

/**
 * Typed API helpers. All calls go through the Eden (ky-backed) client, so
 * request/response types are inferred from the Elysia `App`.
 */
export const apiHelpers = {
  // Auth (pre-signup email check)
  auth: {
    checkEmail: (email: string) =>
      unwrap(api.auth['check-email'].post({ email } as never)),
  },

  // Competitions
  competitions: {
    list: () => unwrap(api.competitions.get()),
    get: (id: string) => unwrap(api.competitions({ id }).get()),
    create: (body: unknown) => unwrap(api.competitions.post(body as never)),
    update: (id: string, body: unknown) => unwrap(api.competitions({ id }).put(body as never)),
    remove: (id: string) => unwrap(api.competitions({ id }).delete()),
    withWinners: () => unwrap(api.competitions['with-winners'].get()),
    timeline: (id: string) => unwrap(api.competitions({ id }).timeline.get()),
    createTimeline: (id: string, body: unknown) =>
      unwrap(api.competitions({ id }).timeline.post(body as never)),
    updateTimeline: (id: string, itemId: string, body: unknown) =>
      unwrap(api.competitions({ id }).timeline({ itemId }).put(body as never)),
    removeTimeline: (id: string, itemId: string) =>
      unwrap(api.competitions({ id }).timeline({ itemId }).delete()),
  },

  // Registrations
  registrations: {
    list: (query: Record<string, string | number | undefined> = {}) =>
      unwrap(api.registrations.get({ query: query as never })),
    get: (id: string) => unwrap(api.registrations({ id }).get()),
    create: (body: unknown) => unwrap(api.registrations.post(body as never)),
    update: (id: string, body: unknown) => unwrap(api.registrations({ id }).patch(body as never)),
    stats: () => unwrap(api.registrations.stats.get()),
    winners: (competitionId: string) =>
      unwrap(api.registrations.winners.get({ query: { competitionId } })),
  },

  // Categories
  categories: {
    list: () => unwrap(api.categories.get()),
    create: (body: unknown) => unwrap(api.categories.post(body as never)),
    update: (id: string, body: unknown) => unwrap(api.categories({ id }).put(body as never)),
    remove: (id: string) => unwrap(api.categories({ id }).delete()),
  },

  // FAQs
  faqs: {
    list: () => unwrap(api.faqs.get()),
    create: (body: unknown) => unwrap(api.faqs.post(body as never)),
    update: (id: string, body: unknown) => unwrap(api.faqs({ id }).put(body as never)),
    remove: (id: string) => unwrap(api.faqs({ id }).delete()),
  },

  // Committee
  committeeMembers: {
    list: () => unwrap(api['committee-members'].get()),
    create: (body: unknown) => unwrap(api['committee-members'].post(body as never)),
    update: (id: string, body: unknown) =>
      unwrap(api['committee-members']({ id }).put(body as never)),
    remove: (id: string) => unwrap(api['committee-members']({ id }).delete()),
    importRows: (rows: unknown[]) =>
      unwrap(api['committee-members']['import'].post({ rows } as never)),
  },
  committeeDivisions: {
    list: () => unwrap(api['committee-divisions'].get()),
    create: (body: unknown) => unwrap(api['committee-divisions'].post(body as never)),
    update: (id: string, body: unknown) =>
      unwrap(api['committee-divisions']({ id }).put(body as never)),
    remove: (id: string) => unwrap(api['committee-divisions']({ id }).delete()),
  },

  // Gallery
  galleryPhotos: {
    list: (query: Record<string, string | number | undefined> = {}) =>
      unwrap(api['gallery-photos'].get({ query: query as never })),
    create: (body: unknown) => unwrap(api['gallery-photos'].post(body as never)),
    update: (id: string, body: unknown) =>
      unwrap(api['gallery-photos']({ id }).put(body as never)),
    remove: (id: string) => unwrap(api['gallery-photos']({ id }).delete()),
  },
  galleryCategories: {
    list: () => unwrap(api['gallery-categories'].get()),
    create: (body: unknown) => unwrap(api['gallery-categories'].post(body as never)),
    update: (id: string, body: unknown) =>
      unwrap(api['gallery-categories']({ id }).put(body as never)),
    remove: (id: string) => unwrap(api['gallery-categories']({ id }).delete()),
  },

  // Journeys
  journeys: {
    list: () => unwrap(api.journeys.get()),
    get: (id: string) => unwrap(api.journeys({ id }).get()),
    create: (body: unknown) => unwrap(api.journeys.post(body as never)),
    update: (id: string, body: unknown) => unwrap(api.journeys({ id }).put(body as never)),
    remove: (id: string) => unwrap(api.journeys({ id }).delete()),
  },

  // Journey photos (documentation gallery)
  journeyPhotos: {
    list: (journeyId: string) =>
      unwrap(api['journey-photos'].get({ query: { journeyId } })),
    create: (body: unknown) => unwrap(api['journey-photos'].post(body as never)),
    remove: (id: number) => unwrap(api['journey-photos']({ id: String(id) }).delete()),
  },

  // Sponsors / media partners
  sponsors: {
    list: () => unwrap(api.sponsors.get()),
    create: (body: unknown) => unwrap(api.sponsors.post(body as never)),
    update: (id: string, body: unknown) => unwrap(api.sponsors({ id }).put(body as never)),
    remove: (id: string) => unwrap(api.sponsors({ id }).delete()),
  },
  mediaPartners: {
    list: () => unwrap(api['media-partners'].get()),
    create: (body: unknown) => unwrap(api['media-partners'].post(body as never)),
    update: (id: string, body: unknown) =>
      unwrap(api['media-partners']({ id }).put(body as never)),
    remove: (id: string) => unwrap(api['media-partners']({ id }).delete()),
  },

  // Users
  users: {
    list: () => unwrap(api.users.get()),
    create: (body: unknown) => unwrap(api.users.post(body as never)),
    update: (id: string, body: unknown) => unwrap(api.users({ id }).put(body as never)),
    remove: (id: string) => unwrap(api.users({ id }).delete()),
  },

  // Certificates
  certificates: {
    send: (body: unknown) => unwrap(api.certificates.send.post(body as never)),
  },

  // Upload (multipart, admin) — fails fast on oversized files client-side too
  upload: (file: File) => {
    const MAX = 10 * 1024 * 1024;
    if (file.size > MAX) {
      return Promise.reject(new Error('File terlalu besar (maksimal 10MB)'));
    }
    if (file.size === 0) {
      return Promise.reject(new Error('File kosong'));
    }
    return api.upload
      .post({ file } as never)
      .then((res) => {
        if (res.error) {
          const value = res.error as { value?: { error?: string } };
          throw new Error(value.value?.error ?? 'Upload gagal');
        }
        return res.data as { url: string };
      });
  },
};
