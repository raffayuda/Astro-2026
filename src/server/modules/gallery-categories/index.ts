import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { db } from '@/src/db';
import { galleryCategories, galleryPhotos } from '@/src/db/schema';
import { asc, eq, count } from 'drizzle-orm';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
  slug: z.string().min(1, 'Slug kategori wajib diisi'),
});

export const galleryCategoriesModule = new Elysia({ prefix: '/gallery-categories' })
  .use(authPlugin)
  .get('/', () => db.select().from(galleryCategories).orderBy(asc(galleryCategories.id)))
  .post('/', async ({ body }) => {
    const [item] = await db
      .insert(galleryCategories)
      .values({ name: body.name, slug: body.slug })
      .returning();
    return status(201, item);
  }, {
    body: categorySchema,
    admin: true,
  })
  .put('/:id', async ({ params, body }) => {
    try {
      const id = Number(params.id);
      if (isNaN(id)) return status(400, { error: 'ID tidak valid' });

      const [existing] = await db
        .select()
        .from(galleryCategories)
        .where(eq(galleryCategories.id, id));

      if (!existing) return status(404, { error: 'Kategori tidak ditemukan' });

      const updates: { name?: string; slug?: string } = {};
      if (body.name !== undefined && body.name.trim() !== '') updates.name = body.name.trim();
      if (body.slug !== undefined && body.slug.trim() !== '') updates.slug = body.slug.trim();

      if (Object.keys(updates).length === 0) {
        return existing;
      }

      const oldSlug = existing.slug;
      const newSlug = updates.slug;
      const isSlugChanged = Boolean(newSlug && newSlug !== oldSlug);

      const item = await db.transaction(async (tx) => {
        if (isSlugChanged) {
          // 1. Buat data kategori baru dengan slug baru
          const [newCat] = await tx
            .insert(galleryCategories)
            .values({
              name: updates.name || existing.name,
              slug: newSlug!,
            })
            .returning();

          // 2. Alihkan semua foto dari oldSlug ke newSlug (berhasil karena newSlug sudah diinsert)
          await tx
            .update(galleryPhotos)
            .set({ category: newSlug! })
            .where(eq(galleryPhotos.category, oldSlug));

          // 3. Hapus data kategori lama (berhasil karena foto sudah beralih ke newSlug)
          await tx
            .delete(galleryCategories)
            .where(eq(galleryCategories.id, id));

          return newCat;
        } else {
          // Jika slug tidak berubah, cukup update nama
          const [updatedCat] = await tx
            .update(galleryCategories)
            .set(updates)
            .where(eq(galleryCategories.id, id))
            .returning();

          return updatedCat;
        }
      });

      return item || existing;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal meng-update kategori';
      console.error('Error updating gallery category:', err);
      return status(500, { error: message });
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Partial(
      t.Object({
        name: t.String(),
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
      .from(galleryCategories)
      .where(eq(galleryCategories.id, id));

    if (!existing) return status(404, { error: 'Kategori tidak ditemukan' });

    const [used] = await db
      .select({ count: count() })
      .from(galleryPhotos)
      .where(eq(galleryPhotos.category, existing.slug));

    if (used && Number(used.count) > 0) {
      return status(400, {
        error: `Tidak bisa menghapus: ${used.count} foto masih menggunakan kategori ini`,
      });
    }

    await db
      .delete(galleryCategories)
      .where(eq(galleryCategories.id, id));
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  });



