-- Add profile_image to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add due_date to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Create index on due_date for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);

-- Grant permissions
GRANT SELECT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, UPDATE ON projects TO authenticated;

-- Update RLS policies to allow users to update their own profile images
CREATE POLICY "Users can update their own profile image"
ON user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Comments
COMMENT ON COLUMN user_profiles.profile_image IS 'URL to user profile image uploaded to Supabase Storage';
COMMENT ON COLUMN projects.due_date IS 'Project due date for tracking and sorting';

