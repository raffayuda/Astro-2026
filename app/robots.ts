import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://astro.nurulfikri.ac.id';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/og-preview',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
