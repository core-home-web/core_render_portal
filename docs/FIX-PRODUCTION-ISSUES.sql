-- =====================================================
-- FIX PRODUCTION ISSUES - Run in Supabase SQL Editor
-- =====================================================
-- This script fixes multiple production errors:
-- 1. Removes project_logo from update_user_project RPC function
-- 2. Adds profile_image column to user_profiles if missing
-- =====================================================

-- =====================================================
-- PART 1: Fix update_user_project RPC function
-- =====================================================
-- Drop the existing function first (required when changing return type)
DROP FUNCTION IF EXISTS update_user_project(uuid, text, text, timestamp with time zone, jsonb);

-- Removes project_logo column reference (column doesn't exist)
CREATE OR REPLACE FUNCTION update_user_project(
  p_project_id UUID,
  p_title TEXT,
  p_retailer TEXT,
  p_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  retailer TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  items JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_has_permission BOOLEAN;
BEGIN
  -- Get the current user's ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user has permission to update this project
  -- User must be owner OR have edit/admin permissions
  SELECT EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = p_project_id
    AND (
      p.user_id = v_user_id  -- User is owner
      OR EXISTS (
        SELECT 1 FROM project_collaborators pc
        WHERE pc.project_id = p_project_id
        AND pc.user_id = v_user_id
        AND pc.permission_level IN ('edit', 'admin')
      )
    )
  ) INTO v_has_permission;

  IF NOT v_has_permission THEN
    RAISE EXCEPTION 'You do not have permission to update this project';
  END IF;

  -- Update the project
  RETURN QUERY
  UPDATE projects
  SET 
    title = p_title,
    retailer = p_retailer,
    due_date = p_due_date,
    items = p_items,
    updated_at = NOW()
  WHERE projects.id = p_project_id
  RETURNING 
    projects.id,
    projects.title,
    projects.retailer,
    projects.due_date,
    projects.items,
    projects.user_id,
    projects.created_at,
    projects.updated_at;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_user_project TO authenticated;

-- Add comment
COMMENT ON FUNCTION update_user_project IS 'Updates a project with permission checks. Allows owner or users with edit/admin permissions. Includes due_date parameter. Removed project_logo column reference.';

-- =====================================================
-- PART 2: Add profile_image column to user_profiles
-- =====================================================
-- Add profile_image column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add comment
COMMENT ON COLUMN user_profiles.profile_image IS 'URL to user profile image uploaded to Supabase Storage';

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Production fixes applied!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Fixed:';
  RAISE NOTICE '✓ update_user_project RPC function (removed project_logo)';
  RAISE NOTICE '✓ Added profile_image column to user_profiles';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Try saving a project now!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

