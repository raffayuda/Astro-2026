import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { db } from '@/src/db';
import { sponsors } from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { deleteSupabaseFile } from '@/src/server/modules/upload';

const sponsorSchema = z.object({
  name: z.string().min(1, 'Nama sponsor wajib diisi'),
  tier: z.string().optional().default('gold'),
  website: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  isCurrent: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

export const sponsorsModule = new Elysia({ prefix: '/sponsors' })
  .use(authPlugin)
  .get('/', () => db.select().from(sponsors).orderBy(asc(sponsors.sortOrder)))
  .post('/', async ({ body }) => {
    if (!body.name && !body.logo) {
      return status(400, { error: 'nama atau logo wajib diisi' });
    }
    const [item] = await db
      .insert(sponsors)
      .values({
        name: body.name,
        tier: body.tier,
        website: body.website ?? null,
        logo: body.logo ?? null,
        isCurrent: body.isCurrent ?? false,
        sortOrder: body.sortOrder,
      })
      .returning();
    return status(201, item);
  }, {
    body: sponsorSchema,
    admin: true,
  })
  .put('/:id', async ({ params, body }) => {
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.tier !== undefined) updates.tier = body.tier;
    if (body.website !== undefined) updates.website = body.website ?? null;
    if (body.logo !== undefined) updates.logo = body.logo ?? null;
    if (body.isCurrent !== undefined) updates.isCurrent = body.isCurrent;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    const [existing] = await db.select().from(sponsors).where(eq(sponsors.id, Number(params.id)));
    if (!existing) return status(404, { error: 'Not found' });

    const [item] = await db
      .update(sponsors)
      .set(updates)
      .where(eq(sponsors.id, Number(params.id)))
      .returning();
      
    if (updates.logo && existing.logo !== updates.logo) {
      deleteSupabaseFile(existing.logo).catch(console.error);
    }

    return item;
  }, {
    params: t.Object({ id: t.String() }),
    body: sponsorSchema.partial(),
    admin: true,
  })
  .delete('/:id', async ({ params }) => {
    const [item] = await db
      .delete(sponsors)
      .where(eq(sponsors.id, Number(params.id)))
      .returning();
    if (!item) return status(404, { error: 'Not found' });
    
    deleteSupabaseFile(item.logo).catch(console.error);
    
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  })
  .put('/reorder', async ({ body }) => {
    try {
      await db.transaction(async (tx) => {
        for (let i = 0; i < body.ids.length; i++) {
          await tx
            .update(sponsors)
            .set({ sortOrder: i + 1 })
            .where(eq(sponsors.id, body.ids[i]));
        }
      });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengubah urutan';
      return status(500, { error: message });
    }
  }, {
    body: t.Object({ ids: t.Array(t.Number()) }),
    admin: true,
  });
