-- =====================================================
-- FIX PROJECTS TABLE RLS POLICIES
-- =====================================================
-- Ensures authenticated users can create/read/update projects
-- Run this in Supabase SQL Editor if you get 400 errors
-- =====================================================

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Drop existing policies (clean slate)
-- =====================================================
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Collaborators can view projects" ON projects;
DROP POLICY IF EXISTS "Collaborators can update projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert own projects" ON projects;

-- =====================================================
-- Create comprehensive RLS policies
-- =====================================================

-- Policy 1: Users can INSERT their own projects
CREATE POLICY "Authenticated users can insert own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can SELECT their own projects
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = projects.id
      AND user_id = auth.uid()
    )
  );

-- Policy 3: Owners can UPDATE their own projects
CREATE POLICY "Owners can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Collaborators with edit/admin can UPDATE projects
CREATE POLICY "Collaborators can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = projects.id
      AND user_id = auth.uid()
      AND permission_level IN ('edit', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = projects.id
      AND user_id = auth.uid()
      AND permission_level IN ('edit', 'admin')
    )
  );

-- Policy 5: Owners can DELETE their own projects
CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- Grant permissions to authenticated role
-- =====================================================
GRANT ALL ON projects TO authenticated;

-- =====================================================
-- Verify policies were created
-- =====================================================
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'projects';
  
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ PROJECTS RLS POLICIES UPDATED!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Total policies: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Policies created:';
  RAISE NOTICE '✓ INSERT - Authenticated users can create projects';
  RAISE NOTICE '✓ SELECT - Users can view own + collaborated projects';
  RAISE NOTICE '✓ UPDATE - Owners and editors can update';
  RAISE NOTICE '✓ DELETE - Owners can delete';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Try creating a project now!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;


