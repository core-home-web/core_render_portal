-- Fixed Update Project Access Control
-- This version fixes the ambiguous column reference issue

-- Function to update a project with access control
CREATE OR REPLACE FUNCTION update_user_project(
  p_project_id UUID,
  p_title TEXT,
  p_retailer TEXT,
  p_items JSONB
)
RETURNS TABLE (
  project_id UUID,
  project_title TEXT,
  project_retailer TEXT,
  project_items JSONB,
  project_user_id UUID,
  project_created_at TIMESTAMP WITH TIME ZONE,
  project_updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_permission_level TEXT;
  v_is_owner BOOLEAN;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if user has access to this project and get their permission level
  SELECT 
    CASE 
      WHEN p.user_id = v_user_id THEN 'admin'
      ELSE pc.permission_level
    END as permission_level,
    CASE 
      WHEN p.user_id = v_user_id THEN true
      ELSE false
    END as is_owner
  INTO v_permission_level, v_is_owner
  FROM projects p
  LEFT JOIN project_collaborators pc ON p.id = pc.project_id AND pc.user_id = v_user_id
  WHERE p.id = p_project_id AND (
    p.user_id = v_user_id OR 
    (pc.user_id = v_user_id AND pc.permission_level IN ('edit', 'admin'))
  );

  -- If no access found, raise exception with more details
  IF v_permission_level IS NULL THEN
    RAISE EXCEPTION 'Access denied: Project % not found or user % has insufficient permissions', p_project_id, v_user_id;
  END IF;

  -- Update the project
  UPDATE projects 
  SET 
    title = p_title,
    retailer = p_retailer,
    items = p_items,
    updated_at = NOW()
  WHERE id = p_project_id;

  -- Return the updated project with unique column names
  RETURN QUERY
  SELECT 
    p.id as project_id,
    p.title as project_title,
    p.retailer as project_retailer,
    p.items as project_items,
    p.user_id as project_user_id,
    p.created_at as project_created_at,
    p.updated_at as project_updated_at
  FROM projects p
  WHERE p.id = p_project_id;
END;
$$;
