import { Elysia } from 'elysia';
import { auth } from '@/src/server/auth';
import { authRoutes } from '@/src/server/auth-routes';
import { authPlugin } from '@/src/server/plugins/auth';
import { formatZodError } from '@/src/server/helpers/validation';
import { competitionsModule } from '@/src/server/modules/competitions';
import { registrationsModule } from '@/src/server/modules/registrations';
import { usersModule } from '@/src/server/modules/users';
import { categoriesModule } from '@/src/server/modules/categories';
import { faqsModule } from '@/src/server/modules/faqs';
import { committeeMembersModule } from '@/src/server/modules/committee-members';
import { committeeDivisionsModule } from '@/src/server/modules/committee-divisions';
import { galleryPhotosModule } from '@/src/server/modules/gallery-photos';
import { galleryCategoriesModule } from '@/src/server/modules/gallery-categories';
import { journeysModule } from '@/src/server/modules/journeys';
import { journeyPhotosModule } from '@/src/server/modules/journey-photos';
import { sponsorsModule } from '@/src/server/modules/sponsors';
import { mediaPartnersModule } from '@/src/server/modules/media-partners';
import { certificatesModule } from '@/src/server/modules/certificates';
import { certificateTemplatesModule } from '@/src/server/modules/certificate-templates';
import { uploadModule } from '@/src/server/modules/upload';

/**
 * Root Elysia app — mounted under `/api` via the single catch-all route.
 *
 * Better Auth is mounted at its default basePath `/api/auth` (the request
 * path already includes the `/api` prefix, so `.mount(auth.handler)` lines
 * up correctly).
 *
 * Validation errors are flattened to `{ error: "field: message" }` so clients
 * can show exactly which field failed and why.
 */
export const app = new Elysia({ prefix: '/api' })
  .use(authPlugin)
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 400;
      return { error: formatZodError(error as any) };
    }
  })
  .use(authRoutes)
  .mount(auth.handler)
  .get('/health', () => ({ status: 'ok' }))
  .use(competitionsModule)
  .use(registrationsModule)
  .use(usersModule)
  .use(categoriesModule)
  .use(faqsModule)
  .use(committeeMembersModule)
  .use(committeeDivisionsModule)
  .use(galleryPhotosModule)
  .use(galleryCategoriesModule)
  .use(journeysModule)
  .use(journeyPhotosModule)
  .use(sponsorsModule)
  .use(mediaPartnersModule)
  .use(certificatesModule)
  .use(certificateTemplatesModule)
  .use(uploadModule);

export type App = typeof app;
