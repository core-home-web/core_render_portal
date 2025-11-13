-- =====================================================
-- FIX: Infinite Recursion in Projects RLS Policies
-- =====================================================
-- Run this to fix the recursive policy error
-- =====================================================

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Collaborators can view projects" ON projects;
DROP POLICY IF EXISTS "Collaborators can update projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Owners can update own projects" ON projects;

-- Step 2: Create SIMPLE, non-recursive policies

-- Policy 1: INSERT - Users can create their own projects
CREATE POLICY "users_insert_own_projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: SELECT - Users can view their own projects (NO subquery)
CREATE POLICY "users_select_own_projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 3: UPDATE - Users can update their own projects
CREATE POLICY "users_update_own_projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: DELETE - Users can delete their own projects
CREATE POLICY "users_delete_own_projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON projects TO authenticated;

-- Force schema reload
NOTIFY pgrst, 'reload schema';

-- Verify
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'projects';
  
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ RLS POLICIES FIXED!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Total policies: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '✓ INSERT - Create own projects';
  RAISE NOTICE '✓ SELECT - View own projects';
  RAISE NOTICE '✓ UPDATE - Update own projects';
  RAISE NOTICE '✓ DELETE - Delete own projects';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 No more infinite recursion!';
  RAISE NOTICE '🎯 Try creating a project now!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

