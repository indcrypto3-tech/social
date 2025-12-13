
-- ============================================
-- FIX: "Allow All" Policy for Media Bucket
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Ensure 'media' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. DANGEROUS: Drop ALL existing policies on storage.objects to remove conflicts
-- WARNING: This affects all buckets if you don't recreate their policies. 
-- Assuming 'media' is the only critical bucket for now.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow Any Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "User Update" ON storage.objects;
DROP POLICY IF EXISTS "User Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload by User Folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update by User Folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete by User Folder" ON storage.objects;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON storage.objects;

-- 3. Create a Simple "Allow All" Policy for Authenticated Users
-- This allows any logged-in user to Insert, Update, Select, Delete 
-- ANYTHING in the 'media' bucket.
CREATE POLICY "Enable all access for authenticated users"
ON storage.objects
FOR ALL
TO authenticated
USING ( bucket_id = 'media' )
WITH CHECK ( bucket_id = 'media' );

-- 4. Create Public Read Access (for viewing images)
CREATE POLICY "Public Read Access"
ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'media' );
