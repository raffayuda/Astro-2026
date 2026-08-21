CREATE TABLE "certificate_templates" (
  "id" SERIAL PRIMARY KEY,
  "competition_id" text NOT NULL REFERENCES "competitions"("id") ON DELETE CASCADE,
  "rank" text NOT NULL,
  "template_image_url" text NOT NULL,
  "text_overlays" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "is_active" text DEFAULT '1',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "certificate_templates_competition_id_rank_unique" UNIQUE ("competition_id", "rank")
);

CREATE INDEX "certificate_templates_competition_id_idx" ON "certificate_templates" ("competition_id");

ALTER TABLE "registrations" ADD COLUMN "certificate_generated_at" timestamp;
ALTER TABLE "registrations" ADD COLUMN "certificate_template_version" integer;
