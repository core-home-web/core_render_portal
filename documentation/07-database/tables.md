# Database Tables

Complete reference for all database tables.

## projects

Stores project data including items and parts.

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  retailer TEXT NOT NULL,
  due_date DATE,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | auto | Primary key |
| `user_id` | UUID | Yes | - | Owner's user ID |
| `title` | TEXT | No | - | Project title |
| `retailer` | TEXT | No | - | Client/retailer name |
| `due_date` | DATE | Yes | - | Due date |
| `items` | JSONB | Yes | `[]` | Items array |
| `created_at` | TIMESTAMPTZ | Yes | now() | Creation time |
| `updated_at` | TIMESTAMPTZ | Yes | now() | Update time |

### Items JSONB Structure

```json
[
  {
    "id": "uuid-string",
    "name": "Item Name",
    "hero_image": "https://storage.url/image.jpg",
    "versions": [
      {
        "id": "uuid-string",
        "versionNumber": 1,
        "versionName": "Base Version",
        "parts": [
          {
            "id": "uuid-string",
            "name": "Part Name",
            "finish": "Matte",
            "color": "#FF5733",
            "texture": "Smooth",
            "files": ["file1.jpg"],
            "x": 100,
            "y": 200,
            "notes": "Special instructions"
          }
        ]
      }
    ]
  }
]
```

---

## user_profiles

User preferences and profile information.

```sql
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  profile_image TEXT,
  team TEXT DEFAULT 'product_development',
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | auto | Primary key |
| `user_id` | UUID | No | - | Reference to auth.users |
| `display_name` | TEXT | Yes | - | Display name |
| `profile_image` | TEXT | Yes | - | Profile image URL |
| `team` | TEXT | Yes | 'product_development' | Team |
| `notification_preferences` | JSONB | Yes | `{}` | Notification settings |

### Team Values

- `product_development` - Teal theme
- `industrial_design` - Orange theme

---

## project_collaborators

Tracks who has access to which projects.

```sql
CREATE TABLE project_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);
```

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | auto | Primary key |
| `project_id` | UUID | No | - | Project reference |
| `user_id` | UUID | No | - | Collaborator's user ID |
| `permission_level` | TEXT | No | - | Permission level |
| `invited_by` | UUID | Yes | - | Who invited them |
| `joined_at` | TIMESTAMPTZ | Yes | now() | When they joined |

### Permission Levels

| Level | Can View | Can Edit | Can Invite |
|-------|----------|----------|------------|
| `view` | Yes | No | No |
| `edit` | Yes | Yes | No |
| `admin` | Yes | Yes | Yes |

---

## project_invitations

Pending invitations that haven't been accepted.

```sql
CREATE TABLE project_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin')),
  token UUID DEFAULT gen_random_uuid() UNIQUE,
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | auto | Primary key |
| `project_id` | UUID | No | - | Project reference |
| `invited_email` | TEXT | No | - | Invitee's email |
| `permission_level` | TEXT | No | - | Permission to grant |
| `token` | UUID | No | auto | Unique invitation token |
| `invited_by` | UUID | Yes | - | Who sent the invitation |
| `expires_at` | TIMESTAMPTZ | Yes | +7 days | Expiration time |
| `accepted_at` | TIMESTAMPTZ | Yes | - | When accepted |

---

## project_logs

Audit log of all project changes.

```sql
CREATE TABLE project_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | auto | Primary key |
| `project_id` | UUID | No | - | Project reference |
| `user_id` | UUID | Yes | - | Who made the change |
| `action` | TEXT | No | - | Action type |
| `details` | JSONB | Yes | `{}` | Change details |
| `timestamp` | TIMESTAMPTZ | Yes | now() | When it happened |

### Action Types

- `create` - Project created
- `update` - Project updated
- `restore` - Restored from history
- `due_date_update` - Due date changed

### Details Structure

```json
{
  "previous_data": { /* full project before */ },
  "new_data": { /* full project after */ },
  "changes": {
    "title": { "from": "Old", "to": "New" }
  }
}
```

---

## project_boards

Stores whiteboard/Excalidraw data.

```sql
CREATE TABLE project_boards (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  board_snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `project_id` | UUID | No | - | Primary key, project reference |
| `board_snapshot` | JSONB | No | `{}` | Excalidraw data |
| `created_at` | TIMESTAMPTZ | Yes | now() | Creation time |
| `updated_at` | TIMESTAMPTZ | Yes | now() | Last update time |

### Board Snapshot Structure

```json
{
  "elements": [
    {
      "type": "rectangle",
      "id": "abc123",
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 100,
      "strokeColor": "#000000",
      "backgroundColor": "#ffffff"
    }
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "zoom": { "value": 1 },
    "scrollX": 0,
    "scrollY": 0
  },
  "files": {
    "fileId": {
      "mimeType": "image/png",
      "dataURL": "data:image/png;base64,..."
    }
  }
}
```

---

## Indexes

```sql
-- Fast user project lookup
CREATE INDEX idx_projects_user ON projects(user_id);

-- Fast collaborator lookup
CREATE INDEX idx_project_collaborators_user ON project_collaborators(user_id);
CREATE INDEX idx_project_collaborators_project ON project_collaborators(project_id);

-- Fast invitation lookup
CREATE INDEX idx_project_invitations_email ON project_invitations(invited_email);
CREATE INDEX idx_project_invitations_token ON project_invitations(token);

-- Fast log lookup
CREATE INDEX idx_project_logs_project ON project_logs(project_id);
```

---

← [Database Overview](./README.md) | Next: [RLS Policies](./rls-policies.md) →

