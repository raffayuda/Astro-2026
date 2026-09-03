-- User Invitations: links for inviting new administrators and users
CREATE TABLE IF NOT EXISTS "user_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL UNIQUE,
	"email" text,
	"role" text DEFAULT 'admin' NOT NULL,
	"invited_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"used_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "user_invitations_token_idx" ON "user_invitations" ("token");
CREATE INDEX IF NOT EXISTS "user_invitations_email_idx" ON "user_invitations" ("email");
CREATE INDEX IF NOT EXISTS "user_invitations_invited_by_idx" ON "user_invitations" ("invited_by_id");
