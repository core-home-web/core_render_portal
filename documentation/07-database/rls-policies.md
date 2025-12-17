# Row Level Security (RLS) Policies

RLS policies control who can access what data.

## What is RLS?

Row Level Security is a PostgreSQL feature that:
- Filters data at the database level
- Cannot be bypassed by client code
- Uses policies to define access rules

## Enabling RLS

```sql
-- Enable RLS on a table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner too
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
```

## Projects Policies

### Select (View)

Users can view projects they own or collaborate on.

```sql
-- Owner can view
CREATE POLICY "projects_select_owner"
ON projects FOR SELECT
USING (user_id = auth.uid());

-- Collaborators can view
CREATE POLICY "projects_select_collaborator"
ON projects FOR SELECT
USING (
  id IN (
    SELECT project_id 
    FROM project_collaborators 
    WHERE user_id = auth.uid()
  )
);
```

### Insert (Create)

Authenticated users can create projects.

```sql
CREATE POLICY "projects_insert"
ON projects FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
```

### Update

Owners and edit/admin collaborators can update.

```sql
-- Owner can update
CREATE POLICY "projects_update_owner"
ON projects FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Edit/admin collaborators can update
CREATE POLICY "projects_update_collaborator"
ON projects FOR UPDATE
USING (
  id IN (
    SELECT project_id 
    FROM project_collaborators 
    WHERE user_id = auth.uid()
    AND permission_level IN ('edit', 'admin')
  )
);
```

### Delete

Only owners can delete.

```sql
CREATE POLICY "projects_delete_owner"
ON projects FOR DELETE
USING (user_id = auth.uid());
```

---

## User Profiles Policies

Users can only access their own profile.

```sql
-- View own profile
CREATE POLICY "profiles_select_own"
ON user_profiles FOR SELECT
USING (user_id = auth.uid());

-- Insert own profile
CREATE POLICY "profiles_insert_own"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Update own profile
CREATE POLICY "profiles_update_own"
ON user_profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

---

## Project Collaborators Policies

### Select

Project members can view collaborators.

```sql
CREATE POLICY "collaborators_select"
ON project_collaborators FOR SELECT
USING (
  -- Owner can see
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  -- Collaborators can see
  project_id IN (
    SELECT project_id FROM project_collaborators WHERE user_id = auth.uid()
  )
);
```

### Insert

Owners and admins can add collaborators.

```sql
CREATE POLICY "collaborators_insert"
ON project_collaborators FOR INSERT
TO authenticated
WITH CHECK (
  -- Owner can add
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  -- Admin can add
  project_id IN (
    SELECT project_id FROM project_collaborators 
    WHERE user_id = auth.uid() AND permission_level = 'admin'
  )
);
```

### Update

Owners and admins can update permissions.

```sql
CREATE POLICY "collaborators_update"
ON project_collaborators FOR UPDATE
USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  project_id IN (
    SELECT project_id FROM project_collaborators 
    WHERE user_id = auth.uid() AND permission_level = 'admin'
  )
);
```

### Delete

Owners and admins can remove collaborators.

```sql
CREATE POLICY "collaborators_delete"
ON project_collaborators FOR DELETE
USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  project_id IN (
    SELECT project_id FROM project_collaborators 
    WHERE user_id = auth.uid() AND permission_level = 'admin'
  )
);
```

---

## Project Invitations Policies

```sql
-- View invitations for projects you can manage
CREATE POLICY "invitations_select"
ON project_invitations FOR SELECT
USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  project_id IN (
    SELECT project_id FROM project_collaborators 
    WHERE user_id = auth.uid() AND permission_level = 'admin'
  )
);

-- Create invitations if you can manage
CREATE POLICY "invitations_insert"
ON project_invitations FOR INSERT
TO authenticated
WITH CHECK (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  project_id IN (
    SELECT project_id FROM project_collaborators 
    WHERE user_id = auth.uid() AND permission_level = 'admin'
  )
);
```

---

## Project Logs Policies

```sql
-- View logs for accessible projects
CREATE POLICY "logs_select"
ON project_logs FOR SELECT
USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  project_id IN (
    SELECT project_id FROM project_collaborators WHERE user_id = auth.uid()
  )
);

-- Insert logs for accessible projects
CREATE POLICY "logs_insert"
ON project_logs FOR INSERT
TO authenticated
WITH CHECK (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  project_id IN (
    SELECT project_id FROM project_collaborators WHERE user_id = auth.uid()
  )
);
```

---

## Project Boards Policies

```sql
-- View boards for accessible projects
CREATE POLICY "boards_select"
ON project_boards FOR SELECT
USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  project_id IN (
    SELECT project_id FROM project_collaborators WHERE user_id = auth.uid()
  )
);

-- Update boards if you can edit
CREATE POLICY "boards_update"
ON project_boards FOR UPDATE
USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  OR
  project_id IN (
    SELECT project_id FROM project_collaborators 
    WHERE user_id = auth.uid() AND permission_level IN ('edit', 'admin')
  )
);
```

---

## Common Issues

### Infinite Recursion

If policies reference each other, you get recursion errors.

**Problem:**
```sql
-- projects policy checks collaborators
-- collaborators policy checks projects
-- → infinite loop!
```

**Solution:** Use simple conditions or database functions.

### Performance

RLS adds overhead. Optimize with:
- Indexes on filtered columns
- Simple policy conditions
- Database functions for complex logic

### Debugging

Check effective policies:

```sql
-- List policies on a table
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'user-uuid-here';
SELECT * FROM projects;
```

---

## Bypassing RLS

For admin operations, use the service role:

```typescript
// Uses SUPABASE_SERVICE_ROLE_KEY
import { supabaseAdmin } from '@/lib/supaAdmin'

// This bypasses RLS
const { data } = await supabaseAdmin.from('projects').select('*')
```

**Warning:** Only use in API routes, never expose service key to client.

---

← [Tables](./tables.md) | Next: [Migrations](./migrations.md) →

