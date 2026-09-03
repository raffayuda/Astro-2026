import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { invitationCreateSchema, invitationAcceptSchema } from './model';
import * as service from './service';

export const invitationsModule = new Elysia({ prefix: '/invitations' })
  .use(authPlugin)

  // ─── Admin Endpoints ───
  .get('/', async () => {
    return service.listInvitations();
  }, { admin: true })

  .post('/', async ({ body, user }) => {
    const result = await service.createInvitation(body, user?.id);
    if ('error' in result) {
      return status(result.status ?? 400, { error: result.error });
    }
    return status(201, result.data);
  }, {
    body: invitationCreateSchema,
    admin: true,
  })

  .delete('/:id', async ({ params }) => {
    const result = await service.revokeInvitation(params.id);
    if ('error' in result) {
      return status(result.status ?? 404, { error: result.error });
    }
    return result.data;
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  })

  // ─── Public Endpoints (Invite Link Flow) ───
  .get('/verify/:token', async ({ params }) => {
    const result = await service.verifyInvitation(params.token);
    if (!result.valid) {
      return status(400, { error: result.error, valid: false });
    }
    return { valid: true, data: result.data };
  }, {
    params: t.Object({ token: t.String() }),
  })

  .post('/accept/:token', async ({ params, body }) => {
    const result = await service.acceptInvitation(params.token, body);
    if ('error' in result) {
      return status(result.status ?? 400, { error: result.error });
    }
    return result.data;
  }, {
    params: t.Object({ token: t.String() }),
    body: invitationAcceptSchema,
  });
