import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { registrationCreateSchema, registrationListQuerySchema } from './model';
import * as service from './service';

/** CSV export requires a plain text/csv response. */
function csvResponse(content: string) {
  return new Response(content, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="astro-pendaftaran-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

/**
 * Registrations module.
 *
 * - GET list: requires auth; admins see all, non-admins only their own.
 * - POST create: anonymous (no-account registration).
 * - PATCH: whitelisted by caller identity (admin vs self-service).
 * - stats/export: admin-only.
 * - winners: public.
 */
export const registrationsModule = new Elysia({ prefix: '/registrations' })
  .use(authPlugin)

  .get('/', async ({ query, user }) => {
    const result = await service.listRegistrations(
      query,
      user.role ?? 'participant',
      user.id,
    );
    return {
      data: result.data,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / result.pageSize),
        hasMore: result.page * result.pageSize < result.total,
      },
    };
  }, {
    query: registrationListQuerySchema,
    auth: true,
  })

  .post('/', async ({ body, user }) => {
    const result = await service.createRegistration(body, user?.id ?? null);
    if ('error' in result) {
      switch (result.status) {
        case 404:
          return status(404, { error: result.error });
        case 502:
          return status(502, { error: result.error });
        default:
          return status(400, { error: result.error });
      }
    }
    return status(201, result.reg);
  }, {
    body: registrationCreateSchema,
    optional: true,
  })

  .get('/stats', async () => service.getStats(), { admin: true })

  .get('/winners', async ({ query }) => {
    if (!query.competitionId) return status(400, { error: 'competitionId wajib diisi' });
    return service.getWinners(query.competitionId);
  }, {
    query: t.Object({ competitionId: t.String() }),
  })

  .get('/export', async () => csvResponse(await service.getExportRows()), {
    admin: true,
  })

  .get('/:id', async ({ params }) => {
    const reg = await service.getRegistration(params.id);
    if (!reg) return status(404, { error: 'Not found' });
    return reg;
  }, {
    params: t.Object({ id: t.String() }),
  })

  .patch('/:id', async ({ params, body, user }) => {
    const isAdmin = user?.role === 'admin';
    const result = await service.updateRegistration(params.id, body, isAdmin);

    switch (result.kind) {
      case 'notfound':
        return status(404, { error: 'Not found' });
      case 'forbidden':
        return status(403, { error: 'Forbidden' });
      case 'locked':
        return status(403, { error: 'Pendaftaran sudah tidak bisa diubah' });
      case 'empty':
        return status(400, { error: 'Tidak ada field yang valid untuk diupdate' });
      case 'invalid':
        return status(400, { error: result.error });
      default:
        return result.reg;
    }
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Record(t.String(), t.Any()),
    optional: true,
  });
