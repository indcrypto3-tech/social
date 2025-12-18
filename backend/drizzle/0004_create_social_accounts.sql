-- Migration: Create social_accounts table
-- Description: Stores OAuth tokens and profile info for linked social platforms.
-- Links directly to auth.users to support Supabase Auth interactions.

-- Ensure platform enum exists
DO $$ BEGIN
    CREATE TYPE "public"."platform" AS ENUM('facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop existing table if exists to clean up old FK references to public.users
-- WARNING: This will cascade to foreign keys in post_destinations
DROP TABLE IF EXISTS "public"."social_accounts" CASCADE;

-- Create social_accounts table
CREATE TABLE "public"."social_accounts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL,
    "platform" "public"."platform" NOT NULL,
    "platform_account_id" varchar NOT NULL,
    "account_name" varchar,
    "access_token" text NOT NULL,
    "refresh_token" text,
    "token_expires_at" timestamp,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,

    -- Foreign Key referencing auth.users directly
    CONSTRAINT "social_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE,

    -- Constraint to ensure one platform account is linked to only one user (or at least unique in the system)
    CONSTRAINT "social_accounts_platform_platform_account_id_key" UNIQUE ("platform", "platform_account_id")
);

-- Indexes for performance
CREATE INDEX "social_accounts_user_id_idx" ON "public"."social_accounts" ("user_id");
-- Unique index on platform info is implicitly created by the constraint, but explicit index is good for lookups if they differ
CREATE INDEX "social_accounts_lookup_idx" ON "public"."social_accounts" ("platform", "platform_account_id");

-- Comments for documentation
COMMENT ON TABLE "public"."social_accounts" IS 'Stores tokens and metadata for linked social media accounts.';
COMMENT ON COLUMN "public"."social_accounts"."user_id" IS 'References the Supabase auth.users(id).';
COMMENT ON COLUMN "public"."social_accounts"."platform" IS 'The social platform (twitter, facebook, etc.).';
COMMENT ON COLUMN "public"."social_accounts"."platform_account_id" IS 'Unique identifier from the provider (e.g. Twitter User ID).';
COMMENT ON COLUMN "public"."social_accounts"."access_token" IS 'OAuth Access Token used for API requests.';
COMMENT ON COLUMN "public"."social_accounts"."refresh_token" IS 'OAuth Refresh Token (if available) for renewing access.';
COMMENT ON COLUMN "public"."social_accounts"."token_expires_at" IS 'Timestamp when the access token expires.';
