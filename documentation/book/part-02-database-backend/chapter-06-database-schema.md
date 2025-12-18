# Chapter 6: Database Schema

This chapter provides a complete reference for all database tables, their columns, relationships, and the rationale behind the schema design.

---

## Schema Overview

The Core Render Portal uses PostgreSQL through Supabase. The schema is designed around these principles:

1. **Normalized where practical**: Separate tables for distinct entities
2. **JSONB for flexible data**: Complex nested data (items, parts) stored as JSONB
3. **Audit trail**: Timestamps and logging on all tables
4. **Foreign key integrity**: Relationships enforced at database level
5. **RLS-ready**: Schema designed for Row Level Security

---

## Entity Relationship Diagram

```
                                 ┌──────────────────────┐
                                 │     auth.users       │
                                 │  (Supabase managed)  │
                                 │                      │
                                 │ id (UUID, PK)        │
                                 │ email                │
                                 │ created_at           │
                                 └──────────┬───────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
         ┌──────────────────┐   ┌──────────────────┐   ┌─────────────────────┐
         │  user_profiles   │   │     projects     │   │ project_invitations │
         │──────────────────│   │──────────────────│   │─────────────────────│
         │ user_id (PK,FK)  │   │ id (PK)          │   │ id (PK)             │
         │ display_name     │   │ title            │   │ project_id (FK)     │
         │ team             │   │ retailer         │   │ invited_email       │
         │ profile_image    │   │ user_id (FK)     │   │ permission_level    │
         │ default_due_date │   │ items (JSONB)    │   │ invitation_token    │
         │ created_at       │   │ due_date         │   │ invited_by (FK)     │
         │ updated_at       │   │ created_at       │   │ expires_at          │
         └──────────────────┘   │ updated_at       │   │ accepted_at         │
                                └────────┬─────────┘   │ created_at          │
                                         │             └─────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
         ┌─────────────────────┐ ┌──────────────┐ ┌─────────────────────┐
         │project_collaborators│ │ project_logs │ │   project_boards    │
         │─────────────────────│ │──────────────│ │─────────────────────│
         │ id (PK)             │ │ id (PK)      │ │ project_id (PK,FK)  │
         │ project_id (FK)     │ │ project_id   │ │ board_snapshot      │
         │ user_id (FK)        │ │ user_id      │ │ created_at          │
         │ permission_level    │ │ action       │ │ updated_at          │
         │ invited_by (FK)     │ │ details      │ └─────────────────────┘
         │ joined_at           │ │ timestamp    │
         │ created_at          │ └──────────────┘
         │ updated_at          │
         └─────────────────────┘
```

---

## Table: projects

The core table storing all project information.

### SQL Definition

```sql
CREATE TABLE IF NOT EXISTS projects (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Project details
  title TEXT NOT NULL,
  retailer TEXT NOT NULL,
  
  -- Owner reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Complex data as JSONB
  items JSONB DEFAULT '[]',
  
  -- Collaboration settings
  collaboration_enabled BOOLEAN DEFAULT true,
  public_view BOOLEAN DEFAULT false,
  
  -- Due date (optional)
  due_date TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);
```

### Column Reference

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Unique identifier |
| `title` | TEXT | NO | - | Project name |
| `retailer` | TEXT | NO | - | Client/retailer name |
| `user_id` | UUID | NO | - | Owner's auth.users.id |
| `items` | JSONB | YES | `'[]'` | Array of items with parts |
| `collaboration_enabled` | BOOLEAN | YES | `true` | Allow sharing |
| `public_view` | BOOLEAN | YES | `false` | Public access |
| `due_date` | TIMESTAMPTZ | YES | - | Target completion date |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | YES | `NOW()` | Last update timestamp |

### JSONB Structure: items

```typescript
// TypeScript interface for items JSONB column
interface Item {
  id: string;           // UUID, auto-generated on client
  name: string;         // Item name (e.g., "Living Room Chair")
  hero_image?: string;  // URL to main image
  parts?: Part[];       // Array of part specifications
  versions?: Version[]; // Alternative: versioned parts
  groups?: PartGroup[]; // Optional grouping of parts
}

interface Part {
  id?: string;          // UUID, optional
  name: string;         // Part name (e.g., "Seat Cushion")
  finish: string;       // Finish type (e.g., "Matte", "Gloss")
  color: string;        // Color hex or name
  texture: string;      // Texture type (e.g., "Leather", "Fabric")
  files?: string[];     // Reference file URLs
  notes?: string;       // Additional notes
  annotation_data?: {   // Position on hero image
    x: number;
    y: number;
    id: string;
  };
}

interface Version {
  id: string;
  versionNumber: number;
  versionName?: string;
  parts: Part[];
  created_at?: string;
}
```

### Example Data

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Modern Dining Chair",
      "hero_image": "https://xxx.supabase.co/storage/v1/object/public/...",
      "parts": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "name": "Seat",
          "finish": "Matte",
          "color": "#8B4513",
          "texture": "Leather",
          "files": [],
          "annotation_data": {
            "x": 150,
            "y": 200,
            "id": "marker-1"
          }
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "name": "Frame",
          "finish": "Satin",
          "color": "#2F4F4F",
          "texture": "Metal",
          "files": []
        }
      ]
    }
  ]
}
```

---

## Table: user_profiles

Stores user preferences and team assignment.

### SQL Definition

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  -- Primary key (also foreign key to auth.users)
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile information
  display_name TEXT,
  team TEXT CHECK (team IN ('product_development', 'industrial_design')),
  profile_image TEXT,
  
  -- Default settings
  default_due_date_value INTEGER DEFAULT 14,
  default_due_date_unit TEXT DEFAULT 'days' 
    CHECK (default_due_date_unit IN ('days', 'weeks', 'months')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Column Reference

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `user_id` | UUID | NO | - | Links to auth.users.id |
| `display_name` | TEXT | YES | - | Display name |
| `team` | TEXT | YES | - | Team: product_development or industrial_design |
| `profile_image` | TEXT | YES | - | URL to profile picture |
| `default_due_date_value` | INTEGER | YES | `14` | Default due date offset |
| `default_due_date_unit` | TEXT | YES | `'days'` | Unit: days, weeks, months |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | YES | `NOW()` | Last update timestamp |

---

## Table: project_collaborators

Tracks which users have access to which projects.

### SQL Definition

```sql
CREATE TABLE IF NOT EXISTS project_collaborators (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relationship
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Access level
  permission_level TEXT NOT NULL DEFAULT 'view' 
    CHECK (permission_level IN ('view', 'edit', 'admin')),
  
  -- Who invited this user
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique project-user combinations
  UNIQUE(project_id, user_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project_id 
  ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id 
  ON project_collaborators(user_id);
```

### Column Reference

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Unique identifier |
| `project_id` | UUID | NO | - | Project being shared |
| `user_id` | UUID | NO | - | User with access |
| `permission_level` | TEXT | NO | `'view'` | Access level |
| `invited_by` | UUID | NO | - | Who granted access |
| `joined_at` | TIMESTAMPTZ | YES | `NOW()` | When access was granted |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | YES | `NOW()` | Last update timestamp |

### Permission Levels

| Level | View | Edit | Manage Collaborators |
|-------|------|------|---------------------|
| `view` | ✅ | ❌ | ❌ |
| `edit` | ✅ | ✅ | ❌ |
| `admin` | ✅ | ✅ | ✅ |

---

## Table: project_invitations

Tracks pending invitations that haven't been accepted yet.

### SQL Definition

```sql
CREATE TABLE IF NOT EXISTS project_invitations (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relationship
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Invitation details
  invited_email TEXT NOT NULL,
  permission_level TEXT NOT NULL DEFAULT 'view' 
    CHECK (permission_level IN ('view', 'edit', 'admin')),
  invitation_token TEXT NOT NULL UNIQUE,
  
  -- Who sent the invitation
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- When accepted (null if pending)
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique project-email combinations for pending invitations
  UNIQUE(project_id, invited_email)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id 
  ON project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_invited_email 
  ON project_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token 
  ON project_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_project_invitations_expires_at 
  ON project_invitations(expires_at);
```

### Column Reference

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Unique identifier |
| `project_id` | UUID | NO | - | Project to share |
| `invited_email` | TEXT | NO | - | Invitee's email |
| `permission_level` | TEXT | NO | `'view'` | Access level to grant |
| `invitation_token` | TEXT | NO | - | Unique token for invite link |
| `invited_by` | UUID | NO | - | Who sent invitation |
| `expires_at` | TIMESTAMPTZ | NO | `NOW() + 7 days` | Expiration time |
| `accepted_at` | TIMESTAMPTZ | YES | - | When accepted (null = pending) |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | YES | `NOW()` | Last update timestamp |

---

## Table: project_logs

Audit trail for project changes.

### SQL Definition

```sql
CREATE TABLE IF NOT EXISTS project_logs (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Relationship
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Log details
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_project_logs_project_id 
  ON project_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_logs_timestamp 
  ON project_logs(timestamp DESC);
```

### Column Reference

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Unique identifier |
| `project_id` | UUID | NO | - | Project being logged |
| `user_id` | UUID | NO | - | User who made change |
| `action` | TEXT | NO | - | Action type |
| `details` | JSONB | YES | `'{}'` | Change details |
| `timestamp` | TIMESTAMPTZ | YES | `NOW()` | When action occurred |

### Action Types

| Action | Description |
|--------|-------------|
| `project_created` | New project created |
| `project_updated` | Project details changed |
| `project_restored` | Restored to previous version |
| `item_added` | New item added |
| `item_updated` | Item modified |
| `item_deleted` | Item removed |
| `collaborator_added` | New collaborator joined |
| `collaborator_removed` | Collaborator removed |
| `due_date_updated` | Due date changed |

### Details Structure

```typescript
interface LogDetails {
  // For updates
  previous_data?: any;
  new_data?: any;
  
  // For changes
  changes?: {
    field_name?: {
      from: any;
      to: any;
    };
  };
  
  // For restores
  restored_from_log_id?: string;
  
  // For due date changes
  previous_due_date?: string | null;
  new_due_date?: string | null;
  changed_by?: string;
}
```

---

## Table: project_boards

Stores whiteboard/Excalidraw snapshots for each project.

### SQL Definition

```sql
CREATE TABLE IF NOT EXISTS project_boards (
  -- Primary key (one board per project)
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Excalidraw snapshot
  board_snapshot JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Column Reference

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `project_id` | UUID | NO | - | Links to projects.id (1:1) |
| `board_snapshot` | JSONB | YES | `'{}'` | Excalidraw state |
| `created_at` | TIMESTAMPTZ | YES | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | YES | `NOW()` | Last update timestamp |

### Board Snapshot Structure

```typescript
interface BoardSnapshot {
  elements: ExcalidrawElement[];  // Drawing elements
  appState: {
    viewBackgroundColor?: string;
    zoom?: { value: number };
    scrollX?: number;
    scrollY?: number;
    gridSize?: number;
  };
  files: Record<string, {
    mimeType: string;
    id: string;
    dataURL: string;
    created: number;
  }>;
}
```

---

## Triggers

### Auto-update timestamps

```sql
-- Function to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to projects
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to project_boards
CREATE TRIGGER update_project_boards_updated_at
    BEFORE UPDATE ON project_boards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply to user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## Chapter Summary

The database schema consists of 6 tables:

1. **projects**: Core project data with JSONB items
2. **user_profiles**: User preferences and team assignment
3. **project_collaborators**: Access control for sharing
4. **project_invitations**: Pending collaboration invitations
5. **project_logs**: Audit trail for changes
6. **project_boards**: Whiteboard snapshots (1:1 with projects)

Key design decisions:
- UUID primary keys for all tables
- JSONB for complex nested data
- Foreign keys with CASCADE deletes
- Timestamps on all tables
- Indexes for frequent query patterns

---

*Next: [Chapter 7: Row Level Security](./chapter-07-rls-policies.md) - Secure data access*
