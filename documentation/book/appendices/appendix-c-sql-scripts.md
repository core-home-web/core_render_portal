# Appendix C: SQL Scripts Index

Complete index of all SQL scripts used in the Core Render Portal.

---

## Master Setup Script

**File:** Chapter 10 contains the complete setup script

**Purpose:** Creates all tables, indexes, RLS policies, functions, triggers, and storage buckets

**When to use:** Initial database setup or complete reset

---

## Script Summary

### Tables Created

| Table | Purpose |
|-------|---------|
| `projects` | Core project data |
| `user_profiles` | User preferences and settings |
| `project_collaborators` | Access control for sharing |
| `project_invitations` | Pending collaboration invitations |
| `project_logs` | Audit trail |
| `project_boards` | Whiteboard snapshots |

### Functions Created

| Function | Purpose |
|----------|---------|
| `get_user_projects()` | Get all projects user can access |
| `get_user_project(uuid)` | Get single project with access check |
| `update_user_project(...)` | Update project with permission check |
| `invite_user_to_project(...)` | Create collaboration invitation |
| `accept_project_invitation(text)` | Accept invitation and add collaborator |
| `get_invitation_details(text)` | Get invitation info for display |
| `get_or_create_project_board(uuid)` | Get/create whiteboard |
| `save_project_board(uuid, jsonb)` | Save whiteboard state |
| `get_project_collaborators_with_users(uuid)` | Get collaborators with user details |

### Storage Buckets

| Bucket | Purpose | Public |
|--------|---------|--------|
| `project-images` | Hero images, reference files | No |
| `profile-images` | User avatars | Yes |
| `board-assets` | Whiteboard images | No |

---

## Running Migrations

### Via Supabase Dashboard

1. Go to SQL Editor
2. Paste the script
3. Click Run
4. Verify success message

### Via psql (Advanced)

```bash
psql "postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres" \
  -f migration.sql
```

---

## Verification Queries

After running migrations, verify setup:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check functions exist  
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check storage buckets
SELECT id, name, public FROM storage.buckets;
```

---

*Return to [Appendices](./README.md)*
