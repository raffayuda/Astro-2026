import { db } from "@/src/db";
import { registrations, competitions, users } from "@/src/db/schema";
import { eq, desc, sql, count, and } from "drizzle-orm";
import { Resend } from "resend";
import { deleteSupabaseFile } from "@/src/server/modules/upload";
import {
  createPayment,
  fetchPublicPaymentCheckout,
  SumoPodError,
} from "@/src/server/modules/payments/sumopod";
import { getEffectiveFee } from "@/src/server/modules/competitions/service";
import { isRecord } from "@/lib/flags";
import { isSafeUrl } from "@/lib/urls";
import type { MemberDetail, RegistrationCreate, RegistrationListQuery } from "./model";
import { SELF_SERVICE_FIELDS, ADMIN_FIELDS } from "./model";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * Competitions with `playerPhotoRequired` (esports, e.g. Mobile Legends) need a
 * photo and an in-game account ID for every player — the leader plus each
 * listed member. Returns an error message when the submitted roster is
 * incomplete, or null when it is valid.
 */
function validatePlayerPhotos(
  comp: typeof competitions.$inferSelect,
  input: {
    type?: string;
    leaderGameId?: string | null;
    leaderPhotoUrl?: string | null;
    memberDetails?: MemberDetail[] | null;
  },
): string | null {
  if (comp.playerPhotoRequired !== "1") return null;
  if (input.type === "individual") {
    if (!input.leaderPhotoUrl) return "Foto pemain wajib diunggah";
    return input.leaderGameId?.trim() ? null : "ID akun pemain wajib diisi";
  }

  if (!input.leaderPhotoUrl) return "Foto ketua tim wajib diunggah";
  if (!input.leaderGameId?.trim()) return "ID akun ketua tim wajib diisi";

  const players = (input.memberDetails ?? []).filter((m) => m.name?.trim());
  // Clamp to the roster size — some competitions have min > max configured.
  const slots = Math.max((comp.maxTeamMembers || 1) - 1, 1);
  const minMembers = Math.min(Math.max((comp.minTeamMembers || 1) - 1, 0), slots);
  if (players.length < minMembers) {
    return `Minimal ${minMembers} anggota (selain ketua) wajib diisi`;
  }
  if (players.some((m) => !m.photoUrl)) {
    return "Setiap anggota tim wajib mengunggah foto pemain";
  }
  if (players.some((m) => !m.gameId?.trim())) {
    return "Setiap anggota tim wajib mengisi ID akun pemain";
  }
  return null;
}

/**
 * Rejects any uploaded-file value that is not an http(s) URL or a
 * root-relative path. These values are rendered as `href` targets in the admin
 * views, where a `javascript:` URI would run in an admin session.
 */
function validateUploadedUrls(updates: Record<string, unknown>): string | null {
  const leaderPhoto = updates.leaderPhotoUrl;
  if (typeof leaderPhoto === "string" && leaderPhoto !== "" && !isSafeUrl(leaderPhoto)) {
    return "URL foto ketua tidak valid";
  }

  if (Array.isArray(updates.memberDetails)) {
    for (const member of updates.memberDetails as MemberDetail[]) {
      const photo = member?.photoUrl;
      if (typeof photo === "string" && photo !== "" && !isSafeUrl(photo)) {
        return "URL foto anggota tidak valid";
      }
    }
  }

  if (isRecord(updates.customFields)) {
    for (const value of Object.values(updates.customFields)) {
      if (typeof value === "string" && /^\s*(javascript|data|vbscript):/i.test(value)) {
        return "Nilai field khusus tidak valid";
      }
    }
  }

  return null;
}

/** Names of the listed players, one per line — kept for CSV/email compatibility. */
function membersText(memberDetails: MemberDetail[] | null | undefined, fallback?: string | null) {
  const names = (memberDetails ?? []).map((m) => m.name?.trim()).filter(Boolean);
  return names.length > 0 ? names.join("\n") : (fallback ?? null);
}

/** Build the `where` clause from list filters. */
function buildWhere(q: RegistrationListQuery, forceUserId?: string, forceUserEmail?: string) {
  const conditions: import("drizzle-orm").SQL[] = [];
  if (q.search) {
    conditions.push(
      sql`(${registrations.fullName} ILIKE ${"%" + q.search + "%"} OR ${registrations.teamName} ILIKE ${"%" + q.search + "%"} OR ${registrations.email} ILIKE ${"%" + q.search + "%"})`,
    );
  }
  if (q.status) conditions.push(eq(registrations.paymentStatus, q.status));
  if (q.competitionId) conditions.push(eq(registrations.competitionId, q.competitionId));

  if (q.userId && !forceUserId) {
    conditions.push(
      sql`(${registrations.userId} = ${q.userId} OR lower(${registrations.email}) = (SELECT lower(email) FROM ${users} WHERE id = ${q.userId} LIMIT 1))`,
    );
  }

  // Non-admin callers are always scoped to their own identity (by userId OR by matching email)
  if (forceUserId) {
    if (forceUserEmail) {
      conditions.push(
        sql`(${registrations.userId} = ${forceUserId} OR lower(${registrations.email}) = lower(${forceUserEmail.trim()}))`,
      );
    } else {
      conditions.push(eq(registrations.userId, forceUserId));
    }
  }

  return conditions.length > 0
    ? sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`
    : undefined;
}

export async function listRegistrations(
  q: RegistrationListQuery,
  role: string,
  sessionUserId?: string,
) {
  const isAdmin = role === "admin";
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
            sql`${registrations.userId} IS NULL`,
          ),
        );
    }
  }

  const where = buildWhere(q, isAdmin ? undefined : sessionUserId, userEmail);

  const [total] = await db.select({ total: count() }).from(registrations).where(where);

  const data = await db
    .select({
      id: registrations.id,
      competitionId: registrations.competitionId,
      type: registrations.type,
      fullName: registrations.fullName,
      teamName: registrations.teamName,
      leaderName: registrations.leaderName,
      leaderIdentity: registrations.leaderIdentity,
      leaderGameId: registrations.leaderGameId,
      leaderPhotoUrl: registrations.leaderPhotoUrl,
      identityNumber: registrations.identityNumber,
      members: registrations.members,
      memberDetails: registrations.memberDetails,
      institution: registrations.institution,
      email: registrations.email,
      whatsapp: registrations.whatsapp,
      customFields: registrations.customFields,
      paymentStatus: registrations.paymentStatus,
      paymentMethod: registrations.paymentMethod,
      paymentAmount: registrations.paymentAmount,
      paymentReference: registrations.paymentReference,
      paymentLinkId: registrations.paymentLinkId,
      paymentLinkUrl: registrations.paymentLinkUrl,
      paymentExpiresAt: registrations.paymentExpiresAt,
      paymentCode: registrations.paymentCode,
      paymentCodeType: registrations.paymentCodeType,
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

/**
 * Trim a full registration row to what a caller *without* an account may
 * legitimately see at `GET /registrations/:id` — their own submitted data,
 * plus the checkout material needed to resume payment. That route is
 * unauthenticated by design (a pre-payment registrant has no session yet)
 * and keyed on the row UUID, so anything internal-only — `userId`,
 * `paymentLinkId`, `certificates`, `isWinner`/`winnerRank`/`certificateSent`,
 * the certificate-template bookkeeping — must not ride along in the body.
 * `getRegistration` itself stays untrimmed: `updateRegistration` and
 * `deleteRegistration` read exactly those fields internally.
 */
export function toPublicRegistration(row: typeof registrations.$inferSelect) {
  const {
    userId: _userId,
    paymentLinkId: _paymentLinkId,
    isWinner: _isWinner,
    winnerRank: _winnerRank,
    certificateSent: _certificateSent,
    certificates: _certificates,
    certificateGeneratedAt: _certificateGeneratedAt,
    certificateTemplateVersion: _certificateTemplateVersion,
    ...pub
  } = row;
  return pub;
}

export async function getRegistration(id: string) {
  const [row] = await db.select().from(registrations).where(eq(registrations.id, id));
  if (!row) return null;

  // Active sync with SumoPod live checkout API if outcome is undecided or payment code is missing
  if (row.paymentStatus === "pending" && (row.paymentLinkId || row.paymentLinkUrl)) {
    try {
      const checkout = await fetchPublicPaymentCheckout(
        row.paymentLinkUrl || row.paymentLinkId || "",
        row.paymentLinkUrl,
      );
      if (checkout) {
        let shouldUpdate = false;
        const updates: Partial<typeof registrations.$inferInsert> = {};

        if (checkout.status === "completed") {
          updates.paymentStatus = "paid";
          shouldUpdate = true;
          await applyPaymentStatusSideEffects(row, "paid");
        } else if (
          checkout.status === "canceled" ||
          checkout.status === "cancelled" ||
          checkout.status === "failed"
        ) {
          updates.paymentStatus = "failed";
          shouldUpdate = true;
        } else if (checkout.status === "expired") {
          updates.paymentStatus = "expired";
          shouldUpdate = true;
        }

        if (!row.paymentCode && checkout.payment_code) {
          updates.paymentCode = checkout.payment_code;
          updates.paymentCodeType = checkout.payment_code_type ?? "QR_TEXT";
          shouldUpdate = true;
        }

        if (
          checkout.amount &&
          Number(checkout.amount) > 0 &&
          checkout.amount !== row.paymentAmount
        ) {
          updates.paymentAmount = checkout.amount;
          shouldUpdate = true;
        }

        if (shouldUpdate) {
          const [updated] = await db
            .update(registrations)
            .set(updates)
            .where(eq(registrations.id, id))
            .returning();
          return updated || row;
        }
      }
    } catch (err) {
      console.warn("Auto-sync checkout status error:", err);
    }
  }

  return row;
}

/** Create an anonymous registration. paymentAmount is derived server-side. */
export async function createRegistration(input: RegistrationCreate, userId: string | null) {
  const [comp] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, input.competitionId));

  if (!comp) return { error: "Kompetisi tidak ditemukan", status: 404 } as const;

  if (comp.isActive !== "1") {
    return { error: "Pendaftaran untuk lomba ini sedang ditutup", status: 400 } as const;
  }

  if (comp.maxSlots > 0 && (comp.filledSlots ?? 0) >= comp.maxSlots) {
    return { error: "Kuota pendaftaran untuk lomba ini sudah penuh", status: 400 } as const;
  }

  // A competition is `individual`, `team`, or `both`. Reject a registration
  // type the competition does not allow.
  const compType = comp.type || "individual";
  if (input.type !== "individual" && input.type !== "team") {
    return { error: "Tipe pendaftaran tidak valid", status: 400 } as const;
  }
  if (compType !== "both" && compType !== input.type) {
    return {
      error:
        compType === "team"
          ? "Lomba ini hanya menerima pendaftaran tim"
          : "Lomba ini hanya menerima pendaftaran individu",
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

  const isFree = comp.isFree === "1" || comp.isFree === "true" || (comp as any).isFree === true;
  const { fee: effectiveFee, batchName } = getEffectiveFee(comp);
  const paymentAmount = isFree ? 0 : effectiveFee;
  const ref = `INV-ASTRO-2026-${Date.now().toString().slice(-8)}`;

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
      leaderGameId: input.leaderGameId ?? null,
      leaderPhotoUrl: input.leaderPhotoUrl ?? null,
      members: membersText(input.memberDetails, input.members),
      memberDetails: input.memberDetails ?? [],
      institution: input.institution,
      email: input.email.trim(),
      whatsapp: input.whatsapp,
      customFields: input.customFields ?? {},
      paymentStatus: "pending",
      paymentMethod: input.paymentMethod ?? null,
      paymentAmount,
      batchName: batchName ?? null,
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

      // If SumoPod charges fee to customer, sync the exact final checkout amount & codes
      let finalAmount = payment.amount || paymentAmount;
      let finalPaymentCode = payment.payment_code ?? null;
      let finalPaymentCodeType = payment.payment_code_type ?? null;
      let finalChannel = reg.paymentMethod ?? payment.payment_channel_used ?? "QRIS";

      try {
        const checkout = await fetchPublicPaymentCheckout(
          payment.payment_link_url || payment.payment_id,
          payment.payment_link_url,
        );
        if (checkout) {
          if (checkout.amount && Number(checkout.amount) > 0) {
            finalAmount = checkout.amount;
          }
          if (checkout.payment_code) {
            finalPaymentCode = checkout.payment_code;
            finalPaymentCodeType = checkout.payment_code_type ?? "QR_TEXT";
          }
          if (checkout.payment_channel_used) {
            finalChannel = checkout.payment_channel_used;
          }
        }
      } catch {}

      const [withPayment] = await db
        .update(registrations)
        .set({
          paymentLinkId: payment.payment_id,
          paymentLinkUrl: payment.payment_link_url,
          paymentExpiresAt: new Date(payment.expires_at),
          paymentCode: finalPaymentCode,
          paymentCodeType: finalPaymentCodeType,
          paymentMethod: finalChannel,
          paymentAmount: finalAmount,
        })
        .where(eq(registrations.id, reg.id))
        .returning();

      return { reg: withPayment };
    } catch (err) {
      await db.delete(registrations).where(eq(registrations.id, reg.id));
      console.error("SumoPod create payment failed:", err);
      // Only SumoPodError carries a message written for participants. Any
      // other failure (a missing API key, a driver error) stays in the log.
      const message =
        err instanceof SumoPodError
          ? err.message
          : "Gagal terhubung ke layanan pembayaran, silakan coba lagi";
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
  if (!current) return { kind: "notfound" } as const;

  const allowedFields = isAdmin
    ? ([...SELF_SERVICE_FIELDS, ...ADMIN_FIELDS] as readonly string[])
    : SELF_SERVICE_FIELDS;

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  // Anonymous self-service edits only allowed while payment is still pending
  if (!isAdmin && updates.paymentStatus !== undefined) return { kind: "forbidden" } as const;
  if (!isAdmin && current.paymentStatus !== "pending") {
    return { kind: "locked" } as const;
  }
  if (Object.keys(updates).length === 0) return { kind: "empty" } as const;

  // The PUT route accepts a loose record, so uploaded-file values are checked
  // here as well as in `registrationCreateSchema`. These end up as `href`
  // targets in the admin views; a `javascript:` URI must never reach the row.
  const urlError = validateUploadedUrls(updates);
  if (urlError) return { kind: "invalid", error: urlError } as const;

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
      if (photoError) return { kind: "invalid", error: photoError } as const;
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
    const newUrls = new Set(((updates.certificates as { url: string }[]) || []).map((c) => c.url));
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

  return { kind: "ok", reg: updated };
}

/**
 * Delete a registration. If it was already paid, decrements filledSlots.
 * Also cleans up any uploaded photos and certificates from Supabase storage.
 */
export async function deleteRegistration(id: string) {
  const current = await getRegistration(id);
  if (!current) return { kind: "notfound" } as const;

  if (current.paymentStatus === "paid") {
    await db
      .update(competitions)
      .set({ filledSlots: sql`GREATEST(${competitions.filledSlots} - 1, 0)` })
      .where(eq(competitions.id, current.competitionId));
  }

  const filesToDelete: (string | null | undefined)[] = [
    current.leaderPhotoUrl,
    ...((current.memberDetails as MemberDetail[]) || []).map((m) => m.photoUrl),
    ...((current.certificates as { url: string }[]) || []).map((c) => c.url),
  ];

  if (current.customFields && typeof current.customFields === "object") {
    for (const val of Object.values(current.customFields as Record<string, unknown>)) {
      if (typeof val === "string" && val.includes("supabase.co")) {
        filesToDelete.push(val);
      }
    }
  }

  for (const fileUrl of filesToDelete) {
    if (fileUrl) {
      deleteSupabaseFile(fileUrl).catch(() => {});
    }
  }

  await db.delete(registrations).where(eq(registrations.id, id));
  return { kind: "ok" } as const;
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
  const wasPaid = current.paymentStatus === "paid";
  const nowPaid = newStatus === "paid";
  const delta = 1; // each approved registration = 1 slot

  if (!wasPaid && nowPaid) {
    await db
      .update(competitions)
      .set({ filledSlots: sql`${competitions.filledSlots} + ${delta}` })
      .where(eq(competitions.id, current.competitionId));

    const [comp] = await db
      .select({
        title: competitions.title,
        category: competitions.category,
        contactName: competitions.contactName,
        contactWhatsapp: competitions.contactWhatsapp,
      })
      .from(competitions)
      .where(eq(competitions.id, current.competitionId));

    const participantName = current.fullName || current.teamName || current.leaderName || "Peserta";
    const regType = current.type === "team" ? "Tim" : "Individu";
    const reference = current.paymentReference || "-";
    const formattedAmount = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(current.paymentAmount || 0);

    const paymentDate = new Date(
      current.updatedAt || current.createdAt || Date.now(),
    ).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const invoiceUrl = `${baseUrl}/check-registration?regId=${current.id}`;
    const batchText = current.batchName || "Reguler";
    const paymentMethod = current.paymentMethod || "QRIS";

    try {
      await resend.emails.send({
        from: "ASTRO 2026 <noreply@mailer.kta.blue>",
        to: current.email,
        subject: `Bukti Pembayaran & Invoice Resmi - ${comp?.title || "ASTRO 2026"}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <!-- Header with Brand & Invoice Title -->
            <div style="background: #0f172a; padding: 28px 24px; text-align: center;">
              <img src="https://i.ibb.co.com/yvSvfLK/logo-astro.png" alt="ASTRO 2026" style="height: 48px; margin-bottom: 12px;" />
              <h1 style="color: #ffffff; font-size: 18px; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; margin: 0 0 4px;">
                Bukti Pembayaran & Invoice Resmi
              </h1>
              <p style="color: #38bdf8; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin: 0;">
                ASTRO 2026 • STT Terpadu Nurul Fikri
              </p>
            </div>

            <!-- Status Verified Banner -->
            <div style="background: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 14px 24px; text-align: center;">
              <span style="display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px;">
                ✓ PEMBAYARAN LUNAS / VERIFIED
              </span>
              <p style="color: #065f46; font-size: 13px; font-weight: 500; margin: 6px 0 0;">
                Pendaftaran telah berhasil dikonfirmasi dan kuota slot lomba kamu telah resmi terkunci.
              </p>
            </div>

            <!-- Body Content -->
            <div style="padding: 24px;">
              <!-- Metadata Table -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; width: 42%;">No. Invoice / Ref</td>
                  <td style="padding: 6px 0; font-weight: 800; color: #0f172a; font-family: monospace;">${reference}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Tanggal Konfirmasi</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${paymentDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Metode Pembayaran</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${paymentMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Pendaftar / Peserta</td>
                  <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">${participantName} (${regType})</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Asal Institusi / Sekolah</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${current.institution || "-"}</td>
                </tr>
              </table>

              <!-- Invoice Breakdown Card -->
              <div style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <thead>
                    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; text-align: left;">
                      <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">Rincian Item</th>
                      <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; text-align: right;">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                        <strong style="color: #0f172a; font-size: 14px; display: block;">${comp?.title || "Kompetisi ASTRO 2026"}</strong>
                        <span style="color: #64748b; font-size: 12px;">Gelombang: ${batchText} • Kategori: ${regType}</span>
                      </td>
                      <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #0f172a; vertical-align: top;">
                        ${formattedAmount}
                      </td>
                    </tr>
                    <tr style="background: #f8fafc;">
                      <td style="padding: 12px 14px; font-weight: 900; font-size: 13px; text-transform: uppercase; color: #0f172a;">
                        Total Dibayarkan
                      </td>
                      <td style="padding: 12px 14px; text-align: right; font-weight: 900; font-size: 16px; color: #0284c7;">
                        ${formattedAmount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- CTA Button to View / Print Invoice -->
              <div style="text-align: center; margin: 28px 0 16px;">
                <a href="${invoiceUrl}" style="display: inline-block; padding: 14px 32px; background: #0284c7; color: #ffffff; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 8px;">
                  Lihat & Cetak Invoice Resmi (PDF) →
                </a>
                <p style="font-size: 11px; color: #94a3b8; margin: 8px 0 0;">
                  Kamu juga dapat mengakses dan mencetak bukti invoice ini kapan saja di menu Cek Pendaftaran.
                </p>
              </div>

              <!-- Contact Person -->
              ${
                comp?.contactWhatsapp
                  ? `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #475569; margin-top: 20px;">
                <strong>Narahubung Lomba (${comp.contactName || "Panitia"}):</strong> 
                WhatsApp di <a href="https://wa.me/${comp.contactWhatsapp.replace(/\D/g, "")}" style="color: #0284c7; text-decoration: none; font-weight: 700;">${comp.contactWhatsapp}</a>
              </div>
              `
                  : ""
              }
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0;">© 2026 ASTRO. All rights reserved.</p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send confirmation email:", emailErr);
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

  if (!current) return { kind: "notfound" } as const;
  if (current.paymentStatus === newStatus) return { kind: "ok", reg: current } as const;

  const [updated] = await db
    .update(registrations)
    .set({ paymentStatus: newStatus, updatedAt: new Date() })
    .where(eq(registrations.id, current.id))
    .returning();

  await applyPaymentStatusSideEffects(current, newStatus);

  return { kind: "ok", reg: updated } as const;
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
    pending: "#f59e0b",
    detecting: "#3b82f6",
    paid: "#10b981",
    failed: "#ef4444",
    expired: "#94a3b8",
  };

  const statusDistribution = statusRows.map((r) => ({
    name: r.status,
    value: Number(r.count),
    color: STATUS_COLORS[r.status] || "#94a3b8",
  }));

  return { perCompetition, statusDistribution };
}

/* ─── Winners (public) ─── */

export async function getWinners(competitionId: string) {
  // Public endpoint keyed on a competition slug — every visitor to the
  // announcements page gets this payload, so it must carry only what a
  // winner leaderboard needs. `email` used to ride along unused by the
  // client; it does not belong in a response anyone can request.
  const data = await db
    .select({
      id: registrations.id,
      competitionId: registrations.competitionId,
      type: registrations.type,
      fullName: registrations.fullName,
      teamName: registrations.teamName,
      leaderName: registrations.leaderName,
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
        eq(registrations.paymentStatus, "paid"),
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
      leaderGameId: registrations.leaderGameId,
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
    "Referensi",
    "Tipe",
    "Nama Lengkap",
    "No Identitas",
    "Nama Tim",
    "Nama Ketua",
    "Identitas Ketua",
    "ID Akun Ketua",
    "Foto Ketua",
    "Anggota",
    "ID Akun Anggota",
    "Foto Anggota",
    "Instansi",
    "Email",
    "WhatsApp",
    "Lomba",
    "Kategori",
    "Status Bayar",
    "Metode Bayar",
    "Jumlah",
    "Tanggal Daftar",
  ];

  /** One cell per roster row, in roster order, so the columns line up. */
  const joinRoster = (
    roster: MemberDetail[],
    pick: (m: MemberDetail) => string | null | undefined,
  ) => roster.map((m) => pick(m) || "-").join("; ");

  const rows = data.map((r) => {
    const roster = (r.memberDetails as MemberDetail[] | null) ?? [];
    const isTeam = r.type === "team";
    return [
      r.reference || "",
      r.type || "",
      isTeam ? "" : r.fullName || "",
      isTeam ? "" : r.identityNumber || "",
      isTeam ? r.teamName || "" : "",
      isTeam ? r.leaderName || "" : "",
      isTeam ? r.leaderIdentity || "" : "",
      r.leaderGameId || "",
      r.leaderPhotoUrl || "",
      isTeam ? (r.members || "").replace(/\n/g, "; ") : "",
      isTeam ? joinRoster(roster, (m) => m.gameId) : "",
      isTeam ? joinRoster(roster, (m) => m.photoUrl) : "",
      r.institution || "",
      r.email || "",
      r.whatsapp || "",
      r.competitionName || "",
      r.competitionCategory || "",
      r.paymentStatus || "",
      r.paymentMethod || "",
      r.paymentAmount?.toString() || "0",
      r.createdAt ? new Date(r.createdAt).toISOString() : "",
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return csvContent;
}

/** Public lookup by invoice reference, registration ID, email, or phone. */
export async function checkRegistrationStatus(rawQuery: string) {
  const q = rawQuery.trim();
  if (!q) return [];

  const lowerQ = q.toLowerCase();
  const digitsOnly = q.replace(/\D/g, "");

  const conditions = [
    sql`lower(${registrations.paymentReference}) = ${lowerQ}`,
    sql`lower(${registrations.email}) = ${lowerQ}`,
  ];

  if (q.length >= 30) {
    conditions.push(sql`lower(CAST(${registrations.id} AS text)) = ${lowerQ}`);
  }

  // Match the full national number, not a substring: an 8-digit `LIKE
  // '%...%'` let anyone walk other people's registrations out of this public
  // endpoint. Leading `0`/`62` is stripped from both sides so `0812…` and
  // `62812…` still resolve to the same person.
  const nationalDigits = digitsOnly.replace(/^(?:62|0)/, "");
  if (nationalDigits.length >= 8) {
    conditions.push(
      sql`regexp_replace(regexp_replace(${registrations.whatsapp}, '\\D', '', 'g'), '^(62|0)', '') = ${nationalDigits}`,
    );
  }

  const whereClause = sql`(${conditions.reduce((a, b) => sql`${a} OR ${b}`)})`;

  const data = await db
    .select({
      id: registrations.id,
      competitionId: registrations.competitionId,
      type: registrations.type,
      fullName: registrations.fullName,
      teamName: registrations.teamName,
      leaderName: registrations.leaderName,
      leaderIdentity: registrations.leaderIdentity,
      leaderGameId: registrations.leaderGameId,
      leaderPhotoUrl: registrations.leaderPhotoUrl,
      identityNumber: registrations.identityNumber,
      members: registrations.members,
      memberDetails: registrations.memberDetails,
      institution: registrations.institution,
      email: registrations.email,
      whatsapp: registrations.whatsapp,
      customFields: registrations.customFields,
      paymentStatus: registrations.paymentStatus,
      paymentMethod: registrations.paymentMethod,
      paymentAmount: registrations.paymentAmount,
      batchName: registrations.batchName,
      paymentReference: registrations.paymentReference,
      paymentLinkId: registrations.paymentLinkId,
      paymentLinkUrl: registrations.paymentLinkUrl,
      paymentExpiresAt: registrations.paymentExpiresAt,
      paymentCode: registrations.paymentCode,
      paymentCodeType: registrations.paymentCodeType,
      isWinner: registrations.isWinner,
      winnerRank: registrations.winnerRank,
      certificateSent: registrations.certificateSent,
      certificates: registrations.certificates,
      userId: registrations.userId,
      createdAt: registrations.createdAt,
      updatedAt: registrations.updatedAt,
      competitionName: competitions.title,
      competitionCategory: competitions.category,
      competitionContactName: competitions.contactName,
      competitionContactWhatsapp: competitions.contactWhatsapp,
      competitionCustomFields: competitions.customFields,
    })
    .from(registrations)
    .innerJoin(competitions, eq(registrations.competitionId, competitions.id))
    .where(whereClause)
    .orderBy(desc(registrations.createdAt))
    .limit(20);

  // Sync any pending registrations with SumoPod checkout
  for (const item of data) {
    if (item.paymentStatus === "pending" && (item.paymentLinkId || item.paymentLinkUrl)) {
      try {
        const checkout = await fetchPublicPaymentCheckout(
          item.paymentLinkUrl || item.paymentLinkId || "",
          item.paymentLinkUrl,
        );
        if (checkout) {
          if (checkout.status === "completed") {
            item.paymentStatus = "paid";
            await db
              .update(registrations)
              .set({ paymentStatus: "paid" })
              .where(eq(registrations.id, item.id));
            await applyPaymentStatusSideEffects(item as any, "paid");
          } else if (
            checkout.status === "canceled" ||
            checkout.status === "cancelled" ||
            checkout.status === "failed"
          ) {
            item.paymentStatus = "failed";
            await db
              .update(registrations)
              .set({ paymentStatus: "failed" })
              .where(eq(registrations.id, item.id));
          } else if (checkout.status === "expired") {
            item.paymentStatus = "expired";
            await db
              .update(registrations)
              .set({ paymentStatus: "expired" })
              .where(eq(registrations.id, item.id));
          }
          if (!item.paymentCode && checkout.payment_code) {
            item.paymentCode = checkout.payment_code;
            await db
              .update(registrations)
              .set({
                paymentCode: checkout.payment_code,
                paymentCodeType: checkout.payment_code_type ?? "QR_TEXT",
              })
              .where(eq(registrations.id, item.id));
          }
          if (
            checkout.amount &&
            Number(checkout.amount) > 0 &&
            checkout.amount !== item.paymentAmount
          ) {
            item.paymentAmount = checkout.amount;
            await db
              .update(registrations)
              .set({ paymentAmount: checkout.amount })
              .where(eq(registrations.id, item.id));
          }
        }
      } catch (err) {
        console.warn("Check sync error:", err);
      }
    }
  }

  // Public payload: only what the lookup page renders. The selected row also
  // carries checkout material (`paymentLinkUrl`, `paymentCode`) and the
  // internal `userId`, which must not leave the server on an unauthenticated
  // endpoint — anyone who found a record could otherwise open its checkout.
  return data.map((item) => ({
    id: item.id,
    competitionId: item.competitionId,
    type: item.type,
    fullName: item.fullName,
    identityNumber: item.identityNumber,
    teamName: item.teamName,
    leaderName: item.leaderName,
    leaderIdentity: item.leaderIdentity,
    leaderGameId: item.leaderGameId,
    leaderPhotoUrl: item.leaderPhotoUrl,
    members: item.members,
    memberDetails: item.memberDetails,
    institution: item.institution,
    email: item.email,
    whatsapp: item.whatsapp,
    customFields: item.customFields,
    paymentStatus: item.paymentStatus,
    paymentMethod: item.paymentMethod,
    paymentAmount: item.paymentAmount,
    batchName: item.batchName,
    paymentReference: item.paymentReference,
    createdAt: item.createdAt,
    competitionName: item.competitionName,
    competitionCategory: item.competitionCategory,
    competitionContactName: item.competitionContactName,
    competitionContactWhatsapp: item.competitionContactWhatsapp,
    competitionCustomFields: item.competitionCustomFields,
  }));
}
