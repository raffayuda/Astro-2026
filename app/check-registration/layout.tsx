import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cek Status Pendaftaran | ASTRO 2026',
  description:
    'Layanan pengecekan status pendaftaran peserta dan tim lomba ASTRO 2026. Masukkan ID registrasi untuk melihat progres verifikasi dan tiket partisipasi.',
  alternates: {
    canonical: 'https://astro.nurulfikri.ac.id/check-registration',
  },
  openGraph: {
    title: 'Cek Status Pendaftaran | ASTRO 2026',
    description:
      'Layanan pengecekan status pendaftaran peserta dan tim lomba ASTRO 2026. Masukkan ID registrasi untuk melihat progres verifikasi.',
    url: 'https://astro.nurulfikri.ac.id/check-registration',
    siteName: 'ASTRO 2026',
    images: [
      {
        url: 'https://i.ibb.co.com/QjnnBLmr/og-image-astro.png',
        width: 1200,
        height: 630,
        alt: 'Cek Status Pendaftaran ASTRO 2026',
      },
    ],
  },
};

export default function CheckRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
