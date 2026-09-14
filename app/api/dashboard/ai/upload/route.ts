import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/src/server/auth";
import { parseUploadedDocument } from "@/src/server/ai/document-parser";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/dashboard/ai/upload
 * Secure document & file parsing endpoint for ASTRO Copilot.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Berkas tidak ditemukan dalam permintaan" },
        { status: 400 },
      );
    }

    const fileName = (file as any).name || "dokumen-unggah.txt";
    const result = await parseUploadedDocument(file, fileName);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("[ai-upload] Error parsing file:", error);
    const message = error instanceof Error ? error.message : "Gagal mengurai isi berkas";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
