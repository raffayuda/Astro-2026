import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { db } from '@/src/db';
import { journeyPhotos } from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';

const photoSchema = z.object({
  journeyId: z.string().min(1, 'Perjalanan (journey) wajib dipilih'),
  url: z.string().min(1, 'URL foto wajib diisi'),
  caption: z.string().optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

/** Journey documentation photos — public list per journey, admin mutations. */
export const journeyPhotosModule = new Elysia({ prefix: '/journey-photos' })
  .use(authPlugin)
  .get('/', async ({ query }) => {
    const journeyId = query.journeyId ?? '';
    return db
      .select()
      .from(journeyPhotos)
      .where(eq(journeyPhotos.journeyId, journeyId))
      .orderBy(asc(journeyPhotos.sortOrder), asc(journeyPhotos.id));
  }, {
    query: t.Object({ journeyId: t.Optional(t.String()) }),
  })
  .post('/', async ({ body }) => {
    const [item] = await db
      .insert(journeyPhotos)
      .values({
        journeyId: body.journeyId,
        url: body.url,
        caption: body.caption ?? null,
        sortOrder: body.sortOrder,
      })
      .returning();
    return status(201, item);
  }, {
    body: photoSchema,
    admin: true,
  })
  .delete('/:id', async ({ params }) => {
    const [item] = await db
      .delete(journeyPhotos)
      .where(eq(journeyPhotos.id, Number(params.id)))
      .returning();
    if (!item) return status(404, { error: 'Not found' });
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  });