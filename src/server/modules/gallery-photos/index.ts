import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { db } from '@/src/db';
import { galleryPhotos } from '@/src/db/schema';
import { asc, eq, count } from 'drizzle-orm';
import { z } from 'zod';
import { paginationSchema, buildPaginatedResponse } from '@/src/server/helpers/pagination';
import { deleteSupabaseFile } from '@/src/server/modules/upload';

const photoSchema = z.object({
  title: z.string().min(1, 'Judul foto wajib diisi'),
  category: z.string().optional().default('Competition'),
  imageUrl: z.string().min(1, 'URL gambar wajib diisi'),
  year: z.string().optional().default('ASTRO 2025'),
  likesCount: z.number().int().optional().default(0),
  sortOrder: z.number().int().optional().default(0),
});

/** Gallery photos — public paginated list, admin mutations. (Renamed from /gallery → /gallery-photos.) */
export const galleryPhotosModule = new Elysia({ prefix: '/gallery-photos' })
  .use(authPlugin)
  .get('/', async ({ query }) => {
    const { page, pageSize } = query;
    const [total] = await db
      .select({ total: count() })
      .from(galleryPhotos);

    const data = await db
      .select()
      .from(galleryPhotos)
      .orderBy(asc(galleryPhotos.sortOrder))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return buildPaginatedResponse(data, Number(total?.total || 0), { page, pageSize });
  }, {
    query: paginationSchema,
  })
  .post('/', async ({ body }) => {
    const [item] = await db
      .insert(galleryPhotos)
      .values({
        title: body.title,
        category: body.category,
        imageUrl: body.imageUrl,
        year: body.year,
        likesCount: body.likesCount,
        sortOrder: body.sortOrder,
      })
      .returning();
    return status(201, item);
  }, {
    body: photoSchema,
    admin: true,
  })
  .put('/:id', async ({ params, body }) => {
    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.category !== undefined) updates.category = body.category;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
    if (body.year !== undefined) updates.year = body.year;
    if (body.likesCount !== undefined) updates.likesCount = body.likesCount;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    const [existing] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, Number(params.id)));
    if (!existing) return status(404, { error: 'Not found' });

    const [item] = await db
      .update(galleryPhotos)
      .set(updates)
      .where(eq(galleryPhotos.id, Number(params.id)))
      .returning();
      .returning();
      
    if (updates.imageUrl && existing.imageUrl !== updates.imageUrl) {
      // Background delete of the old file
      deleteSupabaseFile(existing.imageUrl).catch(console.error);
    }

    return item;
  }, {
    params: t.Object({ id: t.String() }),
    body: photoSchema.partial(),
    admin: true,
  })
  .delete('/:id', async ({ params }) => {
    const [item] = await db
      .delete(galleryPhotos)
      .where(eq(galleryPhotos.id, Number(params.id)))
      .returning();
    if (!item) return status(404, { error: 'Not found' });
    
    // Background delete of the associated file
    deleteSupabaseFile(item.imageUrl).catch(console.error);
    
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  });
