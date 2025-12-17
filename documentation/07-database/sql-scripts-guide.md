# SQL Scripts Guide

Index of all SQL scripts in the `docs/` folder.

## Quick Reference

| Category | Primary Script | Purpose |
|----------|---------------|---------|
| **Initial Setup** | `PRODUCTION-SETUP-COMPLETE.sql` | Complete setup |
| **User Profiles** | `complete-user-profiles-setup.sql` | User profiles |
| **Whiteboard** | `create-project-boards-table.sql` | Whiteboard table |
| **Security** | `fix-security-warnings.sql` | Security fixes |

---

## Complete Setup Scripts

### PRODUCTION-SETUP-COMPLETE.sql

**Purpose:** Complete initial database setup

**Creates:**
- All tables
- RLS policies
- Functions
- Triggers
- Storage buckets

**When to use:** Fresh Supabase project setup

---

## User Profile Scripts

### complete-user-profiles-setup.sql

**Purpose:** Set up user profiles with auto-creation

**Creates:**
- `user_profiles` table
- `handle_new_user()` trigger function
- Auto-profile creation on signup

### setup-user-profiles.sql

**Purpose:** Basic profile table setup

### add-profile-images-and-due-dates.sql

**Purpose:** Add profile_image column and due_date to projects

---

## Collaboration Scripts

### project-collaboration-schema.sql

**Purpose:** Full collaboration setup

**Creates:**
- `project_collaborators` table
- `project_invitations` table
- Related RLS policies

### COMPLETE-INVITATION-SETUP.sql

**Purpose:** Complete invitation system

### fix-collaboration-schema.sql

**Purpose:** Fix collaboration table issues

---

## Whiteboard Scripts

### create-project-boards-table.sql

**Purpose:** Whiteboard data storage

**Creates:**
- `project_boards` table
- `get_or_create_project_board()` function
- `save_project_board()` function
- RLS policies

### setup-board-assets-storage.sql

**Purpose:** Storage bucket for board assets

### fix-board-function-permissions.sql

**Purpose:** Fix function permissions

---

## Fix Scripts

### fix-ambiguous-column-references.sql

**Problem:** "column reference is ambiguous" errors
**Solution:** Adds table aliases to all column references

### fix-rls-infinite-recursion.sql

**Problem:** RLS policy recursion errors
**Solution:** Restructures policies to avoid loops

### fix-security-warnings.sql

**Problem:** Supabase security warnings
**Solution:** Adds `search_path` to functions

### fix-security-warnings-v2.sql

**Purpose:** Additional security improvements

### fix-projects-rls-policies.sql

**Problem:** Project access issues
**Solution:** Fixes project RLS policies

### fix-project-collaborators-view.sql

**Problem:** Collaborator view errors
**Solution:** Fixes collaborator query function

### fix-invitation-flow.sql

**Problem:** Invitation acceptance issues
**Solution:** Fixes invitation handling

### fix-invitations-schema.sql

**Problem:** Invitation table issues
**Solution:** Schema corrections

### fix-database-issues.sql

**Purpose:** General database fixes

---

## Verification Scripts

### verify-project-boards-setup.sql

**Purpose:** Verify whiteboard setup is correct

**Checks:**
- Table exists
- Functions exist
- Policies are active

### verify-projects-rls.sql

**Purpose:** Verify project RLS policies

### verify-collaborators-function.sql

**Purpose:** Verify collaborator functions

### verify-and-fix-schema.sql

**Purpose:** Comprehensive schema verification

---

## Update Scripts

### update-project-access-control.sql

**Purpose:** Update access control logic

### update-project-access-control-fixed.sql

**Purpose:** Fixed version of access control

### update-project-rpc-with-due-date.sql

**Purpose:** Add due_date to RPC functions

### migrate-default-due-dates.sql

**Purpose:** Migrate existing projects to have due dates

---

## Test Scripts

### test-board-function.sql

**Purpose:** Test whiteboard functions

### test-update-function.sql

**Purpose:** Test update functions

---

## Storage Scripts

### SETUP-PHOTO-STORAGE.sql

**Purpose:** Set up photo storage bucket

---

## Running Scripts

### In Supabase Dashboard

1. Go to SQL Editor
2. Create new query
3. Paste script content
4. Click Run
5. Check output for errors

### Script Order

For fresh setup:

```
1. PRODUCTION-SETUP-COMPLETE.sql
   (or run individually:)
   
2. Base tables (projects, user_profiles)
3. complete-user-profiles-setup.sql
4. project-collaboration-schema.sql
5. create-project-boards-table.sql
6. fix-security-warnings.sql
7. fix-ambiguous-column-references.sql
```

### Safe Re-running

Most scripts use `IF NOT EXISTS` and can be re-run safely:

```sql
CREATE TABLE IF NOT EXISTS ...
CREATE INDEX IF NOT EXISTS ...
CREATE OR REPLACE FUNCTION ...
```

---

## Script Naming Convention

| Prefix | Meaning |
|--------|---------|
| `create-` | Creates new resources |
| `setup-` | Initial setup |
| `fix-` | Fixes issues |
| `update-` | Updates existing resources |
| `verify-` | Verification/testing |
| `add-` | Adds new columns/features |
| `migrate-` | Data migration |
| `test-` | Testing scripts |
| `PRODUCTION-` | Production-ready complete scripts |
| `COMPLETE-` | Comprehensive scripts |
| `FIX-` | Important fixes (uppercase for visibility) |

---

← [Migrations](./migrations.md) | Next: [Deployment Overview](../08-deployment/README.md) →

