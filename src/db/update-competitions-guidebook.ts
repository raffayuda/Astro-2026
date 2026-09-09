import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { db } from "./index";
import { competitions } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Updating AGT and Cerdas Cermat guidebook data...");

  const agtGuidebook = [
    {
      id: "agt-babak",
      title: "Tahapan & Jadwal Babak",
      content: `Babak perlombaan ASTRO Got Talent dibagi menjadi 2 tahapan utama yang dilaksanakan di Auditorium Kampus B:

- **Babak Showcase**: 6 Desember 2026 (Auditorium Kampus B)
- **Babak Grand Final**: 13 Desember 2026 (Auditorium Kampus B)

Sebanyak **8–10 peserta terbaik** dari babak Showcase akan melaju ke panggung Grand Final untuk memperebutkan gelar Juara ASTRO 2026!`,
    },
    {
      id: "agt-ketentuan",
      title: "Ketentuan Penampilan & Fasilitas",
      content: `- **Durasi Tampil**: Maksimal **5 menit**. Jika membawa properti tambahan (alat musik, kanvas, dll), waktu setup panggung dibatasi maksimal **2 menit**.
- **Kategori Bakat**: Bebas berekspresi (Bernyanyi, Dance/Tari, Teater/Monolog, Sulap, Melukis, dll) selama TIDAK mengandung unsur SARA, kekerasan, pornografi, politik praktis, maupun lirik terlarang (kata kasar/makian).
- **Fasilitas Panitia**: Panitia hanya menyediakan sound system, laptop operator, dan 2 unit mic wireless. Kebutuhan properti lainnya dibawa sendiri oleh peserta.
- **Audio/Video Pendukung**: Wajib diserahkan kepada panitia maksimal **H-7** sebelum hari penampilan.`,
    },
    {
      id: "agt-penilaian",
      title: "Sistem Penilaian",
      content: `Penilaian dewan juri didasarkan pada 4 kriteria utama:

- **Kreativitas & Orisinalitas**: **30%** (Keunikan konsep, keaslian karya, dan daya tarik pertunjukan)
- **Teknis & Kualitas Penampilan**: **30%** (Kemampuan vokal, ritme gerak, ketepatan nada, atau keterampilan teknis)
- **Penguasaan Panggung**: **25%** (Interaksi panggung, kepercayaan diri, blocking, dan ekspresi)
- **Kostum & Visual**: **15%** (Kerapian, kesesuaian tema penampilan, dan estetika visual)

⚠️ Catatan Penting: Keputusan dewan juri bersifat mutlak dan tidak dapat diganggu gugat.`,
    },
    {
      id: "agt-tatatertib",
      title: "Tata Tertib & Diskualifikasi",
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

  const cerdasCermatGuidebook = [
    {
      id: "cc-alur",
      title: "Alur & Teknis Perlombaan",
      content: `Perlombaan dilaksanakan secara luring (offline) dalam satu hari pada **29 November 2026** di Auditorium Kampus B STT-NF.

- **Materi Pertanyaan**: Nusantara, Pengetahuan Umum, dan Matematika.
- **Tahapan Perlombaan**:
1. **Babak 1 - Seleksi (Individu)**: Ujian seleksi mandiri untuk menyaring peserta terbaik.
2. **Babak 2 - Rebutan (Kelompok)**: Peserta yang lolos dikelompokkan (5 orang per kelompok) untuk sesi cepat tepat menggunakan bel.
3. **Babak 3 - Final (Individu)**: Peserta terbaik dari kelompok pemenang bertanding secara individu di babak grand final.`,
    },
    {
      id: "cc-penilaian",
      title: "Sistem Penilaian & Aturan Bel",
      content: `Aturan menjawab pada Babak Rebutan dan Babak Final:

- Hak menjawab diberikan kepada peserta/kelompok tercepat menekan bel.
- **Aturan Bel**: Bel hanya boleh ditekan SETELAH panitia selesai membacakan soal secara lengkap.
- Jika kelompok yang menekan bel memberikan jawaban yang salah, kesempatan menjawab akan dilempar ke kelompok lain.

Perhitungan Poin:
- Jawaban BENAR: **+100 poin**
- Jawaban SALAH: **-50 poin** (pengurangan nilai)`,
    },
    {
      id: "cc-syarat",
      title: "Syarat & Berkas Pendaftaran",
      content: `- Terbuka untuk seluruh Mahasiswa aktif STT Terpadu Nurul Fikri (Pendaftaran dilakukan secara individu).
- Wajib membaca dan menyetujui Guidebook resmi lomba.
- **Dokumen yang Wajib Disiapkan saat Pendaftaran**:
- Foto Kartu Tanda Mahasiswa (KTM) aktif
- Foto profil untuk publikasi
- Bukti tangkapan layar (screenshot) follow Instagram BEM STT-NF (@bemsttnf) dan ASTRO (@astrosttnf)
- Peserta wajib melakukan registrasi ulang di lokasi perlombaan pada hari H.`,
    },
    {
      id: "cc-tatatertib",
      title: "Tata Tertib & Sanksi Ketat",
      content: `⚠️ Pengumpulan Barang Elektronik:
Seluruh peserta WAJIB mengumpulkan seluruh barang elektronik (HP, smartphone, kalkulator, smartwatch/jam tangan digital) kepada panitia sebelum acara dimulai. Peserta yang ketahuan membawa atau menggunakan alat elektronik selama lomba berlangsung akan LANGSUNG DIDISKUALIFIKASI!

⚠️ Keterlambatan & Kedisiplinan:
- Peserta yang datang terlambat saat Babak 1 sudah dimulai akan langsung dinyatakan gugur/diskualifikasi.
- Dilarang keras melakukan kecurangan, provokasi antar peserta, atau bersikap pasif secara sengaja (terus berdiam diri hanya untuk mengamankan poin).`,
    },
  ];

  // 1. Update AGT
  await db
    .update(competitions)
    .set({
      title: "ASTRO Got Talent (AGT)",
      tagline: "Panggung Ekspresi dan Bakat Mahasiswa STT-NF",
      description:
        "Ajang unjuk kreativitas dan bakat terbesar mahasiswa STT Terpadu Nurul Fikri. Tampilkan aksi terbaikmu baik solo maupun kelompok di panggung megah ASTRO 2026!",
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
      isActive: "1",
    })
    .where(eq(competitions.id, "astro-got-talent"));
  console.log("✓ AGT updated successfully");

  // 2. Update Cerdas Cermat
  await db
    .update(competitions)
    .set({
      title: "Cerdas Cermat",
      tagline: "Uji Ketangkasan Nalar, Wawasan, dan Kecepatan Berpikir",
      description:
        "Kompetisi adu wawasan seputar Nusantara, Pengetahuan Umum, dan Matematika dengan sistem bel cepat tepat beregu dan individual.",
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
      guidebookSections: cerdasCermatGuidebook,
      isActive: "1",
    })
    .where(eq(competitions.id, "cerdas-cermat"));
  console.log("✓ Cerdas Cermat updated successfully");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
