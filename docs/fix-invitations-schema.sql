-- Fix project_invitations table and function
-- Run this in your Supabase SQL Editor

-- 1. Drop and recreate the project_invitations table with correct structure
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

-- 2. Create indexes for better performance
CREATE INDEX idx_project_invitations_project_id ON project_invitations(project_id);
CREATE INDEX idx_project_invitations_invited_email ON project_invitations(invited_email);
CREATE INDEX idx_project_invitations_token ON project_invitations(invitation_token);
CREATE INDEX idx_project_invitations_expires_at ON project_invitations(expires_at);

-- 3. Enable RLS
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
DROP POLICY IF EXISTS "Users can view project invitations" ON project_invitations;
DROP POLICY IF EXISTS "Project owners can manage invitations" ON project_invitations;

CREATE POLICY "Users can view project invitations" ON project_invitations
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM projects WHERE id = project_id
  )
);

CREATE POLICY "Project owners can manage invitations" ON project_invitations
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM projects WHERE id = project_id
  )
);

-- 5. Update the invite_user_to_project function
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

-- 6. Test the function (optional - remove this line after testing)
-- SELECT invite_user_to_project('your-project-id-here'::uuid, 'test@example.com', 'view'); 