import { z } from 'zod';
import type { TextOverlayField } from '@/src/db/schema';

/** Field rank: 1=Juara 1, 2=Juara 2, 3=Juara 3, 'participant'=semua peserta. */
export const certificateRankSchema = z.enum(['1', '2', '3', 'participant']);
export type CertificateRank = z.infer<typeof certificateRankSchema>;

export const textOverlaySchema = z.object({
  field: z.string().min(1, 'Field wajib diisi'),
  x: z.number().int().min(0, 'X tidak boleh negatif'),
  y: z.number().int().min(0, 'Y tidak boleh negatif'),
  fontSize: z.number().int().min(1).optional(),
  fontFamily: z.string().optional(),
  color: z.string().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  maxWidth: z.number().int().min(0).optional(),
});

export const certificateTemplateSchema = z.object({
  competitionId: z.string().min(1, 'ID lomba wajib diisi'),
  rank: certificateRankSchema,
  templateImageUrl: z.string().url('URL template tidak valid'),
  textOverlays: z.array(textOverlaySchema).default([]),
  isActive: z.boolean().optional().default(true),
});

export type CertificateTemplateInput = z.infer<typeof certificateTemplateSchema>;
export type { TextOverlayField };
