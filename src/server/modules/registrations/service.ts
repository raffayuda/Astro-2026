import { db } from '@/src/db';
import { registrations, competitions, users } from '@/src/db/schema';
import { eq, desc, sql, count, and } from 'drizzle-orm';
import { Resend } from 'resend';
import { deleteSupabaseFile } from '@/src/server/modules/upload';
import { createPayment, SumoPodError } from '@/src/server/modules/payments/sumopod';
import type { MemberDetail, RegistrationCreate, RegistrationListQuery } from './model';
import { SELF_SERVICE_FIELDS, ADMIN_FIELDS } from './model';

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Competitions with `playerPhotoRequired` (esports, e.g. Mobile Legends) need a
 * photo for every player — the leader plus each listed member. Returns an error
 * message when the submitted roster is incomplete, or null when it is valid.
 */
function validatePlayerPhotos(
  comp: typeof competitions.$inferSelect,
  input: {
    type?: string;
    leaderPhotoUrl?: string | null;
    memberDetails?: MemberDetail[] | null;
  },
): string | null {
  if (comp.playerPhotoRequired !== '1') return null;
  if (input.type === 'individual') {
    return input.leaderPhotoUrl ? null : 'Foto pemain wajib diunggah';
  }

  if (!input.leaderPhotoUrl) return 'Foto ketua tim wajib diunggah';

  const players = (input.memberDetails ?? []).filter((m) => m.name?.trim());
  // Clamp to the roster size — some competitions have min > max configured.
  const slots = Math.max((comp.maxTeamMembers || 1) - 1, 1);
  const minMembers = Math.min(Math.max((comp.minTeamMembers || 1) - 1, 0), slots);
  if (players.length < minMembers) {
    return `Minimal ${minMembers} anggota (selain ketua) wajib diisi`;
  }
  if (players.some((m) => !m.photoUrl)) {
    return 'Setiap anggota tim wajib mengunggah foto pemain';
  }
  return null;
}

/** Names of the listed players, one per line — kept for CSV/email compatibility. */
function membersText(memberDetails: MemberDetail[] | null | undefined, fallback?: string | null) {
  const names = (memberDetails ?? []).map((m) => m.name?.trim()).filter(Boolean);
  return names.length > 0 ? names.join('\n') : (fallback ?? null);
}

/** Build the `where` clause from list filters. */
function buildWhere(q: RegistrationListQuery, forceUserId?: string, forceUserEmail?: string) {
  const conditions: import('drizzle-orm').SQL[] = [];
  if (q.search) {
    conditions.push(
      sql`(${registrations.fullName} ILIKE ${'%' + q.search + '%'} OR ${registrations.teamName} ILIKE ${'%' + q.search + '%'} OR ${registrations.email} ILIKE ${'%' + q.search + '%'})`,
    );
  }
  if (q.status) conditions.push(eq(registrations.paymentStatus, q.status));
  if (q.competitionId) conditions.push(eq(registrations.competitionId, q.competitionId));
  
  if (q.userId && !forceUserId) {
    conditions.push(
      sql`(${registrations.userId} = ${q.userId} OR lower(${registrations.email}) = (SELECT lower(email) FROM ${users} WHERE id = ${q.userId} LIMIT 1))`
    );
  }

  // Non-admin callers are always scoped to their own identity (by userId OR by matching email)
  if (forceUserId) {
    if (forceUserEmail) {
      conditions.push(
        sql`(${registrations.userId} = ${forceUserId} OR lower(${registrations.email}) = lower(${forceUserEmail.trim()}))`
      );
    } else {
      conditions.push(eq(registrations.userId, forceUserId));
    }
  }

  return conditions.length > 0
    ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`
    : undefined;
}

export async function listRegistrations(q: RegistrationListQuery, role: string, sessionUserId?: string) {
  const isAdmin = role === 'admin';
  let userEmail: string | undefined;

  if (!isAdmin && sessionUserId) {
    const [u] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, sessionUserId))
      .limit(1);

    if (u) {
      userEmail = u.email;
      // Auto-link any registrations created with this email that have null userId
      await db
        .update(registrations)
        .set({ userId: u.id })
        .where(
          and(
            sql`lower(${registrations.email}) = lower(${u.email.trim()})`,
            sql`${registrations.userId} IS NULL`
          )
        );
    }
  }

  const where = buildWhere(q, isAdmin ? undefined : sessionUserId, userEmail);

  const [total] = await db
    .select({ total: count() })
    .from(registrations)
    .where(where);

  const data = await db
    .select({
      id: registrations.id,
      competitionId: registrations.competitionId,
      type: registrations.type,
      fullName: registrations.fullName,
      teamName: registrations.teamName,
      leaderName: registrations.leaderName,
      leaderIdentity: registrations.leaderIdentity,
      leaderPhotoUrl: registrations.leaderPhotoUrl,
      identityNumber: registrations.identityNumber,
      members: registrations.members,
      memberDetails: registrations.memberDetails,
      institution: registrations.institution,
      email: registrations.email,
      whatsapp: registrations.whatsapp,
      paymentStatus: registrations.paymentStatus,
      paymentMethod: registrations.paymentMethod,
      paymentAmount: registrations.paymentAmount,
      paymentReference: registrations.paymentReference,
      isWinner: registrations.isWinner,
      winnerRank: registrations.winnerRank,
      certificateSent: registrations.certificateSent,
      certificates: registrations.certificates,
      userId: registrations.userId,
      createdAt: registrations.createdAt,
      updatedAt: registrations.updatedAt,
      competitionName: competitions.title,
    })
    .from(registrations)
    .innerJoin(competitions, eq(registrations.competitionId, competitions.id))
    .where(where)
    .orderBy(desc(registrations.createdAt))
    .limit(q.pageSize)
    .offset((q.page - 1) * q.pageSize);

  return { data, total: Number(total?.total || 0), page: q.page, pageSize: q.pageSize };
}

export async function getRegistration(id: string) {
  const [row] = await db.select().from(registrations).where(eq(registrations.id, id));
  return row || null;
}

/** Create an anonymous registration. paymentAmount is derived server-side. */
export async function createRegistration(input: RegistrationCreate, userId: string | null) {
  const [comp] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, input.competitionId));

  if (!comp) return { error: 'Kompetisi tidak ditemukan', status: 404 } as const;

  if (comp.isActive !== '1') {
    return { error: 'Pendaftaran untuk lomba ini sedang ditutup', status: 400 } as const;
  }

  if (comp.maxSlots > 0 && (comp.filledSlots ?? 0) >= comp.maxSlots) {
    return { error: 'Kuota pendaftaran untuk lomba ini sudah penuh', status: 400 } as const;
  }

  // A competition is `individual`, `team`, or `both`. Reject a registration
  // type the competition does not allow.
  const compType = comp.type || 'individual';
  if (input.type !== 'individual' && input.type !== 'team') {
    return { error: 'Tipe pendaftaran tidak valid', status: 400 } as const;
  }
  if (compType !== 'both' && compType !== input.type) {
    return {
      error:
        compType === 'team'
          ? 'Lomba ini hanya menerima pendaftaran tim'
          : 'Lomba ini hanya menerima pendaftaran individu',
      status: 400,
    } as const;
  }

  const photoError = validatePlayerPhotos(comp, input);
  if (photoError) return { error: photoError, status: 400 } as const;

  let resolvedUserId = userId;
  if (!resolvedUserId && input.email) {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.email}) = lower(${input.email.trim()})`)
      .limit(1);
    if (existingUser) {
      resolvedUserId = existingUser.id;
    }
  }

  const paymentAmount = comp.isFree === '1' ? 0 : comp.fee || 0;
  const ref = `INV/ASTRO-2026/${Date.now().toString().slice(-8)}`;

  const [reg] = await db
    .insert(registrations)
    .values({
      competitionId: input.competitionId,
      type: input.type,
      fullName: input.fullName ?? null,
      identityNumber: input.identityNumber ?? null,
      teamName: input.teamName ?? null,
      leaderName: input.leaderName ?? null,
      leaderIdentity: input.leaderIdentity ?? null,
      leaderPhotoUrl: input.leaderPhotoUrl ?? null,
      members: membersText(input.memberDetails, input.members),
      memberDetails: input.memberDetails ?? [],
      institution: input.institution,
      email: input.email.trim(),
      whatsapp: input.whatsapp,
      paymentStatus: 'pending',
      paymentMethod: input.paymentMethod ?? null,
      paymentAmount,
      paymentReference: ref,
      userId: resolvedUserId,
    })
    .returning();

  // Paid registrations get a real SumoPod payment link. If SumoPod can't be
  // reached, roll back the insert rather than leaving an unpayable row behind.
  if (paymentAmount > 0) {
    try {
      const payment = await createPayment({
        orderId: ref,
        amount: paymentAmount,
        successReturnUrl: `${baseUrl}/check-registration?regId=${reg.id}`,
        cancelReturnUrl: `${baseUrl}/register/${comp.id}?regId=${reg.id}`,
      });

      const [withPayment] = await db
        .update(registrations)
        .set({
          paymentLinkId: payment.payment_id,
          paymentLinkUrl: payment.payment_link_url,
          paymentExpiresAt: new Date(payment.expires_at),
        })
        .where(eq(registrations.id, reg.id))
        .returning();

      return { reg: withPayment };
    } catch (err) {
      await db.delete(registrations).where(eq(registrations.id, reg.id));
      console.error('SumoPod create payment failed:', err);
      const message =
        err instanceof SumoPodError
          ? 'Gagal membuat link pembayaran, silakan coba lagi'
          : 'Gagal terhubung ke layanan pembayaran, silakan coba lagi';
      return { error: message, status: 502 } as const;
    }
  }

  return { reg };
}

/**
 * Update a registration via whitelist, keyed by caller identity.
 * Returns a discriminated result for the controller to map to status codes.
 */
export async function updateRegistration(
  id: string,
  body: Record<string, unknown>,
  isAdmin: boolean,
) {
  const current = await getRegistration(id);
  if (!current) return { kind: 'notfound' } as const;

  const allowedFields = isAdmin ? ADMIN_FIELDS : SELF_SERVICE_FIELDS;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  // Anonymous self-service edits only allowed while payment is still pending
  if (!isAdmin && updates.paymentStatus !== undefined) return { kind: 'forbidden' } as const;
  if (!isAdmin && current.paymentStatus !== 'pending') {
    return { kind: 'locked' } as const;
  }
  if (Object.keys(updates).length === 0) return { kind: 'empty' } as const;

  // Keep the newline-joined `members` text in sync with the roster, and re-check
  // the photo requirement whenever the roster or the leader photo changes.
  if (updates.memberDetails !== undefined) {
    updates.members = membersText(updates.memberDetails as MemberDetail[]);
  }
  if (updates.memberDetails !== undefined || updates.leaderPhotoUrl !== undefined) {
    const [comp] = await db
      .select()
      .from(competitions)
      .where(eq(competitions.id, current.competitionId));

    if (comp) {
      const photoError = validatePlayerPhotos(comp, {
        type: current.type,
        leaderPhotoUrl:
          (updates.leaderPhotoUrl as string | null | undefined) ?? current.leaderPhotoUrl,
        memberDetails:
          (updates.memberDetails as MemberDetail[] | undefined) ?? current.memberDetails,
      });
      if (photoError) return { kind: 'invalid', error: photoError } as const;
    }
  }

  const [updated] = await db
    .update(registrations)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(registrations.id, id))
    .returning();

  // When the admin replaces the `certificates` array, delete the Supabase
  // files whose URLs were dropped from the list (cascade delete to storage).
  if (isAdmin && updates.certificates !== undefined) {
    const oldUrls = (current.certificates || []).map((c) => c.url);
    const newUrls = new Set(
      ((updates.certificates as { url: string }[]) || []).map((c) => c.url),
    );
    for (const url of oldUrls) {
      if (url && !newUrls.has(url)) {
        deleteSupabaseFile(url).catch(console.error);
      }
    }
  }

  // Auto-update filledSlots when paymentStatus changes to/from 'paid' (admin-only path)
  if (updates.paymentStatus && updates.paymentStatus !== current.paymentStatus) {
    await applyPaymentStatusSideEffects(current, updates.paymentStatus as string);
  }

  return { kind: 'ok', reg: updated };
}

/**
 * Slot count + confirmation email side effects that must run whenever a
 * registration's `paymentStatus` transitions to/from 'paid' — shared by the
 * admin PATCH path and the SumoPod webhook handler.
 */
async function applyPaymentStatusSideEffects(
  current: typeof registrations.$inferSelect,
  newStatus: string,
) {
  const wasPaid = current.paymentStatus === 'paid';
  const nowPaid = newStatus === 'paid';
  const delta = 1; // each approved registration = 1 slot

  if (!wasPaid && nowPaid) {
    await db
      .update(competitions)
      .set({ filledSlots: sql`${competitions.filledSlots} + ${delta}` })
      .where(eq(competitions.id, current.competitionId));

    const [comp] = await db
      .select({ title: competitions.title })
      .from(competitions)
      .where(eq(competitions.id, current.competitionId));

    const participantName =
      current.fullName || current.teamName || current.leaderName || 'Peserta';
    const regType = current.type === 'team' ? 'Tim' : 'Individu';
    const reference = current.paymentReference || '-';

    try {
      await resend.emails.send({
        from: 'ASTRO 2026 <noreply@mailer.kta.blue>',
        to: current.email,
        subject: `Pembayaran Dikonfirmasi - ${comp?.title || 'ASTRO 2026'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8fafc; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://abhshprulipnmetfumrt.supabase.co/storage/v1/object/public/assets/logo-astro.png" alt="ASTRO" style="height: 48px;" />
            </div>
            <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; text-align: center; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 8px;">
              Pembayaran Dikonfirmasi
            </h1>
            <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 24px;">
              Pendaftaran kamu telah berhasil dikonfirmasi
            </p>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 12px;">Detail Pendaftaran</p>
              <table style="width: 100%; font-size: 14px; color: #0f172a;">
                <tr><td style="padding: 4px 0; color: #64748b;">Nama</td><td style="padding: 4px 0; font-weight: 700;">${participantName}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Tipe</td><td style="padding: 4px 0; font-weight: 700;">${regType}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Lomba</td><td style="padding: 4px 0; font-weight: 700;">${comp?.title || '-'}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Referensi</td><td style="padding: 4px 0; font-weight: 700;">${reference}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Status</td><td style="padding: 4px 0; font-weight: 700; color: #10b981;">LUNAS</td></tr>
              </table>
            </div>
            <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 24px;">
              Kamu bisa cek status pendaftaran kapan saja melalui halaman Cek Pendaftaran di website ASTRO 2026.
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${baseUrl}/check-registration" style="display: inline-block; padding: 12px 32px; background: #06b6d4; color: #0f172a; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);">
                Cek Pendaftaran
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #cbd5e1; text-align: center;">
              ASTRO 2026 — Ajang Lomba Pelajar Tingkat Nasional
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr);
    }
  } else if (wasPaid && !nowPaid) {
    await db
      .update(competitions)
      .set({ filledSlots: sql`GREATEST(${competitions.filledSlots} - ${delta}, 0)` })
      .where(eq(competitions.id, current.competitionId));
  }
}

/**
 * Apply a payment-status transition coming from the SumoPod webhook.
 * Trusted, server-to-server — bypasses the admin-only field whitelist but
 * only ever writes `paymentStatus`. Idempotent: replays of the same event
 * (or an out-of-order one) that don't actually change the status are no-ops.
 */
export async function setPaymentStatusByReference(orderId: string, newStatus: string) {
  const [current] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.paymentReference, orderId));

  if (!current) return { kind: 'notfound' } as const;
  if (current.paymentStatus === newStatus) return { kind: 'ok', reg: current } as const;

  const [updated] = await db
    .update(registrations)
    .set({ paymentStatus: newStatus, updatedAt: new Date() })
    .where(eq(registrations.id, current.id))
    .returning();

  await applyPaymentStatusSideEffects(current, newStatus);

  return { kind: 'ok', reg: updated } as const;
}

/* ─── Stats (admin) ─── */

export async function getStats() {
  const perCompetition = await db
    .select({
      name: competitions.title,
      category: competitions.category,
      count: count(),
    })
    .from(registrations)
    .innerJoin(competitions, eq(registrations.competitionId, competitions.id))
    .groupBy(competitions.id, competitions.title, competitions.category);

  const statusRows = await db
    .select({
      status: registrations.paymentStatus,
      count: count(),
    })
    .from(registrations)
    .groupBy(registrations.paymentStatus);

  const STATUS_COLORS: Record<string, string> = {
    pending: '#f59e0b',
    detecting: '#3b82f6',
    paid: '#10b981',
    failed: '#ef4444',
    expired: '#94a3b8',
  };

  const statusDistribution = statusRows.map((r) => ({
    name: r.status,
    value: Number(r.count),
    color: STATUS_COLORS[r.status] || '#94a3b8',
  }));

  return { perCompetition, statusDistribution };
}

/* ─── Winners (public) ─── */

export async function getWinners(competitionId: string) {
  const data = await db
    .select({
      id: registrations.id,
      competitionId: registrations.competitionId,
      type: registrations.type,
      fullName: registrations.fullName,
      teamName: registrations.teamName,
      leaderName: registrations.leaderName,
      email: registrations.email,
      winnerRank: registrations.winnerRank,
      certificates: registrations.certificates,
      competitionName: competitions.title,
      prizes: competitions.prizes,
    })
    .from(registrations)
    .innerJoin(competitions, eq(registrations.competitionId, competitions.id))
    .where(
      and(
        eq(registrations.competitionId, competitionId),
        eq(registrations.paymentStatus, 'paid'),
        sql`(${registrations.isWinner} = '1' OR ${sql`jsonb_array_length(${registrations.certificates})`} > 0)`,
      ),
    )
    .orderBy(registrations.winnerRank);

  const winners = data.filter((r) => r.winnerRank);
  const certHolders = data.filter((r) => !r.winnerRank && (r.certificates?.length || 0) > 0);

  return { winners, certHolders };
}

/* ─── Export CSV (admin) ─── */

export async function getExportRows() {
  const data = await db
    .select({
      reference: registrations.paymentReference,
      type: registrations.type,
      fullName: registrations.fullName,
      identityNumber: registrations.identityNumber,
      teamName: registrations.teamName,
      leaderName: registrations.leaderName,
      leaderIdentity: registrations.leaderIdentity,
      leaderPhotoUrl: registrations.leaderPhotoUrl,
      members: registrations.members,
      memberDetails: registrations.memberDetails,
      institution: registrations.institution,
      email: registrations.email,
      whatsapp: registrations.whatsapp,
      paymentStatus: registrations.paymentStatus,
      paymentMethod: registrations.paymentMethod,
      paymentAmount: registrations.paymentAmount,
      createdAt: registrations.createdAt,
      competitionName: competitions.title,
      competitionCategory: competitions.category,
    })
    .from(registrations)
    .innerJoin(competitions, eq(registrations.competitionId, competitions.id))
    .orderBy(desc(registrations.createdAt));

  const headers = [
    'Referensi', 'Tipe', 'Nama Lengkap', 'No Identitas',
    'Nama Tim', 'Nama Ketua', 'Identitas Ketua', 'Foto Ketua', 'Anggota', 'Foto Anggota',
    'Instansi', 'Email', 'WhatsApp', 'Lomba', 'Kategori',
    'Status Bayar', 'Metode Bayar', 'Jumlah', 'Tanggal Daftar',
  ];

  const rows = data.map((r) => [
    r.reference || '',
    r.type || '',
    r.type === 'team' ? '' : r.fullName || '',
    r.type === 'team' ? '' : r.identityNumber || '',
    r.type === 'team' ? r.teamName || '' : '',
    r.type === 'team' ? r.leaderName || '' : '',
    r.type === 'team' ? r.leaderIdentity || '' : '',
    r.type === 'team' ? (r.members || '').replace(/\n/g, '; ') : '',
    r.institution || '',
    r.email || '',
    r.whatsapp || '',
    r.competitionName || '',
    r.competitionCategory || '',
    r.paymentStatus || '',
    r.paymentMethod || '',
    r.paymentAmount?.toString() || '0',
    r.createdAt ? new Date(r.createdAt).toISOString() : '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    ),
  ].join('\n');

  return csvContent;
}
