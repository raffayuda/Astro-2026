import { z } from 'zod';

export const prizeSchema = z.object({
  label: z.string().min(1, 'Label hadiah wajib diisi'),
  value: z.string().min(1, 'Nilai hadiah wajib diisi'),
});

export const competitionBatchSchema = z.object({
  id: z.string().optional().default(() => crypto.randomUUID()),
  name: z.string().min(1, 'Nama batch wajib diisi'),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
  fee: z.number().int().min(0, 'Biaya batch tidak boleh negatif'),
});

export type CompetitionBatchInput = z.infer<typeof competitionBatchSchema>;

/** Body for creating/updating a competition (admin). */
export const competitionInputSchema = z.object({
  id: z.string().min(1, 'ID (slug) wajib diisi').optional(),
  title: z.string().min(1, 'Judul wajib diisi'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  tagline: z.string().optional().default(''),
  description: z.string().optional().default(''),
  fee: z.number().int().min(0, 'Biaya tidak boleh negatif').optional().default(0),
  hasBatches: z.boolean().optional().default(false),
  batches: z.array(competitionBatchSchema).optional().default([]),
  maxSlots: z.number().int().min(0, 'Kuota tidak boleh negatif').optional().default(0),
  filledSlots: z.number().int().min(0, 'Jumlah terisi tidak boleh negatif').optional().default(0),
  scheduleDate: z.string().datetime('Format tanggal tidak valid').optional().nullable(),
  location: z.string().optional().default(''),
  prizesFirst: z.string().optional().default(''),
  prizesSecond: z.string().optional().default(''),
  prizesThird: z.string().optional().default(''),
  prizes: z.array(prizeSchema).optional().default([]),
  rulesSummary: z.array(z.string()).optional().default([]),
  rulebookUrl: z.string().optional().default(''),
  contactName: z.string().optional().default(''),
  contactWhatsapp: z.string().optional().default(''),
  type: z.enum(['individual', 'team', 'both'], 'Tipe lomba tidak valid').optional().default('individual'),
  maxTeamMembers: z.number().int().min(1, 'Maksimal anggota tim minimal 1').optional().default(1),
  minTeamMembers: z.number().int().min(1, 'Minimal anggota tim minimal 1').optional().default(1),
  membersRequired: z.enum(['optional', 'required'], 'Pilihan anggota tidak valid').optional().default('optional'),
  playerPhotoRequired: z.boolean().optional().default(false),
  isFree: z.boolean().optional().default(false),
  origin: z.enum(['internal', 'external'], 'Asal lomba tidak valid').optional().default('internal'),
  certificateEnabled: z.boolean().optional().default(false),
  certificateType: z.enum(['winner', 'all'], 'Tipe sertifikat tidak valid').optional().default('winner'),
  certificateTemplate: z.string().nullable().optional().default(null),
  isActive: z.boolean().optional().default(true),
});

export type CompetitionInput = z.infer<typeof competitionInputSchema>;

/** Zod schema for the timeline item body (admin). */
export const timelineItemSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  title: z.string().min(1, 'Judul wajib diisi'),
  desc: z.string().min(1, 'Deskripsi wajib diisi'),
  sortOrder: z.number().int().optional(),
});

export type TimelineItem = z.infer<typeof timelineItemSchema>;
