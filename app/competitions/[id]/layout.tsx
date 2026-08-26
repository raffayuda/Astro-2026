import type { Metadata } from 'next';
import { db } from '@/src/db';
import { competitions } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const comp = await db.query.competitions.findFirst({
      where: eq(competitions.id, id),
    });

    if (!comp) {
      return {
        title: 'Detail Lomba | ASTRO 2026',
        description: 'Informasi detail cabang perlombaan ASTRO 2026.',
      };
    }

    const title = `${comp.title} - Perlombaan ASTRO 2026 | BEM STT-NF`;
    const description =
      comp.description ||
      comp.tagline ||
      `Ikuti cabang lomba ${comp.title} di event ASTRO 2026 persembahan BEM STT-NF. Simak juknis, jadwal, dan daftarkan timmu sekarang!`;

    return {
      title,
      description,
      alternates: {
        canonical: `https://astro.nurulfikri.ac.id/competitions/${id}`,
      },
      openGraph: {
        title,
        description,
        url: `https://astro.nurulfikri.ac.id/competitions/${id}`,
        siteName: 'ASTRO 2026',
        images: [
          {
            url: 'https://i.ibb.co.com/QjnnBLmr/og-image-astro.png',
            width: 1200,
            height: 630,
            alt: `${comp.title} - ASTRO 2026`,
          },
        ],
      },
    };
  } catch {
    return {
      title: 'Detail Kompetisi | ASTRO 2026',
    };
  }
}

export default function CompetitionDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
