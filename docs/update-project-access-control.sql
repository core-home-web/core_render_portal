-- Update Project Access Control
-- This file contains the SQL to create a function for updating projects with proper access control

-- Function to update a project with access control
CREATE OR REPLACE FUNCTION update_user_project(
  p_project_id UUID,
  p_title TEXT,
  p_retailer TEXT,
  p_items JSONB
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  retailer TEXT,
  items JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_permission_level TEXT;
  v_is_owner BOOLEAN;
BEGIN
  -- Check if user has access to this project and get their permission level
  SELECT 
    CASE 
      WHEN p.user_id = auth.uid() THEN 'admin'
      ELSE pc.permission_level
    END as permission_level,
    CASE 
      WHEN p.user_id = auth.uid() THEN true
      ELSE false
    END as is_owner
  INTO v_permission_level, v_is_owner
  FROM projects p
  LEFT JOIN project_collaborators pc ON p.id = pc.project_id AND pc.user_id = auth.uid()
  WHERE p.id = p_project_id AND (
    p.user_id = auth.uid() OR 
    (pc.user_id = auth.uid() AND pc.permission_level IN ('edit', 'admin'))
  );

  -- If no access found, raise exception
  IF v_permission_level IS NULL THEN
    RAISE EXCEPTION 'Access denied: Project not found or insufficient permissions';
  END IF;

  -- Update the project
  UPDATE projects 
  SET 
    title = p_title,
    retailer = p_retailer,
    items = p_items,
    updated_at = NOW()
  WHERE id = p_project_id;

  -- Return the updated project
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.retailer,
    p.items,
    p.user_id,
    p.created_at,
    p.updated_at
  FROM projects p
  WHERE p.id = p_project_id;
END;
$$;
