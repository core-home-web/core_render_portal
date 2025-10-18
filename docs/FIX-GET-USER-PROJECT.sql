-- ============================================================================
-- FIX MISSING get_user_project FUNCTION
-- ============================================================================
-- This script creates the missing get_user_project function that's needed
-- for opening individual projects. Run this in your Supabase SQL Editor.
-- 
-- The issue: The application is calling get_user_project() but this function
-- doesn't exist in the database, causing 404 errors when trying to open projects.
-- ============================================================================

-- Create the missing get_user_project function
CREATE OR REPLACE FUNCTION get_user_project(
  p_project_id UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  retailer TEXT,
  items JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  permission_level TEXT,
  is_owner BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Projects owned by user
  SELECT 
    p.id,
    p.title,
    p.retailer,
    p.items,
    p.user_id,
    p.created_at,
    p.updated_at,
    'admin'::TEXT as permission_level,
    true as is_owner
  FROM projects p
  WHERE p.id = p_project_id AND p.user_id = auth.uid()
  
  UNION ALL
  
  -- Projects where user is collaborator
  SELECT 
    p.id,
    p.title,
    p.retailer,
    p.items,
    p.user_id,
    p.created_at,
    p.updated_at,
    pc.permission_level,
    false as is_owner
  FROM project_collaborators pc
  JOIN projects p ON p.id = pc.project_id
  WHERE p.id = p_project_id AND pc.user_id = auth.uid();
END;
$$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this script, verify the function exists:
-- SELECT routine_name FROM information_schema.routines WHERE routine_name = 'get_user_project';
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ get_user_project function has been created!';
  RAISE NOTICE '🔐 Function includes proper access control for owned and collaborated projects';
  RAISE NOTICE '🎯 Project opening should now work properly';
END $$;
