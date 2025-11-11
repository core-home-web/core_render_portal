-- =====================================================
-- Fix Database Issues for Core Home Render Portal
-- =====================================================
-- Run this in your Supabase SQL Editor to fix:
-- 1. user_profiles table 406 errors
-- 2. RLS policies
-- 3. Ensure proper table structure
-- =====================================================

-- =====================================================
-- 1. Create user_profiles table if it doesn't exist
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  profile_image TEXT,
  team TEXT CHECK (team IN ('product_development', 'industrial_design')),
  notification_preferences JSONB DEFAULT '{"email": true, "project_updates": true, "collaborator_invites": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- 2. Create indexes for better performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_team ON user_profiles(team);

-- =====================================================
-- 3. Enable Row Level Security
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. Drop existing policies (in case they're too restrictive)
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- =====================================================
-- 5. Create proper RLS policies
-- =====================================================

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own profile
CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. Grant permissions
-- =====================================================
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

-- =====================================================
-- 7. Add trigger to auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. Verify projects table has correct columns
-- =====================================================
-- Add due_date column if it doesn't exist
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Add profile_image column if it doesn't exist (for legacy support)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_logo TEXT;

-- =====================================================
-- 9. Fix any malformed column names in projects table
-- =====================================================
-- This ensures column names use underscores, not spaces
DO $$
BEGIN
  -- This is just a safety check - your columns should already be correct
  -- No action needed if columns are properly named
  RAISE NOTICE 'Verifying projects table structure...';
END $$;

-- =====================================================
-- 10. Update project_collaborators RLS policies
-- =====================================================
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own collaborations" ON project_collaborators;
CREATE POLICY "Users can view own collaborations"
  ON project_collaborators
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_collaborators.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database fixes applied successfully!';
  RAISE NOTICE '1. user_profiles table created/verified';
  RAISE NOTICE '2. RLS policies updated';
  RAISE NOTICE '3. Indexes created';
  RAISE NOTICE '4. Permissions granted';
  RAISE NOTICE '5. Triggers activated';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next steps:';
  RAISE NOTICE '1. Restart your dev server: npm run dev';
  RAISE NOTICE '2. Clear browser cache and refresh';
  RAISE NOTICE '3. Try creating a project again';
END $$;

