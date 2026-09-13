import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/src/server/auth";
import { db } from "@/src/db";
import { registrations } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  createCompetition,
  updateCompetition,
  revalidateCompetitionPaths,
} from "@/src/server/modules/competitions/service";
import { updateRegistration } from "@/src/server/modules/registrations/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { actionType, payload } = body;

    if (!actionType || !payload) {
      return NextResponse.json(
        { error: "actionType and payload are required" },
        { status: 400 },
      );
    }

    console.info(
      `[SECURITY AUDIT - MUTATION EXECUTED] Admin: ${session.user.email} (${session.user.id}) approved & executed action: ${actionType} at ${new Date().toISOString()}`,
    );

    switch (actionType) {
      case "CREATE_COMPETITION": {
        const row = await createCompetition(payload);
        return NextResponse.json({
          success: true,
          message: `Cabang lomba '${row.title}' berhasil dibuat!`,
          detailUrl: `/dashboard/competitions`,
        });
      }

      case "UPDATE_COMPETITION": {
        const { id, ...updates } = payload;
        if (!id) {
          return NextResponse.json({ error: "ID kompetisi diperlukan" }, { status: 400 });
        }
        const row = await updateCompetition(id, updates);
        if (!row) {
          return NextResponse.json({ error: "Gagal memperbarui kompetisi" }, { status: 404 });
        }
        return NextResponse.json({
          success: true,
          message: `Kompetisi '${row.title}' berhasil diperbarui!`,
          detailUrl: `/dashboard/competitions`,
        });
      }

      case "UPDATE_REGISTRATION_STATUS": {
        const { registrationId, paymentStatus, status, notes } = payload;
        if (!registrationId) {
          return NextResponse.json({ error: "registrationId diperlukan" }, { status: 400 });
        }

        const updates: Record<string, unknown> = {};
        if (paymentStatus) updates.paymentStatus = paymentStatus;
        if (status) updates.status = status;
        if (notes) updates.notes = notes;

        const result = await updateRegistration(registrationId, updates, true);
        if (result.kind !== "ok") {
          return NextResponse.json(
            { error: `Gagal memperbarui pendaftar (${result.kind})` },
            { status: 400 },
          );
        }

        return NextResponse.json({
          success: true,
          message: "Status pendaftaran berhasil diperbarui!",
          detailUrl: `/dashboard/registrations/${registrationId}`,
        });
      }

      case "SET_WINNERS": {
        const { competitionId, winners } = payload;
        if (!competitionId || !Array.isArray(winners)) {
          return NextResponse.json(
            { error: "competitionId dan daftar winners diperlukan" },
            { status: 400 },
          );
        }

        // Reset previous winners for this competition
        await db
          .update(registrations)
          .set({ isWinner: "0", winnerRank: null })
          .where(eq(registrations.competitionId, competitionId));

        // Assign new winners
        for (const w of winners) {
          if (w.registrationId && w.rank) {
            await db
              .update(registrations)
              .set({ isWinner: "1", winnerRank: w.rank })
              .where(eq(registrations.id, w.registrationId));
          }
        }

        revalidateCompetitionPaths(competitionId);
        revalidatePath("/announcements");
        revalidatePath("/");

        return NextResponse.json({
          success: true,
          message: `Juara lomba berhasil ditetapkan dan dipublikasikan ke halaman Pengumuman!`,
          detailUrl: `/announcements`,
        });
      }

      default:
        return NextResponse.json(
          { error: `Tipe aksi '${actionType}' tidak didukung` },
          { status: 400 },
        );
    }
  } catch (error: unknown) {
    console.error("[ai-action-execute] Error:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan saat mengeksekusi aksi AI";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
