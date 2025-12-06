-- ============================================================================
-- VERIFY COLLABORATORS FUNCTION
-- ============================================================================
-- This script helps verify that get_project_collaborators_with_users is working
-- Replace the project_id below with an actual project ID you have access to
-- ============================================================================

-- Set a test project ID (replace with your actual project ID)
DO $$
DECLARE
  test_project_id UUID := '93dd1e48-775a-4fe7-8aff-a675b7099b56'; -- Replace with your project ID
  current_user_id UUID;
  is_owner BOOLEAN;
  is_collaborator BOOLEAN;
  collaborator_count INTEGER;
  function_result_count INTEGER;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  RAISE NOTICE 'Current user ID: %', current_user_id;
  
  -- Check if project exists
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = test_project_id) THEN
    RAISE NOTICE '❌ Project does not exist: %', test_project_id;
    RETURN;
  ELSE
    RAISE NOTICE '✅ Project exists: %', test_project_id;
  END IF;
  
  -- Check if user is owner
  SELECT EXISTS (
    SELECT 1 FROM projects 
    WHERE id = test_project_id 
    AND user_id = current_user_id
  ) INTO is_owner;
  
  RAISE NOTICE 'Is project owner: %', is_owner;
  
  -- Check if user is collaborator
  SELECT EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_id = test_project_id 
    AND user_id = current_user_id
  ) INTO is_collaborator;
  
  RAISE NOTICE 'Is collaborator: %', is_collaborator;
  
  -- Check total collaborators for this project
  SELECT COUNT(*) INTO collaborator_count
  FROM project_collaborators
  WHERE project_id = test_project_id;
  
  RAISE NOTICE 'Total collaborators in project: %', collaborator_count;
  
  -- Test the function
  SELECT COUNT(*) INTO function_result_count
  FROM get_project_collaborators_with_users(test_project_id);
  
  RAISE NOTICE 'Function returned % row(s)', function_result_count;
  
  IF function_result_count = 0 AND collaborator_count > 0 THEN
    RAISE NOTICE '⚠️  WARNING: Project has % collaborators but function returned 0 rows', collaborator_count;
    RAISE NOTICE 'This might indicate an access/permission issue';
  ELSIF function_result_count = 0 AND collaborator_count = 0 THEN
    RAISE NOTICE '✅ Expected: No collaborators in project, function correctly returns 0 rows';
  ELSE
    RAISE NOTICE '✅ Function is working correctly!';
  END IF;
  
END $$;

-- Test the function directly (uncomment and replace project_id to test)
-- SELECT * FROM get_project_collaborators_with_users('93dd1e48-775a-4fe7-8aff-a675b7099b56');

-- Check all projects you have access to
SELECT 
  p.id,
  p.title,
  p.user_id as owner_id,
  CASE 
    WHEN p.user_id = auth.uid() THEN 'Owner'
    ELSE 'Collaborator'
  END as access_type,
  (SELECT COUNT(*) FROM project_collaborators WHERE project_id = p.id) as collaborator_count
FROM projects p
WHERE p.user_id = auth.uid()
   OR EXISTS (
     SELECT 1 FROM project_collaborators 
     WHERE project_id = p.id AND user_id = auth.uid()
   )
ORDER BY p.created_at DESC
LIMIT 10;

