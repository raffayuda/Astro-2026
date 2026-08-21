import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { certificateTemplateSchema } from './model';
import * as service from './service';

/**
 * Certificate templates module.
 * - GET list: public (for fetching template + overlays at announce time)
 * - POST/PUT/DELETE: admin only
 */
export const certificateTemplatesModule = new Elysia({
  prefix: '/certificate-templates',
})
  .use(authPlugin)

  .get(
    '/',
    async ({ query }) => {
      if (!query.competitionId) {
        return status(400, { error: 'competitionId wajib diisi' });
      }
      return service.listTemplates(query.competitionId);
    },
    {
      query: t.Object({ competitionId: t.String() }),
    },
  )

  .post(
    '/',
    async ({ body }) => {
      const template = await service.upsertTemplate(body);
      return status(201, template);
    },
    {
      body: certificateTemplateSchema,
      admin: true,
    },
  )

  .delete(
    '/:id',
    async ({ params }) => {
      const deleted = await service.deleteTemplate(Number(params.id));
      if (!deleted) return status(404, { error: 'Template tidak ditemukan' });
      return { success: true };
    },
    {
      params: t.Object({ id: t.String() }),
      admin: true,
    },
  );
