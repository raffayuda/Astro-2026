import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

/** File types allowed for upload, keyed by magic-byte signature. */
const MAGIC_BYTES: { ext: string; mime: string; signature: number[]; check: (h: Uint8Array) => boolean }[] = [
  { ext: 'png', mime: 'image/png', signature: [0x89, 0x50, 0x4e, 0x47], check: (h) => h.length >= 4 },
  { ext: 'jpg', mime: 'image/jpeg', signature: [0xff, 0xd8, 0xff], check: (h) => h.length >= 3 },
  {
    // WEBP: RIFF....WEBP — verify the WEBP marker, not just RIFF (avoids AVI/WAV)
    ext: 'webp', mime: 'image/webp', signature: [0x52, 0x49, 0x46, 0x46], check: (h) =>
      h.length >= 12 &&
      h[0] === 0x52 && h[1] === 0x49 && h[2] === 0x46 && h[3] === 0x46 && // RIFF
      h[8] === 0x57 && h[9] === 0x45 && h[10] === 0x42 && h[11] === 0x50, // WEBP
  },
  { ext: 'gif', mime: 'image/gif', signature: [0x47, 0x49, 0x46, 0x38], check: (h) => h.length >= 4 },
  { ext: 'pdf', mime: 'application/pdf', signature: [0x25, 0x50, 0x44, 0x46], check: (h) => h.length >= 4 },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Extract path from Supabase URL and delete the file from the 'uploads' bucket.
 * Designed to be called safely; it ignores invalid URLs or non-Supabase URLs silently.
 */
export async function deleteSupabaseFile(url: string | null | undefined) {
  if (!url || !supabaseUrl || !supabaseKey) return;
  
  // Example URL: https://[ID].supabase.co/storage/v1/object/public/uploads/uploads/filename.ext
  // or legacy local path: /uploads/filename.ext (which we don't delete automatically as it's legacy)
  const uploadsPathString = '/storage/v1/object/public/uploads/';
  if (!url.includes(uploadsPathString)) return;

  try {
    const relativePath = url.split(uploadsPathString)[1];
    if (!relativePath) return;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.storage.from('uploads').remove([relativePath]);
    
    if (error) {
      console.error('Failed to delete file from Supabase:', error);
    }
  } catch (err) {
    console.error('Error in deleteSupabaseFile:', err);
  }
}

/**
 * File upload (admin) — validates the real file content via magic bytes,
 * writes to Supabase Storage (public `uploads` bucket) and returns an
 * absolute public URL. Local-fs writes do not work on Vercel (read-only
 * `/var/task`), so all uploads go to object storage instead.
 */
export const uploadModule = new Elysia({ prefix: '/upload' })
  .use(authPlugin)
  .post('/', async ({ body, user }) => {
    // Defense in depth: the `admin: true` macro already rejects non-admins
    // (401 unauth / 403 forbidden), but re-verify the resolved session user.
    if (user?.role !== 'admin') return status(403, { error: 'Forbidden' });

    const file = body.file;

    if (!file) return status(400, { error: 'File tidak ditemukan' });

    // Enforce the size limit both at the schema boundary and here (belt & suspenders).
    if (file.size > MAX_UPLOAD_SIZE) {
      return status(400, { error: 'File terlalu besar (maksimal 10MB)' });
    }
    if (file.size === 0) {
      return status(400, { error: 'File kosong' });
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase env vars missing for upload');
      return status(500, { error: 'Konfigurasi storage tidak lengkap' });
    }

    // Sniff the real content type from the first bytes — never trust the
    // client-supplied `Content-Type` or extension (blocks SVG/XSS payloads).
    const bytes = new Uint8Array(await file.arrayBuffer());
    const head = bytes.subarray(0, 12);
    const match = MAGIC_BYTES.find((m) => m.check(head) && m.signature.every((byte, i) => head[i] === byte));

    if (!match) {
      return status(400, {
        error: 'Hanya file gambar (PNG/JPG/WEBP/GIF) dan PDF yang diizinkan',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const path = `uploads/${randomUUID()}.${match.ext}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(path, bytes, {
        contentType: match.mime,
        upsert: false,
      });

    if (error || !data?.path) {
      console.error('Supabase upload failed:', error);
      return status(500, { error: 'Gagal menyimpan file' });
    }

    const { data: publicUrl } = supabase.storage.from('uploads').getPublicUrl(data.path);
    return { url: publicUrl.publicUrl };
  }, {
    body: t.Object({
      file: t.File({ maxSize: MAX_UPLOAD_SIZE }),
    }),
    admin: true,
  });
