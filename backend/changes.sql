ALTER TABLE "social_accounts" ADD COLUMN IF NOT EXISTS "account_type" varchar DEFAULT 'profile';
ALTER TABLE "social_accounts" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires_at" timestamp NOT NULL,
  "ip_address" varchar(45),
  "user_agent" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add approval status enum
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'none');

-- Add approval fields to scheduled_posts
ALTER TABLE "scheduled_posts" ADD COLUMN "approval_status" approval_status DEFAULT 'none' NOT NULL;
ALTER TABLE "scheduled_posts" ADD COLUMN "reviewed_by" uuid REFERENCES "users"("id");
ALTER TABLE "scheduled_posts" ADD COLUMN "reviewed_at" timestamp;
