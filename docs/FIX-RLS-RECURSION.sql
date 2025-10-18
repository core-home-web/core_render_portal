-- ============================================================================
-- FIX RLS POLICY RECURSION ISSUE
-- ============================================================================
-- This script fixes the infinite recursion error in project_collaborators RLS policies
-- Run this in your Supabase SQL Editor
-- 
-- Issue: "infinite recursion detected in policy for relation 'project_collaborators'"
-- This happens when RLS policies reference the same table they're protecting
-- ============================================================================

-- ============================================================================
-- 1. FIX PROJECT_COLLABORATORS RLS POLICIES
-- ============================================================================

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Users can view project collaborators" ON project_collaborators;
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON project_collaborators;

-- Create simpler policies that avoid recursion
-- Users can view collaborators for projects they have access to
CREATE POLICY "Users can view their own collaboration records" ON project_collaborators
FOR SELECT USING (auth.uid() = user_id);

-- Project owners can view all collaborators for their projects (using projects table only)
CREATE POLICY "Project owners can view all collaborators" ON project_collaborators
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Project owners can manage collaborators (insert, update, delete)
CREATE POLICY "Project owners can manage collaborators" ON project_collaborators
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- ============================================================================
-- 2. FIX PROJECT_LOGS RLS POLICIES
-- ============================================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view project logs for their projects" ON project_logs;
DROP POLICY IF EXISTS "Users can insert project logs for their projects" ON project_logs;

-- Create simpler policies without recursion
CREATE POLICY "Users can view project logs" ON project_logs
FOR SELECT USING (
  -- Users can see logs they created
  auth.uid() = user_id
  OR
  -- Or logs for projects they own
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_logs.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert project logs" ON project_logs
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_logs.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- ============================================================================
-- 3. ENSURE PROJECT_INVITATIONS POLICIES ARE WORKING
-- ============================================================================

-- Refresh the project_invitations policies to make sure they work
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
-- 4. UPDATE THE COLLABORATORS VIEW
-- ============================================================================

-- Drop and recreate the view to ensure it works with new policies
DROP VIEW IF EXISTS project_collaborators_with_users CASCADE;

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

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this script, the infinite recursion error should be resolved
-- Test by refreshing the project page and checking the console
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policy recursion issues have been fixed!';
  RAISE NOTICE '🔧 Simplified policies to avoid infinite recursion';
  RAISE NOTICE '👥 Fixed project_collaborators policies';
  RAISE NOTICE '📋 Fixed project_logs policies';
  RAISE NOTICE '🎯 Project logs and collaborators should now load properly';
END $$;
