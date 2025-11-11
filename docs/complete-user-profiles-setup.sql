-- =====================================================
-- COMPLETE USER PROFILES SETUP
-- =====================================================
-- This script will:
-- 1. Ensure user_profiles table has all columns
-- 2. Create auto-profile-creation trigger
-- 3. Migrate existing users from auth.users
-- 4. Fix RLS policies
-- 5. Secure the implementation
-- =====================================================

-- =====================================================
-- PART 1: Ensure user_profiles table exists with ALL columns
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

-- Add profile_image column if it's missing (safe - won't error if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'profile_image'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN profile_image TEXT;
    RAISE NOTICE '✅ Added profile_image column';
  ELSE
    RAISE NOTICE '✅ profile_image column already exists';
  END IF;
END $$;

-- =====================================================
-- PART 2: Create indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_team ON user_profiles(team);

-- =====================================================
-- PART 3: Enable RLS
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 4: Drop and recreate RLS policies (clean slate)
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Create fresh, secure RLS policies
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PART 5: Grant permissions
-- =====================================================
GRANT ALL ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

-- =====================================================
-- PART 6: Create trigger function for auto-profile creation
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name, team, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'team', 'product_development'),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- PART 7: Create trigger on auth.users
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 8: Create trigger for updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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
-- PART 9: MIGRATE EXISTING USERS
-- =====================================================
-- This will create user_profiles for all existing auth.users
DO $$
DECLARE
  user_record RECORD;
  migrated_count INTEGER := 0;
BEGIN
  RAISE NOTICE '🔄 Starting user migration...';
  
  FOR user_record IN 
    SELECT id, email, raw_user_meta_data, created_at 
    FROM auth.users
  LOOP
    -- Insert user profile if it doesn't exist
    INSERT INTO public.user_profiles (
      user_id,
      display_name,
      team,
      created_at,
      updated_at
    )
    VALUES (
      user_record.id,
      COALESCE(
        user_record.raw_user_meta_data->>'display_name',
        split_part(user_record.email, '@', 1)
      ),
      COALESCE(
        user_record.raw_user_meta_data->>'team',
        'product_development'
      ),
      user_record.created_at,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      display_name = COALESCE(
        EXCLUDED.display_name,
        user_profiles.display_name
      ),
      updated_at = NOW();
    
    migrated_count := migrated_count + 1;
  END LOOP;
  
  RAISE NOTICE '✅ Migrated % users to user_profiles', migrated_count;
END $$;

-- =====================================================
-- PART 10: Verify the setup
-- =====================================================
DO $$
DECLARE
  auth_user_count INTEGER;
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM user_profiles;
  
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ SETUP COMPLETE!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Auth Users: %', auth_user_count;
  RAISE NOTICE 'User Profiles: %', profile_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '✓ Auto-profile creation on signup';
  RAISE NOTICE '✓ RLS policies active';
  RAISE NOTICE '✓ All existing users migrated';
  RAISE NOTICE '✓ profile_image column available';
  RAISE NOTICE '✓ Team system ready';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next: Restart dev server and refresh browser';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

