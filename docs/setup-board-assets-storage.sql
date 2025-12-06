-- ============================================================================
-- BOARD ASSETS STORAGE BUCKET SETUP
-- ============================================================================
-- This script creates the storage bucket for whiteboard assets (images, files)
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run" or press Cmd+Enter / Ctrl+Enter
-- ============================================================================

-- Step 1: Create the board-assets bucket
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'board-assets',
  'board-assets',
  true,  -- Public bucket for easy access to assets
  52428800,  -- 50MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm'];

-- Step 2: Create storage policies
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can upload board assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can view board assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their board assets" ON storage.objects;

-- Policy: Authenticated users can upload assets to their project folders
CREATE POLICY "Users can upload board assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'board-assets'
  AND auth.role() = 'authenticated'
  AND (
    -- Check if user owns the project or is a collaborator with edit access
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id::text = (storage.foldername(name))[1]
      AND projects.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_collaborators.project_id::text = (storage.foldername(name))[1]
      AND project_collaborators.user_id = auth.uid()
      AND project_collaborators.permission_level IN ('edit', 'admin')
    )
  )
);

-- Policy: Anyone can view assets (public bucket)
CREATE POLICY "Users can view board assets" ON storage.objects
FOR SELECT USING (
  bucket_id = 'board-assets'
);

-- Policy: Users can delete assets from projects they have access to
CREATE POLICY "Users can delete their board assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'board-assets'
  AND auth.role() = 'authenticated'
  AND (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id::text = (storage.foldername(name))[1]
      AND projects.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_collaborators.project_id::text = (storage.foldername(name))[1]
      AND project_collaborators.user_id = auth.uid()
      AND project_collaborators.permission_level IN ('edit', 'admin')
    )
  )
);

-- Policy: Users can update assets in projects they have access to
CREATE POLICY "Users can update board assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'board-assets'
  AND auth.role() = 'authenticated'
  AND (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id::text = (storage.foldername(name))[1]
      AND projects.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_collaborators.project_id::text = (storage.foldername(name))[1]
      AND project_collaborators.user_id = auth.uid()
      AND project_collaborators.permission_level IN ('edit', 'admin')
    )
  )
);

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- The board-assets bucket is now ready for use.
-- Assets will be organized by project: board-assets/{project_id}/{filename}
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Board assets storage bucket setup complete!';
  RAISE NOTICE '📦 Bucket created: board-assets';
  RAISE NOTICE '🔐 Storage policies configured for authenticated users';
  RAISE NOTICE '📤 Max file size: 50MB';
  RAISE NOTICE '🖼️  Allowed types: JPEG, PNG, GIF, WebP, SVG, MP4, WebM';
END $$;
