import type { MetadataRoute } from 'next';
import { db } from '@/src/db';
import { competitions } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://astro.nurulfikri.ac.id';

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/check-registration`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/announcements`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/media`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic competition routes
  let competitionRoutes: MetadataRoute.Sitemap = [];
  try {
    const allCompetitions = await db
      .select({ id: competitions.id, createdAt: competitions.createdAt })
      .from(competitions)
      .where(eq(competitions.isActive, '1'));

    competitionRoutes = allCompetitions.map((comp) => ({
      url: `${baseUrl}/competitions/${comp.id}`,
      lastModified: comp.createdAt ? new Date(comp.createdAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));
  } catch (err) {
    console.error('Error generating sitemap competitions:', err);
  }

  return [...staticRoutes, ...competitionRoutes];
}
