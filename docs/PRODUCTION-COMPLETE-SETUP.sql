-- =====================================================
-- COMPLETE PRODUCTION DATABASE SETUP
-- =====================================================
-- Run this ONCE on core_render_portal_production
-- Project: erasycqfdjlhdgovtrxi
-- =====================================================

-- =====================================================
-- STEP 1: Add due_date column to projects table
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' 
        AND column_name = 'due_date'
    ) THEN
        ALTER TABLE projects 
        ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE '✅ Added due_date column to projects';
    ELSE
        RAISE NOTICE '✓ due_date column already exists';
    END IF;
END $$;

-- =====================================================
-- STEP 2: Setup RLS Policies for Projects Table
-- =====================================================

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
DROP POLICY IF EXISTS "Collaborators can view projects" ON projects;
DROP POLICY IF EXISTS "Collaborators can update projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Owners can update own projects" ON projects;

-- Policy 1: Users can INSERT their own projects
CREATE POLICY "Authenticated users can insert own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can SELECT their own projects
CREATE POLICY "Users can view own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = projects.id
      AND user_id = auth.uid()
    )
  );

-- Policy 3: Owners can UPDATE their own projects
CREATE POLICY "Owners can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Collaborators with edit/admin can UPDATE projects
CREATE POLICY "Collaborators can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = projects.id
      AND user_id = auth.uid()
      AND permission_level IN ('edit', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_collaborators
      WHERE project_id = projects.id
      AND user_id = auth.uid()
      AND permission_level IN ('edit', 'admin')
    )
  );

-- Policy 5: Owners can DELETE their own projects
CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions to authenticated role
GRANT ALL ON projects TO authenticated;

-- =====================================================
-- STEP 3: Setup user_profiles table (if not exists)
-- =====================================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  team TEXT DEFAULT 'product_development' CHECK (team IN ('product_development', 'industrial_design')),
  profile_image TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- STEP 4: Create trigger for auto-creating user profiles
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, team, display_name)
  VALUES (
    NEW.id,
    'product_development',
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STEP 5: Migrate existing users to user_profiles
-- =====================================================

INSERT INTO user_profiles (user_id, team, display_name)
SELECT 
  id,
  'product_development' as team,
  COALESCE(raw_user_meta_data->>'full_name', email) as display_name
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- STEP 6: Force schema reload
-- =====================================================

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- STEP 7: Verify Everything
-- =====================================================

DO $$
DECLARE
  due_date_exists BOOLEAN;
  user_profiles_exists BOOLEAN;
  projects_policies_count INTEGER;
  user_profiles_count INTEGER;
  users_count INTEGER;
BEGIN
  -- Check due_date column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'due_date'
  ) INTO due_date_exists;
  
  -- Check user_profiles table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_profiles'
  ) INTO user_profiles_exists;
  
  -- Count policies
  SELECT COUNT(*) INTO projects_policies_count
  FROM pg_policies
  WHERE tablename = 'projects';
  
  -- Count user profiles
  SELECT COUNT(*) INTO user_profiles_count
  FROM user_profiles;
  
  -- Count auth users
  SELECT COUNT(*) INTO users_count
  FROM auth.users;
  
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ PRODUCTION DATABASE SETUP COMPLETE!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Projects Table:';
  RAISE NOTICE '  due_date column: %', CASE WHEN due_date_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
  RAISE NOTICE '  RLS policies: % policies', projects_policies_count;
  RAISE NOTICE '';
  RAISE NOTICE 'User Profiles:';
  RAISE NOTICE '  user_profiles table: %', CASE WHEN user_profiles_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
  RAISE NOTICE '  Profiles created: %', user_profiles_count;
  RAISE NOTICE '  Auth users: %', users_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Production database is ready!';
  RAISE NOTICE '🎯 Try creating a project now!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- Show final projects table schema
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

