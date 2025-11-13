-- =====================================================
-- VERIFY AND FIX PROJECTS TABLE SCHEMA
-- =====================================================
-- This will check if columns exist and add them if missing
-- Then force a schema reload
-- =====================================================

-- Step 1: Check current columns
DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🔍 CHECKING PROJECTS TABLE COLUMNS';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
END $$;

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Step 2: Add due_date if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'due_date'
    ) THEN
        ALTER TABLE projects 
        ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✅ Added due_date column';
    ELSE
        RAISE NOTICE '✓ due_date column already exists';
    END IF;
END $$;

-- Step 3: Force reload schema cache
NOTIFY pgrst, 'reload schema';

-- Step 4: Verify again
DO $$
DECLARE
  due_date_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'due_date'
  ) INTO due_date_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ VERIFICATION COMPLETE';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'due_date column: %', CASE WHEN due_date_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
  RAISE NOTICE '';
  
  IF due_date_exists THEN
    RAISE NOTICE '🎯 Schema reloaded! Try creating project now!';
  ELSE
    RAISE NOTICE '⚠️  Column still missing - contact support';
  END IF;
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

