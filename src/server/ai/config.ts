import { db } from "@/src/db";
import { aiSettings, type AiSettings } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export interface PublicAiConfig {
  id: string;
  provider: string;
  baseUrl: string;
  model: string;
  temperature: string;
  maxTokens: number;
  systemPrompt: string | null;
  isEnabled: boolean;
  hasApiKey: boolean;
  maskedApiKey: string;
  updatedAt: string;
  updatedBy: string | null;
  telemetry?: {
    totalRequestsChecked: number;
    totalThreatsBlocked: number;
    threatsByType: Record<string, number>;
    circuitBreakerTrips: number;
    activeGuards: string[];
  };
}

export interface UpdateAiConfigInput {
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: string;
  maxTokens?: number;
  systemPrompt?: string | null;
  isEnabled?: boolean;
}

/**
 * Mask API key for secure visual display on frontend.
 * Example: '9r-abc123456789xyz' -> '9r-***xyz'
 */
export function maskApiKey(key: string | null | undefined): string {
  if (!key || key.trim() === "") return "";
  const trimmed = key.trim();
  if (trimmed.length <= 8) return "••••••••";
  const start = trimmed.slice(0, 4);
  const end = trimmed.slice(-4);
  return `${start}••••••••${end}`;
}

/**
 * Get active raw AI settings from database for server-side LLM calls.
 */
export async function getRawAiSettings(): Promise<AiSettings> {
  const existing = await db.query.aiSettings.findFirst({
    where: eq(aiSettings.id, "default"),
  });

  if (existing) {
    return existing;
  }

  // Fallback: initialize row if missing
  const [created] = await db
    .insert(aiSettings)
    .values({
      id: "default",
      provider: "9router",
      baseUrl: "https://api.9router.com/v1",
      model: "gemini-2.0-flash",
      temperature: "0.7",
      maxTokens: 2048,
      isEnabled: true,
    })
    .returning();

  return created;
}

/**
 * Get sanitized AI config for frontend consumption (masks the secret key).
 */
export async function getPublicAiConfig(): Promise<PublicAiConfig> {
  const settings = await getRawAiSettings();
  const rawKey = settings.apiKey || process.env.NINEROUTER_API_KEY || "";

  return {
    id: settings.id,
    provider: settings.provider,
    baseUrl: settings.baseUrl || "https://api.9router.com/v1",
    model: settings.model || "gemini-2.0-flash",
    temperature: settings.temperature || "0.7",
    maxTokens: settings.maxTokens || 2048,
    systemPrompt: settings.systemPrompt,
    isEnabled: settings.isEnabled ?? true,
    hasApiKey: Boolean(rawKey && rawKey.trim().length > 0),
    maskedApiKey: maskApiKey(rawKey),
    updatedAt: settings.updatedAt ? settings.updatedAt.toISOString() : new Date().toISOString(),
    updatedBy: settings.updatedBy,
  };
}

/**
 * Update AI settings in the database.
 */
export async function updateAiSettings(
  input: UpdateAiConfigInput,
  updatedBy?: string,
): Promise<PublicAiConfig> {
  const updateData: Partial<typeof aiSettings.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.provider !== undefined) updateData.provider = input.provider;
  if (input.baseUrl !== undefined) updateData.baseUrl = input.baseUrl.trim();
  if (input.model !== undefined) updateData.model = input.model.trim();
  if (input.temperature !== undefined) updateData.temperature = input.temperature;
  if (input.maxTokens !== undefined) updateData.maxTokens = input.maxTokens;
  if (input.systemPrompt !== undefined) updateData.systemPrompt = input.systemPrompt;
  if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;
  if (updatedBy) updateData.updatedBy = updatedBy;

  // Only update apiKey if a non-masked, non-empty value was provided
  if (input.apiKey !== undefined && input.apiKey.trim() !== "") {
    const cleanKey = input.apiKey.trim();
    // Don't overwrite with masked value
    if (!cleanKey.includes("••••")) {
      updateData.apiKey = cleanKey;
    }
  }

  await db
    .insert(aiSettings)
    .values({
      id: "default",
      ...updateData,
    })
    .onConflictDoUpdate({
      target: aiSettings.id,
      set: updateData,
    });

  return getPublicAiConfig();
}
