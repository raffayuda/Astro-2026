import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { db } from '@/src/db';
import { faqs } from '@/src/db/schema';
import { desc, max, eq } from 'drizzle-orm';
import { z } from 'zod';

const faqSchema = z.object({
  question: z.string().min(1, 'Pertanyaan wajib diisi'),
  answer: z.string().min(1, 'Jawaban wajib diisi'),
  sortOrder: z.number().int().optional(),
});

/** FAQs — public list, admin mutations. */
export const faqsModule = new Elysia({ prefix: '/faqs' })
  .use(authPlugin)
  .get('/', () => db.select().from(faqs).orderBy(desc(faqs.sortOrder)))
  .post('/', async ({ body }) => {
    const [maxOrder] = await db.select({ max: max(faqs.sortOrder) }).from(faqs);
    const nextOrder = (maxOrder?.max ?? 0) + 1;

    const [faq] = await db
      .insert(faqs)
      .values({
        question: body.question,
        answer: body.answer,
        sortOrder: body.sortOrder ?? nextOrder,
      })
      .returning();
    return status(201, faq);
  }, {
    body: faqSchema,
    admin: true,
  })
  .put('/:id', async ({ params, body }) => {
    const updates: { question?: string; answer?: string; sortOrder?: number } = {};
    if (body.question !== undefined) updates.question = body.question;
    if (body.answer !== undefined) updates.answer = body.answer;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    const [updated] = await db
      .update(faqs)
      .set(updates)
      .where(eq(faqs.id, parseInt(params.id)))
      .returning();
    if (!updated) return status(404, { error: 'Not found' });
    return updated;
  }, {
    params: t.Object({ id: t.String() }),
    body: faqSchema.partial(),
    admin: true,
  })
  .delete('/:id', async ({ params }) => {
    await db.delete(faqs).where(eq(faqs.id, parseInt(params.id)));
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  });
