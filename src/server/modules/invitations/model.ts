import { z } from 'zod';

export const invitationCreateSchema = z.object({
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')).nullable(),
  role: z.enum(['admin', 'participant'], 'Role tidak valid').default('admin'),
  expiresInHours: z.number().int().min(1).max(720).default(168), // default 7 days (168 hours)
  sendEmail: z.boolean().optional().default(false),
});

export type InvitationCreate = z.infer<typeof invitationCreateSchema>;

export const invitationAcceptSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  email: z.string().email('Format email tidak valid').optional().nullable(),
});

export type InvitationAccept = z.infer<typeof invitationAcceptSchema>;
