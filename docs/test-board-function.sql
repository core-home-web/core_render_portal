-- ============================================================================
-- TEST BOARD FUNCTION
-- ============================================================================
-- This script tests the get_or_create_project_board function directly
-- Replace the UUID below with an actual project ID you have access to
-- ============================================================================

-- Test 1: Check if function is callable (this will show permission errors)
DO $$
DECLARE
  test_project_id UUID := '93dd1e48-775a-4fe7-8aff-a675b7099b56'; -- Replace with your project ID
  result_count INTEGER;
BEGIN
  -- Try to call the function
  SELECT COUNT(*) INTO result_count
  FROM get_or_create_project_board(test_project_id);
  
  RAISE NOTICE '✅ Function call succeeded! Returned % row(s)', result_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Function call failed: %', SQLERRM;
    RAISE NOTICE 'Error code: %', SQLSTATE;
END $$;

-- Test 2: Check current user and permissions
DO $$
BEGIN
  RAISE NOTICE 'Current user (auth.uid()): %', auth.uid();
  RAISE NOTICE 'Current role: %', current_user;
END $$;

-- Test 3: Check if user has access to the project
DO $$
DECLARE
  test_project_id UUID := '93dd1e48-775a-4fe7-8aff-a675b7099b56'; -- Replace with your project ID
  is_owner BOOLEAN;
  is_collaborator BOOLEAN;
BEGIN
  -- Check if user is owner
  SELECT EXISTS (
    SELECT 1 FROM projects 
    WHERE id = test_project_id 
    AND user_id = auth.uid()
  ) INTO is_owner;
  
  -- Check if user is collaborator
  SELECT EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_id = test_project_id 
    AND user_id = auth.uid()
  ) INTO is_collaborator;
  
  RAISE NOTICE 'Is project owner: %', is_owner;
  RAISE NOTICE 'Is collaborator: %', is_collaborator;
  RAISE NOTICE 'Has access: %', (is_owner OR is_collaborator);
END $$;

-- Test 4: Check function permissions
SELECT 
  p.proname as function_name,
  p.prosecdef as security_definer,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'get_or_create_project_board';

-- Test 5: Check grants on the function
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name = 'get_or_create_project_board';

