-- Fix collaboration schema relationships
-- Run this in your Supabase SQL Editor

-- 1. Ensure the project_collaborators table has proper foreign key relationships
-- Drop existing constraints if they exist
ALTER TABLE project_collaborators 
DROP CONSTRAINT IF EXISTS fk_project_collaborators_project_id;

ALTER TABLE project_collaborators 
DROP CONSTRAINT IF EXISTS fk_project_collaborators_user_id;

-- Add new constraints
ALTER TABLE project_collaborators 
ADD CONSTRAINT fk_project_collaborators_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE project_collaborators 
ADD CONSTRAINT fk_project_collaborators_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Ensure the project_invitations table has proper foreign key relationships
ALTER TABLE project_invitations 
DROP CONSTRAINT IF EXISTS fk_project_invitations_project_id;

ALTER TABLE project_invitations 
ADD CONSTRAINT fk_project_invitations_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 3. Create a view for project_collaborators with user information
DROP VIEW IF EXISTS project_collaborators_with_users;

CREATE VIEW project_collaborators_with_users AS
SELECT 
  pc.*,
  u.email as user_email,
  u.raw_user_meta_data->>'full_name' as user_full_name
FROM project_collaborators pc
LEFT JOIN auth.users u ON pc.user_id = u.id;

-- 4. Fix RLS policies for project_collaborators (simplified to avoid recursion)
DROP POLICY IF EXISTS "Users can view project collaborators" ON project_collaborators;
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON project_collaborators;

-- Simple policy: users can view collaborators if they are a collaborator or project owner
CREATE POLICY "Users can view project collaborators" ON project_collaborators
FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT user_id FROM projects WHERE id = project_id
  )
);

-- Project owners can manage collaborators
CREATE POLICY "Project owners can manage collaborators" ON project_collaborators
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM projects WHERE id = project_id
  )
);

-- 5. Fix RLS policies for project_invitations (simplified to avoid recursion)
DROP POLICY IF EXISTS "Users can view project invitations" ON project_invitations;
DROP POLICY IF EXISTS "Project owners can manage invitations" ON project_invitations;

-- Simple policy: project owners can view and manage invitations
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

-- 6. Add RLS policy for auth.users table to allow email verification
DROP POLICY IF EXISTS "Users can view their own email" ON auth.users;

CREATE POLICY "Users can view their own email" ON auth.users
FOR SELECT USING (auth.uid() = id); 