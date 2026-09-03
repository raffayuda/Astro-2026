-- Migration: Add competition batches and registration batch_name
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS has_batches text DEFAULT '0';
ALTER TABLE competitions ADD COLUMN IF NOT EXISTS batches jsonb DEFAULT '[]'::jsonb;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS batch_name text;
