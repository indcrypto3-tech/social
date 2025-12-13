
-- ============================================
-- FIX: Robust Storage Policies (Path-Based)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Drop existing policies to start fresh and avoid conflicts
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "User Update" ON storage.objects;
DROP POLICY IF EXISTS "User Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload by User Folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update by User Folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete by User Folder" ON storage.objects;

-- 2. Ensure the 'media' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Public Read Access (View files)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'media' );

-- 4. Authenticated Upload (Path Strategy)
-- Allows upload ONLY if the file path starts with the User's UUID.
-- Example: "user_uuid/image.jpg" -> Allowed
-- Example: "other_uuid/image.jpg" -> LEAK PREVENTION (Denied)
CREATE POLICY "Allow Upload by User Folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Update/Delete (Path Strategy)
CREATE POLICY "Allow Update by User Folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow Delete by User Folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
