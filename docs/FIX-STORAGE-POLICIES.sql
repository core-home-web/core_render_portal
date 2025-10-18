-- ============================================================================
-- FIX STORAGE POLICIES FOR PROJECT FILES BUCKET
-- ============================================================================
-- This script fixes the storage policies to allow service role uploads
-- Run this in your Supabase SQL Editor
-- 
-- The issue: Service role uploads are being rejected due to missing or
-- incorrect storage policies for the project-files bucket.
-- ============================================================================

-- First, drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for project files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Project owners can update their files" ON storage.objects;
DROP POLICY IF EXISTS "Project owners can delete their files" ON storage.objects;

-- Create comprehensive policies for project-files bucket

-- 1. Allow public read access (needed for serving files)
CREATE POLICY "Public read access for project files" ON storage.objects
FOR SELECT USING (bucket_id = 'project-files');

-- 2. Allow service role to upload (for admin API calls)
CREATE POLICY "Service role can upload project files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-files' 
  AND auth.role() = 'service_role'
);

-- 3. Allow authenticated users to upload (for client-side uploads if needed)
CREATE POLICY "Authenticated users can upload project files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);

-- 4. Allow service role to update files
CREATE POLICY "Service role can update project files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'service_role'
);

-- 5. Allow authenticated users to update files (optional)
CREATE POLICY "Authenticated users can update project files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);

-- 6. Allow service role to delete files
CREATE POLICY "Service role can delete project files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'service_role'
);

-- 7. Allow authenticated users to delete files (optional)
CREATE POLICY "Authenticated users can delete project files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this script, check that your bucket has the right policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%project files%';
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies for project-files bucket have been fixed!';
  RAISE NOTICE '🔐 Policies created for both service_role and authenticated users';
  RAISE NOTICE '📁 Public read access enabled for serving files';
  RAISE NOTICE '🎯 Photo uploads should now work properly';
END $$;
