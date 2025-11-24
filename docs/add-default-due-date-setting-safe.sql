-- Safe version: Add default due date settings to user_profiles table
-- This version checks if columns/constraints exist before adding them
-- Use this if you get "already exists" errors

-- Add default_due_date_value column (1-99) - only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'default_due_date_value'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN default_due_date_value INTEGER DEFAULT 30;
    RAISE NOTICE '✅ Added default_due_date_value column';
  ELSE
    RAISE NOTICE '✅ default_due_date_value column already exists';
  END IF;
END $$;

-- Add constraint to ensure value is between 1 and 99 - only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'user_profiles' 
    AND constraint_name = 'check_default_due_date_value'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT check_default_due_date_value 
    CHECK (default_due_date_value IS NULL OR (default_due_date_value >= 1 AND default_due_date_value <= 99));
    RAISE NOTICE '✅ Added check_default_due_date_value constraint';
  ELSE
    RAISE NOTICE '✅ check_default_due_date_value constraint already exists';
  END IF;
END $$;

-- Add default_due_date_unit column (days, weeks, or months) - only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'default_due_date_unit'
  ) THEN
    ALTER TABLE user_profiles 
    ADD COLUMN default_due_date_unit TEXT DEFAULT 'days';
    RAISE NOTICE '✅ Added default_due_date_unit column';
  ELSE
    RAISE NOTICE '✅ default_due_date_unit column already exists';
  END IF;
END $$;

-- Add constraint to ensure unit is valid - only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'user_profiles' 
    AND constraint_name = 'check_default_due_date_unit'
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT check_default_due_date_unit 
    CHECK (default_due_date_unit IS NULL OR default_due_date_unit IN ('days', 'weeks', 'months'));
    RAISE NOTICE '✅ Added check_default_due_date_unit constraint';
  ELSE
    RAISE NOTICE '✅ check_default_due_date_unit constraint already exists';
  END IF;
END $$;

-- Update existing users to have default values (30 days) - only if they're NULL
UPDATE user_profiles
SET 
  default_due_date_value = 30,
  default_due_date_unit = 'days'
WHERE default_due_date_value IS NULL OR default_due_date_unit IS NULL;

-- Add comments (will update if they already exist)
COMMENT ON COLUMN user_profiles.default_due_date_value IS 'Default number of time units for project due dates (1-99)';
COMMENT ON COLUMN user_profiles.default_due_date_unit IS 'Default time unit for project due dates: days, weeks, or months';

