import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { db } from './index';
import { competitions } from './schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Configuring custom registration fields for AGT and Cerdas Cermat...');

  const agtCustomFields = [
    {
      id: 'talent_category',
      label: 'Kategori Bakat',
      type: 'select' as const,
      options: [
        'Bernyanyi (Vokal / Solo / Duo)',
        'Dance / Seni Tari',
        'Teater / Monolog / Puisi',
        'Sulap / Magic Performance',
        'Akustik / Musik Instrumen',
        'Melukis / Speed Painting',
        'Lainnya',
      ],
      required: true,
      description: 'Pilih jenis pertunjukan atau bakat utama yang akan ditampilkan',
    },
    {
      id: 'performance_title',
      label: 'Judul / Konsep Karya Penampilan',
      type: 'text' as const,
      placeholder: 'Contoh: Cover Lagu Bendera - Cokelat',
      required: true,
      description: 'Nama atau judul aksi pertunjukan yang akan dibawakan di panggung',
    },
    {
      id: 'stage_property',
      label: 'Kebutuhan Properti & Alat Panggung',
      type: 'textarea' as const,
      placeholder: 'Tuliskan alat/properti yang dibawa sendiri (misal: 1 gitar akustik, stand kanvas lukis, dll)',
      required: false,
      description: 'Panitia hanya menyediakan sound system, laptop operator, dan 2 mic wireless. Kebutuhan properti lain dibawa sendiri oleh peserta.',
    },
    {
      id: 'ktm_url',
      label: 'Foto KTM / Bukti Mahasiswa STT-NF',
      type: 'image' as const,
      required: true,
      description: 'Unggah foto Kartu Tanda Mahasiswa (KTM) aktif STT-NF sebagai bukti kepesertaan',
    },
  ];

  const cerdasCermatCustomFields = [
    {
      id: 'major',
      label: 'Program Studi & Angkatan',
      type: 'select' as const,
      options: [
        'Teknik Informatika 2024',
        'Teknik Informatika 2025',
        'Teknik Informatika 2026',
        'Sistem Informasi 2024',
        'Sistem Informasi 2025',
        'Sistem Informasi 2026',
        'Bisnis Digital 2024',
        'Bisnis Digital 2025',
        'Bisnis Digital 2026',
        'Lainnya',
      ],
      required: true,
      description: 'Pilih program studi dan tahun angkatan aktif Anda di STT-NF',
    },
    {
      id: 'ktm_url',
      label: 'Foto Kartu Tanda Mahasiswa (KTM)',
      type: 'image' as const,
      required: true,
      description: 'Unggah foto KTM aktif atau tangkapan layar SIAK resmi sebagai bukti Mahasiswa aktif STT-NF',
    },
    {
      id: 'profile_photo_url',
      label: 'Foto Profil untuk Publikasi',
      type: 'image' as const,
      required: true,
      description: 'Foto portrait diri peserta untuk kebutuhan kartu peserta, bagan, dan pamflet publikasi',
    },
    {
      id: 'instagram_proof_url',
      label: 'Screenshot Bukti Follow Instagram @bemsttnf & @astrosttnf',
      type: 'image' as const,
      required: true,
      description: 'Unggah tangkapan layar bukti telah mengikuti (follow) akun Instagram resmi BEM STT-NF dan ASTRO',
    },
  ];

  // Update AGT
  await db
    .update(competitions)
    .set({
      type: 'both',
      minTeamMembers: 1,
      maxTeamMembers: 10,
      customFields: agtCustomFields,
    })
    .where(eq(competitions.id, 'astro-got-talent'));
  console.log('✓ AGT (astro-got-talent) custom fields and team config updated!');

  // Update Cerdas Cermat
  await db
    .update(competitions)
    .set({
      type: 'individual',
      minTeamMembers: 1,
      maxTeamMembers: 1,
      customFields: cerdasCermatCustomFields,
    })
    .where(eq(competitions.id, 'cerdas-cermat'));
  console.log('✓ Cerdas Cermat (cerdas-cermat) custom fields and config updated!');

  process.exit(0);
}

main().catch((err) => {
  console.error('Error updating custom fields:', err);
  process.exit(1);
});
