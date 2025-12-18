# Chapter 8: Database Functions & RPCs

This chapter covers all PostgreSQL functions (stored procedures) used in the Core Render Portal. These functions are called via Supabase RPC (Remote Procedure Call) from the client.

---

## Why Use Database Functions?

Database functions provide several benefits:

1. **Bypass RLS when needed**: Functions can use `SECURITY DEFINER` to run as the function owner
2. **Complex operations**: Multi-step operations that would require multiple client calls
3. **Atomic transactions**: All-or-nothing operations
4. **Business logic encapsulation**: Keep complex logic in one place
5. **Performance**: Reduce round trips between client and database

---

## Function: get_user_projects

Returns all projects a user has access to (owned + shared).

### SQL Definition

```sql
CREATE OR REPLACE FUNCTION get_user_projects()
RETURNS TABLE (
  project_id UUID,
  project_title TEXT,
  project_retailer TEXT,
  project_items JSONB,
  project_user_id UUID,
  project_created_at TIMESTAMPTZ,
  project_updated_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
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
    p.items as project_items,
    p.user_id as project_user_id,
    p.created_at as project_created_at,
    p.updated_at as project_updated_at,
    p.due_date,
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
    p.items as project_items,
    p.user_id as project_user_id,
    p.created_at as project_created_at,
    p.updated_at as project_updated_at,
    p.due_date,
    pc.permission_level,
    false as is_owner
  FROM project_collaborators pc
  JOIN projects p ON p.id = pc.project_id
  WHERE pc.user_id = auth.uid();
END;
$$;
```

### Code Explanation

| Line | Purpose |
|------|---------|
| `RETURNS TABLE (...)` | Defines the columns returned by the function |
| `SECURITY DEFINER` | Runs with the permissions of the function creator |
| `auth.uid()` | Gets the current authenticated user's ID |
| `UNION ALL` | Combines owned and shared projects |
| `'admin'::TEXT` | Owners always have admin permission |

### Usage from Client

```typescript
const { data: projects, error } = await supabase.rpc('get_user_projects')

// Returns array of projects with permission info
// [{ project_id, project_title, is_owner, permission_level, ... }]
```

---

## Function: get_user_project

Returns a single project with access verification.

### SQL Definition

```sql
CREATE OR REPLACE FUNCTION get_user_project(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  retailer TEXT,
  items JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  permission_level TEXT,
  is_owner BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  -- Check if user owns the project
  SELECT 
    p.id,
    p.title,
    p.retailer,
    p.items,
    p.user_id,
    p.created_at,
    p.updated_at,
    p.due_date,
    'admin'::TEXT as permission_level,
    true as is_owner
  FROM projects p
  WHERE p.id = p_project_id AND p.user_id = auth.uid()
  
  UNION ALL
  
  -- Check if user is a collaborator
  SELECT 
    p.id,
    p.title,
    p.retailer,
    p.items,
    p.user_id,
    p.created_at,
    p.updated_at,
    p.due_date,
    pc.permission_level,
    false as is_owner
  FROM projects p
  JOIN project_collaborators pc ON pc.project_id = p.id
  WHERE p.id = p_project_id AND pc.user_id = auth.uid();
END;
$$;
```

### Usage from Client

```typescript
const { data: project, error } = await supabase.rpc('get_user_project', {
  p_project_id: projectId
})

if (!project || project.length === 0) {
  // No access or project doesn't exist
}
```

---

## Function: update_user_project

Updates a project with proper permission checking.

### SQL Definition

```sql
CREATE OR REPLACE FUNCTION update_user_project(
  p_project_id UUID,
  p_title TEXT DEFAULT NULL,
  p_retailer TEXT DEFAULT NULL,
  p_items JSONB DEFAULT NULL,
  p_due_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  project_id UUID,
  project_title TEXT,
  project_retailer TEXT,
  project_items JSONB,
  project_user_id UUID,
  project_created_at TIMESTAMPTZ,
  project_updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_access BOOLEAN;
  v_can_edit BOOLEAN;
BEGIN
  -- Check if user is owner
  SELECT EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id AND user_id = auth.uid()
  ) INTO v_has_access;
  
  -- If not owner, check if collaborator with edit permission
  IF NOT v_has_access THEN
    SELECT EXISTS (
      SELECT 1 FROM project_collaborators 
      WHERE project_id = p_project_id 
      AND user_id = auth.uid()
      AND permission_level IN ('edit', 'admin')
    ) INTO v_can_edit;
    
    IF NOT v_can_edit THEN
      RAISE EXCEPTION 'Access denied: You do not have permission to edit this project';
    END IF;
  END IF;
  
  -- Perform the update
  RETURN QUERY
  UPDATE projects
  SET
    title = COALESCE(p_title, title),
    retailer = COALESCE(p_retailer, retailer),
    items = COALESCE(p_items, items),
    due_date = COALESCE(p_due_date, due_date),
    updated_at = NOW()
  WHERE id = p_project_id
  RETURNING 
    id as project_id,
    title as project_title,
    retailer as project_retailer,
    items as project_items,
    user_id as project_user_id,
    created_at as project_created_at,
    updated_at as project_updated_at;
END;
$$;
```

### Code Explanation

| Line | Purpose |
|------|---------|
| `DEFAULT NULL` | Parameters are optional |
| `COALESCE(p_title, title)` | Only update if parameter provided |
| `RAISE EXCEPTION` | Throws error if no permission |
| `RETURNING` | Returns the updated row |

### Usage from Client

```typescript
const { data, error } = await supabase.rpc('update_user_project', {
  p_project_id: projectId,
  p_title: 'New Title',
  p_items: updatedItems
})

if (error?.message.includes('Access denied')) {
  // Handle permission error
}
```

---

## Function: invite_user_to_project

Creates a project invitation and returns the token.

### SQL Definition

```sql
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
  v_invitation_token TEXT;
  v_existing_invitation project_invitations%ROWTYPE;
  v_existing_collaborator project_collaborators%ROWTYPE;
BEGIN
  -- Verify current user is project owner
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

  -- Check for existing pending invitation
  SELECT * INTO v_existing_invitation
  FROM project_invitations
  WHERE project_id = p_project_id 
    AND invited_email = p_email
    AND accepted_at IS NULL
    AND expires_at > NOW();

  IF FOUND THEN
    -- Return existing token
    RETURN v_existing_invitation.invitation_token;
  END IF;

  -- Generate new invitation token
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
```

### Usage from Client

```typescript
const { data: token, error } = await supabase.rpc('invite_user_to_project', {
  p_project_id: projectId,
  p_email: 'user@example.com',
  p_permission_level: 'edit'
})

if (token) {
  const invitationUrl = `${window.location.origin}/project/invite/${token}`
  // Send email with invitationUrl
}
```

---

## Function: accept_project_invitation

Accepts an invitation and adds user as collaborator.

### SQL Definition

```sql
CREATE OR REPLACE FUNCTION accept_project_invitation(p_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation project_invitations%ROWTYPE;
  v_user_id UUID;
BEGIN
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
  
  -- Verify email matches (if authenticated)
  IF v_user_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = v_user_id AND email = v_invitation.invited_email
    ) THEN
      RAISE EXCEPTION 'Email does not match invitation';
    END IF;
  END IF;
  
  -- Add as collaborator
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
    -- Return project_id for redirect (user needs to sign in)
    RETURN v_invitation.project_id;
  END IF;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Already a collaborator on this project';
END;
$$;
```

---

## Function: get_invitation_details

Returns invitation details for display before accepting.

### SQL Definition

```sql
CREATE OR REPLACE FUNCTION get_invitation_details(p_token TEXT)
RETURNS TABLE (
  invited_email TEXT,
  project_id UUID,
  project_title TEXT,
  permission_level TEXT,
  expires_at TIMESTAMPTZ
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
```

---

## Function: get_or_create_project_board

Gets the whiteboard for a project, creating one if it doesn't exist.

### SQL Definition

```sql
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
DECLARE
  v_board project_boards%ROWTYPE;
BEGIN
  -- Verify user has access to project
  IF NOT EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id AND user_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_collaborators.project_id = p_project_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to this project';
  END IF;
  
  -- Try to get existing board
  SELECT * INTO v_board FROM project_boards WHERE project_boards.project_id = p_project_id;
  
  -- Create if not exists
  IF NOT FOUND THEN
    INSERT INTO project_boards (project_id, board_snapshot)
    VALUES (p_project_id, '{}')
    RETURNING * INTO v_board;
  END IF;
  
  RETURN QUERY SELECT 
    v_board.project_id,
    v_board.board_snapshot,
    v_board.created_at,
    v_board.updated_at;
END;
$$;
```

---

## Function: save_project_board

Saves whiteboard snapshot.

### SQL Definition

```sql
CREATE OR REPLACE FUNCTION save_project_board(
  p_project_id UUID,
  p_snapshot JSONB
)
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
  -- Verify user has edit access
  IF NOT EXISTS (
    SELECT 1 FROM projects WHERE id = p_project_id AND user_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_collaborators.project_id = p_project_id 
    AND user_id = auth.uid()
    AND permission_level IN ('edit', 'admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: You do not have permission to edit this board';
  END IF;
  
  -- Upsert the board
  RETURN QUERY
  INSERT INTO project_boards (project_id, board_snapshot, updated_at)
  VALUES (p_project_id, p_snapshot, NOW())
  ON CONFLICT (project_id) 
  DO UPDATE SET 
    board_snapshot = EXCLUDED.board_snapshot,
    updated_at = NOW()
  RETURNING *;
END;
$$;
```

---

## Function: get_project_collaborators_with_users

Gets collaborators with their user information.

### SQL Definition

```sql
CREATE OR REPLACE FUNCTION get_project_collaborators_with_users(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  user_id UUID,
  permission_level TEXT,
  invited_by UUID,
  joined_at TIMESTAMPTZ,
  user_email TEXT,
  user_full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller has access to project
  IF NOT EXISTS (
    SELECT 1 FROM projects WHERE projects.id = p_project_id AND user_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM project_collaborators pc
    WHERE pc.project_id = p_project_id AND pc.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  RETURN QUERY
  SELECT 
    pc.id,
    pc.project_id,
    pc.user_id,
    pc.permission_level,
    pc.invited_by,
    pc.joined_at,
    u.email as user_email,
    u.raw_user_meta_data->>'full_name' as user_full_name
  FROM project_collaborators pc
  JOIN auth.users u ON pc.user_id = u.id
  WHERE pc.project_id = p_project_id;
END;
$$;
```

---

## Calling Functions from Client

### Using supabase.rpc()

```typescript
// No parameters
const { data, error } = await supabase.rpc('function_name')

// With parameters
const { data, error } = await supabase.rpc('function_name', {
  param1: value1,
  param2: value2
})
```

### Error Handling

```typescript
const { data, error } = await supabase.rpc('invite_user_to_project', {
  p_project_id: projectId,
  p_email: email,
  p_permission_level: 'edit'
})

if (error) {
  if (error.message.includes('Only project owners')) {
    // Permission error
  } else if (error.message.includes('already a collaborator')) {
    // User already has access
  } else {
    // Other error
  }
}
```

---

## Chapter Summary

Database functions provide:

1. **Encapsulated business logic** - Complex operations in one place
2. **Security bypass when needed** - SECURITY DEFINER for controlled access
3. **Atomic operations** - All-or-nothing transactions
4. **Performance** - Fewer round trips

Key functions implemented:
- `get_user_projects` - List all accessible projects
- `get_user_project` - Get single project with access check
- `update_user_project` - Update with permission verification
- `invite_user_to_project` - Create invitations
- `accept_project_invitation` - Process invitation acceptance
- `get_or_create_project_board` - Manage whiteboard data
- `save_project_board` - Save whiteboard changes

---

*Next: [Chapter 9: Storage Setup](./chapter-09-storage-setup.md) - Configure file uploads*
