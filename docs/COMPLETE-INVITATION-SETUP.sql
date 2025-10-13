-- ============================================================================
-- COMPLETE PROJECT INVITATION SETUP
-- ============================================================================
-- This script sets up the complete invitation system from scratch
-- Run this in your Supabase SQL Editor
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run" or press Cmd+Enter / Ctrl+Enter
-- ============================================================================

-- Step 1: Create or Update project_collaborators table
-- ============================================================================
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

-- Step 2: Drop and recreate project_invitations table with correct structure
-- ============================================================================
DROP TABLE IF EXISTS project_invitations CASCADE;

CREATE TABLE project_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'admin')),
  invitation_token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_invited_email ON project_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON project_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_expires_at ON project_invitations(expires_at);

-- Step 4: Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies (if any)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own collaborations" ON project_collaborators;
DROP POLICY IF EXISTS "Project owners can view all collaborators" ON project_collaborators;
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON project_collaborators;
DROP POLICY IF EXISTS "Users can view project invitations" ON project_invitations;
DROP POLICY IF EXISTS "Project owners can manage invitations" ON project_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON project_invitations;

-- Step 6: Create RLS policies
-- ============================================================================

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
    WHERE auth.users.email = project_invitations.invited_email 
    AND auth.users.id = auth.uid()
  )
);

-- Step 7: Create invite_user_to_project function
-- ============================================================================
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

-- Step 8: Create accept_project_invitation function (with email verification)
-- ============================================================================
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
      WHERE id = v_user_id AND email = v_invitation.invited_email
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
    WHERE invitation_token = p_token;
    
    RETURN v_invitation.project_id;
  ELSE
    -- For unauthenticated users, just return the project ID
    -- They'll need to sign up/sign in first
    RETURN v_invitation.project_id;
  END IF;
END;
$$;

-- Step 9: Create get_invitation_details function
-- ============================================================================
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

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- You can now use the invitation system:
-- 1. Send invitations using invite_user_to_project(project_id, email, permission)
-- 2. Accept invitations using accept_project_invitation(token)
-- 3. Get invitation details using get_invitation_details(token)
-- ============================================================================

-- Verify setup (optional - will show success message)
DO $$
BEGIN
  RAISE NOTICE '✅ Project invitation system setup complete!';
  RAISE NOTICE '📋 Tables created: project_collaborators, project_invitations';
  RAISE NOTICE '🔐 RLS policies configured';
  RAISE NOTICE '⚙️  Functions created: invite_user_to_project, accept_project_invitation, get_invitation_details';
END $$;

