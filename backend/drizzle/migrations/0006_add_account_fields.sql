-- Migration: Add missing fields to social_accounts
-- Description: Adds account_type and is_active columns which are present in Drizzle schema but missing in DB.

ALTER TABLE "social_accounts" ADD COLUMN IF NOT EXISTS "account_type" varchar DEFAULT 'profile';
ALTER TABLE "social_accounts" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;
