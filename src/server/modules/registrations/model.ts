import { z } from 'zod';
import { paginationSchema } from '@/src/server/helpers/pagination';
import { isSafeUrl } from '@/lib/urls';

/**
 * Uploaded-file fields are rendered as `href` targets in the admin views, so
 * only http(s) URLs and root-relative paths are accepted. Blocks a registrant
 * from storing a `javascript:` or `data:` URI.
 */
const uploadedUrlSchema = z
  .string()
  .refine((value) => value === '' || isSafeUrl(value), {
    message: 'URL berkas tidak valid',
  });

/** One player row — name plus (optionally required) in-game ID and photo. */
export const memberDetailSchema = z.object({
  name: z.string().min(1, 'Nama pemain wajib diisi'),
  gameId: z.string().nullable().optional().default(null),
  photoUrl: uploadedUrlSchema.nullable().optional().default(null),
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
  leaderGameId: z.string().nullable().optional(),
  leaderPhotoUrl: uploadedUrlSchema.nullable().optional(),
  members: z.string().nullable().optional(),
  memberDetails: z.array(memberDetailSchema).nullable().optional(),
  institution: z.string().min(1, 'Asal instansi wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  whatsapp: z.string().min(1, 'Nomor WhatsApp wajib diisi'),
  paymentMethod: z.string().nullable().optional(),
  customFields: z
    .record(
      z.string(),
      // Image custom fields hold an uploaded URL that also becomes an `href`.
      z.string().refine((value) => !/^\s*(javascript|data|vbscript):/i.test(value), {
        message: 'Nilai field tidak valid',
      }),
    )
    .nullable()
    .optional()
    .default({}),
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

/** Public check registration body. */
export const registrationCheckSchema = z.object({
  query: z.string().min(2, 'Kata kunci pencarian minimal 2 karakter'),
});

export type RegistrationCheckInput = z.infer<typeof registrationCheckSchema>;

/** Fields an anonymous participant may self-edit, pre-payment only. */
export const SELF_SERVICE_FIELDS = [
  'fullName',
  'identityNumber',
  'teamName',
  'leaderName',
  'leaderIdentity',
  'leaderGameId',
  'leaderPhotoUrl',
  'members',
  'memberDetails',
  'institution',
  'email',
  'whatsapp',
  'customFields',
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
