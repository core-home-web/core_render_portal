-- ============================================================================
-- FIX BOARD FUNCTION PERMISSIONS
-- ============================================================================
-- This script grants execute permissions on the board functions
-- Run this if you're getting 400 errors even though the functions exist
-- ============================================================================

-- Grant execute permissions on functions to authenticated and anon roles
GRANT EXECUTE ON FUNCTION get_or_create_project_board(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_project_board(UUID) TO anon;
GRANT EXECUTE ON FUNCTION save_project_board(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION save_project_board(UUID, JSONB) TO anon;

-- Verify grants
SELECT 
  grantee,
  routine_name,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name IN ('get_or_create_project_board', 'save_project_board')
ORDER BY routine_name, grantee;

DO $$
BEGIN
  RAISE NOTICE '✅ Execute permissions granted on board functions';
  RAISE NOTICE '📋 Check the query results above to verify grants';
END $$;

