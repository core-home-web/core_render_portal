-- ============================================================================
-- PROJECT BOARDS TABLE - Whiteboard Persistence
-- ============================================================================
-- This script creates the project_boards table for storing tldraw whiteboard
-- snapshots. Each project has exactly one board.
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this ENTIRE file
-- 4. Click "Run" or press Cmd+Enter / Ctrl+Enter
-- ============================================================================

-- Step 1: Create the project_boards table
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_boards (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  board_snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for better performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_project_boards_updated_at ON project_boards(updated_at);

-- Step 3: Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE project_boards ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies (if any) to avoid conflicts
-- ============================================================================
DROP POLICY IF EXISTS "Project owners can manage their boards" ON project_boards;
DROP POLICY IF EXISTS "Collaborators can view boards" ON project_boards;
DROP POLICY IF EXISTS "Collaborators with edit can update boards" ON project_boards;

-- Step 5: Create RLS policies
-- ============================================================================

-- Policy: Project owners have full access to their boards
CREATE POLICY "Project owners can manage their boards" ON project_boards
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_boards.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Policy: Collaborators can view boards they have access to
CREATE POLICY "Collaborators can view boards" ON project_boards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_boards.project_id
    AND project_collaborators.user_id = auth.uid()
  )
);

-- Policy: Collaborators with edit/admin permission can update boards
CREATE POLICY "Collaborators with edit can update boards" ON project_boards
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_boards.project_id
    AND project_collaborators.user_id = auth.uid()
    AND project_collaborators.permission_level IN ('edit', 'admin')
  )
);

-- Step 6: Create function to update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_project_boards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger to auto-update updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS project_boards_updated_at ON project_boards;
CREATE TRIGGER project_boards_updated_at
  BEFORE UPDATE ON project_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_project_boards_updated_at();

-- Step 8: Create function to get or create board for a project
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
  IF NOT EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id AND user_id = auth.uid()
    UNION
    SELECT 1 FROM project_collaborators WHERE project_collaborators.project_id = p_project_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to project';
  END IF;

  -- Try to insert a new board, do nothing if it already exists
  INSERT INTO project_boards (project_id, board_snapshot)
  VALUES (p_project_id, '{}')
  ON CONFLICT (project_id) DO NOTHING;

  -- Return the board
  RETURN QUERY
  SELECT pb.project_id, pb.board_snapshot, pb.created_at, pb.updated_at
  FROM project_boards pb
  WHERE pb.project_id = p_project_id;
END;
$$;

-- Step 9: Create function to save board snapshot
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
  IF NOT EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id AND user_id = auth.uid()
    UNION
    SELECT 1 FROM project_collaborators 
    WHERE project_collaborators.project_id = p_project_id 
    AND user_id = auth.uid()
    AND permission_level IN ('edit', 'admin')
  ) THEN
    RAISE EXCEPTION 'No edit access to project';
  END IF;

  -- Upsert the board snapshot
  INSERT INTO project_boards (project_id, board_snapshot)
  VALUES (p_project_id, p_snapshot)
  ON CONFLICT (project_id) 
  DO UPDATE SET board_snapshot = p_snapshot, updated_at = NOW();

  -- Return the updated board
  RETURN QUERY
  SELECT pb.project_id, pb.board_snapshot, pb.created_at, pb.updated_at
  FROM project_boards pb
  WHERE pb.project_id = p_project_id;
END;
$$;

-- Step 10: Grant execute permissions on functions
-- ============================================================================
-- SECURITY DEFINER functions still need execute grants for authenticated users
GRANT EXECUTE ON FUNCTION get_or_create_project_board(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_project_board(UUID) TO anon;
GRANT EXECUTE ON FUNCTION save_project_board(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION save_project_board(UUID, JSONB) TO anon;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- You can now use the following functions:
-- 1. get_or_create_project_board(project_id) - Get board, creating if needed
-- 2. save_project_board(project_id, snapshot) - Save board snapshot
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Project boards table setup complete!';
  RAISE NOTICE '📋 Table created: project_boards';
  RAISE NOTICE '🔐 RLS policies configured for owners and collaborators';
  RAISE NOTICE '⚙️  Functions created: get_or_create_project_board, save_project_board';
  RAISE NOTICE '🔑 Execute permissions granted to authenticated and anon roles';
END $$;
