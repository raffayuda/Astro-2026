-- Migration: Add guidebook_sections to competitions
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS guidebook_sections jsonb DEFAULT '[]'::jsonb;
