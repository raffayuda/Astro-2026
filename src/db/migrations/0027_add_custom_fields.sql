ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "custom_fields" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "custom_fields" jsonb DEFAULT '{}'::jsonb;
