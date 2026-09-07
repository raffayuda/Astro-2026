-- Add payment_code and payment_code_type for In-App QRIS and checkout display
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "payment_code" text;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "payment_code_type" text;
