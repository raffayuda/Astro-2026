import { z } from 'zod';
import { paginationSchema } from '@/src/server/helpers/pagination';

/** One player row — name plus (optionally required) photo. */
export const memberDetailSchema = z.object({
  name: z.string().min(1, 'Nama pemain wajib diisi'),
  photoUrl: z.string().nullable().optional().default(null),
});

export type MemberDetail = z.infer<typeof memberDetailSchema>;

/** Public POST body — anonymous registration (paymentAmount computed server-side). */
export const registrationCreateSchema = z.object({
  competitionId: z.string().min(1, 'Lomba wajib dipilih'),
  type: z.enum(['team', 'individual'], 'Tipe pendaftaran tidak valid'),
  fullName: z.string().nullable().optional(),
  identityNumber: z.string().nullable().optional(),
  teamName: z.string().nullable().optional(),
  leaderName: z.string().nullable().optional(),
  leaderIdentity: z.string().nullable().optional(),
  leaderPhotoUrl: z.string().nullable().optional(),
  members: z.string().nullable().optional(),
  memberDetails: z.array(memberDetailSchema).nullable().optional(),
  institution: z.string().min(1, 'Asal instansi wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  whatsapp: z.string().min(1, 'Nomor WhatsApp wajib diisi'),
  paymentMethod: z.string().nullable().optional(),
});

export type RegistrationCreate = z.infer<typeof registrationCreateSchema>;

/** GET list query — search/status/competitionId (renamed from lomba) + pagination. */
export const registrationListQuerySchema = paginationSchema.extend({
  search: z.string().optional().default(''),
  status: z.string().optional().default(''),
  competitionId: z.string().optional().default(''),
  userId: z.string().optional().default(''),
});

export type RegistrationListQuery = z.infer<typeof registrationListQuerySchema>;

/** Fields an anonymous participant may self-edit, pre-payment only. */
export const SELF_SERVICE_FIELDS = [
  'fullName',
  'identityNumber',
  'teamName',
  'leaderName',
  'leaderIdentity',
  'leaderPhotoUrl',
  'members',
  'memberDetails',
  'institution',
  'email',
  'whatsapp',
] as const;

/** Fields only an admin may edit. */
export const ADMIN_FIELDS = [
  'paymentStatus',
  'paymentMethod',
  'paymentAmount',
  'isWinner',
  'winnerRank',
  'certificates',
  'certificateSent',
] as const;
