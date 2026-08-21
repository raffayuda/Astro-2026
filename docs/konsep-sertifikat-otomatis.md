# Konsep Sistem Sertifikat Otomatis — ASTRO 2026

Berdasarkan analisis graphify (graphify-out/GRAPH_REPORT.md) dan kode sumber yang ada.

---

## Ringkasan Eksekutif

Sistem sertifikat saat ini masih **manual** — admin harus mengunggah file sertifikat **per peserta** satu per satu di `WinnerManager` / `SertifikatPage`. Konsep ini mengganti alur manual tersebut dengan **template berbasis generate otomatis**, di mana admin hanya perlu:

1. Upload **satu gambar template hasil Canva** untuk masing-masing peringkat (Juara 1, 2, 3) + atur posisi teks overlay
2. Sistem akan **generate PDF otomatis** dari gambar template + data pemenang

User peserta dapat mengklik **"Cetak Sertifikat"** di modal pengumuman (`WinnersModal`), dan sistem akan **generate sertifikatnya + anggota timnya** secara langsung.

---

## 1. Kondisi Saat Ini (Existing State)

### 1.1 Database Schema (dari `src/db/schema/index.ts`)
Kolom yang relevan sudah ada tetapi belum optimal dimanfaatkan:

| Tabel | Kolom | Tipe | Deskripsi |
|-------|-------|------|-----------|
| `competitions` | `certificate_enabled` | text '0'/'1' | Aktif/nonaktif sertifikat |
| `competitions` | `certificate_type` | text 'winner'\|'all' | 'winner' = juara saja, 'all' = semua peserta |
| `competitions` | `certificate_template` | text (nullable) | **Belum dipakai** — hanya kolom tunggal URL |
| `registrations` | `certificates` | jsonb `[{name, url}]` | URL sertifikat yang diupload manual |
| `registrations` | `is_winner` | text '0'/'1' | Flag juara |
| `registrations` | `winner_rank` | text '1'\|'2'\|'3' | Peringkat juara |
| `registrations` | `certificate_sent` | text '0'/'1' | Apakah sertifikat sudah dikirim via email |
| `registrations` | `members` | text | Daftar anggota tim (newline-separated, untuk team) |

### 1.2 Backend API (dari graphify: Community 14, 17, 31)

**`certificatesModule`** (`src/server/modules/certificates/index.ts`):
- `POST /api/certificates/send` — admin only; kirim link download sertifikat via email Resend.

**`registrationsModule`** (`src/server/modules/registrations/index.ts` + `service.ts`):
- `GET /api/registrations/winners?competitionId=` — public; kembalikan `winners` (juara) + `certHolders` (yang punya sertifikat).
- `PATCH /api/registrations/{id}` — admin bisa update `certificates`, `isWinner`, `winnerRank`, `certificateSent`.

**`uploadModule`** (`src/server/modules/upload/index.ts`):
- `POST /api/upload` — admin only; upload file ke Supabase Storage (PNG/JPG/WEBP/GIF/PDF, max 10MB).

**`competitionsModule`** (`src/server/modules/competitions/index.ts`):
- CRUD lengkap kompetisi termasuk `certificateEnabled`, `certificateType`, `certificateTemplate`.

### 1.3 Frontend (dari graphify: Community 1, 19, 31)

**`SertifikatPage`** (`app/dashboard/certificates/page.tsx`):
- Halaman admin: pilih lomba → lihat daftar peserta lunas → tandai juara 1/2/3 → upload sertifikat manual per peserta → klik "Kirim" sertifikat via email.

**`WinnerManager`** (`components/WinnerManager.tsx`):
- Komponen dipanggil di dashboard kompetisi (`app/dashboard/competitions/page.tsx`).
- Toggle juara 1/2/3 (draft mode), bulk save, upload sertifikat per peserta, delete sertifikat, kirim sertifikat.

**`WinnersModal`** (`app/announcements/WinnersModal.tsx`):
- Modal pengumuman pemenang (di halaman `PengumumanClient`).
- Menampilkan podium juara 1/2/3 + tombol **"Dapatkan Sertifikat"** yang membuka sub-modal `CertModal`.
- `CertModal` hanya menampilkan **link download sertifikat yang sudah diupload** — belum ada tombol generate.

---

## 2. Konsep Baru: Sertifikat Otomatis (Template-Based)

### 2.1 Prinsip Dasar

| Aspek | Konsep Baru |
|-------|-------------|
| **Template** | Admin upload **gambar template hasil desain Canva** per peringkat (Juara 1, 2, 3) — bukan HTML editor |
| **Text Overlay** | Admin atur **posisi (X, Y)** dan styling teks overlay di UI; sistem replace placeholder-value di atas gambar |
| **Generate** | Sistem render: gambar template + text overlay → PDF |
| **Trigger** | Dua trigger: admin "Generate Semua" atau user "Cetak Sertifikat" |
| **Team Support** | Untuk tim, generate sertifikat terpisah untuk **setiap anggota tim** |

### 2.2 Placeholder System

Saat generate, nilai-nilai berikut **di-overlay ke gambar template** di posisi yang ditentukan admin:

```
{{participantName}}   →  Nama juara / ketua tim
{{rank}}              →  "Juara 1" / "Juara 2" / "Juara 3"
{{competitionTitle}}  →  Nama lomba
{{category}}          →  "Akademik" / "Olahraga" / "Esports"
{{institution}}       →  Asal instansi
{{teamName}}          →  Nama tim (jika tim)
{{teamMembers}}       →  Daftar anggota tim (jika tim)
{{date}}              →  Tanggal pembuatan sertifikat
{{competitionTagline}}→  Tagline lomba
{{competitionType}}   →  "Individu" / "Tim"
```

Setiap placeholder dikaitkan dengan sebuah **"text overlay field"** yang punya:
- `field` — nama placeholder (mis. `participantName`)
- `x`, `y` — posisi piksel dari kiri/atas (relatif terhadap gambar template)
- `fontSize` — ukuran font (default 16)
- `fontFamily` — font (default "Helvetica" / system font)
- `color` — warna hex (default "#000000")
- `align` — "left" | "center" | "right"
- `maxWidth` — lebar maksimum teks sebelum wrap (opsional)

### 2.3 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN WORKFLOW                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Buka halaman Kompetisi → Edit Lomba                         │
│  2. Aktifkan "Sertifikat" + pilih "certificate_type"           │
│  3. Buka tab "Template Sertifikat"                             │
│     a. Upload template HTML untuk Juara 1                      │
│     b. Upload template HTML untuk Juara 2                      │
│     c. Upload template HTML untuk Juara 3                      │
│  4. Buka WinnerManager → tandai juara 1/2/3                     │
│  5. Klik "Generate Otomatis"                                    │
│     → Sistem generate PDF per juara + team members             │
│     → Upload ke Supabase Storage                               │
│     → Simpan URL di registrations.certificates                 │
│     → Kirim email ke peserta                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    USER WORKFLOW (Pengumuman)                   │
├─────────────────────────────────────────────────────────────────┤
│  1. Buka halaman Pengumuman                                     │
│  2. Klik "Lihat Juara" pada lomba yang relevan                  │
│  3. Di WinnersModal → klik "Cetak Sertifikat"                   │
│     → Sistem generate PDF on-demand dari template              │
│     → Untuk team: generate + download semua anggota tim        │
│     → User dapat link download langsung                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Perubahan yang Diperlukan

### 3.1 Database Schema

#### Tabel baru: `certificate_templates`

```sql
CREATE TABLE certificate_templates (
  id              SERIAL PRIMARY KEY,
  competition_id  TEXT  REFERENCES competitions(id) ON DELETE CASCADE,
  rank          TEXT  NOT NULL,  -- '1' | '2' | '3' | 'participant'
  template_image_url  TEXT NOT NULL,  -- URL gambar template dari Canva (Supabase)
  text_overlays       JSONB NOT NULL,  -- Array { field, x, y, fontSize, fontFamily, color, align, maxWidth }
  is_active       TEXT  DEFAULT '1',
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  UNIQUE(competition_id, rank)
);
```

`text_overlays` JSONB contoh:
```json
[
  { "field": "participantName", "x": 400, "y": 350, "fontSize": 24, "color": "#0f172a", "align": "center", "maxWidth": 300 },
  { "field": "rank", "x": 680, "y": 420, "fontSize": 18, "color": "#d97706", "align": "center" },
  { "field": "date", "x": 500, "y": 560, "fontSize": 12, "color": "#64748b", "align": "center" }
]
```

Keuntungan dengan tabel terpisah:
- Bisa menyimpan **3 template berbeda** (juara 1/2/3) plus template untuk semua peserta
- Setiap template = 1 gambar + konfigurasi posisi teks overlay
- Bisa versioning (update template, generate ulang)
- Kolom `competitions.certificate_template` (text) yang sudah ada **bisa dihapus** atau diperlakukan sebagai URL template fallback lama — rekomendasi: migrasi ke tabel baru, hapus kolom lama di migration berikutnya.

#### Kolom tambahan di `registrations`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `certificate_generated_at` | timestamp nullable | Kapan sertifikat generate otomatis |
| `certificate_template_version` | integer nullable | Versi template yang dipakai (untuk regenerasi) |

> Kolom `certificates` (jsonb) tetap dipakai — sekarang diisi oleh sistem generate otomatis bukan upload manual.

### 3.2 Backend — Service & API Baru

#### Module baru: `src/server/modules/certificate-templates/`

**`GET /api/certificate-templates?competitionId=xxx`** (admin)
- List semua template (juara 1/2/3/peserta) untuk sebuah kompetisi.

**`POST /api/certificate-templates`** (admin)
- Create/update template: `{ competitionId, rank, templateImageUrl, textOverlays }`

**`DELETE /api/certificate-templates/{id}`** (admin)
- Hapus template.

#### Module baru di `certificatesModule`:

**`POST /api/certificates/generate`** (admin)
```ts
// Generate semua sertifikat untuk semua pemenang
{
  competitionId: string,
  ranks?: string[]  // default ['1','2','3']; boleh kosong = semua
}
```
- Ambil semua pemenang (juara 1/2/3) yang paymentStatus 'paid'.
- Untuk tim: parse `members` field, generate sertifikat per anggota.
- Render gambar template + text overlay → PDF.
- Upload PDF ke Supabase Storage.
- Update `registrations.certificates` dengan `{ name: "Sertifikat Juara X", url: "..." }`.
- Set `certificateSent: '1'`.
- Kirim email ke ketua tim.
- Return summary: `{ generated: N, skipped: M, errors: [...] }`.

**`POST /api/certificates/generate-single`** (public — but only for the user's own registration)
```ts
// Generate on-demand untuk satu pemenang (user-side)
{
  competitionId: string,
  registrationId: string  // atau email + competitionId untuk verifikasi
}
```
- Verifikasi bahwa registration itu memang juara (isWinner='1' && paymentStatus='paid').
- Render gambar template + text overlay → PDF, upload ke Supabase.
- Update `registrations.certificates`, kembalikan URL.
- User bisa langsung download dari modal.

> **Security note:** generate-single harus verifikasi bahwa request ini dari pemenang yang bersangkutan (cek email session atau token).

#### Service generate (`src/server/modules/certificates/service.ts`)

```ts
async function generateCertificatePdf(
  templateImageUrl: string,
  textOverlays: TextOverlayField[],
  values: Record<string, string>
): Promise<Buffer> {
  // 1. Download gambar template (PNG/JPG) dari Supabase
  // 2. Render text overlay di atas gambar:
  //    - Pilihan A: node-canvas (drawImage + fillText) → PNG → pdf-lib
  //    - Pilihan B: pdf-lib langsung (embedImage + drawText)
  // 3. Kembalikan PDF buffer
}
```

**Rendering engine rekomendasi:**
- **`pdf-lib`** — embed gambar ke PDF halaman, drawText di overlay. Ringan, pure JS, tidak butuh native deps. Cocia untuk gambar Canva.
- **`node-canvas`** (canvas) — compositing gambar + teks di canvas, render ke PNG, lalu bungkus di PDF pakai pdf-lib. Fleksibel untuk text wrapping & styling, tapi butuh native deps (cairo).

Rekomendasi: **`pdf-lib`** sebagai backend utama — karena ini gambar template statis hasil Canva, kita hanya butuh embed gambar + draw text di posisi tetap. Ringan dan reliable.

### 3.4 Frontend — Template Management

#### Lokasi: Integrasi di `app/dashboard/competitions/page.tsx`

Setiap kartu kompetisi yang sudah di-expand (WinnerManager terbuka) mendapatkan tambahan tab/section:

```
┌──────────────────────────────────────────┐
│ [Timeline] [Juara & Sertifikat] [Template] │
└──────────────────────────────────────────┘
```

**Tab "Template Sertifikat"** berisi:
- Toggle "Aktifkan Sertifikat"
- Radio: `certificate_type` = "Juara saja" atau "Semua peserta"
- **Template Juara 1**: upload gambar PNG/JPG hasil Canva + daftar text overlay field
- **Template Juara 2**: sama
- **Template Juara 3**: sama
- **Template Peserta** (hanya muncul jika certificate_type='all')
- Tombol "Simpan Template"
- Preview: render gambar + overlay teks dummy di modal

#### UI Mock — Upload Gambar Template:
```
┌────────────────────────────────────────────────────────┐
│ Juara 1                     [Simpan] [Preview]          │
├────────────────────────────────────────────────────────┤
│ [Upload PNG]  /  URL: /assets/certs/template-rank1.png  │
│                                                        │
│ Text Overlay Fields:                                   │
│ + [participantName]  X:400 Y:350  Size:24  Color:#0f172a│
│ + [rank]             X:680 Y:420  Size:18  Color:#d97706│
│ + [competitionTitle] X:400 Y:300  Size:20  Color:#0f172a│
│ + [date]             X:500 Y:560  Size:12  Color:#64748b│
│ + [institution]      X:400 Y:470  Size:14  Color:#475569│
└────────────────────────────────────────────────────────┘
```

#### UI — Overlay Position Picker
- Gambar template ditampilkan full-preview di modal.
- Admin klik pada posisi X,Y langsung di gambar (klik koordinat) untuk set posisi field.
- Atau input manual angka X/Y.
- Dropdown pilih field: `participantName`, `rank`, `competitionTitle`, `institution`, `teamName`, `teamMembers`, `date`, `competitionTagline`, `competitionType`.
- Input fontSize, color picker, alignment.

### 3.5 Frontend — Button "Cetak Sertifikat" di WinnersModal

#### Perubahan di `app/announcements/WinnersModal.tsx`

Setiap kartu pemenang mendapatkan tombol tambahan:

```tsx
// Di dalam podium card atau daftar pemenang:
<Button onClick={() => handlePrintCertificate(winner.id)}>
  <Download /> Cetak Sertifikat
</Button>
```

**Flow:**
1. User klik "Cetak Sertifikat" pada juara tertentu.
2. Sistem panggil `POST /api/certificates/generate-single`.
3. Tunggu loading → dapatkan URL PDF.
4. Buka modal download (mirip sekarang tapi URL di-generate on-demand) **atau** langsung trigger download.
5. Untuk tim: tampilkan 2 tombol — "Unduh Ketua" dan "Unduh Semua Anggota" (zip).

> Jika template belum ada: tampilkan pesan "Sertifikat belum tersedia, silakan cek kembali nanti."
> Jika sudah pernah digenerate: cukup arahkan ke URL yang sudah ada di `registrations.certificates`.

### 3.6 Frontend — Admin Dashboard (SertifikatPage)

#### Perubahan di `app/dashboard/certificates/page.tsx`

Setelah memilih kompetisi:
- Tab baru: **"Auto Generate"** di samping view manual lama.
- Di tab ini:
  - Preview template yang sudah disetting
  - Tombol **"Generate Otomatis untuk Semua Juara"**:
    - Loading spinner
    - Setelah selesai: toast "✅ 12 sertifikat berhasil digenerate"
  - Checklist: generate untuk Juara 1 saja / Juara 2 saja / Juara 3 saja
  - Toggle "Kirim ke email otomatis"

---

## 4. Data Flow Detail

### 4.1 Admin: Setup Template + Generate

```
Admin buka /dashboard/competitions
  → Pilih kompetisi
  → Buka WinnerManager tab
  → Buka sub-tab "Template Sertifikat"
  → Upload gambar PNG/JPG hasil Canva untuk rank 1/2/3
  → Atur text overlay positions (participantName, rank, date, dll)
  → Klik "Simpan Template" → POST /api/certificate-templates

Admin klik "Generate Otomatis"
  → POST /api/certificates/generate { competitionId }
  → Backend:
      1. Query semua registrations WHERE competitionId AND isWinner='1' AND paymentStatus='paid'
      2. Untuk tiap registration:
         a. Cari template berdasarkan winnerRank
         b. Parse members (jika team) — generate 1 PDF per anggota tim
         c. Render gambar template + text overlay → PDF (pakai pdf-lib)
         d. Upload PDF ke Supabase Storage
         e. Update registrations.certificates += {name, url}
      3. Set certificateSent='1'
      4. Kirim email ke ketua
  → Frontend: invalidate query, update UI
```

### 4.2 User: Cetak Sertifikat di Pengumuman

```
User buka /announcements
  → Klik "Lihat Juara" pada sebuah lomba
  → WinnersModal terbuka
  → Klik "Cetak Sertifikat" pada juara tertentu
  → POST /api/certificates/generate-single { competitionId, registrationId }
  → Backend:
      1. Verifikasi registration.id memang juara & lunas
      2. Cari template berdasarkan winnerRank
      3. Render gambar template + text overlay → PDF (pakai pdf-lib)
      4. Upload ke Supabase
      5. Update registrations.certificates += {name, url}
      6. Kembalikan { url, name }
  → Frontend: buka CertModal atau langsung trigger download
```

---

## 5. Keamanan & Edge Cases

| Kasus | Penanganan |
|-------|-----------|
| Template gambar belum diupload | API return 400, tombol "Cetak" disabled di frontend |
| Text overlay belum dikonfigurasi | Warning di frontend, generate tetap jalan dengan nilai default |
| User klik generate tapi bukan juara | Backend reject 403 |
| User tim klik cetak | Generate untuk ketua + semua anggota, download zip atau link individual |
| pdf-lib render gagal | Retry 1x, log error, fallback ke error message |
| Template sudah pernah digenerate | Return URL existing, jangan generate ulang (cache) |
| Competition belum punya template | Sembunyikan tombol "Cetak Sertifikat" |
| File PDF terlalu besar | Validasi ukuran di service, max 5MB per PDF |

---

## 6. Ringkasan Perubahan Kode (Implementation Checklist)

1. **DB Migration**: buat tabel `certificate_templates`, tambah kolom `certificate_generated_at` + `certificate_template_version` di `registrations`.
2. **New Module**: `src/server/modules/certificate-templates/index.ts` (CRUD template — gambar URL + text overlays).
3. **New Module**: `src/server/modules/certificates/service.ts` — tambahkan service `generateCertificatePdf()`.
   - Install `pdf-lib` (render gambar template + text overlay → PDF, pure JS, ringan).
   - Alternatif jika perlu styling teks kompleks: `node-canvas` + `pdf-lib`.
4. **`certificatesModule`**: tambahkan endpoint `POST /generate` (admin) + `POST /generate-single` (public).
5. **API Helpers**: tambahkan `apiHelpers.certificateTemplates.*` + `apiHelpers.certificates.generate`.
6. **React Query hooks**: `useCertificateTemplates`, `useCertificateGenerate`.
7. **Frontend — `WinnerManager`**: tambahkan tab "Template Sertifikat" (upload gambar Canva + atur overlay posisi) + tombol "Generate Otomatis".
8. **Frontend — `WinnersModal`**: ganti tombol "Dapatkan Sertifikat" jadi "Cetak Sertifikat" (generate on-demand); jika sudah ada sertifikat, tetap gunakan URL existing.
9. **Frontend — `SertifikatPage`**: tambahkan tab/mode "Auto Generate" di samping view manual lama.
10. **`graphify update .`**: jalankan setelah semua migration & kode selesai untuk update knowledge graph.

---

## 7. Alternatif Library Rendering

Karena template berupa **gambar** (bukan HTML), opsi rendering berubah:

| Pendekatan | Pros | Cons |
|-----------|------|------|
| `pdf-lib` (rekomendasi) | Pure JS, ringan, embed gambar + drawText langsung ke PDF | Font terbatas (harus register), text wrapping manual |
| `node-canvas` + `pdf-lib` | Text rendering fleksibel (font, warna, wrapping), compositing gambar+teks di canvas | Butuh native deps (cairo, pango) — ribet di Windows/Vercel |
| `puppeteer` | CSS penuh, font Google Fonts, text wrapping otomatis | Berat (~300MB Chrome), overkill untuk gambar statis |
| `sharp` + `pdfkit` | Ringan untuk image processing | sharp tidak punya text rendering; butuh canvas lagi |

**Rekomendasi utama: `pdf-lib`** — karena gambar template sudah jadi desain Canva yang lengkap, kita hanya perlu embed ke PDF + draw teks overlay di posisi tetap. Pure JS, support semua platform, perfect untuk workflow ini.

**`node-canvas`** sebagai fallback jika butuh text wrapping yang fleksibel atau rendering ke PNG dulu sebelum PDF.
