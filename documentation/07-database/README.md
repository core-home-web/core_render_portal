# Database Overview

This section covers the PostgreSQL database structure and setup.

## In This Section

| Document | Description |
|----------|-------------|
| [Tables](./tables.md) | All database tables |
| [RLS Policies](./rls-policies.md) | Row Level Security |
| [Migrations](./migrations.md) | Running database migrations |
| [SQL Scripts Guide](./sql-scripts-guide.md) | Index of all SQL scripts |

## Database Technology

- **Database:** PostgreSQL (via Supabase)
- **ORM:** None (direct SQL)
- **Client:** Supabase JavaScript client

## Quick Overview

| Table | Purpose |
|-------|---------|
| `projects` | Project data |
| `user_profiles` | User preferences |
| `project_collaborators` | Who has access |
| `project_invitations` | Pending invites |
| `project_logs` | Activity history |
| `project_boards` | Whiteboard data |

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              auth.users                                      │
│                           (Supabase managed)                                 │
│                                                                              │
│  id │ email │ created_at │ ...                                              │
└──────┬──────────────────────────────────────────────────────────────────────┘
       │
       │ 1:1
       ▼
┌──────────────────┐     ┌─────────────────┐     ┌────────────────────────┐
│  user_profiles   │     │    projects     │     │  project_invitations   │
│                  │     │                 │     │                        │
│  user_id (FK)    │     │  user_id (FK)   │     │  project_id (FK)       │
│  display_name    │     │  title          │     │  invited_email         │
│  team            │     │  retailer       │     │  permission_level      │
│  profile_image   │     │  items (JSONB)  │     │  token                 │
└──────────────────┘     │  due_date       │     │  expires_at            │
                         └────────┬────────┘     └────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │ 1:N         │ 1:N         │ 1:1
                    ▼             ▼             ▼
         ┌──────────────────┐  ┌─────────────┐  ┌─────────────────┐
         │ project_         │  │ project_    │  │ project_boards  │
         │ collaborators    │  │ logs        │  │                 │
         │                  │  │             │  │ project_id (PK) │
         │ project_id (FK)  │  │ project_id  │  │ board_snapshot  │
         │ user_id (FK)     │  │ user_id     │  │                 │
         │ permission_level │  │ action      │  │                 │
         └──────────────────┘  │ details     │  └─────────────────┘
                               └─────────────┘
```

## Connecting to Database

### From Frontend (Client)

```typescript
import { supabase } from '@/lib/supaClient'

// Query
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)

// Insert
const { data, error } = await supabase
  .from('projects')
  .insert({ title: 'New Project', retailer: 'Client' })
  .select()
  .single()

// Update
const { error } = await supabase
  .from('projects')
  .update({ title: 'Updated Title' })
  .eq('id', projectId)

// Delete
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId)
```

### From API Routes (Server)

```typescript
import { supabaseAdmin } from '@/lib/supaAdmin'

// Bypass RLS for admin operations
const { data } = await supabaseAdmin
  .from('projects')
  .select('*')
```

## Key Concepts

### Row Level Security (RLS)

All tables have RLS enabled. This means:
- Users can only see data they have access to
- Policies define who can read/write/update/delete
- Enforced at database level (cannot be bypassed)

### JSONB Columns

Complex data is stored as JSONB:
- `projects.items` - Array of items with parts
- `project_boards.board_snapshot` - Excalidraw data
- `project_logs.details` - Change details

### Foreign Keys

Relationships are enforced with foreign keys:
- `projects.user_id` → `auth.users.id`
- `project_collaborators.project_id` → `projects.id`
- Cascade deletes remove related data

## Initial Setup

See [Migrations](./migrations.md) for complete setup instructions.

Quick start:

1. Go to Supabase SQL Editor
2. Run `docs/PRODUCTION-SETUP-COMPLETE.sql`
3. Verify tables in Table Editor

## Common Queries

### Get User's Projects

```typescript
// Owned projects
const owned = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)

// Shared projects
const shared = await supabase
  .from('project_collaborators')
  .select('project_id, permission_level, projects(*)')
  .eq('user_id', userId)
```

### Check User Permission

```typescript
const { data: collab } = await supabase
  .from('project_collaborators')
  .select('permission_level')
  .eq('project_id', projectId)
  .eq('user_id', userId)
  .single()

const canEdit = collab?.permission_level === 'edit' 
             || collab?.permission_level === 'admin'
```

### Log a Change

```typescript
await supabase.from('project_logs').insert({
  project_id: projectId,
  user_id: userId,
  action: 'update',
  details: {
    previous_data: oldProject,
    new_data: newProject
  }
})
```

---

← [Supabase Functions](../06-api/supabase-functions.md) | Next: [Tables](./tables.md) →

