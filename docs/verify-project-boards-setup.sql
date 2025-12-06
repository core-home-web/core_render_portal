-- ============================================================================
-- VERIFY PROJECT BOARDS SETUP
-- ============================================================================
-- This script verifies that the project_boards table and functions are set up correctly
-- Run this in your Supabase SQL Editor to diagnose issues
-- ============================================================================

-- Check if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_boards') THEN
    RAISE NOTICE '✅ Table project_boards exists';
  ELSE
    RAISE NOTICE '❌ Table project_boards does NOT exist - Run create-project-boards-table.sql';
  END IF;
END $$;

-- Check if function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'get_or_create_project_board'
  ) THEN
    RAISE NOTICE '✅ Function get_or_create_project_board exists';
  ELSE
    RAISE NOTICE '❌ Function get_or_create_project_board does NOT exist - Run create-project-boards-table.sql';
  END IF;
END $$;

-- Check if save function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'save_project_board'
  ) THEN
    RAISE NOTICE '✅ Function save_project_board exists';
  ELSE
    RAISE NOTICE '❌ Function save_project_board does NOT exist - Run create-project-boards-table.sql';
  END IF;
END $$;

-- Check RLS status
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE tablename = 'project_boards' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE '✅ RLS is enabled on project_boards';
  ELSE
    RAISE NOTICE '⚠️  RLS is NOT enabled on project_boards';
  END IF;
END $$;

-- Check policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'project_boards';
  
  IF policy_count > 0 THEN
    RAISE NOTICE '✅ Found % policies on project_boards', policy_count;
  ELSE
    RAISE NOTICE '❌ No policies found on project_boards - Run create-project-boards-table.sql';
  END IF;
END $$;

-- Show function signature for debugging
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('get_or_create_project_board', 'save_project_board');

-- ============================================================================
-- IF ANY CHECKS FAIL, RUN: docs/create-project-boards-table.sql
-- ============================================================================

