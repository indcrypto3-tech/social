-- 1. Scheduling & Execution
CREATE TABLE IF NOT EXISTS "post_executions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" uuid NOT NULL REFERENCES "scheduled_posts"("id") ON DELETE CASCADE,
  "job_id" text, -- External Job ID (e.g., BullMQ)
  "worker_id" text,
  "status" text NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
  "started_at" timestamp DEFAULT now() NOT NULL,
  "finished_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "job_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "job_id" text NOT NULL,
  "job_type" text NOT NULL,
  "status" text NOT NULL, -- 'success', 'failed'
  "duration_ms" integer,
  "error_message" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "worker_failures" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "worker_id" text,
  "job_id" text,
  "error" text NOT NULL,
  "stack_trace" text,
  "occurred_at" timestamp DEFAULT now() NOT NULL
);

-- 2. Social Accounts Extras
CREATE TABLE IF NOT EXISTS "token_refresh_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "social_account_id" uuid NOT NULL REFERENCES "social_accounts"("id") ON DELETE CASCADE,
  "old_expires_at" timestamp,
  "new_expires_at" timestamp,
  "status" text NOT NULL, -- 'success', 'failed'
  "error_message" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "account_permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "social_account_id" uuid NOT NULL REFERENCES "social_accounts"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "permission_level" text DEFAULT 'viewer' NOT NULL, -- 'admin', 'editor', 'viewer'
  "created_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("social_account_id", "user_id")
);

-- 3. Approvals
CREATE TABLE IF NOT EXISTS "post_approvals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" uuid NOT NULL REFERENCES "scheduled_posts"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "action" approval_status NOT NULL, -- 'approved', 'rejected'
  "comment" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- 4. Analytics
CREATE TABLE IF NOT EXISTS "post_analytics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" uuid NOT NULL REFERENCES "scheduled_posts"("id") ON DELETE CASCADE,
  "platform" platform NOT NULL,
  "metrics" jsonb DEFAULT '{}'::jsonb NOT NULL, -- Stores dynamic metrics: likes, shares, etc.
  "fetched_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "account_analytics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "social_account_id" uuid NOT NULL REFERENCES "social_accounts"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "metrics" jsonb DEFAULT '{}'::jsonb NOT NULL, -- followers, impressions, etc.
  "created_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("social_account_id", "date")
);

-- 5. Media Library Updates
-- Extend existing media_library instead of creating media_assets
ALTER TABLE "media_library" ADD COLUMN IF NOT EXISTS "bucket" text;
ALTER TABLE "media_library" ADD COLUMN IF NOT EXISTS "storage_path" text;
ALTER TABLE "media_library" ADD COLUMN IF NOT EXISTS "mime_type" text; -- redundancy for file_type if needed, or alias
ALTER TABLE "media_library" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'ready'; -- 'uploading', 'processing', 'ready', 'error'

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_post_executions_post_id" ON "post_executions" ("post_id");
CREATE INDEX IF NOT EXISTS "idx_post_analytics_post_id" ON "post_analytics" ("post_id");
CREATE INDEX IF NOT EXISTS "idx_job_history_job_id" ON "job_history" ("job_id");
