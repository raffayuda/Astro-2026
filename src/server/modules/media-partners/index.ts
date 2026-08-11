import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { db } from '@/src/db';
import { mediaPartners } from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { deleteSupabaseFile } from '@/src/server/modules/upload';

const partnerSchema = z.object({
  name: z.string().min(1, 'Nama media partner wajib diisi'),
  website: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
});

export const mediaPartnersModule = new Elysia({ prefix: '/media-partners' })
  .use(authPlugin)
  .get('/', () => db.select().from(mediaPartners).orderBy(asc(mediaPartners.sortOrder)))
  .post('/', async ({ body }) => {
    if (!body.name && !body.logo) {
      return status(400, { error: 'nama atau logo wajib diisi' });
    }
    const [item] = await db
      .insert(mediaPartners)
      .values({
        name: body.name,
        website: body.website ?? null,
        logo: body.logo ?? null,
        sortOrder: body.sortOrder,
      })
      .returning();
    return status(201, item);
  }, {
    body: partnerSchema,
    admin: true,
  })
  .put('/:id', async ({ params, body }) => {
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.website !== undefined) updates.website = body.website ?? null;
    if (body.logo !== undefined) updates.logo = body.logo ?? null;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    const [existing] = await db.select().from(mediaPartners).where(eq(mediaPartners.id, Number(params.id)));
    if (!existing) return status(404, { error: 'Not found' });

    const [item] = await db
      .update(mediaPartners)
      .set(updates)
      .where(eq(mediaPartners.id, Number(params.id)))
      .returning();
      
    if (updates.logo && existing.logo !== updates.logo) {
      deleteSupabaseFile(existing.logo).catch(console.error);
    }

    return item;
  }, {
    params: t.Object({ id: t.String() }),
    body: partnerSchema.partial(),
    admin: true,
  })
  .delete('/:id', async ({ params }) => {
    const [item] = await db
      .delete(mediaPartners)
      .where(eq(mediaPartners.id, Number(params.id)))
      .returning();
    if (!item) return status(404, { error: 'Not found' });
    
    deleteSupabaseFile(item.logo).catch(console.error);
    
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  });
