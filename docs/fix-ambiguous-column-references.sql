-- ============================================================================
-- FIX AMBIGUOUS COLUMN REFERENCES IN SQL FUNCTIONS
-- ============================================================================
-- This script fixes "column reference is ambiguous" errors in SQL functions
-- by fully qualifying all column references with table aliases in UNION queries
-- ============================================================================

-- Fix 1: get_project_collaborators_with_users function
-- ============================================================================
CREATE OR REPLACE FUNCTION get_project_collaborators_with_users(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  user_id UUID,
  permission_level TEXT,
  invited_by UUID,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_email TEXT,
  user_full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to this project
  -- FIXED: Fully qualified all column references with table aliases
  IF NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.id = p_project_id AND p.user_id = auth.uid()
    UNION
    SELECT 1 FROM project_collaborators pc 
    WHERE pc.project_id = p_project_id AND pc.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to project';
  END IF;

  -- Return collaborators with user info
  RETURN QUERY
  SELECT 
    pc.id,
    pc.project_id,
    pc.user_id,
    pc.permission_level,
    pc.invited_by,
    pc.joined_at,
    pc.created_at,
    pc.updated_at,
    u.email::TEXT as user_email,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      split_part(u.email, '@', 1)
    )::TEXT as user_full_name
  FROM project_collaborators pc
  LEFT JOIN auth.users u ON pc.user_id = u.id
  WHERE pc.project_id = p_project_id;
END;
$$;

-- Fix 2: get_or_create_project_board function
-- ============================================================================
CREATE OR REPLACE FUNCTION get_or_create_project_board(p_project_id UUID)
RETURNS TABLE (
  project_id UUID,
  board_snapshot JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to this project
  -- FIXED: Fully qualified all column references with table aliases
  IF NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.id = p_project_id AND p.user_id = auth.uid()
    UNION
    SELECT 1 FROM project_collaborators pc 
    WHERE pc.project_id = p_project_id AND pc.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to project';
  END IF;

  -- Try to insert a new board, do nothing if it already exists
  -- FIXED: Use constraint name in ON CONFLICT to avoid ambiguity with RETURNS TABLE column
  INSERT INTO project_boards (project_id, board_snapshot)
  VALUES (p_project_id, '{}')
  ON CONFLICT ON CONSTRAINT project_boards_pkey DO NOTHING;

  -- Return the board
  RETURN QUERY
  SELECT pb.project_id, pb.board_snapshot, pb.created_at, pb.updated_at
  FROM project_boards pb
  WHERE pb.project_id = p_project_id;
END;
$$;

-- Fix 3: save_project_board function
-- ============================================================================
CREATE OR REPLACE FUNCTION save_project_board(p_project_id UUID, p_snapshot JSONB)
RETURNS TABLE (
  project_id UUID,
  board_snapshot JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has edit access to this project
  -- FIXED: Fully qualified all column references with table aliases
  IF NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.id = p_project_id AND p.user_id = auth.uid()
    UNION
    SELECT 1 FROM project_collaborators pc 
    WHERE pc.project_id = p_project_id 
    AND pc.user_id = auth.uid()
    AND pc.permission_level IN ('edit', 'admin')
  ) THEN
    RAISE EXCEPTION 'No edit access to project';
  END IF;

  -- Upsert the board snapshot
  -- FIXED: Use constraint name in ON CONFLICT to avoid ambiguity with RETURNS TABLE column
  INSERT INTO project_boards (project_id, board_snapshot)
  VALUES (p_project_id, p_snapshot)
  ON CONFLICT ON CONSTRAINT project_boards_pkey
  DO UPDATE SET board_snapshot = p_snapshot, updated_at = NOW();

  -- Return the updated board
  RETURN QUERY
  SELECT pb.project_id, pb.board_snapshot, pb.created_at, pb.updated_at
  FROM project_boards pb
  WHERE pb.project_id = p_project_id;
END;
$$;

-- Ensure execute permissions are granted
-- ============================================================================
GRANT EXECUTE ON FUNCTION get_project_collaborators_with_users(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_collaborators_with_users(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_or_create_project_board(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_project_board(UUID) TO anon;
GRANT EXECUTE ON FUNCTION save_project_board(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION save_project_board(UUID, JSONB) TO anon;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Test the functions:
-- SELECT * FROM get_project_collaborators_with_users('your-project-id-here');
-- SELECT * FROM get_or_create_project_board('your-project-id-here');
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Fixed ambiguous column references in SQL functions';
  RAISE NOTICE '📋 Updated: get_project_collaborators_with_users';
  RAISE NOTICE '📋 Updated: get_or_create_project_board';
  RAISE NOTICE '📋 Updated: save_project_board';
  RAISE NOTICE '🔑 Execute permissions verified';
END $$;

