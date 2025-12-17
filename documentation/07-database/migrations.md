# Migrations

How to set up and update the database schema.

## Initial Setup

### Step 1: Access SQL Editor

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Navigate to **SQL Editor**
4. Click **New Query**

### Step 2: Run Complete Setup

Copy and run the complete setup script:

**File:** `docs/PRODUCTION-SETUP-COMPLETE.sql`

This creates:
- All tables
- RLS policies
- Database functions
- Triggers
- Indexes

### Step 3: Verify Setup

Check that all tables exist:

1. Go to **Table Editor**
2. Verify these tables exist:
   - `projects`
   - `user_profiles`
   - `project_collaborators`
   - `project_invitations`
   - `project_logs`
   - `project_boards`

### Step 4: Set Up Storage

1. Go to **Storage**
2. Create buckets:
   - `project-images` (public)
   - `board-assets` (public)
   - `profile-images` (public)
3. Run storage policy scripts

---

## Running Migrations

### Applying a Migration

1. Open SQL Editor
2. Create new query
3. Paste SQL content
4. Click **Run**
5. Check for errors in output

### Order Matters

Run migrations in order. Dependencies:

```
1. Base tables (projects, user_profiles)
2. Relation tables (project_collaborators, invitations)
3. Feature tables (project_boards, project_logs)
4. RLS policies
5. Functions and triggers
```

---

## Available Migration Scripts

### Complete Setup

| Script | Purpose |
|--------|---------|
| `PRODUCTION-SETUP-COMPLETE.sql` | Full initial setup |
| `PRODUCTION-COMPLETE-SETUP.sql` | Alternative full setup |

### User Profiles

| Script | Purpose |
|--------|---------|
| `complete-user-profiles-setup.sql` | User profiles table + trigger |
| `setup-user-profiles.sql` | Basic profile setup |
| `add-profile-images-and-due-dates.sql` | Add columns |

### Project Features

| Script | Purpose |
|--------|---------|
| `create-project-boards-table.sql` | Whiteboard storage |
| `project-collaboration-schema.sql` | Collaboration tables |

### Fixes and Updates

| Script | Purpose |
|--------|---------|
| `fix-ambiguous-column-references.sql` | Fix column ambiguity |
| `fix-rls-infinite-recursion.sql` | Fix RLS recursion |
| `fix-security-warnings.sql` | Security improvements |

---

## Creating a New Migration

### 1. Create SQL File

```sql
-- docs/my-new-migration.sql

-- Description: Add new feature table
-- Date: 2024-01-15

-- Create table
CREATE TABLE IF NOT EXISTS new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "new_feature_select"
ON new_feature FOR SELECT
USING (
  project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
);

-- Add index
CREATE INDEX idx_new_feature_project ON new_feature(project_id);
```

### 2. Test Locally

If you have a local Supabase instance:

```bash
supabase db push
```

### 3. Apply to Production

1. Open Supabase SQL Editor
2. Paste and run the script
3. Verify changes in Table Editor

---

## Rollback Strategy

There's no automatic rollback. For each migration:

### Create Undo Script

```sql
-- docs/my-new-migration-undo.sql

-- Drop policies first
DROP POLICY IF EXISTS "new_feature_select" ON new_feature;

-- Drop indexes
DROP INDEX IF EXISTS idx_new_feature_project;

-- Drop table
DROP TABLE IF EXISTS new_feature;
```

### Manual Rollback

1. Run undo script in SQL Editor
2. Verify changes
3. Document the rollback

---

## Best Practices

### 1. Use IF NOT EXISTS

```sql
CREATE TABLE IF NOT EXISTS table_name (...);
CREATE INDEX IF NOT EXISTS idx_name ON table_name(column);
```

### 2. Use ON CONFLICT for Inserts

```sql
INSERT INTO table (id, value)
VALUES ('id', 'value')
ON CONFLICT (id) DO NOTHING;
```

### 3. Test Before Production

- Run on a test database first
- Verify with sample data
- Check for errors

### 4. Document Changes

Add comments to migrations:

```sql
-- Migration: Add due_date column
-- Date: 2024-01-15
-- Author: Developer Name
-- Reason: Support project deadlines

ALTER TABLE projects ADD COLUMN IF NOT EXISTS due_date DATE;
```

### 5. Backup First

Before major changes:

1. Export data from Table Editor
2. Take note of current state
3. Have undo script ready

---

## Common Issues

### "relation already exists"

Table/index already created. Use `IF NOT EXISTS`:

```sql
CREATE TABLE IF NOT EXISTS my_table (...);
```

### "permission denied"

RLS is blocking. Check:
- You're using the right role
- Policies allow the operation

### "violates foreign key constraint"

Referenced row doesn't exist. Check:
- Parent table has the referenced ID
- Run parent migrations first

### "column does not exist"

Column referenced but not created:
- Check migration order
- Verify column name spelling

---

← [RLS Policies](./rls-policies.md) | Next: [SQL Scripts Guide](./sql-scripts-guide.md) →

