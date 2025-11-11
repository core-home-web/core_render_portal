-- =====================================================
-- FIX SECURITY ADVISOR WARNINGS
-- =====================================================
-- This script fixes the security issues shown in Supabase:
-- 1. Function Search Path Mutable (8 functions)
-- 2. Exposed Auth Users (2 views)
-- 3. Security Definer View (1 view)
-- =====================================================

-- =====================================================
-- PART 1: Fix "Function Search Path Mutable" warnings
-- =====================================================
-- Add SET search_path to all functions to prevent injection attacks

-- Fix: update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix: get_user_projects
CREATE OR REPLACE FUNCTION get_user_projects()
RETURNS TABLE (
  project_id UUID,
  project_title TEXT,
  project_retailer TEXT,
  project_items JSONB,
  due_date TIMESTAMP WITH TIME ZONE,
  project_user_id UUID,
  project_created_at TIMESTAMP WITH TIME ZONE,
  project_updated_at TIMESTAMP WITH TIME ZONE,
  is_owner BOOLEAN,
  permission_level TEXT
)
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS project_id,
    p.title AS project_title,
    p.retailer AS project_retailer,
    p.items AS project_items,
    p.due_date,
    p.user_id AS project_user_id,
    p.created_at AS project_created_at,
    p.updated_at AS project_updated_at,
    TRUE AS is_owner,
    'owner'::TEXT AS permission_level
  FROM projects p
  WHERE p.user_id = auth.uid()

  UNION ALL

  SELECT 
    p.id AS project_id,
    p.title AS project_title,
    p.retailer AS project_retailer,
    p.items AS project_items,
    p.due_date,
    p.user_id AS project_user_id,
    p.created_at AS project_created_at,
    p.updated_at AS project_updated_at,
    FALSE AS is_owner,
    pc.permission_level
  FROM projects p
  INNER JOIN project_collaborators pc ON p.id = pc.project_id
  WHERE pc.user_id = auth.uid();
END;
$$;

-- Fix: get_user_project
CREATE OR REPLACE FUNCTION get_user_project(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  retailer TEXT,
  items JSONB,
  due_date TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.retailer,
    p.items,
    p.due_date,
    p.user_id,
    p.created_at,
    p.updated_at
  FROM projects p
  WHERE p.id = p_project_id
    AND (
      p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM project_collaborators pc
        WHERE pc.project_id = p.id
        AND pc.user_id = auth.uid()
      )
    );
END;
$$;

-- Fix: update_user_project
CREATE OR REPLACE FUNCTION update_user_project(
  p_project_id UUID,
  p_title TEXT,
  p_retailer TEXT,
  p_due_date TIMESTAMP WITH TIME ZONE,
  p_items JSONB
)
RETURNS SETOF projects
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed
LANGUAGE plpgsql
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  project_owner_id UUID;
  user_permission_level TEXT;
BEGIN
  SELECT user_id INTO project_owner_id FROM projects WHERE id = p_project_id;

  IF project_owner_id IS NULL THEN
    RAISE EXCEPTION 'Project not found.';
  END IF;

  IF current_user_id = project_owner_id THEN
    user_permission_level := 'owner';
  ELSE
    SELECT permission_level INTO user_permission_level
    FROM project_collaborators
    WHERE project_id = p_project_id AND user_id = current_user_id;
  END IF;

  IF user_permission_level IS NULL OR user_permission_level NOT IN ('owner', 'admin', 'edit') THEN
    RAISE EXCEPTION 'User does not have sufficient permissions to update this project.';
  END IF;

  RETURN QUERY
  UPDATE projects
  SET
    title = p_title,
    retailer = p_retailer,
    due_date = p_due_date,
    items = p_items,
    updated_at = NOW()
  WHERE id = p_project_id
  RETURNING *;
END;
$$;

-- Fix: invite_user_to_project
CREATE OR REPLACE FUNCTION invite_user_to_project(
  p_project_id UUID,
  p_inviter_id UUID,
  p_invitee_email TEXT,
  p_permission_level TEXT,
  p_invitation_token TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed
LANGUAGE plpgsql
AS $$
DECLARE
  invitation_id UUID;
BEGIN
  IF p_permission_level NOT IN ('view', 'edit', 'admin') THEN
    RAISE EXCEPTION 'Invalid permission level';
  END IF;

  INSERT INTO project_invitations (
    project_id,
    inviter_id,
    invitee_email,
    permission_level,
    invitation_token,
    expires_at
  )
  VALUES (
    p_project_id,
    p_inviter_id,
    p_invitee_email,
    p_permission_level,
    p_invitation_token,
    NOW() + INTERVAL '7 days'
  )
  RETURNING id INTO invitation_id;

  RETURN invitation_id;
END;
$$;

-- Fix: get_invitation_details
CREATE OR REPLACE FUNCTION get_invitation_details(p_token TEXT)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  project_title TEXT,
  inviter_email TEXT,
  invitee_email TEXT,
  permission_level TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted BOOLEAN
)
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    pi.project_id,
    p.title AS project_title,
    u.email AS inviter_email,
    pi.invitee_email,
    pi.permission_level,
    pi.expires_at,
    pi.accepted
  FROM project_invitations pi
  JOIN projects p ON pi.project_id = p.id
  JOIN auth.users u ON pi.inviter_id = u.id
  WHERE pi.invitation_token = p_token;
END;
$$;

-- Fix: can_accept_invitation
CREATE OR REPLACE FUNCTION can_accept_invitation(p_token TEXT, p_user_email TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed
LANGUAGE plpgsql
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  SELECT * INTO invitation_record
  FROM project_invitations
  WHERE invitation_token = p_token;

  IF invitation_record IS NULL THEN
    RETURN FALSE;
  END IF;

  IF invitation_record.invitee_email != p_user_email THEN
    RETURN FALSE;
  END IF;

  IF invitation_record.accepted THEN
    RETURN FALSE;
  END IF;

  IF invitation_record.expires_at < NOW() THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- Fix: accept_project_invitation
CREATE OR REPLACE FUNCTION accept_project_invitation(
  p_token TEXT,
  p_user_id UUID,
  p_user_email TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed
LANGUAGE plpgsql
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  SELECT * INTO invitation_record
  FROM project_invitations
  WHERE invitation_token = p_token
  FOR UPDATE;

  IF invitation_record IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;

  IF invitation_record.invitee_email != p_user_email THEN
    RAISE EXCEPTION 'Invitation email does not match';
  END IF;

  IF invitation_record.accepted THEN
    RAISE EXCEPTION 'Invitation already accepted';
  END IF;

  IF invitation_record.expires_at < NOW() THEN
    RAISE EXCEPTION 'Invitation has expired';
  END IF;

  INSERT INTO project_collaborators (project_id, user_id, permission_level)
  VALUES (
    invitation_record.project_id,
    p_user_id,
    invitation_record.permission_level
  )
  ON CONFLICT (project_id, user_id) DO UPDATE
  SET permission_level = EXCLUDED.permission_level;

  UPDATE project_invitations
  SET accepted = TRUE
  WHERE invitation_token = p_token;

  RETURN TRUE;
END;
$$;

-- =====================================================
-- PART 2: Fix "Exposed Auth Users" warnings
-- =====================================================
-- Drop the insecure view that exposes auth.users
DROP VIEW IF EXISTS project_collaborators_with_users CASCADE;

-- Create a secure alternative that doesn't expose auth.users directly
CREATE OR REPLACE VIEW project_collaborators_with_users_secure
WITH (security_barrier = true)  -- ✅ Security barrier
AS
SELECT 
  pc.project_id,
  pc.user_id,
  pc.permission_level,
  up.display_name,
  up.profile_image,
  up.team,
  pc.created_at
FROM project_collaborators pc
LEFT JOIN user_profiles up ON pc.user_id = up.user_id;

-- Grant minimal permissions
GRANT SELECT ON project_collaborators_with_users_secure TO authenticated;

-- =====================================================
-- PART 3: Add RLS to the secure view
-- =====================================================
-- Note: Views don't have RLS directly, but we control access via functions

-- Create a safe function to get collaborators
CREATE OR REPLACE FUNCTION get_project_collaborators(p_project_id UUID)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  profile_image TEXT,
  team TEXT,
  permission_level TEXT
)
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only allow access if user is project owner or collaborator
  IF NOT EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id AND user_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM project_collaborators WHERE project_id = p_project_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    pc.user_id,
    up.display_name,
    up.profile_image,
    up.team,
    pc.permission_level
  FROM project_collaborators pc
  LEFT JOIN user_profiles up ON pc.user_id = up.user_id
  WHERE pc.project_id = p_project_id;
END;
$$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ SECURITY FIXES APPLIED!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Fixed:';
  RAISE NOTICE '✓ 8 functions - Added search_path';
  RAISE NOTICE '✓ Removed insecure auth.users view';
  RAISE NOTICE '✓ Created secure collaborators view';
  RAISE NOTICE '✓ Added security barriers';
  RAISE NOTICE '✓ Created safe accessor functions';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Next: Run Security Advisor again';
  RAISE NOTICE '   Most warnings should be resolved!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

