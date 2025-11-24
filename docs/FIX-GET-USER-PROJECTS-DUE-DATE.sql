-- =====================================================
-- FIX get_user_projects TO INCLUDE due_date
-- =====================================================
-- This script updates the get_user_projects RPC function
-- to include due_date, project_items, and project_created_at
-- so the dashboard can display all project information correctly.
-- =====================================================

-- Drop and recreate get_user_projects function with due_date
DROP FUNCTION IF EXISTS get_user_projects() CASCADE;

CREATE OR REPLACE FUNCTION get_user_projects()
RETURNS TABLE (
  project_id UUID,
  project_title TEXT,
  project_retailer TEXT,
  project_items JSONB,
  due_date TIMESTAMP WITH TIME ZONE,
  project_created_at TIMESTAMP WITH TIME ZONE,
  project_updated_at TIMESTAMP WITH TIME ZONE,
  permission_level TEXT,
  is_owner BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  -- Projects owned by user
  SELECT 
    p.id as project_id,
    p.title as project_title,
    p.retailer as project_retailer,
    p.items as project_items,
    p.due_date,
    p.created_at as project_created_at,
    p.updated_at as project_updated_at,
    'admin'::TEXT as permission_level,
    true as is_owner
  FROM projects p
  WHERE p.user_id = auth.uid()
  
  UNION ALL
  
  -- Projects where user is collaborator
  SELECT 
    p.id as project_id,
    p.title as project_title,
    p.retailer as project_retailer,
    p.items as project_items,
    p.due_date,
    p.created_at as project_created_at,
    p.updated_at as project_updated_at,
    pc.permission_level,
    false as is_owner
  FROM project_collaborators pc
  JOIN projects p ON p.id = pc.project_id
  WHERE pc.user_id = auth.uid();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_projects TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_projects IS 'Returns all projects the user has access to (owned or collaborated), including due_date, items, and timestamps.';

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ get_user_projects function updated!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Now includes:';
  RAISE NOTICE '✓ due_date';
  RAISE NOTICE '✓ project_items';
  RAISE NOTICE '✓ project_created_at';
  RAISE NOTICE '✓ project_updated_at';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Dashboard should now display due dates correctly!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

