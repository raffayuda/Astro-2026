import type { CompetitionBatch } from "@/src/db/schema";

/**
 * Mendapatkan batch pendaftaran yang sedang aktif berdasarkan waktu saat ini.
 */
export function getActiveBatch(
  batches: CompetitionBatch[] | null | undefined,
  now = new Date(),
): CompetitionBatch | null {
  if (!batches || !Array.isArray(batches) || batches.length === 0) return null;
  return (
    batches.find((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return now >= start && now <= end;
    }) || null
  );
}

/**
 * Menghitung biaya efektif dan informasi batch aktif untuk suatu lomba.
 */
export function getEffectiveCompetitionFee(
  competition: {
    fee: number;
    isFree?: boolean | string | null;
    hasBatches?: boolean | string | null;
    batches?: CompetitionBatch[] | null;
  },
  now = new Date(),
): {
  fee: number;
  batchName: string | null;
  isBatch: boolean;
  activeBatch: CompetitionBatch | null;
} {
  const isFree = competition.isFree === true || competition.isFree === "1";
  if (isFree) {
    return { fee: 0, batchName: null, isBatch: false, activeBatch: null };
  }

  const hasBatches = competition.hasBatches === true || competition.hasBatches === "1";
  if (hasBatches && competition.batches && competition.batches.length > 0) {
    const activeBatch = getActiveBatch(competition.batches, now);
    if (activeBatch) {
      return { fee: activeBatch.fee, batchName: activeBatch.name, isBatch: true, activeBatch };
    }
  }

  return { fee: competition.fee || 0, batchName: null, isBatch: false, activeBatch: null };
}

/**
 * Mem-parse string tanggal/waktu ke timestamp milidetik secara aman.
 * Mendukung:
 * - "YYYY-MM-DD" (dianggap berakhir di akhir hari 23:59:59 WIB / +07:00)
 * - "YYYY-MM-DDTHH:mm" (ditambahkan timezone +07:00 jika belum ada penanda zona)
 * - ISO string standar ("2026-12-05T23:59:59.000Z" atau offset "+07:00")
 */
export function parseDateToTimestamp(dateStr: string | Date | null | undefined): number | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) {
    const time = dateStr.getTime();
    return isNaN(time) ? null : time;
  }
  if (typeof dateStr !== "string") return null;

  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Format tanggal saja: "YYYY-MM-DD" -> set ke akhir hari 23:59:59 WIB (+07:00)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const endOfDay = new Date(`${trimmed}T23:59:59+07:00`);
    const time = endOfDay.getTime();
    return isNaN(time) ? null : time;
  }

  // Format datetime tanpa detik: "YYYY-MM-DDTHH:mm"
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    const withTz = new Date(`${trimmed}:59+07:00`);
    const time = withTz.getTime();
    if (!isNaN(time)) return time;
  }

  const d = new Date(trimmed);
  const time = d.getTime();
  return isNaN(time) ? null : time;
}

/**
 * Menghitung batas penutupan pendaftaran paling akhir dari seluruh lomba aktif secara dinamis.
 *
 * Memeriksa:
 * 1. Tanggal penutupan gelombang pendaftaran (batch.endDate) jika lomba memiliki batches.
 * 2. Tanggal pelaksanaan lomba (scheduleDate) jika lomba tidak memiliki batch terpisah.
 *
 * Mengambil timestamp terbesar (waktu paling akhir / paling lambat) dan mengembalikannya
 * dalam format ISO string. Jika tidak ada tanggal valid, fallback ke default fallbackDeadline.
 */
export function getLatestRegistrationDeadline(
  competitions: Array<{
    isActive?: boolean | string | null;
    hasBatches?: boolean | string | null;
    batches?: CompetitionBatch[] | null;
    scheduleDate?: string | Date | null;
  }>,
  fallbackDeadline = "2026-09-20T23:59:59+07:00",
): string {
  let latestTimestamp = 0;

  for (const comp of competitions) {
    // Abaikan lomba yang dinonaktifkan
    if (comp.isActive === false || comp.isActive === "0") continue;

    const hasBatches = comp.hasBatches === true || comp.hasBatches === "1";
    const batches = comp.batches;

    // Prioritas 1: Ambil dari gelombang pendaftaran (batches)
    if (hasBatches && batches && batches.length > 0) {
      for (const batch of batches) {
        if (batch.endDate) {
          const time = parseDateToTimestamp(batch.endDate);
          if (time !== null && time > latestTimestamp) {
            latestTimestamp = time;
          }
        }
      }
    } else if (comp.scheduleDate) {
      // Prioritas 2: Jika tidak menggunakan batch, gunakan jadwal pelaksanaan lomba
      const time = parseDateToTimestamp(comp.scheduleDate);
      if (time !== null && time > latestTimestamp) {
        latestTimestamp = time;
      }
    }
  }

  return latestTimestamp > 0 ? new Date(latestTimestamp).toISOString() : fallbackDeadline;
}
