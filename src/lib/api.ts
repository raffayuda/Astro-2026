import { api } from '@/src/lib/eden';
import { compressImage } from '@/src/lib/image-compression';

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
        
        // Handle Elysia single validation error object
        if (parsed.type === 'validation' && (parsed.summary || parsed.message)) {
          const msg = parsed.summary || parsed.message;
          if (msg.includes('Expected file size to not exceed')) {
            const match = msg.match(/Expected file size to not exceed (\d+)/i);
            const mb = match ? Math.round(Number(match[1]) / (1024 * 1024)) : 10;
            return `Ukuran file terlalu besar (maksimal ${mb}MB)`;
          }
          if (msg.includes('Expected File')) {
            return 'Format file tidak didukung atau file kosong';
          }
          return msg;
        }
      }
    } catch {
      // Handle Elysia raw validation string messages
      if (raw.includes('Expected file size to not exceed')) {
        const match = raw.match(/Expected file size to not exceed (\d+)/i);
        const mb = match ? Math.round(Number(match[1]) / (1024 * 1024)) : 10;
        return `Ukuran file terlalu besar (maksimal ${mb}MB)`;
      }
      if (raw.includes('Expected File')) {
        return 'Format file tidak didukung atau file kosong';
      }
      return raw || fallback;
    }
  }
  
  if (typeof raw === 'string') {
    if (raw.includes('Expected file size to not exceed')) {
      const match = raw.match(/Expected file size to not exceed (\d+)/i);
      const mb = match ? Math.round(Number(match[1]) / (1024 * 1024)) : 10;
      return `Ukuran file terlalu besar (maksimal ${mb}MB)`;
    }
    if (raw.includes('Expected File')) {
      return 'Format file tidak didukung atau file kosong';
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
    check: (query: string) =>
      unwrap(api.registrations.check.post({ query } as never)),
    delete: (id: string) => unwrap(api.registrations({ id }).delete()),
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
    reorder: (ids: number[]) =>
      unwrap(api['committee-divisions'].reorder.put({ ids } as never)),
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
    reorder: (ids: number[]) => unwrap(api.sponsors.reorder.put({ ids } as never)),
    remove: (id: string) => unwrap(api.sponsors({ id }).delete()),
  },
  mediaPartners: {
    list: () => unwrap(api['media-partners'].get()),
    create: (body: unknown) => unwrap(api['media-partners'].post(body as never)),
    update: (id: string, body: unknown) =>
      unwrap(api['media-partners']({ id }).put(body as never)),
    reorder: (ids: number[]) => unwrap(api['media-partners'].reorder.put({ ids } as never)),
    remove: (id: string) => unwrap(api['media-partners']({ id }).delete()),
  },

  // Users
  users: {
    list: () => unwrap(api.users.get()),
    create: (body: unknown) => unwrap(api.users.post(body as never)),
    update: (id: string, body: unknown) => unwrap(api.users({ id }).put(body as never)),
    remove: (id: string) => unwrap(api.users({ id }).delete()),
  },

  // Invitations
  invitations: {
    list: () => unwrap(api.invitations.get()),
    create: (body: unknown) => unwrap(api.invitations.post(body as never)),
    revoke: (id: string) => unwrap(api.invitations({ id }).delete()),
    verify: (token: string) => unwrap(api.invitations.verify({ token }).get()),
    accept: (token: string, body: unknown) =>
      unwrap(api.invitations.accept({ token }).post(body as never)),
  },

  // Certificates
  certificates: {
    send: (body: unknown) => unwrap(api.certificates.send.post(body as never)),
    generate: (body: unknown) => unwrap(api.certificates.generate.post(body as never)),
    generateSingle: (body: unknown) => unwrap(api.certificates['generate-single'].post(body as never)),
  },

  // Certificate Templates
  certificateTemplates: {
    list: async (competitionId: string) => {
      const res = await fetch(
        `/api/certificate-templates?competitionId=${encodeURIComponent(competitionId)}`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return res.json();
    },
    create: (body: unknown) => unwrap(api['certificate-templates'].post(body as never)),
    remove: (id: number) => unwrap(api['certificate-templates']({ id }).delete()),
  },

  // Upload (multipart, admin) — auto-compresses photos client-side before upload to protect Supabase Storage
  upload: async (file: File, options?: { isCommittee?: boolean }): Promise<{ url: string }> => {
    if (options?.isCommittee) {
      return apiHelpers.uploadCommittee(file);
    }
    const RAW_MAX = 30 * 1024 * 1024;
    if (file.size > RAW_MAX) {
      return Promise.reject(new Error('File terlalu besar (maksimal 30MB)'));
    }
    if (file.size === 0) {
      return Promise.reject(new Error('File kosong'));
    }

    const processedFile = await compressImage(file, { maxDimension: 1600, quality: 0.85 });
    const SERVER_MAX = 10 * 1024 * 1024;
    if (processedFile.size > SERVER_MAX) {
      return Promise.reject(new Error('Ukuran file setelah kompresi melebihi 10MB'));
    }

    return api.upload
      .post({ file: processedFile } as never)
      .then((res) => {
        if (res.error) {
          throw new Error(getApiError(res.error, 'Upload gagal'));
        }
        return res.data as { url: string };
      });
  },

  // Committee photo upload (multipart, admin) — allows up to 30MB raw photos, auto-compressed to WebP
  uploadCommittee: async (file: File): Promise<{ url: string }> => {
    const RAW_MAX = 30 * 1024 * 1024;
    if (file.size > RAW_MAX) {
      return Promise.reject(new Error('File terlalu besar (maksimal 30MB)'));
    }
    if (file.size === 0) {
      return Promise.reject(new Error('File kosong'));
    }

    const processedFile = await compressImage(file, { maxDimension: 1600, quality: 0.85 });

    return api.upload.committee
      .post({ file: processedFile } as never)
      .then((res) => {
        if (res.error) {
          throw new Error(getApiError(res.error, 'Upload gagal'));
        }
        return res.data as { url: string };
      });
  },

  // Player photo (multipart, anonymous) — raw photos up to 20MB auto-compressed to lightweight WebP
  uploadPlayerPhoto: async (file: File): Promise<{ url: string }> => {
    const RAW_MAX = 20 * 1024 * 1024;
    if (file.size > RAW_MAX) {
      return Promise.reject(new Error('Foto terlalu besar (maksimal 20MB)'));
    }
    if (file.size === 0) {
      return Promise.reject(new Error('File kosong'));
    }

    const processedFile = await compressImage(file, { maxDimension: 1200, quality: 0.82 });
    const SERVER_MAX = 5 * 1024 * 1024;
    if (processedFile.size > SERVER_MAX) {
      return Promise.reject(new Error('Foto setelah kompresi melebihi 5MB'));
    }

    return api.upload['player-photo']
      .post({ file: processedFile } as never)
      .then((res) => {
        if (res.error) {
          throw new Error(getApiError(res.error, 'Upload foto gagal'));
        }
        return res.data as { url: string };
      });
  },
};
