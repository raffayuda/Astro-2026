import type { CompetitionBatch } from '@/src/db/schema';

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
  const isFree = competition.isFree === true || competition.isFree === '1';
  if (isFree) {
    return { fee: 0, batchName: null, isBatch: false, activeBatch: null };
  }

  const hasBatches = competition.hasBatches === true || competition.hasBatches === '1';
  if (hasBatches && competition.batches && competition.batches.length > 0) {
    const activeBatch = getActiveBatch(competition.batches, now);
    if (activeBatch) {
      return { fee: activeBatch.fee, batchName: activeBatch.name, isBatch: true, activeBatch };
    }
  }

  return { fee: competition.fee || 0, batchName: null, isBatch: false, activeBatch: null };
}
