# Chapter 10: Database Migrations

This chapter provides the complete, annotated SQL scripts needed to set up the entire database from scratch. Run these scripts in order in the Supabase SQL Editor.

---

## Migration Strategy

The Core Render Portal uses a single comprehensive setup script approach:

1. **One master script** for initial setup
2. **Incremental scripts** for updates/fixes
3. **Safe to re-run** - uses `IF NOT EXISTS` and `ON CONFLICT`

---

## Running Migrations

### Step 1: Access SQL Editor

1. Go to your Supabase Dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New query**

### Step 2: Run the Script

1. Copy the script below
2. Paste into the SQL Editor
3. Click **Run** (or Cmd+Enter / Ctrl+Enter)
4. Wait for completion

---

## Complete Production Setup Script

This is the master script to create everything from scratch:

```sql
-- ============================================================================
-- CORE RENDER PORTAL - COMPLETE DATABASE SETUP
-- ============================================================================
-- Version: 1.0.0
-- Last Updated: December 2024
-- 
-- This script sets up the complete database schema including:
-- - All tables with proper relationships
-- - Row Level Security policies
-- - Database functions (RPCs)
-- - Storage buckets and policies
-- - Triggers for auto-updating timestamps
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run" or press Cmd+Enter / Ctrl+Enter
-- 5. Wait for completion (may take 30-60 seconds)
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE TABLES
-- ============================================================================

-- Projects table (core entity)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  retailer TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB DEFAULT '[]',
  collaboration_enabled BOOLEAN DEFAULT true,
  public_view BOOLEAN DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  team TEXT CHECK (team IN ('product_development', 'industrial_design')),
  profile_image TEXT,
  default_due_date_value INTEGER DEFAULT 14,
  default_due_date_unit TEXT DEFAULT 'days' CHECK (default_due_date_unit IN ('days', 'weeks', 'months')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project collaborators table
CREATE TABLE IF NOT EXISTS project_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'admin')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Project invitations table
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'admin')),
  invitation_token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, invited_email)
);

-- Project logs table (audit trail)
CREATE TABLE IF NOT EXISTS project_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project boards table (whiteboard snapshots)
CREATE TABLE IF NOT EXISTS project_boards (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  board_snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PART 2: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_invited_email ON project_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON project_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_expires_at ON project_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_project_logs_project_id ON project_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_logs_timestamp ON project_logs(timestamp DESC);

-- ============================================================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_boards ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 4: CREATE RLS POLICIES
-- ============================================================================

-- Projects policies
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects" ON projects
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Collaborators can view shared projects" ON projects;
CREATE POLICY "Collaborators can view shared projects" ON projects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_collaborators.project_id = projects.id 
    AND project_collaborators.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
CREATE POLICY "Users can create their own projects" ON projects
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects" ON projects
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects" ON projects
FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Project collaborators policies
DROP POLICY IF EXISTS "Users can view their own collaborations" ON project_collaborators;
CREATE POLICY "Users can view their own collaborations" ON project_collaborators
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Project owners can view all collaborators" ON project_collaborators;
CREATE POLICY "Project owners can view all collaborators" ON project_collaborators
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Project owners can manage collaborators" ON project_collaborators;
CREATE POLICY "Project owners can manage collaborators" ON project_collaborators
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Project invitations policies
DROP POLICY IF EXISTS "Project owners can manage invitations" ON project_invitations;
CREATE POLICY "Project owners can manage invitations" ON project_invitations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_invitations.project_id 
    AND projects.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON project_invitations;
CREATE POLICY "Users can view invitations sent to their email" ON project_invitations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.email = project_invitations.invited_email 
    AND auth.users.id = auth.uid()
  )
);

-- Project logs policies
DROP POLICY IF EXISTS "Project owners can view logs" ON project_logs;
CREATE POLICY "Project owners can view logs" ON project_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_logs.project_id
    AND projects.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Collaborators can view logs" ON project_logs;
CREATE POLICY "Collaborators can view logs" ON project_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_logs.project_id
    AND project_collaborators.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated users can insert logs" ON project_logs;
CREATE POLICY "Authenticated users can insert logs" ON project_logs
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Project boards policies
DROP POLICY IF EXISTS "Project owners can access boards" ON project_boards;
CREATE POLICY "Project owners can access boards" ON project_boards
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_boards.project_id
    AND projects.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Collaborators can view boards" ON project_boards;
CREATE POLICY "Collaborators can view boards" ON project_boards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_boards.project_id
    AND project_collaborators.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Collaborators with edit can update boards" ON project_boards;
CREATE POLICY "Collaborators with edit can update boards" ON project_boards
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_boards.project_id
    AND project_collaborators.user_id = auth.uid()
    AND project_collaborators.permission_level IN ('edit', 'admin')
  )
);

-- ============================================================================
-- PART 5: CREATE TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_boards_updated_at ON project_boards;
CREATE TRIGGER update_project_boards_updated_at
    BEFORE UPDATE ON project_boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 6: CREATE DATABASE FUNCTIONS
-- ============================================================================

-- Get all projects for current user
CREATE OR REPLACE FUNCTION get_user_projects()
RETURNS TABLE (
  project_id UUID,
  project_title TEXT,
  project_retailer TEXT,
  project_items JSONB,
  project_user_id UUID,
  project_created_at TIMESTAMPTZ,
  project_updated_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  permission_level TEXT,
  is_owner BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.title, p.retailer, p.items, p.user_id, p.created_at, p.updated_at, p.due_date,
    'admin'::TEXT, true
  FROM projects p WHERE p.user_id = auth.uid()
  UNION ALL
  SELECT 
    p.id, p.title, p.retailer, p.items, p.user_id, p.created_at, p.updated_at, p.due_date,
    pc.permission_level, false
  FROM project_collaborators pc
  JOIN projects p ON p.id = pc.project_id
  WHERE pc.user_id = auth.uid();
END;
$$;

-- Get single project with access check
CREATE OR REPLACE FUNCTION get_user_project(p_project_id UUID)
RETURNS TABLE (
  id UUID, title TEXT, retailer TEXT, items JSONB, user_id UUID,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, due_date TIMESTAMPTZ,
  permission_level TEXT, is_owner BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.retailer, p.items, p.user_id, p.created_at, p.updated_at, p.due_date,
    'admin'::TEXT, true
  FROM projects p WHERE p.id = p_project_id AND p.user_id = auth.uid()
  UNION ALL
  SELECT p.id, p.title, p.retailer, p.items, p.user_id, p.created_at, p.updated_at, p.due_date,
    pc.permission_level, false
  FROM projects p
  JOIN project_collaborators pc ON pc.project_id = p.id
  WHERE p.id = p_project_id AND pc.user_id = auth.uid();
END;
$$;

-- Update project with permission check
CREATE OR REPLACE FUNCTION update_user_project(
  p_project_id UUID,
  p_title TEXT DEFAULT NULL,
  p_retailer TEXT DEFAULT NULL,
  p_items JSONB DEFAULT NULL,
  p_due_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  project_id UUID, project_title TEXT, project_retailer TEXT, project_items JSONB,
  project_user_id UUID, project_created_at TIMESTAMPTZ, project_updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND user_id = auth.uid())
     AND NOT EXISTS (
       SELECT 1 FROM project_collaborators 
       WHERE project_collaborators.project_id = p_project_id 
       AND user_id = auth.uid() AND permission_level IN ('edit', 'admin')
     ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  UPDATE projects SET
    title = COALESCE(p_title, title),
    retailer = COALESCE(p_retailer, retailer),
    items = COALESCE(p_items, items),
    due_date = COALESCE(p_due_date, due_date),
    updated_at = NOW()
  WHERE id = p_project_id
  RETURNING id, title, retailer, items, user_id, created_at, updated_at;
END;
$$;

-- Invite user to project
CREATE OR REPLACE FUNCTION invite_user_to_project(
  p_project_id UUID, p_email TEXT, p_permission_level TEXT DEFAULT 'view'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only project owners can invite users';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM project_collaborators pc
    JOIN auth.users u ON pc.user_id = u.id
    WHERE pc.project_id = p_project_id AND u.email = p_email
  ) THEN
    RAISE EXCEPTION 'User is already a collaborator';
  END IF;
  
  SELECT invitation_token INTO v_token FROM project_invitations
  WHERE project_id = p_project_id AND invited_email = p_email 
    AND accepted_at IS NULL AND expires_at > NOW();
  
  IF v_token IS NOT NULL THEN RETURN v_token; END IF;
  
  v_token := encode(gen_random_bytes(32), 'hex');
  
  INSERT INTO project_invitations (project_id, invited_email, permission_level, invitation_token, invited_by)
  VALUES (p_project_id, p_email, p_permission_level, v_token, auth.uid());
  
  RETURN v_token;
END;
$$;

-- Accept invitation
CREATE OR REPLACE FUNCTION accept_project_invitation(p_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation project_invitations%ROWTYPE;
BEGIN
  SELECT * INTO v_invitation FROM project_invitations 
  WHERE invitation_token = p_token AND expires_at > NOW() AND accepted_at IS NULL;
  
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid or expired invitation'; END IF;
  
  IF auth.uid() IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = v_invitation.invited_email) THEN
      RAISE EXCEPTION 'Email does not match invitation';
    END IF;
    
    INSERT INTO project_collaborators (project_id, user_id, permission_level, invited_by)
    VALUES (v_invitation.project_id, auth.uid(), v_invitation.permission_level, v_invitation.invited_by);
    
    UPDATE project_invitations SET accepted_at = NOW() WHERE invitation_token = p_token;
  END IF;
  
  RETURN v_invitation.project_id;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'Already a collaborator';
END;
$$;

-- Get invitation details
CREATE OR REPLACE FUNCTION get_invitation_details(p_token TEXT)
RETURNS TABLE (invited_email TEXT, project_id UUID, project_title TEXT, permission_level TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT pi.invited_email, pi.project_id, p.title, pi.permission_level, pi.expires_at
  FROM project_invitations pi
  JOIN projects p ON pi.project_id = p.id
  WHERE pi.invitation_token = p_token AND pi.expires_at > NOW() AND pi.accepted_at IS NULL;
END;
$$;

-- Get or create project board
CREATE OR REPLACE FUNCTION get_or_create_project_board(p_project_id UUID)
RETURNS TABLE (project_id UUID, board_snapshot JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE v_board project_boards%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND user_id = auth.uid())
     AND NOT EXISTS (SELECT 1 FROM project_collaborators WHERE project_collaborators.project_id = p_project_id AND user_id = auth.uid())
  THEN RAISE EXCEPTION 'Access denied'; END IF;
  
  SELECT * INTO v_board FROM project_boards WHERE project_boards.project_id = p_project_id;
  
  IF NOT FOUND THEN
    INSERT INTO project_boards (project_id, board_snapshot) VALUES (p_project_id, '{}') RETURNING * INTO v_board;
  END IF;
  
  RETURN QUERY SELECT v_board.project_id, v_board.board_snapshot, v_board.created_at, v_board.updated_at;
END;
$$;

-- Save project board
CREATE OR REPLACE FUNCTION save_project_board(p_project_id UUID, p_snapshot JSONB)
RETURNS TABLE (project_id UUID, board_snapshot JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = p_project_id AND user_id = auth.uid())
     AND NOT EXISTS (
       SELECT 1 FROM project_collaborators 
       WHERE project_collaborators.project_id = p_project_id 
       AND user_id = auth.uid() AND permission_level IN ('edit', 'admin')
     ) THEN RAISE EXCEPTION 'Access denied'; END IF;
  
  RETURN QUERY
  INSERT INTO project_boards (project_id, board_snapshot, updated_at)
  VALUES (p_project_id, p_snapshot, NOW())
  ON CONFLICT (project_id) DO UPDATE SET board_snapshot = EXCLUDED.board_snapshot, updated_at = NOW()
  RETURNING *;
END;
$$;

-- Get collaborators with user info
CREATE OR REPLACE FUNCTION get_project_collaborators_with_users(p_project_id UUID)
RETURNS TABLE (
  id UUID, project_id UUID, user_id UUID, permission_level TEXT,
  invited_by UUID, joined_at TIMESTAMPTZ, user_email TEXT, user_full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM projects WHERE projects.id = p_project_id AND user_id = auth.uid())
     AND NOT EXISTS (SELECT 1 FROM project_collaborators pc WHERE pc.project_id = p_project_id AND pc.user_id = auth.uid())
  THEN RAISE EXCEPTION 'Access denied'; END IF;
  
  RETURN QUERY
  SELECT pc.id, pc.project_id, pc.user_id, pc.permission_level, pc.invited_by, pc.joined_at,
    u.email, u.raw_user_meta_data->>'full_name'
  FROM project_collaborators pc
  JOIN auth.users u ON pc.user_id = u.id
  WHERE pc.project_id = p_project_id;
END;
$$;

-- ============================================================================
-- PART 7: SETUP STORAGE
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('project-images', 'project-images', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('board-assets', 'board-assets', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
CREATE POLICY "Authenticated users can upload project images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Authenticated users can view project images" ON storage.objects;
CREATE POLICY "Authenticated users can view project images" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Authenticated users can delete project images" ON storage.objects;
CREATE POLICY "Authenticated users can delete project images" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
CREATE POLICY "Anyone can view profile images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Authenticated users can manage board assets" ON storage.objects;
CREATE POLICY "Authenticated users can manage board assets" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'board-assets') WITH CHECK (bucket_id = 'board-assets');

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '📋 Tables: projects, user_profiles, project_collaborators, project_invitations, project_logs, project_boards';
  RAISE NOTICE '🔐 RLS enabled and policies configured';
  RAISE NOTICE '⚙️ Functions created for all operations';
  RAISE NOTICE '📁 Storage buckets configured';
  RAISE NOTICE '🎯 Ready for application use!';
END $$;
```

---

## Verifying the Setup

After running the migration, verify:

### 1. Check Tables Exist

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected: projects, user_profiles, project_collaborators, project_invitations, project_logs, project_boards

### 2. Check Functions Exist

```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
```

### 3. Check Storage Buckets

Go to **Storage** in Supabase Dashboard and verify buckets exist.

---

## Chapter Summary

This chapter provided:

1. **Complete migration script** - One script to set up everything
2. **Idempotent operations** - Safe to re-run
3. **Verification steps** - How to confirm setup worked

Run this script once on a new Supabase project and the database is ready for use.

---

## Part 2 Complete

You now have:
- Complete database schema with 6 tables
- Row Level Security policies for all tables
- Database functions for all operations
- Storage buckets configured
- A master migration script for setup

---

*Continue to [Part 3: Authentication & Core Systems](../part-03-auth-core/README.md) to implement user authentication.*
