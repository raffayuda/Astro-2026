import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { db } from './index';
import { competitions } from './schema';
import { eq } from 'drizzle-orm';

async function restore() {
  console.log('Restoring competition data...');

  // 1. Restore AGT
  const agtGuidebook = [
    {
      id: 'agt-babak',
      title: 'Tahapan & Jadwal Babak',
      content: `Babak perlombaan ASTRO Got Talent dibagi menjadi 2 tahapan utama yang dilaksanakan di Auditorium Kampus B:

- **Babak Showcase**: 6 Desember 2026 (Auditorium Kampus B)
- **Babak Grand Final**: 13 Desember 2026 (Auditorium Kampus B)

Sebanyak **8–10 peserta terbaik** dari babak Showcase akan melaju ke panggung Grand Final untuk memperebutkan gelar Juara ASTRO 2026!`,
    },
    {
      id: 'agt-ketentuan',
      title: 'Ketentuan Penampilan & Fasilitas',
      content: `- **Durasi Tampil**: Maksimal **5 menit**. Jika membawa properti tambahan (alat musik, kanvas, dll), waktu setup panggung dibatasi maksimal **2 menit**.
- **Kategori Bakat**: Bebas berekspresi (Bernyanyi, Dance/Tari, Teater/Monolog, Sulap, Melukis, dll) selama TIDAK mengandung unsur SARA, kekerasan, pornografi, politik praktis, maupun lirik terlarang (kata kasar/makian).
- **Fasilitas Panitia**: Panitia hanya menyediakan sound system, laptop operator, dan 2 unit mic wireless. Kebutuhan properti lainnya dibawa sendiri oleh peserta.
- **Audio/Video Pendukung**: Wajib diserahkan kepada panitia maksimal **H-7** sebelum hari penampilan.`,
    },
    {
      id: 'agt-penilaian',
      title: 'Sistem Penilaian',
      content: `Penilaian dewan juri didasarkan pada 4 kriteria utama:

- **Kreativitas & Orisinalitas**: **30%** (Keunikan konsep, keaslian karya, dan daya tarik pertunjukan)
- **Teknis & Kualitas Penampilan**: **30%** (Kemampuan vokal, ritme gerak, ketepatan nada, atau keterampilan teknis)
- **Penguasaan Panggung**: **25%** (Interaksi panggung, kepercayaan diri, blocking, dan ekspresi)
- **Kostum & Visual**: **15%** (Kerapian, kesesuaian tema penampilan, dan estetika visual)

⚠️ Catatan Penting: Keputusan dewan juri bersifat mutlak dan tidak dapat diganggu gugat.`,
    },
    {
      id: 'agt-tatatertib',
      title: 'Tata Tertib & Diskualifikasi',
      content: `- **Syarat Kepesertaan**: Mahasiswa aktif STT Terpadu Nurul Fikri, baik secara individu maupun kelompok (maksimal 10 orang).
- Setiap peserta hanya diperbolehkan tampil dalam satu penampilan dengan membawakan karya/aksi yang bersifat orisinil.
- Peserta wajib melakukan registrasi ulang di hari H dan harus standby di backstage minimal **30 menit** sebelum giliran.
- Peserta wajib berpakaian sopan, menjaga ketertiban suporter, dan tidak menggunakan properti yang membahayakan. Kerusakan alat panitia akibat kelalaian akan menjadi tanggung jawab peserta.

⚠️ Diskualifikasi Otomatis:
- Dipanggil 3 kali berturut-turut di backstage tidak hadir.
- Melanggar batas materi (mengandung unsur SARA, pornografi, atau kata-kata kasar/makian).
- Tidak hadir saat sesi Technical Meeting (TM) tanpa pemberitahuan resmi.`,
    },
  ];

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

  await db
    .update(competitions)
    .set({
      title: "ASTRO Got Talent (AGT)",
      tagline: "Panggung Ekspresi dan Bakat Mahasiswa STT-NF",
      description: "Ajang unjuk kreativitas dan bakat terbesar mahasiswa STT Terpadu Nurul Fikri. Tampilkan aksi terbaikmu baik solo maupun kelompok di panggung megah ASTRO 2026!",
      category: "kesenian-/-seni",
      type: "both",
      minTeamMembers: 1,
      maxTeamMembers: 10,
      fee: 20000,
      hasBatches: "1",
      batches: [
        {
          id: "agt-batch-1",
          name: "Batch 1",
          fee: 20000,
          startDate: "2026-09-01T00:00",
          endDate: "2026-11-20T23:59",
        },
        {
          id: "agt-batch-2",
          name: "Batch 2",
          fee: 25000,
          startDate: "2026-11-21T00:00",
          endDate: "2026-12-05T23:59",
        },
      ],
      maxSlots: 25,
      location: "Audit Kampus B",
      scheduleDate: new Date("2026-12-06T08:00:00Z"),
      contactName: "Farel Zaghlul",
      contactWhatsapp: "6285183660490",
      rulebookUrl: "https://forms.gle/yKcEFqNZbR85zzqU9",
      prizes: [
        { label: "Juara 1", value: "Hadiah + E-Sertifikat" },
        { label: "Juara 2", value: "Hadiah + E-Sertifikat" },
        { label: "Juara 3", value: "Hadiah + E-Sertifikat" },
      ],
      guidebookSections: agtGuidebook,
      customFields: agtCustomFields,
      isActive: "1",
    })
    .where(eq(competitions.id, 'astro-got-talent'));
  console.log('✓ Restored ASTRO Got Talent');

  // 2. Restore Cerdas Cermat
  const ccGuidebook = [
    {
      id: 'cc-alur',
      title: 'Alur & Teknis Perlombaan',
      content: `Perlombaan dilaksanakan secara luring (offline) dalam satu hari pada **29 November 2026** di Auditorium Kampus B STT-NF.

- **Materi Pertanyaan**: Nusantara, Pengetahuan Umum, dan Matematika.
- **Tahapan Perlombaan**:
1. **Babak 1 - Seleksi (Individu)**: Ujian seleksi mandiri untuk menyaring peserta terbaik.
2. **Babak 2 - Rebutan (Kelompok)**: Peserta yang lolos dikelompokkan (5 orang per kelompok) untuk sesi cepat tepat menggunakan bel.
3. **Babak 3 - Final (Individu)**: Peserta terbaik dari kelompok pemenang bertanding secara individu di babak grand final.`,
    },
    {
      id: 'cc-penilaian',
      title: 'Sistem Penilaian & Aturan Bel',
      content: `Aturan menjawab pada Babak Rebutan dan Babak Final:

- Hak menjawab diberikan kepada peserta/kelompok tercepat menekan bel.
- **Aturan Bel**: Bel hanya boleh ditekan SETELAH panitia selesai membacakan soal secara lengkap.
- Jika kelompok yang menekan bel memberikan jawaban yang salah, kesempatan menjawab akan dilempar ke kelompok lain.

Perhitungan Poin:
- Jawaban BENAR: **+100 poin**
- Jawaban SALAH: **-50 poin** (pengurangan nilai)`,
    },
    {
      id: 'cc-syarat',
      title: 'Syarat & Berkas Pendaftaran',
      content: `- Terbuka untuk seluruh Mahasiswa aktif STT Terpadu Nurul Fikri (Pendaftaran dilakukan secara individu).
- Wajib membaca dan menyetujui Guidebook resmi lomba.
- **Dokumen yang Wajib Disiapkan saat Pendaftaran**:
- Foto Kartu Tanda Mahasiswa (KTM) aktif
- Foto profil untuk publikasi
- Bukti tangkapan layar (screenshot) follow Instagram BEM STT-NF (@bemsttnf) dan ASTRO (@astrosttnf)
- Peserta wajib melakukan registrasi ulang di lokasi perlombaan pada hari H.`,
    },
    {
      id: 'cc-tatatertib',
      title: 'Tata Tertib & Sanksi Ketat',
      content: `⚠️ Pengumpulan Barang Elektronik:
Seluruh peserta WAJIB mengumpulkan seluruh barang elektronik (HP, smartphone, kalkulator, smartwatch/jam tangan digital) kepada panitia sebelum acara dimulai. Peserta yang ketahuan membawa atau menggunakan alat elektronik selama lomba berlangsung akan LANGSUNG DIDISKUALIFIKASI!

⚠️ Keterlambatan & Kedisiplinan:
- Peserta yang datang terlambat saat Babak 1 sudah dimulai akan langsung dinyatakan gugur/diskualifikasi.
- Dilarang keras melakukan kecurangan, provokasi antar peserta, atau bersikap pasif secara sengaja (terus berdiam diri hanya untuk mengamankan poin).`,
    },
  ];

  const ccCustomFields = [
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

  await db
    .update(competitions)
    .set({
      title: "Cerdas Cermat",
      tagline: "Uji Ketangkasan Nalar, Wawasan, dan Kecepatan Berpikir",
      description: "Kompetisi adu wawasan seputar Nusantara, Pengetahuan Umum, dan Matematika dengan sistem bel cepat tepat beregu dan individual.",
      category: "akademik",
      type: "individual",
      minTeamMembers: 1,
      maxTeamMembers: 1,
      fee: 20000,
      hasBatches: "1",
      batches: [
        {
          id: "cc-batch-1",
          name: "Batch 1",
          fee: 20000,
          startDate: "2026-09-01T00:00",
          endDate: "2026-11-15T23:59",
        },
        {
          id: "cc-batch-2",
          name: "Batch 2",
          fee: 25000,
          startDate: "2026-11-16T00:00",
          endDate: "2026-11-28T23:59",
        },
      ],
      maxSlots: 30,
      location: "Audit Kampus B",
      scheduleDate: new Date("2026-11-29T08:00:00Z"),
      contactName: "Trinita Agustin",
      contactWhatsapp: "62898519052",
      rulebookUrl: "",
      prizes: [
        { label: "Juara 1", value: "Hadiah + E-Sertifikat" },
        { label: "Juara 2", value: "Hadiah + E-Sertifikat" },
        { label: "Juara 3", value: "Hadiah + E-Sertifikat" },
      ],
      guidebookSections: ccGuidebook,
      customFields: ccCustomFields,
      isActive: "1",
    })
    .where(eq(competitions.id, 'cerdas-cermat'));
  console.log('✓ Restored Cerdas Cermat');

  // 3. Restore Futsal Internal
  await db
    .update(competitions)
    .set({
      title: "Futsal Internal",
      tagline: "Ajang Adu Taktik dan Solidaritas Lapangan Hijau",
      description: "Turnamen futsal bergengsi antar mahasiswa STT-NF. Tunjukkan skil olah bola, kerja sama tim terbaik, dan bawa pulang trofi kebanggaan!",
      category: "olahraga",
      type: "team",
      minTeamMembers: 5,
      maxTeamMembers: 10,
      membersRequired: "required",
      fee: 150000,
      hasBatches: "0",
      batches: [],
      maxSlots: 16,
      location: "Viva Futsal Arena",
      scheduleDate: new Date("2026-11-20T08:00:00Z"),
      contactName: "Panitia Futsal",
      contactWhatsapp: "628123456789",
      prizes: [
        { label: "Juara 1", value: "Rp 1.500.000 + Trofi + E-Sertifikat" },
        { label: "Juara 2", value: "Rp 1.000.000 + E-Sertifikat" },
        { label: "Top Scorer", value: "Hadiah + E-Sertifikat" },
      ],
      rulesSummary: [
        "1 Tim terdiri dari 5 pemain inti dan maksimal 5 cadangan",
        "Waktu pertandingan 2 x 15 menit kotor",
        "Sistem gugur (knockout stage)",
        "Wajib menggunakan deker (shin guard) dan sepatu futsal standar",
      ],
      isActive: "1",
    })
    .where(eq(competitions.id, 'futsal-internal'));
  console.log('✓ Restored Futsal Internal');

  // 4. Restore Badminton
  await db
    .update(competitions)
    .set({
      title: "Badminton",
      tagline: "Smash Keras, Raih Prestasi di Puncak Gelanggang",
      description: "Kompetisi bulu tangkis antar mahasiswa STT-NF dalam kategori tunggal dan ganda. Uji ketahanan fisik, kelincahan gerak, dan ketepatan pukulan!",
      category: "olahraga",
      type: "both",
      minTeamMembers: 1,
      maxTeamMembers: 2,
      fee: 35000,
      hasBatches: "0",
      batches: [],
      maxSlots: 32,
      location: "GOR Badminton Ciracas",
      scheduleDate: new Date("2026-11-22T08:00:00Z"),
      contactName: "Panitia Badminton",
      contactWhatsapp: "628123456789",
      prizes: [
        { label: "Juara 1", value: "Rp 750.000 + Medali + E-Sertifikat" },
        { label: "Juara 2", value: "Rp 500.000 + Medali + E-Sertifikat" },
        { label: "Juara 3", value: "Rp 250.000 + Medali + E-Sertifikat" },
      ],
      rulesSummary: [
        "Sistem gugur (knockout) rally point 21x3 (rubber game jika imbang)",
        "Peserta membawa raket sendiri, shuttlecock disediakan panitia",
        "Wajib mengenakan sepatu olahraga non-marking",
      ],
      isActive: "1",
    })
    .where(eq(competitions.id, 'badminton'));
  console.log('✓ Restored Badminton');

  // 5. Restore Mobile Legends
  await db
    .update(competitions)
    .set({
      title: "Mobile Legends (MLBB)",
      tagline: "Taklukkan Land of Dawn dan Rebut Tahta Juara",
      description: "Turnamen Mobile Legends: Bang Bang resmi ASTRO 2026. Susun draft terbaik, menangkan teamfight, dan hancurkan nexus lawan!",
      category: "esports",
      type: "team",
      minTeamMembers: 5,
      maxTeamMembers: 6,
      membersRequired: "required",
      playerPhotoRequired: "1",
      fee: 50000,
      hasBatches: "0",
      batches: [],
      maxSlots: 32,
      location: "Online (Kualifikasi) & Audit Kampus B (Grand Final)",
      scheduleDate: new Date("2026-11-25T13:00:00Z"),
      contactName: "Panitia Esports",
      contactWhatsapp: "628123456789",
      prizes: [
        { label: "Juara 1", value: "Rp 1.000.000 + Diamonds + E-Sertifikat" },
        { label: "Juara 2", value: "Rp 600.000 + Diamonds + E-Sertifikat" },
        { label: "Juara 3", value: "Rp 400.000 + Diamonds + E-Sertifikat" },
      ],
      rulesSummary: [
        "1 Tim terdiri dari 5 pemain inti dan 1 pemain cadangan (opsional)",
        "Sistem pertandingan Single Elimination BO3, Grand Final BO5",
        "Wajib unggah foto seluruh pemain roster tim",
        "Dilarang menggunakan cheat, bug, atau aplikasi pihak ketiga apapun",
      ],
      isActive: "1",
    })
    .where(eq(competitions.id, 'mobile-legends-mlbb'));
  console.log('✓ Restored Mobile Legends');

  console.log('All competitions restored successfully!');
  process.exit(0);
}

restore().catch((err) => {
  console.error(err);
  process.exit(1);
});
