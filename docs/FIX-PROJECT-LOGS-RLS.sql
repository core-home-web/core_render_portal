-- =====================================================
-- FIX PROJECT_LOGS RLS POLICIES FOR DUE DATE LOGGING
-- =====================================================
-- This script ensures that:
-- 1. Users can INSERT logs for projects they own or collaborate on (with edit/admin)
-- 2. All collaborators (including viewers) can VIEW logs
-- 3. Logs are properly displayed in Project History
-- =====================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view project logs" ON project_logs;
DROP POLICY IF EXISTS "Users can insert project logs" ON project_logs;
DROP POLICY IF EXISTS "Users can view project logs for their projects" ON project_logs;
DROP POLICY IF EXISTS "Users can insert project logs for their projects" ON project_logs;

-- =====================================================
-- POLICY 1: SELECT - All collaborators can view logs
-- =====================================================
CREATE POLICY "Users can view project logs" ON project_logs
FOR SELECT USING (
  -- Users can see logs for projects they own
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_logs.project_id 
    AND projects.user_id = auth.uid()
  )
  OR
  -- Users can see logs for projects they collaborate on (any permission level)
  EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_collaborators.project_id = project_logs.project_id 
    AND project_collaborators.user_id = auth.uid()
  )
);

-- =====================================================
-- POLICY 2: INSERT - Owners and editors/admins can insert logs
-- =====================================================
CREATE POLICY "Users can insert project logs" ON project_logs
FOR INSERT WITH CHECK (
  -- Must be inserting as themselves
  user_id = auth.uid() AND
  (
    -- Can log for projects they own
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_logs.project_id 
      AND projects.user_id = auth.uid()
    )
    OR
    -- Can log for projects they collaborate on with edit/admin permissions
    EXISTS (
      SELECT 1 FROM project_collaborators 
      WHERE project_collaborators.project_id = project_logs.project_id 
      AND project_collaborators.user_id = auth.uid()
      AND project_collaborators.permission_level IN ('edit', 'admin')
    )
  )
);

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Project logs RLS policies updated!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Policies:';
  RAISE NOTICE '✓ All collaborators can VIEW logs';
  RAISE NOTICE '✓ Owners and editors/admins can INSERT logs';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Due date changes should now be logged and visible!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

