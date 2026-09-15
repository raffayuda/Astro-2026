import { createOpenAI } from "@ai-sdk/openai";
import { getRawAiSettings } from "./config";

export interface ResolvedAiModel {
  model: ReturnType<ReturnType<typeof createOpenAI>["chat"]>;
  modelName: string;
  temperature: number;
  maxTokens: number;
  systemPromptCustom: string | null;
  baseURL: string;
}

/**
 * Initialize 9router dynamic provider using configuration loaded from the database.
 */
export async function getAiModel(): Promise<ResolvedAiModel> {
  const settings = await getRawAiSettings();
  const apiKey = (settings.apiKey || process.env.NINEROUTER_API_KEY || "").trim();
  const baseURL = (settings.baseUrl || process.env.NINEROUTER_BASE_URL || "https://api.9router.com/v1").trim();
  const modelName = (settings.model || process.env.NINEROUTER_MODEL || "gemini-2.0-flash").trim();

  if (!apiKey) {
    throw new Error(
      "Kunci API belum dikonfigurasi. Silakan buka Pengaturan AI di dashboard untuk memasukkan API Key Anda.",
    );
  }

  if (settings.isEnabled === false) {
    throw new Error(
      "AI Assistant sedang dinonaktifkan oleh administrator. Anda dapat mengaktifkannya kembali di menu Pengaturan AI.",
    );
  }

  const routerProvider = createOpenAI({
    baseURL,
    apiKey,
  });

  return {
    model: routerProvider.chat(modelName),
    modelName,
    temperature: parseFloat(settings.temperature || "0.2") || 0.2,
    maxTokens: settings.maxTokens || 8192,
    systemPromptCustom: settings.systemPrompt,
    baseURL,
  };
}

/**
 * Quick connection test to verify if AI endpoint and API key work.
 */
export async function testAiConnection(customKey?: string, customUrl?: string, customModel?: string) {
  const settings = await getRawAiSettings();
  const apiKey = (customKey || settings.apiKey || process.env.NINEROUTER_API_KEY || "").trim();
  const baseURL = (customUrl || settings.baseUrl || process.env.NINEROUTER_BASE_URL || "https://api.9router.com/v1").trim();
  const modelName = (customModel || settings.model || process.env.NINEROUTER_MODEL || "gemini-2.0-flash").trim();

  if (!apiKey) {
    return {
      success: false,
      message: "Kunci API kosong. Masukkan API Key terlebih dahulu.",
    };
  }

  try {
    // Send a lightweight test request
    const response = await fetch(`${baseURL.replace(/\/+$/, "")}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const text = await response.text();
      return {
        success: false,
        message: `Koneksi gagal (${response.status}): ${text.slice(0, 150)}`,
      };
    }

    return {
      success: true,
      message: `Koneksi gateway AI berhasil terhubung (Model: ${modelName})`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghubungi server AI";
    return {
      success: false,
      message: `Error koneksi: ${message}`,
    };
  }
}
