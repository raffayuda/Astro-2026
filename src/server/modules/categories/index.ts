import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { db } from '@/src/db';
import { categories, competitions } from '@/src/db/schema';
import { asc, eq, count } from 'drizzle-orm';
import { z } from 'zod';

const categorySchema = z.object({
  id: z.string().min(1, 'ID kategori wajib diisi'),
  label: z.string().min(1, 'Nama kategori wajib diisi'),
  color: z.string().optional().default('text-cyan-700 bg-cyan-50 border-cyan-200'),
  sortOrder: z.number().int().optional().default(99),
});

/** Categories — public list, admin mutations. */
export const categoriesModule = new Elysia({ prefix: '/categories' })
  .use(authPlugin)
  .get('/', () => db.select().from(categories).orderBy(asc(categories.sortOrder)))
  .post('/', async ({ body }) => {
    const [cat] = await db
      .insert(categories)
      .values({
        id: body.id.toLowerCase().replace(/\s+/g, '-'),
        label: body.label,
        color: body.color,
        sortOrder: body.sortOrder,
      })
      .returning();
    return status(201, cat);
  }, {
    body: categorySchema,
    admin: true,
  })
  .put('/:id', async ({ params, body }) => {
    const updates: { label?: string; color?: string; sortOrder?: number } = {};
    if (body.label !== undefined) updates.label = body.label;
    if (body.color !== undefined) updates.color = body.color;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    const [updated] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, params.id))
      .returning();
    if (!updated) return status(404, { error: 'Not found' });
    return updated;
  }, {
    params: t.Object({ id: t.String() }),
    body: categorySchema.partial(),
    admin: true,
  })
  .delete('/:id', async ({ params }) => {
    const [used] = await db
      .select({ count: count() })
      .from(competitions)
      .where(eq(competitions.category, params.id));

    if (used && Number(used.count) > 0) {
      return status(400, {
        error: `Tidak bisa menghapus: ${used.count} lomba masih menggunakan kategori ini`,
      });
    }

    await db.delete(categories).where(eq(categories.id, params.id));
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  });
