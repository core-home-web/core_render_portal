-- ============================================================================
-- FIX MISSING DATABASE TABLES AND VIEWS
-- ============================================================================
-- This script fixes the missing database components that are causing 404/403 errors
-- Run this in your Supabase SQL Editor after running the previous fixes
-- 
-- Issues being fixed:
-- 1. Missing project_logs table
-- 2. Missing project_collaborators_with_users view  
-- 3. Missing RLS policies for proper access control
-- ============================================================================

-- ============================================================================
-- 1. CREATE PROJECT_LOGS TABLE
-- ============================================================================

-- Drop if exists to avoid conflicts
DROP TABLE IF EXISTS project_logs CASCADE;

-- Create project_logs table for tracking project changes
CREATE TABLE project_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL DEFAULT 'project_updated',
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for project_logs
CREATE INDEX idx_project_logs_project_id ON project_logs(project_id);
CREATE INDEX idx_project_logs_user_id ON project_logs(user_id);
CREATE INDEX idx_project_logs_timestamp ON project_logs(timestamp);

-- Enable RLS on project_logs
ALTER TABLE project_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_logs
CREATE POLICY "Users can view project logs for their projects" ON project_logs
FOR SELECT USING (
  -- Users can see logs for projects they own
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_logs.project_id 
    AND projects.user_id = auth.uid()
  )
  OR
  -- Users can see logs for projects they collaborate on
  EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_collaborators.project_id = project_logs.project_id 
    AND project_collaborators.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert project logs for their projects" ON project_logs
FOR INSERT WITH CHECK (
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

-- ============================================================================
-- 2. CREATE PROJECT_COLLABORATORS_WITH_USERS VIEW
-- ============================================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS project_collaborators_with_users CASCADE;

-- Create view for project_collaborators with user information
CREATE VIEW project_collaborators_with_users AS
SELECT 
  pc.id,
  pc.project_id,
  pc.user_id,
  pc.permission_level,
  pc.invited_by,
  pc.joined_at,
  pc.created_at,
  pc.updated_at,
  u.email as user_email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ) as user_full_name
FROM project_collaborators pc
LEFT JOIN auth.users u ON pc.user_id = u.id;

-- Enable RLS on the view (views inherit RLS from underlying tables)
-- The view will use the RLS policies from project_collaborators table

-- ============================================================================
-- 3. ENSURE PROPER RLS POLICIES FOR COLLABORATION TABLES
-- ============================================================================

-- Fix project_collaborators RLS policies
DROP POLICY IF EXISTS "Users can view their own collaborations" ON project_collaborators;
DROP POLICY IF EXISTS "Project owners can view all collaborators" ON project_collaborators;
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON project_collaborators;

-- Users can view collaborators for projects they have access to
CREATE POLICY "Users can view project collaborators" ON project_collaborators
FOR SELECT USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM project_collaborators pc2
    WHERE pc2.project_id = project_collaborators.project_id 
    AND pc2.user_id = auth.uid()
  )
);

-- Project owners can manage collaborators
CREATE POLICY "Project owners can manage collaborators" ON project_collaborators
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- ============================================================================
-- 4. ENSURE PROPER RLS POLICIES FOR PROJECT_INVITATIONS
-- ============================================================================

-- Fix project_invitations RLS policies
DROP POLICY IF EXISTS "Project owners can manage invitations" ON project_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON project_invitations;

-- Project owners can manage invitations
CREATE POLICY "Project owners can manage invitations" ON project_invitations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_invitations.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Users can view invitations sent to their email
CREATE POLICY "Users can view invitations sent to their email" ON project_invitations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.email = project_invitations.invited_email 
    AND auth.users.id = auth.uid()
  )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this script, verify these components exist:
-- SELECT * FROM information_schema.tables WHERE table_name IN ('project_logs', 'project_collaborators', 'project_invitations');
-- SELECT * FROM information_schema.views WHERE table_name = 'project_collaborators_with_users';
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Missing database tables and views have been created!';
  RAISE NOTICE '📋 Created: project_logs table with proper RLS policies';
  RAISE NOTICE '👥 Created: project_collaborators_with_users view';
  RAISE NOTICE '🔐 Fixed: RLS policies for all collaboration tables';
  RAISE NOTICE '🎯 Project page should now load without console errors';
END $$;
