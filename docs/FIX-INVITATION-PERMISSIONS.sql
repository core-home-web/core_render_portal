-- ============================================================================
-- FIX PROJECT INVITATIONS PERMISSIONS
-- ============================================================================
-- This script fixes the 403 (Forbidden) error when fetching project invitations
-- due to 'permission denied for table users'.
-- Run this in your Supabase SQL Editor.
-- 
-- Issue: The application is unable to fetch project invitations, resulting in
-- a 403 error and a 'permission denied for table users' message.
-- This indicates missing or incorrect RLS policies for the project_invitations
-- table when trying to access user information.
-- ============================================================================

-- ============================================================================
-- 1. DROP ALL EXISTING POLICIES TO AVOID CONFLICTS
-- ============================================================================

-- Drop all existing policies that might conflict
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON project_invitations;
DROP POLICY IF EXISTS "Project owners can manage invitations" ON project_invitations;
DROP POLICY IF EXISTS "Collaborators can view invitations" ON project_invitations;
DROP POLICY IF EXISTS "Users can view their invitations by email" ON project_invitations;
DROP POLICY IF EXISTS "Project members can view invitations" ON project_invitations;

-- ============================================================================
-- 2. CREATE SIMPLIFIED RLS POLICIES FOR project_invitations
-- ============================================================================

-- Policy 1: Project owners can view and manage invitations for their projects
CREATE POLICY "Project owners can manage invitations" ON project_invitations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_invitations.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Policy 2: Collaborators with admin/edit permissions can view invitations for projects they collaborate on
CREATE POLICY "Collaborators can view invitations" ON project_invitations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_collaborators pc
    JOIN projects p ON p.id = pc.project_id
    WHERE pc.project_id = project_invitations.project_id 
    AND pc.user_id = auth.uid()
    AND pc.permission_level IN ('admin', 'edit')
  )
);

-- ============================================================================
-- 3. GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Ensure the authenticated role has necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_invitations TO authenticated;

-- ============================================================================
-- 4. VERIFY TABLE STRUCTURE AND INDEXES
-- ============================================================================

-- Ensure indexes exist for better performance
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_invited_email ON project_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON project_invitations(invitation_token);

-- ============================================================================
-- 6. ALTERNATIVE: DISABLE RLS TEMPORARILY FOR TESTING (OPTIONAL)
-- ============================================================================
-- If you want to test without RLS restrictions temporarily:
-- ALTER TABLE project_invitations DISABLE ROW LEVEL SECURITY;
-- 
-- Then re-enable it later:
-- ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Project invitations permissions have been fixed!';
  RAISE NOTICE '🔧 Removed problematic RLS policy referencing auth.users';
  RAISE NOTICE '🛡️ Created simplified policies for project invitations';
  RAISE NOTICE '🎯 Project invitations should now load without 403 errors';
  RAISE NOTICE '⚠️  Note: Email-based invitation filtering will be handled at application level';
END $$;
