import type { Metadata } from 'next';
import { PageShell } from '@/components/brand';
import PengumumanClient from './PengumumanClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pengumuman Pemenang — ASTRO 2026',
  description: 'Daftar pemenang seluruh cabang lomba ASTRO 2026.',
};

export default function PengumumanPage() {
  return (
    <PageShell>
      <PengumumanClient />
    </PageShell>
  );
}
