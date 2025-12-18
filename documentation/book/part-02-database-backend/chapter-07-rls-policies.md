# Chapter 7: Row Level Security (RLS)

Row Level Security is PostgreSQL's built-in feature that filters data at the database level. This chapter covers all RLS policies used in the Core Render Portal.

---

## What is Row Level Security?

RLS allows you to define policies that control which rows users can see and modify. Unlike application-level checks, RLS:

- **Cannot be bypassed** from client code
- **Works at query time** - filtering happens in the database
- **Applies to all access** - direct queries, joins, functions
- **Is transparent** - queries work normally, just filtered

### RLS Mental Model

```
┌──────────────────────────────────────────────────────────────────┐
│                     Traditional Security                         │
│                                                                  │
│  Application Code → Database → Returns ALL data → Filter in app │
│                                                                  │
│  ⚠️ Problem: Bugs can expose all data                           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     Row Level Security                           │
│                                                                  │
│  Application Code → Database → Policy Filter → Returns SAFE data│
│                                                                  │
│  ✅ Benefit: Database enforces security                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Enabling RLS

RLS must be enabled on each table:

```sql
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_boards ENABLE ROW LEVEL SECURITY;
```

> **Important:** Once RLS is enabled, users see NO data until policies are created.

---

## Key Concepts

### auth.uid()

Supabase provides `auth.uid()` function that returns the current user's ID:

```sql
-- Returns the UUID of the currently authenticated user
-- Returns NULL if not authenticated
SELECT auth.uid();
```

### Policy Syntax

```sql
CREATE POLICY "policy_name" ON table_name
  FOR operation          -- SELECT, INSERT, UPDATE, DELETE, or ALL
  USING (condition)      -- Which rows can be accessed
  WITH CHECK (condition) -- Which rows can be inserted/updated
```

### Policy Operations

| Operation | USING | WITH CHECK |
|-----------|-------|------------|
| SELECT | Which rows visible | N/A |
| INSERT | N/A | Which rows can be inserted |
| UPDATE | Which rows can be updated | What values can be set |
| DELETE | Which rows can be deleted | N/A |
| ALL | Both apply | Both apply |

---

## Projects Table Policies

### Policy: Users can view their own projects

```sql
CREATE POLICY "Users can view their own projects" ON projects
FOR SELECT 
USING (auth.uid() = user_id);
```

**Explanation:**
- `FOR SELECT`: Applies to read operations
- `USING (auth.uid() = user_id)`: Only rows where user_id matches the current user

### Policy: Users can create their own projects

```sql
CREATE POLICY "Users can create their own projects" ON projects
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

**Explanation:**
- `FOR INSERT`: Applies to new rows
- `WITH CHECK`: user_id must equal current user's ID

### Policy: Users can update their own projects

```sql
CREATE POLICY "Users can update their own projects" ON projects
FOR UPDATE 
USING (auth.uid() = user_id);
```

### Policy: Users can delete their own projects

```sql
CREATE POLICY "Users can delete their own projects" ON projects
FOR DELETE 
USING (auth.uid() = user_id);
```

### Policy: Collaborators can view shared projects

```sql
CREATE POLICY "Collaborators can view shared projects" ON projects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_collaborators.project_id = projects.id 
    AND project_collaborators.user_id = auth.uid()
  )
);
```

**Explanation:**
- Uses subquery to check if current user is a collaborator
- `EXISTS` is efficient - stops at first match

### Policy: Collaborators can update shared projects (with edit permission)

```sql
CREATE POLICY "Collaborators with edit can update" ON projects
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_collaborators.project_id = projects.id 
    AND project_collaborators.user_id = auth.uid()
    AND project_collaborators.permission_level IN ('edit', 'admin')
  )
);
```

---

## User Profiles Table Policies

### Policy: Users can view their own profile

```sql
CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT 
USING (auth.uid() = user_id);
```

### Policy: Users can insert their own profile

```sql
CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### Policy: Users can update their own profile

```sql
CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE 
USING (auth.uid() = user_id);
```

### Policy: Users can view collaborator profiles

```sql
CREATE POLICY "Users can view collaborator profiles" ON user_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_collaborators pc
    JOIN projects p ON pc.project_id = p.id
    WHERE (p.user_id = auth.uid() OR pc.user_id = auth.uid())
    AND user_profiles.user_id = pc.user_id
  )
);
```

---

## Project Collaborators Table Policies

### Policy: Users can view their own collaborations

```sql
CREATE POLICY "Users can view their own collaborations" ON project_collaborators
FOR SELECT 
USING (auth.uid() = user_id);
```

### Policy: Project owners can view all collaborators

```sql
CREATE POLICY "Project owners can view all collaborators" ON project_collaborators
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
);
```

### Policy: Project owners can manage collaborators

```sql
CREATE POLICY "Project owners can manage collaborators" ON project_collaborators
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
);
```

**Note:** `FOR ALL` covers INSERT, UPDATE, and DELETE.

### Policy: Admins can manage collaborators

```sql
CREATE POLICY "Admins can manage collaborators" ON project_collaborators
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM project_collaborators pc
    WHERE pc.project_id = project_collaborators.project_id
    AND pc.user_id = auth.uid()
    AND pc.permission_level = 'admin'
  )
);
```

---

## Project Invitations Table Policies

### Policy: Project owners can manage invitations

```sql
CREATE POLICY "Project owners can manage invitations" ON project_invitations
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_invitations.project_id 
    AND projects.user_id = auth.uid()
  )
);
```

### Policy: Users can view invitations sent to their email

```sql
CREATE POLICY "Users can view invitations sent to their email" ON project_invitations
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.email = project_invitations.invited_email 
    AND auth.users.id = auth.uid()
  )
);
```

**Note:** This allows users to see invitations awaiting their acceptance.

---

## Project Logs Table Policies

### Policy: Project owners can view logs

```sql
CREATE POLICY "Project owners can view logs" ON project_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_logs.project_id
    AND projects.user_id = auth.uid()
  )
);
```

### Policy: Collaborators can view logs

```sql
CREATE POLICY "Collaborators can view logs" ON project_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_logs.project_id
    AND project_collaborators.user_id = auth.uid()
  )
);
```

### Policy: Authenticated users can insert logs

```sql
CREATE POLICY "Authenticated users can insert logs" ON project_logs
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND auth.uid() = user_id
);
```

---

## Project Boards Table Policies

### Policy: Project owners can access boards

```sql
CREATE POLICY "Project owners can access boards" ON project_boards
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_boards.project_id
    AND projects.user_id = auth.uid()
  )
);
```

### Policy: Collaborators can view boards

```sql
CREATE POLICY "Collaborators can view boards" ON project_boards
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_boards.project_id
    AND project_collaborators.user_id = auth.uid()
  )
);
```

### Policy: Collaborators with edit can update boards

```sql
CREATE POLICY "Collaborators with edit can update boards" ON project_boards
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_boards.project_id
    AND project_collaborators.user_id = auth.uid()
    AND project_collaborators.permission_level IN ('edit', 'admin')
  )
);
```

---

## Complete RLS Setup Script

```sql
-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_boards ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================

-- Users can view their own projects
CREATE POLICY "Users can view their own projects" ON projects
FOR SELECT USING (auth.uid() = user_id);

-- Collaborators can view shared projects
CREATE POLICY "Collaborators can view shared projects" ON projects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_collaborators.project_id = projects.id 
    AND project_collaborators.user_id = auth.uid()
  )
);

-- Users can create their own projects
CREATE POLICY "Users can create their own projects" ON projects
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update their own projects" ON projects
FOR UPDATE USING (auth.uid() = user_id);

-- Collaborators with edit can update projects
CREATE POLICY "Collaborators with edit can update" ON projects
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM project_collaborators 
    WHERE project_collaborators.project_id = projects.id 
    AND project_collaborators.user_id = auth.uid()
    AND project_collaborators.permission_level IN ('edit', 'admin')
  )
);

-- Users can delete their own projects
CREATE POLICY "Users can delete their own projects" ON projects
FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

CREATE POLICY "Users can view own profile" ON user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- PROJECT COLLABORATORS POLICIES
-- ============================================================================

CREATE POLICY "Users can view their own collaborations" ON project_collaborators
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Project owners can view all collaborators" ON project_collaborators
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Project owners can manage collaborators" ON project_collaborators
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_collaborators.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- ============================================================================
-- PROJECT INVITATIONS POLICIES
-- ============================================================================

CREATE POLICY "Project owners can manage invitations" ON project_invitations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_invitations.project_id 
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view invitations sent to their email" ON project_invitations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.email = project_invitations.invited_email 
    AND auth.users.id = auth.uid()
  )
);

-- ============================================================================
-- PROJECT LOGS POLICIES
-- ============================================================================

CREATE POLICY "Project owners can view logs" ON project_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_logs.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Collaborators can view logs" ON project_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_logs.project_id
    AND project_collaborators.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can insert logs" ON project_logs
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- ============================================================================
-- PROJECT BOARDS POLICIES
-- ============================================================================

CREATE POLICY "Project owners can access boards" ON project_boards
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_boards.project_id
    AND projects.user_id = auth.uid()
  )
);

CREATE POLICY "Collaborators can view boards" ON project_boards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_boards.project_id
    AND project_collaborators.user_id = auth.uid()
  )
);

CREATE POLICY "Collaborators with edit can update boards" ON project_boards
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_collaborators.project_id = project_boards.project_id
    AND project_collaborators.user_id = auth.uid()
    AND project_collaborators.permission_level IN ('edit', 'admin')
  )
);
```

---

## Testing RLS Policies

### Test as Specific User

In Supabase SQL Editor:

```sql
-- Set the current user (for testing)
SET request.jwt.claim.sub = 'user-uuid-here';

-- Now queries will use RLS as that user
SELECT * FROM projects;
```

### Verify Policy Works

```sql
-- As project owner
SELECT * FROM projects WHERE id = 'project-uuid';
-- Should return the project

-- As non-owner/non-collaborator
SET request.jwt.claim.sub = 'different-user-uuid';
SELECT * FROM projects WHERE id = 'project-uuid';
-- Should return empty
```

---

## Common RLS Patterns

### Pattern: Owner Access

```sql
CREATE POLICY "owner_access" ON table_name
FOR ALL USING (auth.uid() = owner_column);
```

### Pattern: Member Access via Junction Table

```sql
CREATE POLICY "member_access" ON table_name
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM membership_table
    WHERE membership_table.resource_id = table_name.id
    AND membership_table.user_id = auth.uid()
  )
);
```

### Pattern: Hierarchical Access

```sql
CREATE POLICY "hierarchical_access" ON child_table
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM parent_table
    WHERE parent_table.id = child_table.parent_id
    AND parent_table.user_id = auth.uid()
  )
);
```

---

## Avoiding Common Pitfalls

### Pitfall 1: Infinite Recursion

**Problem:** Policy on table A checks table B, policy on table B checks table A.

**Solution:** Use SECURITY DEFINER functions.

### Pitfall 2: Performance Issues

**Problem:** Complex subqueries in policies slow down queries.

**Solution:** 
- Add indexes on columns used in policies
- Use EXISTS instead of IN
- Keep policies simple

### Pitfall 3: Forgetting RLS on New Tables

**Problem:** New table accessible to all users.

**Solution:** Enable RLS immediately after CREATE TABLE.

---

## Chapter Summary

Row Level Security provides:

1. **Database-level enforcement** - Cannot be bypassed by application bugs
2. **Transparent filtering** - Queries work normally
3. **Fine-grained control** - Different policies for different operations

Key policies implemented:
- Project owners can fully manage their projects
- Collaborators get access based on permission level
- Users can only see/edit their own profiles
- Audit logs are readable by project participants

---

*Next: [Chapter 8: Database Functions](./chapter-08-database-functions.md) - Stored procedures and RPCs*
