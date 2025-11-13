-- =====================================================
-- VERIFY PROJECTS TABLE RLS POLICIES
-- =====================================================
-- Check if RLS is blocking project creation
-- Run this in Supabase SQL Editor to diagnose
-- =====================================================

-- Check if RLS is enabled on projects table
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'projects';

-- List all policies on projects table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'projects';

-- Check projects table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Test: Try to see if current user can insert
-- (This will show what the authenticated role can do)
SELECT 
  has_table_privilege('projects', 'INSERT') as can_insert,
  has_table_privilege('projects', 'SELECT') as can_select,
  has_table_privilege('projects', 'UPDATE') as can_update,
  has_table_privilege('projects', 'DELETE') as can_delete;

