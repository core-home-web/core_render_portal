# Supabase Functions

Database functions (RPC) called via `supabase.rpc()`.

## Overview

Supabase RPC functions provide:
- Complex queries in a single call
- Security via `SECURITY DEFINER`
- Business logic in the database

## get_or_create_project_board

Gets or creates a whiteboard for a project.

### Signature

```sql
get_or_create_project_board(p_project_id UUID) RETURNS JSONB
```

### Usage

```typescript
const { data, error } = await supabase
  .rpc('get_or_create_project_board', {
    p_project_id: projectId
  })

// Returns the board_snapshot JSONB
```

### Returns

```typescript
{
  "elements": [],
  "appState": {
    "viewBackgroundColor": "#ffffff"
  },
  "files": {}
}
```

### Access Control

- User must be project owner OR
- User must be a collaborator

### Implementation

```sql
CREATE OR REPLACE FUNCTION get_or_create_project_board(p_project_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_board project_boards;
BEGIN
  -- Check access
  IF NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.id = p_project_id AND p.user_id = auth.uid()
    UNION
    SELECT 1 FROM project_collaborators pc 
    WHERE pc.project_id = p_project_id AND pc.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Get or create
  INSERT INTO project_boards (project_id, board_snapshot)
  VALUES (p_project_id, '{}'::jsonb)
  ON CONFLICT (project_id) DO NOTHING;
  
  SELECT * INTO v_board
  FROM project_boards
  WHERE project_id = p_project_id;
  
  RETURN v_board.board_snapshot;
END;
$$;
```

---

## save_project_board

Saves whiteboard data.

### Signature

```sql
save_project_board(
  p_project_id UUID,
  p_board_snapshot JSONB
) RETURNS VOID
```

### Usage

```typescript
await supabase.rpc('save_project_board', {
  p_project_id: projectId,
  p_board_snapshot: {
    elements: [...],
    appState: {...},
    files: {...}
  }
})
```

### Access Control

- User must be project owner OR
- User must be collaborator with 'edit' or 'admin' permission

### Implementation

```sql
CREATE OR REPLACE FUNCTION save_project_board(
  p_project_id UUID,
  p_board_snapshot JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check edit access
  IF NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.id = p_project_id AND p.user_id = auth.uid()
    UNION
    SELECT 1 FROM project_collaborators pc 
    WHERE pc.project_id = p_project_id 
    AND pc.user_id = auth.uid()
    AND pc.permission_level IN ('edit', 'admin')
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  UPDATE project_boards
  SET 
    board_snapshot = p_board_snapshot,
    updated_at = NOW()
  WHERE project_id = p_project_id;
END;
$$;
```

---

## get_project_collaborators_with_users

Gets collaborators with user details.

### Signature

```sql
get_project_collaborators_with_users(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  user_id UUID,
  permission_level TEXT,
  user_email TEXT,
  user_full_name TEXT,
  joined_at TIMESTAMPTZ
)
```

### Usage

```typescript
const { data, error } = await supabase
  .rpc('get_project_collaborators_with_users', {
    p_project_id: projectId
  })

// Returns array of collaborators
```

### Returns

```typescript
[
  {
    "id": "uuid",
    "project_id": "uuid",
    "user_id": "uuid",
    "permission_level": "edit",
    "user_email": "user@example.com",
    "user_full_name": "John Doe",
    "joined_at": "2024-01-01T00:00:00Z"
  }
]
```

### Implementation

```sql
CREATE OR REPLACE FUNCTION get_project_collaborators_with_users(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  user_id UUID,
  permission_level TEXT,
  user_email TEXT,
  user_full_name TEXT,
  joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify access
  IF NOT EXISTS (
    SELECT 1 FROM projects p WHERE p.id = p_project_id AND p.user_id = auth.uid()
    UNION
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
    u.email AS user_email,
    up.display_name AS user_full_name,
    pc.joined_at
  FROM project_collaborators pc
  JOIN auth.users u ON pc.user_id = u.id
  LEFT JOIN user_profiles up ON pc.user_id = up.user_id
  WHERE pc.project_id = p_project_id;
END;
$$;
```

---

## accept_project_invitation

Accepts an invitation and creates a collaborator record.

### Signature

```sql
accept_project_invitation(p_token UUID)
RETURNS JSONB
```

### Usage

```typescript
const { data, error } = await supabase
  .rpc('accept_project_invitation', {
    p_token: invitationToken
  })
```

### Returns

```typescript
{
  "success": true,
  "project_id": "uuid",
  "permission_level": "edit"
}
```

### Errors

- `Invalid or expired invitation` - Token not found or expired
- `Email mismatch` - Logged in with different email

---

## get_user_projects

Gets all projects for the current user (owned and shared).

### Signature

```sql
get_user_projects()
RETURNS TABLE (
  id UUID,
  title TEXT,
  retailer TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ,
  is_owner BOOLEAN,
  permission_level TEXT
)
```

### Usage

```typescript
const { data, error } = await supabase.rpc('get_user_projects')
```

### Returns

```typescript
[
  {
    "id": "uuid",
    "title": "My Project",
    "retailer": "Client",
    "due_date": "2024-12-31",
    "is_owner": true,
    "permission_level": null
  },
  {
    "id": "uuid",
    "title": "Shared Project",
    "retailer": "Other Client",
    "due_date": null,
    "is_owner": false,
    "permission_level": "edit"
  }
]
```

---

## Error Handling

All functions raise exceptions for access violations:

```sql
RAISE EXCEPTION 'Access denied';
```

In JavaScript, catch errors:

```typescript
const { data, error } = await supabase.rpc('function_name', params)

if (error) {
  if (error.message.includes('Access denied')) {
    // Handle permission error
  } else {
    // Handle other errors
  }
}
```

---

## Creating New Functions

### Template

```sql
CREATE OR REPLACE FUNCTION function_name(
  p_param1 TYPE,
  p_param2 TYPE
)
RETURNS RETURN_TYPE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_variable TYPE;
BEGIN
  -- Check access
  IF NOT EXISTS (/* access check */) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Business logic
  
  RETURN result;
END;
$$;
```

### Best Practices

1. **Use SECURITY DEFINER** - Runs with function owner's privileges
2. **Set search_path** - Prevents SQL injection
3. **Check access first** - Verify user has permission
4. **Use table aliases** - Avoid ambiguous column references
5. **Return minimal data** - Only what's needed

---

← [API Endpoints](./endpoints.md) | Next: [Database Overview](../07-database/README.md) →

