import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { auth } from "@/src/server/auth";
import { getAiModel } from "@/src/server/ai/provider";
import { aiTools } from "@/src/server/ai/tools";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 1 minute max duration for complex tool calling

const DEFAULT_SYSTEM_PROMPT = `
Kamu adalah ASTRO Copilot, asisten AI operasional resmi untuk panitia dan administrator ASTRO 2026 (Annual STT-NF Real Olympiad).
Tugas utamamu adalah membantu divisi Kompetisi, Kesekretariatan/Pendaftaran, Bendahara, dan Panitia Inti dalam:
1. Menemukan data pendaftar/tim secara akurat, cepat, dan transparan.
2. Memberikan ringkasan statistik keterisian kuota kompetisi dan sisa slot pendaftaran.
3. Menganalisis kendala pembayaran (misal: mendeteksi peserta berstatus 'pending' yang butuh konfirmasi lanjutan).
4. Membantu pembuatan cabang lomba baru dari teks/dokumen juknis informal atau instruksi panitia (via proposeCreateCompetition).
5. Membantu pembaruan jadwal, kuota, biaya, atau status aktif kompetisi (via proposeUpdateCompetition).
6. Membantu verifikasi status pendaftaran dan konfirmasi pembayaran manual (via proposeUpdateRegistrationStatus).
7. Membantu penetapan juara lomba (Juara 1, 2, 3) (via proposeSetWinners).
8. Menyusun laporan audit eksekutif berkala dan rekomendasi taktis untuk rapat panitia (via generateExecutiveReport).
9. Menyediakan ekspor dataset pendaftaran ke format CSV siap unduh langsung di chat (via generateDataExport).

PEDOMAN PERILAKU & KEAMANAN AKSI (HUMAN-IN-THE-LOOP):
- Jawab dalam Bahasa Indonesia yang profesional, jelas, ramah, dan solutif.
- Selalu gunakan tools yang tersedia untuk membaca data, mengajukan proposal aksi, menyusun laporan audit, atau mengekspor CSV.
- JANGAN PERNAH menyatakan bahwa data sudah langsung tersimpan/berubah di database! Selalu sampaikan bahwa kamu telah menyiapkan proposal perubahan dalam kartu konfirmasi aksi dan minta admin untuk memeriksa serta menekan tombol "Setujui & Terapkan".
- Sajikan ringkasan data dalam format Markdown yang rapi: gunakan tabel Markdown atau daftar berpoin terstruktur.
- Jika menampilkan daftar pendaftar, sertakan link detail admin menggunakan format: [Lihat Detail](/dashboard/registrations/<ID_PENDAFTAR>).
- Untuk status pembayaran, gunakan indikator yang jelas:
  • Lunas / Paid: ✅ Lunas
  • Pending: ⏳ Menunggu Pembayaran
  • Failed: ❌ Gagal / Batal
- Cantumkan nomor WhatsApp peserta/ketua jika relevan untuk tindak lanjut panitia.
- Jika data tidak ditemukan, sampaikan dengan jujur tanpa berhalusinasi dan tawarkan variasi kata kunci lain.
`.trim();

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 },
      );
    }

    // Resolve dynamic 9router model configured in PostgreSQL
    const resolvedAi = await getAiModel();

    const systemPrompt = resolvedAi.systemPromptCustom
      ? `${DEFAULT_SYSTEM_PROMPT}\n\nInstruksi Tambahan dari Admin:\n${resolvedAi.systemPromptCustom}`
      : DEFAULT_SYSTEM_PROMPT;

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: resolvedAi.model,
      system: systemPrompt,
      messages: modelMessages,
      tools: aiTools,
      stopWhen: stepCountIs(5),
      temperature: resolvedAi.temperature,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    console.error("[ai-chat] Error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan saat memproses permintaan AI";

    const isConfigMissing =
      message.toLowerCase().includes("api key") ||
      message.toLowerCase().includes("dinonaktifkan");

    return NextResponse.json(
      {
        error: message,
        needsConfig: isConfigMissing,
      },
      { status: isConfigMissing ? 400 : 500 },
    );
  }
}
