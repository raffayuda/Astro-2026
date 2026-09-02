import { Elysia, t, status } from 'elysia';
import { authPlugin } from '@/src/server/plugins/auth';
import { competitionInputSchema, timelineItemSchema } from './model';
import * as service from './service';

/**
 * Competitions module.
 *
 * GET routes are public (they feed the marketing site); mutating routes are
 * admin-only via the `admin` macro.
 */
export const competitionsModule = new Elysia({ prefix: '/competitions' })
  .use(authPlugin)

  .get('/', ({ set }) => {
    set.headers['cache-control'] = 'no-store, no-cache, must-revalidate';
    return service.listCompetitions();
  })

  .get('/with-winners', ({ set }) => {
    set.headers['cache-control'] = 'no-store, no-cache, must-revalidate';
    return service.listCompetitionsWithWinners();
  })

  .get('/:id', async ({ params, set }) => {
    set.headers['cache-control'] = 'no-store, no-cache, must-revalidate';
    const comp = await service.getCompetition(params.id);
    if (!comp) return status(404, { error: 'Not found' });
    return comp;
  }, {
    params: t.Object({ id: t.String() }),
  })

  .post('/', async ({ body }) => service.createCompetition(body), {
    body: competitionInputSchema,
    admin: true,
  })

  .put('/:id', async ({ params, body }) => {
    const comp = await service.updateCompetition(params.id, body);
    if (!comp) return status(404, { error: 'Not found' });
    return comp;
  }, {
    params: t.Object({ id: t.String() }),
    body: competitionInputSchema.partial(),
    admin: true,
  })

  .delete('/:id', async ({ params }) => {
    const result = await service.deleteCompetition(params.id);
    if (result.blocked) {
      return status(400, {
        error: `Tidak bisa dihapus: ${result.count} pendaftar masih terdaftar di lomba ini. Nonaktifkan saja.`,
      });
    }
    return { success: true };
  }, {
    params: t.Object({ id: t.String() }),
    admin: true,
  })

  /* ─── Timeline ─── */
  .get('/:id/timeline', async ({ params, set }) => {
    set.headers['cache-control'] = 'no-store, no-cache, must-revalidate';
    return service.listTimeline(params.id);
  }, {
    params: t.Object({ id: t.String() }),
  })

  .post('/:id/timeline', async ({ params, body }) =>
    service.createTimelineItem(params.id, body), {
    params: t.Object({ id: t.String() }),
    body: timelineItemSchema,
    admin: true,
  })

  .put('/:id/timeline/:itemId', async ({ params, body }) => {
    const item = await service.updateTimelineItem(Number(params.itemId), body);
    if (!item) return status(404, { error: 'Not found' });
    return item;
  }, {
    params: t.Object({ id: t.String(), itemId: t.String() }),
    body: timelineItemSchema.partial(),
    admin: true,
  })

  .delete('/:id/timeline/:itemId', async ({ params }) => {
    const item = await service.deleteTimelineItem(Number(params.itemId));
    if (!item) return status(404, { error: 'Not found' });
    return { success: true };
  }, {
    params: t.Object({ id: t.String(), itemId: t.String() }),
    admin: true,
  });
