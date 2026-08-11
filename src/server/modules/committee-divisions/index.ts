import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { db } from '@/src/db';
import { committeeDivisions, committeeMembers } from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';

const divisionSchema = z.object({
  name: z.string().min(1, 'Nama divisi wajib diisi'),
  shortName: z.string().nullable().optional(),
  slug: z.string().min(1, 'Slug divisi wajib diisi'),
});

export const committeeDivisionsModule = new Elysia({ prefix: '/committee-divisions' })
  .use(authPlugin)
  .get('/', () => db.select().from(committeeDivisions).orderBy(asc(committeeDivisions.id)))
  .post('/', async ({ body }) => {
    const [item] = await db
      .insert(committeeDivisions)
      .values({
        name: body.name,
        shortName: body.shortName ?? null,
        slug: body.slug,
      })
      .returning();
    return status(201, item);
  }, {
    body: divisionSchema,
    admin: true,
  })
  .put('/:id', async ({ params, body }) => {
    try {
      const id = Number(params.id);
      if (isNaN(id)) return status(400, { error: 'ID tidak valid' });

      const [existing] = await db
        .select()
        .from(committeeDivisions)
        .where(eq(committeeDivisions.id, id));

      if (!existing) return status(404, { error: 'Divisi tidak ditemukan' });

      const updates: { name?: string; shortName?: string | null; slug?: string } = {};
      if (body.name !== undefined && body.name.trim() !== '') updates.name = body.name.trim();
      if (body.shortName !== undefined) updates.shortName = body.shortName ? body.shortName.trim() : null;
      if (body.slug !== undefined && body.slug.trim() !== '') updates.slug = body.slug.trim();

      if (Object.keys(updates).length === 0) {
        return existing;
      }

      const oldSlug = existing.slug;
      const oldName = existing.name;
      const newSlug = updates.slug;
      const newName = updates.name;
      const isSlugChanged = Boolean(newSlug && newSlug !== oldSlug);

      const item = await db.transaction(async (tx) => {
        if (isSlugChanged) {
          // 1. Buat divisi baru dengan slug baru
          const [newDiv] = await tx
            .insert(committeeDivisions)
            .values({
              name: updates.name || existing.name,
              shortName: updates.shortName !== undefined ? updates.shortName : existing.shortName,
              slug: newSlug!,
            })
            .returning();

          // 2. Alihkan semua anggota panitia ke newSlug (dan nama divisi baru jika ada)
          await tx
            .update(committeeMembers)
            .set({
              division: newSlug!,
              ...(newName ? { divisionName: newName } : {}),
            })
            .where(eq(committeeMembers.division, oldSlug));

          // 3. Hapus divisi lama (berhasil karena anggota sudah beralih ke newSlug)
          await tx
            .delete(committeeDivisions)
            .where(eq(committeeDivisions.id, id));

          return newDiv;
        } else {
          // Jika slug tidak berubah, cukup update divisi dan perbarui nama divisi anggota jika nama berubah
          const [updatedDiv] = await tx
            .update(committeeDivisions)
            .set(updates)
            .where(eq(committeeDivisions.id, id))
            .returning();

          if (newName && newName !== oldName) {
            await tx
              .update(committeeMembers)
              .set({ divisionName: newName })
              .where(eq(committeeMembers.division, oldSlug));
          }

          return updatedDiv;
        }
      });

      return item || existing;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal meng-update divisi';
      console.error('Error updating committee division:', err);
      return status(500, { error: message });
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Partial(
      t.Object({
        name: t.String(),
        shortName: t.Nullable(t.String()),
        slug: t.String(),
      }),
    ),
    admin: true,
  })
  .delete('/:id', async ({ params }) => {
    const id = Number(params.id);
    if (isNaN(id)) return status(400, { error: 'ID tidak valid' });

    const [existing] = await db
      .select()
      .from(committeeDivisions)
      .where(eq(committeeDivisions.id, id));

    if (!existing) return status(404, { error: 'Divisi tidak ditemukan' });

    await db
      .delete(committeeDivisions)
      .where(eq(committeeDivisions.id, id));
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  });



