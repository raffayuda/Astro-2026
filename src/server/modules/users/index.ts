import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/src/server/auth';
import { z } from 'zod';

const userCreateSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().optional(),
  role: z.enum(['admin', 'participant'], 'Role tidak valid').optional().default('participant'),
});

const userUpdateSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['admin', 'participant']).optional(),
});

/**
 * Users module — admin-only CRUD.
 * GET/DELETE hit the public.users table; POST creates via Better Auth admin API.
 */
export const usersModule = new Elysia({ prefix: '/users' })
  .use(authPlugin)

  .get('/', async () => {
    const data = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
    return { data };
  }, { admin: true })

  .post('/', async ({ body }) => {
    const result = await auth.api.createUser({
      body: {
        email: body.email,
        password: body.password,
        name: body.name || body.email.split('@')[0],
        role: body.role as 'admin' | 'user',
      },
      headers: await headers(),
    });

    if ('error' in result && result.error) {
      const err = result.error as { message?: string };
      return status(400, { error: err.message ?? 'Gagal membuat user' });
    }

    return status(201, { data: result });
  }, {
    body: userCreateSchema,
    admin: true,
  })

  .put('/:id', async ({ params, body }) => {
    const updates: { name?: string; role?: string } = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.role !== undefined) updates.role = body.role;

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, params.id))
      .returning();

    if (!updated) return status(404, { error: 'User tidak ditemukan' });
    return { data: updated };
  }, {
    params: t.Object({ id: t.String() }),
    body: userUpdateSchema,
    admin: true,
  })

  .delete('/:id', async ({ params }) => {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, params.id))
      .returning();

    if (!deleted) return status(404, { error: 'User tidak ditemukan' });
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  });
