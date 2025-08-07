-- Project Collaboration Database Schema
-- This file contains the SQL to set up tables for multi-user project collaboration

-- 1. Project Collaborators Table
-- Tracks who has access to each project and their permission level
CREATE TABLE IF NOT EXISTS project_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'admin')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique project-user combinations
  UNIQUE(project_id, user_id)
);

-- 2. Project Invitations Table
-- Tracks pending invitations that haven't been accepted yet
CREATE TABLE IF NOT EXISTS project_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'admin')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique project-email combinations for pending invitations
  UNIQUE(project_id, email)
);

-- 3. Add collaboration settings to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS collaboration_enabled BOOLEAN DEFAULT true;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS public_view BOOLEAN DEFAULT false;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email ON project_invitations(email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON project_invitations(invitation_token);

-- 5. Row Level Security (RLS) Policies

-- Enable RLS on new tables
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Project Collaborators Policies
CREATE POLICY "Users can view their own collaborations" ON project_collaborators
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Project owners can view all collaborators" ON project_collaborators
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Project owners can manage collaborators" ON project_collaborators
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Project Invitations Policies
CREATE POLICY "Project owners can manage invitations" ON project_invitations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_invitations.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view invitations sent to their email" ON project_invitations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.email = project_invitations.email 
    AND auth.users.id = auth.uid()
  )
);

-- 6. Functions for common operations

-- Add RLS policy for auth.users table to allow email verification
CREATE POLICY "Users can view their own email" ON auth.users
FOR SELECT USING (auth.uid() = id);

-- Function to invite a user to a project
CREATE OR REPLACE FUNCTION invite_user_to_project(
  p_project_id UUID,
  p_email TEXT,
  p_permission_level TEXT DEFAULT 'view'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_invitation_token TEXT;
  v_existing_invitation project_invitations%ROWTYPE;
  v_existing_collaborator project_collaborators%ROWTYPE;
BEGIN
  -- Check if current user is the project owner
  IF NOT EXISTS (
    SELECT 1 FROM projects 
    WHERE id = p_project_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only project owners can invite users';
  END IF;

  -- Check if user is already a collaborator
  SELECT * INTO v_existing_collaborator
  FROM project_collaborators pc
  JOIN auth.users u ON pc.user_id = u.id
  WHERE pc.project_id = p_project_id AND u.email = p_email;

  IF FOUND THEN
    RAISE EXCEPTION 'User is already a collaborator on this project';
  END IF;

  -- Check if there's already an invitation for this email
  SELECT * INTO v_existing_invitation
  FROM project_invitations
  WHERE project_id = p_project_id 
    AND invited_email = p_email
    AND accepted_at IS NULL
    AND expires_at > NOW();

  IF FOUND THEN
    -- Return existing token instead of creating a new one
    RETURN v_existing_invitation.invitation_token;
  END IF;

  -- Generate invitation token
  v_invitation_token := encode(gen_random_bytes(32), 'hex');

  -- Create invitation
  INSERT INTO project_invitations (
    project_id,
    invited_email,
    permission_level,
    invitation_token,
    invited_by,
    expires_at
  ) VALUES (
    p_project_id,
    p_email,
    p_permission_level,
    v_invitation_token,
    auth.uid(),
    NOW() + INTERVAL '7 days'
  );

  RETURN v_invitation_token;
END;
$$;

-- Function to accept an invitation
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
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Find the invitation
  SELECT * INTO v_invitation 
  FROM project_invitations 
  WHERE invitation_token = p_token 
    AND expires_at > NOW() 
    AND accepted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;
  
  -- Check if user email matches invitation (only if user is authenticated)
  IF v_user_id IS NOT NULL THEN
    -- For authenticated users, verify email matches
    IF NOT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = v_user_id AND email = v_invitation.email
    ) THEN
      RAISE EXCEPTION 'Email does not match invitation';
    END IF;
  END IF;
  
  -- Add user as collaborator (only if user is authenticated)
  IF v_user_id IS NOT NULL THEN
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

-- Function to get projects user has access to (owned + collaborated)
CREATE OR REPLACE FUNCTION get_user_projects()
RETURNS TABLE (
  project_id UUID,
  project_title TEXT,
  project_retailer TEXT,
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
    p.id as project_id,
    p.title as project_title,
    p.retailer as project_retailer,
    'admin'::TEXT as permission_level,
    true as is_owner
  FROM projects p
  WHERE p.user_id = auth.uid()
  
  UNION ALL
  
  -- Projects where user is collaborator
  SELECT 
    p.id as project_id,
    p.title as project_title,
    p.retailer as project_retailer,
    pc.permission_level,
    false as is_owner
  FROM project_collaborators pc
  JOIN projects p ON p.id = pc.project_id
  WHERE pc.user_id = auth.uid();
END;
$$; 