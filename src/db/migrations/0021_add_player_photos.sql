-- Player photos: opt-in per competition (esports needs a photo per player),
-- stored per registration as leader photo + member details.
ALTER TABLE "competitions" ADD COLUMN IF NOT EXISTS "player_photo_required" text DEFAULT '0';

ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "leader_photo_url" text;
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "member_details" jsonb DEFAULT '[]'::jsonb NOT NULL;

-- Mobile Legends requires a photo for every player (slug differs per environment).
UPDATE "competitions" SET "player_photo_required" = '1'
WHERE "id" IN ('mlbb-tournament', 'mobile-legends-mlbb');
