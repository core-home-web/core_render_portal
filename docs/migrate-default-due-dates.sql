-- Migration script to set default due dates for existing projects
-- This script:
-- 1. Fixes projects with NULL created_at dates (sets to NOW())
-- 2. Sets default due dates for projects with NULL due_date based on user's default settings
-- 3. Uses user's default_due_date_value and default_due_date_unit if set, otherwise defaults to 30 days

-- Step 1: Fix projects with NULL created_at dates
UPDATE projects 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Step 2: Set default due dates for projects with NULL due_date
-- This uses the user's default settings from user_profiles
UPDATE projects p
SET due_date = CASE 
  -- If user has weeks as unit
  WHEN up.default_due_date_unit = 'weeks' THEN 
    p.created_at + (up.default_due_date_value || ' weeks')::INTERVAL
  -- If user has months as unit
  WHEN up.default_due_date_unit = 'months' THEN 
    p.created_at + (up.default_due_date_value || ' months')::INTERVAL
  -- Default to days (either user has 'days' or NULL)
  ELSE 
    p.created_at + (COALESCE(up.default_due_date_value, 30) || ' days')::INTERVAL
END
FROM user_profiles up
WHERE p.due_date IS NULL
  AND p.user_id = up.user_id
  AND p.created_at IS NOT NULL;

-- Step 3: For projects where user_profiles doesn't exist, use default 30 days
UPDATE projects p
SET due_date = p.created_at + INTERVAL '30 days'
WHERE p.due_date IS NULL
  AND p.created_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = p.user_id
  );

-- Summary query to verify the migration
SELECT 
  COUNT(*) as total_projects,
  COUNT(CASE WHEN due_date IS NULL THEN 1 END) as projects_without_due_date,
  COUNT(CASE WHEN created_at IS NULL THEN 1 END) as projects_without_created_at
FROM projects;

