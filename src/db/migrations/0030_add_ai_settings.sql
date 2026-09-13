-- 0030_add_ai_settings.sql
-- Create ai_settings table for storing 9router / LLM configuration directly in PostgreSQL
CREATE TABLE IF NOT EXISTS "ai_settings" (
    "id" text PRIMARY KEY DEFAULT 'default',
    "provider" text NOT NULL DEFAULT '9router',
    "api_key" text,
    "base_url" text DEFAULT 'https://api.9router.com/v1',
    "model" text DEFAULT 'gemini-2.0-flash',
    "temperature" text DEFAULT '0.7',
    "max_tokens" integer DEFAULT 2048,
    "system_prompt" text,
    "is_enabled" boolean DEFAULT true,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "updated_by" text
);

-- Seed default singleton row if not exists
INSERT INTO "ai_settings" ("id", "provider", "base_url", "model", "is_enabled")
VALUES ('default', '9router', 'https://api.9router.com/v1', 'gemini-2.0-flash', true)
ON CONFLICT ("id") DO NOTHING;
