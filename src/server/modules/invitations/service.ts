import { db } from '@/src/db';
import { userInvitations, users } from '@/src/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { Resend } from 'resend';
import crypto from 'node:crypto';
import { auth } from '@/src/server/auth';
import { headers } from 'next/headers';
import type { InvitationCreate, InvitationAccept } from './model';

const resend = new Resend(process.env.RESEND_API_KEY);

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    'https://astro.nurulfikri.ac.id'
  ).replace(/\/+$/, '');
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export function computeInvitationStatus(invitation: {
  revokedAt: Date | null;
  usedAt: Date | null;
  expiresAt: Date;
}): InvitationStatus {
  if (invitation.revokedAt) return 'revoked';
  if (invitation.usedAt) return 'accepted';
  if (new Date() > new Date(invitation.expiresAt)) return 'expired';
  return 'pending';
}

export async function listInvitations() {
  const rows = await db
    .select({
      id: userInvitations.id,
      token: userInvitations.token,
      email: userInvitations.email,
      role: userInvitations.role,
      invitedById: userInvitations.invitedById,
      invitedByName: users.name,
      invitedByEmail: users.email,
      expiresAt: userInvitations.expiresAt,
      usedAt: userInvitations.usedAt,
      usedById: userInvitations.usedById,
      revokedAt: userInvitations.revokedAt,
      createdAt: userInvitations.createdAt,
    })
    .from(userInvitations)
    .leftJoin(users, eq(userInvitations.invitedById, users.id))
    .orderBy(desc(userInvitations.createdAt));

  const data = rows.map((row) => ({
    ...row,
    status: computeInvitationStatus(row),
    inviteUrl: `${getBaseUrl()}/invite/${row.token}`,
  }));

  return { data };
}

export async function createInvitation(
  input: InvitationCreate,
  callerUserId?: string,
) {
  const normalizedEmail = input.email ? input.email.toLowerCase().trim() : null;

  if (normalizedEmail) {
    // Check if an account already exists with that email
    const [existingUser] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(sql`lower(${users.email}) = lower(${normalizedEmail})`)
      .limit(1);

    if (existingUser && existingUser.role === input.role) {
      return {
        error: `User dengan email ${normalizedEmail} sudah terdaftar dengan role ${input.role}.`,
        status: 400,
      } as const;
    }
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiresInMs = (input.expiresInHours || 168) * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + expiresInMs);

  const [invitation] = await db
    .insert(userInvitations)
    .values({
      token,
      email: normalizedEmail,
      role: input.role,
      invitedById: callerUserId || null,
      expiresAt,
    })
    .returning();

  const inviteUrl = `${getBaseUrl()}/invite/${token}`;

  // Optional: Send invitation email via Resend
  if (input.sendEmail && normalizedEmail && process.env.RESEND_API_KEY) {
    try {
      const roleLabel = input.role === 'admin' ? 'Admin / Panitia' : 'Peserta';
      await resend.emails.send({
        from: 'ASTRO 2026 <noreply@mailer.kta.blue>',
        to: normalizedEmail,
        subject: `Undangan Bergabung ke ASTRO 2026 (${roleLabel})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://i.ibb.co.com/yvSvfLK/logo-astro.png" alt="ASTRO 2026" style="height: 48px;" />
            </div>
            <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; text-align: center; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 8px;">
              Undangan Akun ASTRO 2026
            </h1>
            <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 24px;">
              Anda diundang untuk bergabung ke sistem ASTRO 2026 sebagai <strong>${roleLabel}</strong>.
            </p>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">
                Klik tombol di bawah ini untuk membuat akun dan menentukan kata sandi Anda:
              </p>
              <a href="${inviteUrl}" style="display: inline-block; padding: 12px 28px; background: #06b6d4; color: #0f172a; font-weight: 900; font-size: 13px; text-decoration: none; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
                Terima Undangan
              </a>
            </div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              Tautan ini berlaku selama <strong>${input.expiresInHours} jam</strong>. Jika Anda tidak merasa menerima undangan ini, abaikan email ini.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #cbd5e1; text-align: center;">
              ASTRO 2026 — BEM STT-NF
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Failed to send invitation email:', emailErr);
    }
  }

  return {
    data: {
      ...invitation,
      status: 'pending' as const,
      inviteUrl,
    },
  };
}

export async function revokeInvitation(id: string) {
  const [updated] = await db
    .update(userInvitations)
    .set({
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(userInvitations.id, id))
    .returning();

  if (!updated) {
    return { error: 'Undangan tidak ditemukan', status: 404 } as const;
  }

  return { data: updated };
}

export async function verifyInvitation(token: string) {
  const [inv] = await db
    .select()
    .from(userInvitations)
    .where(eq(userInvitations.token, token))
    .limit(1);

  if (!inv) {
    return {
      valid: false,
      error: 'Tautan undangan tidak ditemukan atau tidak valid.',
    } as const;
  }

  const status = computeInvitationStatus(inv);

  if (status === 'revoked') {
    return {
      valid: false,
      error: 'Tautan undangan ini telah dibatalkan oleh administrator.',
    } as const;
  }

  if (status === 'accepted') {
    return {
      valid: false,
      error: 'Tautan undangan ini sudah pernah digunakan.',
    } as const;
  }

  if (status === 'expired') {
    return {
      valid: false,
      error: 'Tautan undangan ini telah melewati masa berlaku (kadaluarsa).',
    } as const;
  }

  return {
    valid: true,
    data: {
      token: inv.token,
      email: inv.email,
      role: inv.role,
      expiresAt: inv.expiresAt,
    },
  } as const;
}

export async function acceptInvitation(token: string, input: InvitationAccept) {
  const verification = await verifyInvitation(token);
  if (!verification.valid) {
    return { error: verification.error, status: 400 } as const;
  }

  const inv = verification.data;
  const targetEmail = (inv.email || input.email)?.toLowerCase().trim();

  if (!targetEmail) {
    return { error: 'Email wajib diisi.', status: 400 } as const;
  }

  // Check if user with targetEmail already exists
  const [existingUser] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(sql`lower(${users.email}) = lower(${targetEmail})`)
    .limit(1);

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    // Upgrade/update user role to the invited role and make sure emailVerified = true
    await db
      .update(users)
      .set({
        name: input.name || undefined,
        role: inv.role,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } else {
    // Create new user using Better Auth Admin API
    const result = await auth.api.createUser({
      body: {
        email: targetEmail,
        password: input.password,
        name: input.name,
        role: inv.role as 'admin' | 'user',
      },
      headers: await headers(),
    });

    if ('error' in result && result.error) {
      const err = result.error as { message?: string };
      return {
        error: err.message || 'Gagal mendaftarkan akun baru.',
        status: 400,
      } as const;
    }

    const createdId = (result as any)?.user?.id || (result as any)?.id;
    userId = createdId;

    // Ensure emailVerified is true
    await db
      .update(users)
      .set({ emailVerified: true, role: inv.role })
      .where(eq(users.email, targetEmail));
  }

  // Mark invitation as used
  await db
    .update(userInvitations)
    .set({
      usedAt: new Date(),
      usedById: userId,
      updatedAt: new Date(),
    })
    .where(eq(userInvitations.token, token));

  return {
    data: {
      success: true,
      email: targetEmail,
      role: inv.role,
    },
  };
}
