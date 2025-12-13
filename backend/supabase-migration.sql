-- ============================================
-- Social Media Scheduler - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Migration 0000: Initial Schema
-- ============================================

-- Create ENUMS
CREATE TYPE "public"."destination_status" AS ENUM('pending', 'success', 'failed');
CREATE TYPE "public"."platform" AS ENUM('facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok');
CREATE TYPE "public"."post_status" AS ENUM('draft', 'scheduled', 'publishing', 'published', 'failed');
CREATE TYPE "public"."role" AS ENUM('admin', 'editor', 'viewer');
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'pro', 'business');

-- Create Tables
CREATE TABLE "media_library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"url" text NOT NULL,
	"file_type" varchar NOT NULL,
	"file_size" integer,
	"file_name" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "post_destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"social_account_id" uuid NOT NULL,
	"status" "destination_status" DEFAULT 'pending' NOT NULL,
	"platform_post_id" varchar,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "scheduled_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text,
	"scheduled_at" timestamp NOT NULL,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"platform_configs" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "social_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" "platform" NOT NULL,
	"platform_account_id" varchar NOT NULL,
	"account_name" varchar,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"password_hash" varchar,
	"subscription_tier" "subscription_tier" DEFAULT 'free',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Add Foreign Keys
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "post_destinations" ADD CONSTRAINT "post_destinations_post_id_scheduled_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."scheduled_posts"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "post_destinations" ADD CONSTRAINT "post_destinations_social_account_id_social_accounts_id_fk" FOREIGN KEY ("social_account_id") REFERENCES "public"."social_accounts"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "scheduled_posts" ADD CONSTRAINT "scheduled_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Migration 0001: Analytics & Notifications
-- ============================================

CREATE TABLE "analytics_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" "platform" NOT NULL,
	"followers" integer DEFAULT 0 NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"engagement" integer DEFAULT 0 NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_post_failed" boolean DEFAULT true NOT NULL,
	"email_post_published" boolean DEFAULT true NOT NULL,
	"weekly_digest" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "publish_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"platform" "platform" NOT NULL,
	"status" text NOT NULL,
	"error_code" text,
	"error_message" text,
	"attempt" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add columns to existing tables
ALTER TABLE "scheduled_posts" ADD COLUMN "media_urls" jsonb;
ALTER TABLE "users" ADD COLUMN "timezone" varchar(50) DEFAULT 'UTC';
ALTER TABLE "users" ADD COLUMN "avatar_url" text;
ALTER TABLE "users" ADD COLUMN "subscription_plan" text;
ALTER TABLE "users" ADD COLUMN "subscription_status" text;
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" text;
ALTER TABLE "users" ADD COLUMN "refresh_at" timestamp;

-- Add Foreign Keys
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "publish_logs" ADD CONSTRAINT "publish_logs_post_id_scheduled_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."scheduled_posts"("id") ON DELETE cascade ON UPDATE no action;

-- Add Indexes
CREATE UNIQUE INDEX "platform_account_id_idx" ON "social_accounts" USING btree ("platform","platform_account_id");

-- Migration 0002: Teams & Notifications
-- ============================================

CREATE TYPE "public"."notification_type" AS ENUM('post_failed', 'post_published', 'weekly_digest');
CREATE TYPE "public"."team_role" AS ENUM('owner', 'editor', 'viewer');

CREATE TABLE "notification_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"payload" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "team_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "team_role" DEFAULT 'viewer' NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_invites_token_unique" UNIQUE("token")
);

CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "team_role" DEFAULT 'viewer' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"invited_at" timestamp DEFAULT now()
);

CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add Foreign Keys
ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "team_invites" ADD CONSTRAINT "team_invites_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Add Indexes
CREATE UNIQUE INDEX "unique_team_member" ON "team_members" USING btree ("team_id","user_id");

-- ============================================
-- Migration Complete!
-- ============================================
