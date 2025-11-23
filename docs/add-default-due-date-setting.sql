-- Add default due date settings to user_profiles table
-- Users can set a default time frame (value 1-99 + unit: days/weeks/months)
-- Default: 30 days

-- Add default_due_date_value column (1-99)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS default_due_date_value INTEGER DEFAULT 30;

-- Add constraint to ensure value is between 1 and 99
ALTER TABLE user_profiles
ADD CONSTRAINT check_default_due_date_value 
CHECK (default_due_date_value IS NULL OR (default_due_date_value >= 1 AND default_due_date_value <= 99));

-- Add default_due_date_unit column (days, weeks, or months)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS default_due_date_unit TEXT DEFAULT 'days';

-- Add constraint to ensure unit is valid
ALTER TABLE user_profiles
ADD CONSTRAINT check_default_due_date_unit 
CHECK (default_due_date_unit IS NULL OR default_due_date_unit IN ('days', 'weeks', 'months'));

-- Update existing users to have default values (30 days)
UPDATE user_profiles
SET 
  default_due_date_value = 30,
  default_due_date_unit = 'days'
WHERE default_due_date_value IS NULL OR default_due_date_unit IS NULL;

-- Add comments
COMMENT ON COLUMN user_profiles.default_due_date_value IS 'Default number of time units for project due dates (1-99)';
COMMENT ON COLUMN user_profiles.default_due_date_unit IS 'Default time unit for project due dates: days, weeks, or months';
