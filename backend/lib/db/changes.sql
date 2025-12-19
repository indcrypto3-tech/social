-- Add account_type column to social_accounts table
ALTER TABLE social_accounts 
ADD COLUMN IF NOT EXISTS account_type VARCHAR(50) DEFAULT 'profile';
