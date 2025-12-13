
-- ============================================
-- Fix: Storage Policies for Media Bucket (Idempotent)
-- ============================================

DO $$
BEGIN
    -- 1. Ensure the 'media' bucket exists and is public
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('media', 'media', true)
    ON CONFLICT (id) DO UPDATE SET public = true;

    -- 2. Allow public access to view files
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access') THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'media' );
    END IF;

    -- 3. Allow authenticated users to upload files
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated Upload') THEN
        CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'media' AND auth.uid() = owner );
    END IF;

    -- 4. Allow users to update their own files
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'User Update') THEN
        CREATE POLICY "User Update" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'media' AND auth.uid() = owner );
    END IF;

    -- 5. Allow users to delete their own files
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'User Delete') THEN
        CREATE POLICY "User Delete" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'media' AND auth.uid() = owner );
    END IF;

END
$$;
