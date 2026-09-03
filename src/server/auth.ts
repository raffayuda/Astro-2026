import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { emailOTP } from 'better-auth/plugins';
import { admin } from 'better-auth/plugins';
import { Resend } from 'resend';
import { db } from '@/src/db';
import { users, authSessions, authAccounts, authVerifications } from '@/src/db/schema';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://astro.nurulfikri.ac.id',
  trustedOrigins: [
    'https://astro.nurulfikri.ac.id',
    'http://localhost:3000',
    'http://localhost:3001',
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
      ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((s) => s.trim())
      : []),
    ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
    ...(process.env.NEXT_PUBLIC_BASE_URL ? [process.env.NEXT_PUBLIC_BASE_URL] : []),
  ],
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    schema: {
      users,
      sessions: authSessions,
      accounts: authAccounts,
      verifications: authVerifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 3, // Maksimal 3 kali salah memasukkan kode OTP
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      storeOTP: 'hashed',
      rateLimit: {
        window: 600, // 10 menit
        max: 3, // Maksimal 3 kali pengiriman OTP dalam 10 menit
      },
      sendVerificationOTP: async ({ email, otp, type }) => {
        const subject =
          type === 'forget-password'
            ? 'Reset Password ASTRO 2026'
            : 'Kode OTP ASTRO 2026';
        const message =
          type === 'forget-password'
            ? 'Gunakan kode berikut untuk mereset password akun ASTRO 2026'
            : 'Gunakan kode berikut untuk memverifikasi akun ASTRO 2026';

        const baseUrl = (
          process.env.NEXT_PUBLIC_BASE_URL ||
          process.env.BETTER_AUTH_URL ||
          'https://astro.nurulfikri.ac.id'
        ).replace(/\/+$/, '');
        const verifyUrl = `${baseUrl}/auth/verify-otp?email=${encodeURIComponent(email)}`;

        await resend.emails.send({
          from: 'ASTRO 2026 <noreply@mailer.kta.blue>',
          to: email,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src="https://abhshprulipnmetfumrt.supabase.co/storage/v1/object/public/assets/logo-astro.png" alt="ASTRO" style="height: 48px;" />
              </div>
              <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; text-align: center; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 8px;">
                Kode OTP
              </h1>
              <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 24px;">
                ${message}
              </p>
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px;">
                <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 8px;">Kode OTP</p>
                <p style="font-size: 36px; font-weight: 900; color: #06b6d4; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</p>
              </div>
              <div style="text-align: center; margin-bottom: 20px;">
                <a href="${verifyUrl}" style="display: inline-block; padding: 11px 24px; background: #06b6d4; color: #0f172a; font-weight: 800; font-size: 13px; text-decoration: none; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.05em;">
                  Buka Halaman Masukkan OTP
                </a>
              </div>
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                Kode ini berlaku selama <strong style="color: #64748b;">10 menit</strong>. Jangan bagikan kode ini kepada siapa pun.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 11px; color: #cbd5e1; text-align: center;">
                ASTRO 2026 — Ajang Lomba Pelajar Tingkat Nasional
              </p>
            </div>
          `,
        });
      },
    }),
    admin({
      defaultRole: 'participant',
      adminRoles: ['admin'],
    }),
    nextCookies(),
  ],
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      '/email-otp/send-verification-otp': {
        window: 600, // 10 menit
        max: 3, // Maksimal 3 kali request kirim OTP per 10 menit
      },
      '/email-otp/verify-email': {
        window: 600,
        max: 5, // Maksimal 5 kali salah/coba verifikasi per 10 menit
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },
});
