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

export const guidebookSectionSchema = z.object({
  id: z.string().optional().default(() => crypto.randomUUID()),
  title: z.string().min(1, 'Judul bagian wajib diisi'),
  content: z.string().default(''),
});

export type GuidebookSectionInput = z.infer<typeof guidebookSectionSchema>;

export const competitionCustomFieldSchema = z.object({
  id: z.string().min(1, 'ID field wajib diisi'),
  label: z.string().min(1, 'Label field wajib diisi'),
  type: z.enum(['text', 'textarea', 'select', 'image']),
  placeholder: z.string().optional().default(''),
  options: z.array(z.string()).optional().default([]),
  required: z.boolean().optional().default(false),
  description: z.string().optional().default(''),
});

export type CompetitionCustomFieldInput = z.infer<typeof competitionCustomFieldSchema>;

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
  guidebookSections: z.array(guidebookSectionSchema).optional().default([]),
  customFields: z.array(competitionCustomFieldSchema).optional().default([]),
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

/**
 * Body for updating a competition (admin).
 * Crucially has ZERO defaults so that partial updates (e.g. toggling isActive)
 * never overwrite omitted fields with empty strings, 0s, or empty arrays.
 */
export const competitionUpdateSchema = z.object({
  id: z.string().min(1, 'ID (slug) wajib diisi').optional(),
  title: z.string().min(1, 'Judul wajib diisi').optional(),
  category: z.string().min(1, 'Kategori wajib diisi').optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  fee: z.number().int().min(0, 'Biaya tidak boleh negatif').optional(),
  hasBatches: z.boolean().optional(),
  batches: z.array(competitionBatchSchema).optional(),
  guidebookSections: z.array(guidebookSectionSchema).optional(),
  customFields: z.array(competitionCustomFieldSchema).optional(),
  maxSlots: z.number().int().min(0, 'Kuota tidak boleh negatif').optional(),
  filledSlots: z.number().int().min(0, 'Jumlah terisi tidak boleh negatif').optional(),
  scheduleDate: z.string().datetime('Format tanggal tidak valid').optional().nullable(),
  location: z.string().optional(),
  prizesFirst: z.string().optional(),
  prizesSecond: z.string().optional(),
  prizesThird: z.string().optional(),
  prizes: z.array(prizeSchema).optional(),
  rulesSummary: z.array(z.string()).optional(),
  rulebookUrl: z.string().optional(),
  contactName: z.string().optional(),
  contactWhatsapp: z.string().optional(),
  type: z.enum(['individual', 'team', 'both'], 'Tipe lomba tidak valid').optional(),
  maxTeamMembers: z.number().int().min(1, 'Maksimal anggota tim minimal 1').optional(),
  minTeamMembers: z.number().int().min(1, 'Minimal anggota tim minimal 1').optional(),
  membersRequired: z.enum(['optional', 'required'], 'Pilihan anggota tidak valid').optional(),
  playerPhotoRequired: z.boolean().optional(),
  isFree: z.boolean().optional(),
  origin: z.enum(['internal', 'external'], 'Asal lomba tidak valid').optional(),
  certificateEnabled: z.boolean().optional(),
  certificateType: z.enum(['winner', 'all'], 'Tipe sertifikat tidak valid').optional(),
  certificateTemplate: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CompetitionUpdateInput = z.infer<typeof competitionUpdateSchema>;

/** Zod schema for the timeline item body (admin). */
export const timelineItemSchema = z.object({
  date: z.string().min(1, 'Tanggal wajib diisi'),
  title: z.string().min(1, 'Judul wajib diisi'),
  desc: z.string().min(1, 'Deskripsi wajib diisi'),
  sortOrder: z.number().int().optional(),
});

export type TimelineItem = z.infer<typeof timelineItemSchema>;
