import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { db } from '@/src/db';
import { journeys } from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';

const journeySchema = z.object({
  year: z.string().min(1, 'Tahun wajib diisi'),
  theme: z.string().min(1, 'Tema wajib diisi'),
  participants: z.number().int().optional().default(0),
  date: z.string().nullable().optional(),
  competitionsCount: z.number().int().optional().default(0),
  achievement: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  highlights: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export const journeysModule = new Elysia({ prefix: '/journeys' })
  .use(authPlugin)
  .get('/', () => db.select().from(journeys).orderBy(asc(journeys.sortOrder)))
  .get('/:id', async ({ params }) => {
    const [item] = await db.select().from(journeys).where(eq(journeys.id, params.id));
    if (!item) return status(404, { error: 'Not found' });
    return item;
  }, {
    params: t.Object({ id: t.String() }),
  })
  .post('/', async ({ body }) => {
    // ID otomatis dari tahun — admin tidak perlu mengisi ID
    const id = `j-${body.year}`;

    const [item] = await db
      .insert(journeys)
      .values({
        id,
        year: body.year,
        theme: body.theme,
        participants: body.participants,
        date: body.date ?? null,
        competitionsCount: body.competitionsCount,
        achievement: body.achievement ?? null,
        description: body.description ?? null,
        highlights: body.highlights,
        isActive: body.isActive ? '1' : '0',
        sortOrder: body.sortOrder,
      })
      .returning();
    return status(201, item);
  }, {
    body: journeySchema,
    admin: true,
  })
  .put('/:id', async ({ params, body }) => {
    const updates: Record<string, unknown> = {};
    // Tahun bisa diubah — ID otomatis ikut menyesuaikan
    if (body.year !== undefined) {
      updates.year = body.year;
      updates.id = `j-${body.year}`;
    }
    if (body.theme !== undefined) updates.theme = body.theme;
    if (body.participants !== undefined) updates.participants = body.participants;
    if (body.date !== undefined) updates.date = body.date ?? null;
    if (body.competitionsCount !== undefined) updates.competitionsCount = body.competitionsCount;
    if (body.achievement !== undefined) updates.achievement = body.achievement ?? null;
    if (body.description !== undefined) updates.description = body.description ?? null;
    if (body.highlights !== undefined) updates.highlights = body.highlights;
    if (body.isActive !== undefined) updates.isActive = body.isActive ? '1' : '0';
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    const [item] = await db
      .update(journeys)
      .set(updates)
      .where(eq(journeys.id, params.id))
      .returning();
    if (!item) return status(404, { error: 'Not found' });
    return item;
  }, {
    params: t.Object({ id: t.String() }),
    body: journeySchema.partial(),
    admin: true,
  })
  .delete('/:id', async ({ params }) => {
    const [item] = await db
      .delete(journeys)
      .where(eq(journeys.id, params.id))
      .returning();
    if (!item) return status(404, { error: 'Not found' });
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  });
