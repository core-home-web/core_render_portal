-- Test function to verify RPC function creation
-- This is a simple test function to check if the database can create and execute RPC functions

-- Simple test function
CREATE OR REPLACE FUNCTION test_update_function(
  p_project_id UUID,
  p_title TEXT
)
RETURNS TABLE (
  id UUID,
  title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Just return the input parameters for testing
  RETURN QUERY
  SELECT 
    p_project_id as id,
    p_title as title;
END;
$$;
