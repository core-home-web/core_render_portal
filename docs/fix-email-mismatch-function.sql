-- Fix email mismatch verification in accept_project_invitation function
-- This update fixes the email verification logic to use the correct field name
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire SQL block
-- 4. Execute the query
-- 5. Verify the function is updated

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
