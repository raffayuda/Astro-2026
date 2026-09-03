import { Elysia, status } from 'elysia';
import { db } from '@/src/db';
import { users, authVerifications } from '@/src/db/schema';
import { eq, or, like, desc } from 'drizzle-orm';
import { z } from 'zod';

const checkEmailSchema = z.object({
  email: z.string().email(),
});

/**
 * Public pre-signup email check.
 *
 * Better Auth deliberately returns a synthetic success response for an email
 * that already exists when `requireEmailVerification` is enabled (anti-user
 * enumeration). The signup page would otherwise proceed to the OTP step even
 * though the account already exists. This endpoint lets the client detect that
 * case before calling `signUp.email`.
 *
 * Returns email availability, verification status, and whether an active
 * unexpired OTP exists for this email.
 */
export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/check-email', async ({ body }) => {
    const parsed = checkEmailSchema.safeParse(body);
    if (!parsed.success) {
      return status(400, { available: false, error: 'Email tidak valid' });
    }

    const email = parsed.data.email.toLowerCase();
    const [existing] = await db
      .select({ id: users.id, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let hasActiveOtp = false;
    let otpExpiresAt: string | null = null;

    if (existing && !existing.emailVerified) {
      const [verification] = await db
        .select({ expiresAt: authVerifications.expiresAt })
        .from(authVerifications)
        .where(
          or(
            eq(authVerifications.identifier, email),
            like(authVerifications.identifier, `${email}%`),
          ),
        )
        .orderBy(desc(authVerifications.createdAt))
        .limit(1);

      if (verification && verification.expiresAt > new Date()) {
        hasActiveOtp = true;
        otpExpiresAt = verification.expiresAt.toISOString();
      }
    }

    return {
      available: !existing,
      emailVerified: existing ? existing.emailVerified : false,
      hasActiveOtp,
      otpExpiresAt,
    };
  }, {
    body: checkEmailSchema,
  });