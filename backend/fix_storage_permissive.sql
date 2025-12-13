
-- ============================================
-- FIX: Permissive Storage Policy (Debug Mode)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Reset Policies for 'media' bucket
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "User Update" ON storage.objects;
DROP POLICY IF EXISTS "User Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload by User Folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update by User Folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete by User Folder" ON storage.objects;

-- 2. Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Public Read Access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media' );

-- 4. Simple Authenticated Write Access
-- This allows ANY logged-in user to upload ANY file to the 'media' bucket
-- If this works, the previous path-based policy was the issue.
CREATE POLICY "Allow Any Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'media' );

-- 5. Simple Authenticated Update/Delete (Own files only)
-- We'll keep the owner CHECK for update/delete to prevent users modifying others' files
CREATE POLICY "Allow Own Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'media' AND auth.uid() = owner );

CREATE POLICY "Allow Own Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'media' AND auth.uid() = owner );
