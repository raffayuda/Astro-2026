import { z } from 'zod';

/** One player on a team roster — name plus photo (formal or casual, both fine). */
export const memberDetailSchema = z.object({
  name: z.string(),
  photoUrl: z.string(),
});

export type MemberDetail = z.infer<typeof memberDetailSchema>;

/** Individual-registration personal fields (also used for PATCH self-service). */
export const registrationFormSchema = z.object({
  fullName: z.string().optional(),
  identityNumber: z.string().optional(),
  teamName: z.string().optional(),
  leaderName: z.string().optional(),
  leaderIdentity: z.string().optional(),
  leaderPhotoUrl: z.string().optional(),
  members: z.string().optional(),
  memberDetails: z.array(memberDetailSchema).optional(),
  institution: z.string().min(1, 'Nama sekolah/instansi wajib diisi'),
  email: z.email('Format email tidak valid'),
  whatsapp: z
    .string()
    .min(9, 'Nomor WhatsApp tidak valid (minimal 9 digit)'),
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

/**
 * Schema for one competition. When the competition requires a player photo
 * (esports, e.g. Mobile Legends) every listed player needs both a name and an
 * uploaded photo — a name alone is not enough.
 */
export function buildRegistrationSchema(opts: {
  isTeam: boolean;
  photoRequired: boolean;
  /** Roster rows that must be filled, excluding the leader. */
  requiredMembers?: number;
}) {
  if (!opts.photoRequired) return registrationFormSchema;

  const minMembers = Math.max(opts.requiredMembers ?? 0, 0);

  return registrationFormSchema.superRefine((values, ctx) => {
    if (!values.leaderPhotoUrl) {
      ctx.addIssue({
        code: 'custom',
        path: ['leaderPhotoUrl'],
        message: opts.isTeam
          ? 'Foto ketua tim wajib diunggah'
          : 'Foto pemain wajib diunggah',
      });
    }

    if (!opts.isTeam) return;

    const players = (values.memberDetails ?? []).filter((m) => m.name.trim());
    if (players.length < minMembers) {
      ctx.addIssue({
        code: 'custom',
        path: ['memberDetails'],
        message: `Minimal ${minMembers} anggota (selain ketua) wajib diisi`,
      });
    }
    (values.memberDetails ?? []).forEach((m, i) => {
      if (m.name.trim() && !m.photoUrl) {
        ctx.addIssue({
          code: 'custom',
          path: ['memberDetails', i, 'photoUrl'],
          message: 'Foto pemain wajib diunggah',
        });
      }
      if (!m.name.trim() && m.photoUrl) {
        ctx.addIssue({
          code: 'custom',
          path: ['memberDetails', i, 'name'],
          message: 'Nama pemain wajib diisi',
        });
      }
    });
  });
}

/** Build the registration request body for a given competition type. */
export function toRegistrationBody(
  values: RegistrationFormValues,
  competitionId: string,
  type: 'team' | 'individual',
) {
  const roster = (values.memberDetails ?? [])
    .filter((m) => m.name.trim())
    .map((m) => ({ name: m.name.trim(), photoUrl: m.photoUrl || null }));

  return {
    competitionId,
    type,
    fullName: values.fullName || null,
    identityNumber: values.identityNumber || null,
    teamName: values.teamName || null,
    leaderName: values.leaderName || null,
    leaderIdentity: values.leaderIdentity || null,
    leaderPhotoUrl: values.leaderPhotoUrl || null,
    members: roster.length > 0 ? roster.map((m) => m.name).join('\n') : values.members || null,
    memberDetails: roster,
    institution: values.institution,
    email: values.email,
    whatsapp: values.whatsapp,
  };
}

/** Body for the self-service PATCH (no competition/type switch involved). */
export function toSelfServiceBody(values: RegistrationFormValues) {
  const { competitionId: _c, type: _t, ...rest } = toRegistrationBody(
    values,
    '',
    'individual',
  );
  return rest;
}
