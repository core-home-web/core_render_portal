-- =====================================================
-- FIX PROJECTS TABLE SCHEMA
-- =====================================================
-- Adds missing due_date column and ensures proper structure
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add due_date column if it doesn't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Add project_logo column if it doesn't exist (for legacy support)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_logo TEXT;

-- Verify the table structure
DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ Projects table schema updated!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Columns added:';
  RAISE NOTICE '✓ due_date (TIMESTAMP)';
  RAISE NOTICE '✓ project_logo (TEXT)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Try creating a project again!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

