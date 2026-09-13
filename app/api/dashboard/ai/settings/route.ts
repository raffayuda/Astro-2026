import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/src/server/auth";
import { getPublicAiConfig, updateAiSettings } from "@/src/server/ai/config";
import { testAiConnection } from "@/src/server/ai/provider";
import { getSecurityTelemetry } from "@/src/server/ai/guardrails";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/ai/settings
 * Fetch sanitized AI configuration for admin view.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await getPublicAiConfig();
    const telemetry = getSecurityTelemetry();
    return NextResponse.json({ ...config, telemetry });
  } catch (error: unknown) {
    console.error("[ai-settings] GET error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil konfigurasi AI" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/dashboard/ai/settings
 * Save AI configuration or test 9router connection.
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Test connection action
    if (body.action === "test") {
      const testResult = await testAiConnection(body.apiKey, body.baseUrl, body.model);
      return NextResponse.json(testResult);
    }

    // Update settings
    const updated = await updateAiSettings(
      {
        provider: body.provider,
        apiKey: body.apiKey,
        baseUrl: body.baseUrl,
        model: body.model,
        temperature: body.temperature,
        maxTokens: body.maxTokens ? Number(body.maxTokens) : undefined,
        systemPrompt: body.systemPrompt,
        isEnabled: body.isEnabled,
      },
      session.user.email || session.user.name || "admin",
    );

    return NextResponse.json({
      success: true,
      message: "Pengaturan AI berhasil diperbarui",
      data: updated,
    });
  } catch (error: unknown) {
    console.error("[ai-settings] POST error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan konfigurasi AI" },
      { status: 500 },
    );
  }
}
