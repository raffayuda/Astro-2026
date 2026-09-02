-- SumoPod payment gateway: link a registration to its created payment link.
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "payment_link_id" uuid;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "payment_link_url" text;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "payment_expires_at" timestamp;
