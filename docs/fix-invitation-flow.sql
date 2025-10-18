-- Fix the accept_project_invitation function to handle new users properly
-- Run this in your Supabase SQL Editor

-- 1. Fix the accept_project_invitation function
CREATE OR REPLACE FUNCTION accept_project_invitation(
  p_token TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation project_invitations%ROWTYPE;
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Get current user ID and email
  v_user_id := auth.uid();
  
  -- Get user email if authenticated
  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email 
    FROM auth.users 
    WHERE id = v_user_id;
  END IF;
  
  -- Find the invitation
  SELECT * INTO v_invitation 
  FROM project_invitations 
  WHERE invitation_token = p_token 
    AND expires_at > NOW() 
    AND accepted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;
  
  -- For authenticated users, verify email matches invitation (case-insensitive)
  IF v_user_id IS NOT NULL THEN
    -- Normalize emails for comparison (trim whitespace and convert to lowercase)
    IF LOWER(TRIM(v_user_email)) != LOWER(TRIM(v_invitation.invited_email)) THEN
      RAISE EXCEPTION 'Email does not match invitation. Expected: %, Got: %', v_invitation.invited_email, v_user_email;
    END IF;
    
    -- Check if user is already a collaborator
    IF EXISTS (
      SELECT 1 FROM project_collaborators 
      WHERE project_id = v_invitation.project_id 
        AND user_id = v_user_id
    ) THEN
      RAISE EXCEPTION 'User is already a collaborator on this project';
    END IF;
    
    -- Add user as collaborator
    INSERT INTO project_collaborators (
      project_id,
      user_id,
      permission_level,
      invited_by
    ) VALUES (
      v_invitation.project_id,
      v_user_id,
      v_invitation.permission_level,
      v_invitation.invited_by
    );
    
    -- Mark invitation as accepted
    UPDATE project_invitations 
    SET accepted_at = NOW() 
    WHERE id = v_invitation.id;
  END IF;
  
  RETURN v_invitation.project_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Already a collaborator on this project';
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- 2. Create a function to get invitation details (for pre-filling email)
CREATE OR REPLACE FUNCTION get_invitation_details(
  p_token TEXT
)
RETURNS TABLE (
  invited_email TEXT,
  project_id UUID,
  project_title TEXT,
  permission_level TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.invited_email,
    pi.project_id,
    p.title as project_title,
    pi.permission_level,
    pi.expires_at
  FROM project_invitations pi
  JOIN projects p ON pi.project_id = p.id
  WHERE pi.invitation_token = p_token 
    AND pi.expires_at > NOW() 
    AND pi.accepted_at IS NULL;
END;
$$;

-- 3. Create a function to check if user can accept invitation
CREATE OR REPLACE FUNCTION can_accept_invitation(
  p_token TEXT
)
RETURNS TABLE (
  can_accept BOOLEAN,
  reason TEXT,
  invited_email TEXT,
  project_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation project_invitations%ROWTYPE;
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Get current user ID and email
  v_user_id := auth.uid();
  
  -- Get user email if authenticated
  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email 
    FROM auth.users 
    WHERE id = v_user_id;
  END IF;
  
  -- Find the invitation
  SELECT * INTO v_invitation 
  FROM project_invitations 
  WHERE invitation_token = p_token 
    AND expires_at > NOW() 
    AND accepted_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid or expired invitation token', '', '';
    RETURN;
  END IF;
  
  -- If user is authenticated, check email match (case-insensitive)
  IF v_user_id IS NOT NULL THEN
    IF LOWER(TRIM(v_user_email)) != LOWER(TRIM(v_invitation.invited_email)) THEN
      RETURN QUERY SELECT false, 'Email does not match invitation', v_invitation.invited_email, '';
      RETURN;
    END IF;
    
    -- Check if already a collaborator
    IF EXISTS (
      SELECT 1 FROM project_collaborators 
      WHERE project_id = v_invitation.project_id 
        AND user_id = v_user_id
    ) THEN
      RETURN QUERY SELECT false, 'Already a collaborator on this project', v_invitation.invited_email, '';
      RETURN;
    END IF;
  END IF;
  
  -- Get project title
  DECLARE
    v_project_title TEXT;
  BEGIN
    SELECT title INTO v_project_title 
    FROM projects 
    WHERE id = v_invitation.project_id;
    
    RETURN QUERY SELECT true, 'Can accept invitation', v_invitation.invited_email, v_project_title;
  END;
END;
$$;

-- 4. Create a function to get a single project with full details
CREATE OR REPLACE FUNCTION get_user_project(
  p_project_id UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  retailer TEXT,
  items JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  permission_level TEXT,
  is_owner BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Projects owned by user
  SELECT 
    p.id,
    p.title,
    p.retailer,
    p.items,
    p.user_id,
    p.created_at,
    p.updated_at,
    'admin'::TEXT as permission_level,
    true as is_owner
  FROM projects p
  WHERE p.id = p_project_id AND p.user_id = auth.uid()
  
  UNION ALL
  
  -- Projects where user is collaborator
  SELECT 
    p.id,
    p.title,
    p.retailer,
    p.items,
    p.user_id,
    p.created_at,
    p.updated_at,
    pc.permission_level,
    false as is_owner
  FROM projects p
  JOIN project_collaborators pc ON p.id = pc.project_id
  WHERE p.id = p_project_id AND pc.user_id = auth.uid();
END;
$$; 