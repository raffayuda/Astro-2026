-- Player in-game account ID for esports competitions (e.g. Mobile Legends).
-- The leader gets a dedicated column; members carry `gameId` inside the
-- existing `member_details` JSON rows, so nothing needs backfilling there.
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "leader_game_id" text;
