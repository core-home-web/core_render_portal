-- ============================================================================
-- FIX PROJECT_COLLABORATORS_WITH_USERS VIEW (406 Error)
-- ============================================================================
-- The 406 error occurs because PostgREST cannot expose auth.users through views
-- This script creates a SECURITY DEFINER function that can safely access auth.users
-- ============================================================================

-- Drop the problematic view
DROP VIEW IF EXISTS project_collaborators_with_users CASCADE;

-- Option 1: Create a function-based approach (recommended)
-- This function can access auth.users because it's SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_project_collaborators_with_users(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  user_id UUID,
  permission_level TEXT,
  invited_by UUID,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_email TEXT,
  user_full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to this project
  IF NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.id = p_project_id AND p.user_id = auth.uid()
    UNION
    SELECT 1 FROM project_collaborators pc 
    WHERE pc.project_id = p_project_id AND pc.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to project';
  END IF;

  -- Return collaborators with user info
  RETURN QUERY
  SELECT 
    pc.id,
    pc.project_id,
    pc.user_id,
    pc.permission_level,
    pc.invited_by,
    pc.joined_at,
    pc.created_at,
    pc.updated_at,
    u.email::TEXT as user_email,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      split_part(u.email, '@', 1)
    )::TEXT as user_full_name
  FROM project_collaborators pc
  LEFT JOIN auth.users u ON pc.user_id = u.id
  WHERE pc.project_id = p_project_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_project_collaborators_with_users(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_collaborators_with_users(UUID) TO anon;

-- Note: We're not creating a view because:
-- 1. user_profiles table doesn't have email column (email is in auth.users)
-- 2. PostgREST blocks views that join with auth.users (causes 406 errors)
-- 3. The RPC function (created above) is the recommended and working solution
-- 
-- The function get_project_collaborators_with_users() can safely access auth.users
-- and will be used by the application code automatically.

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test the function:
-- SELECT * FROM get_project_collaborators_with_users('your-project-id-here');
--
-- If view exists, test it:
-- SELECT * FROM project_collaborators_with_users WHERE project_id = 'your-project-id-here';
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Fixed project_collaborators_with_users access issue';
  RAISE NOTICE '📋 Function created: get_project_collaborators_with_users(project_id)';
  RAISE NOTICE '🔑 Execute permissions granted';
END $$;

