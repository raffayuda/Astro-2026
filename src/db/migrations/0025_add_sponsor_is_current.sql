ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS is_current boolean DEFAULT false NOT NULL;
ALTER TABLE media_partners ADD COLUMN IF NOT EXISTS is_current boolean DEFAULT false NOT NULL;
