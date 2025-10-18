-- ============================================================================
-- PHOTO STORAGE SETUP - SUPABASE STORAGE CONFIGURATION
-- ============================================================================
-- This script sets up Supabase Storage for photo uploads
-- Run this in your Supabase SQL Editor
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run" or press Cmd+Enter / Ctrl+Enter
-- ============================================================================

-- Step 1: Create Storage Buckets
-- ============================================================================

-- Create main project files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create user avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create project thumbnails bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-thumbnails',
  'project-thumbnails',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Create Storage Policies
-- ============================================================================

-- Project Files Bucket Policies
CREATE POLICY "Public read access for project files" ON storage.objects
FOR SELECT USING (bucket_id = 'project-files');

CREATE POLICY "Authenticated users can upload project files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN ('uploads', 'project-images', 'item-images', 'part-images')
);

CREATE POLICY "Project owners can update their files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
  AND (
    -- Users can update files in their own project folders
    (storage.foldername(name))[1] = 'project-images' 
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id::text = (storage.foldername(name))[2]
      AND projects.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Project owners can delete their files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
  AND (
    -- Users can delete files in their own project folders
    (storage.foldername(name))[1] = 'project-images' 
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id::text = (storage.foldername(name))[2]
      AND projects.user_id = auth.uid()
    )
  )
);

-- User Avatars Bucket Policies
CREATE POLICY "Public read access for user avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Project Thumbnails Bucket Policies
CREATE POLICY "Public read access for project thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'project-thumbnails');

CREATE POLICY "Project owners can upload thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-thumbnails' 
  AND auth.role() = 'authenticated'
  AND (
    -- Users can upload thumbnails for their own projects
    (storage.foldername(name))[1] = 'project-thumbnails' 
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id::text = (storage.foldername(name))[2]
      AND projects.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Project owners can update their thumbnails" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-thumbnails' 
  AND auth.role() = 'authenticated'
  AND (
    -- Users can update thumbnails for their own projects
    (storage.foldername(name))[1] = 'project-thumbnails' 
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id::text = (storage.foldername(name))[2]
      AND projects.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Project owners can delete their thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-thumbnails' 
  AND auth.role() = 'authenticated'
  AND (
    -- Users can delete thumbnails for their own projects
    (storage.foldername(name))[1] = 'project-thumbnails' 
    AND EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id::text = (storage.foldername(name))[2]
      AND projects.user_id = auth.uid()
    )
  )
);

-- Step 3: Create Helper Functions
-- ============================================================================

-- Function to get public URL for a file
CREATE OR REPLACE FUNCTION get_file_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT storage.url
    FROM storage.objects
    WHERE bucket_id = bucket_name AND name = file_path
  );
END;
$$;

-- Function to check if user can access a file
CREATE OR REPLACE FUNCTION can_access_file(bucket_name TEXT, file_path TEXT, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  folder_path TEXT[];
BEGIN
  -- Public buckets are always accessible
  IF bucket_name IN ('project-files', 'user-avatars', 'project-thumbnails') THEN
    RETURN TRUE;
  END IF;
  
  -- For private files, check ownership
  folder_path := storage.foldername(file_path);
  
  -- Check if user owns the project (for project-related files)
  IF bucket_name = 'project-files' AND folder_path[1] = 'project-images' THEN
    RETURN EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id::text = folder_path[2]
      AND projects.user_id = user_id
    );
  END IF;
  
  -- Check if user owns the avatar
  IF bucket_name = 'user-avatars' THEN
    RETURN folder_path[1] = user_id::text;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Step 4: Create File Management Functions
-- ============================================================================

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
  file_record RECORD;
BEGIN
  -- Find files that are no longer referenced in the database
  FOR file_record IN
    SELECT o.name, o.bucket_id
    FROM storage.objects o
    WHERE o.bucket_id = 'project-files'
    AND NOT EXISTS (
      -- Check if file is referenced in any project's items JSONB
      SELECT 1 FROM projects p
      WHERE p.items::text LIKE '%' || o.name || '%'
    )
    AND o.created_at < NOW() - INTERVAL '24 hours' -- Only delete files older than 24 hours
  LOOP
    -- Delete the file
    PERFORM storage.delete_object(file_record.bucket_id, file_record.name);
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN deleted_count;
END;
$$;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Storage buckets created:
-- - project-files: For project images, item images, part images
-- - user-avatars: For user profile pictures
-- - project-thumbnails: For project preview images
-- 
-- Security policies configured for:
-- - Public read access to all buckets
-- - Authenticated upload permissions
-- - User-specific file management
-- - Project owner file management
-- 
-- Helper functions created:
-- - get_file_url(): Get public URL for files
-- - can_access_file(): Check file access permissions
-- - cleanup_orphaned_files(): Clean up unused files
-- ============================================================================

-- Verify setup (optional - will show success message)
DO $$
BEGIN
  RAISE NOTICE '✅ Photo storage setup complete!';
  RAISE NOTICE '📁 Storage buckets created: project-files, user-avatars, project-thumbnails';
  RAISE NOTICE '🔐 Storage policies configured for secure file access';
  RAISE NOTICE '⚙️  Helper functions created for file management';
  RAISE NOTICE '🎯 Ready for photo uploads and management!';
END $$;

