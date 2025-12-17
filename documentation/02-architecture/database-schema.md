# Database Schema

Database tables and relationships.

## Tables Overview

| Table | Purpose |
|-------|---------|
| `projects` | Project data |
| `user_profiles` | User preferences |
| `project_collaborators` | Access control |
| `project_invitations` | Pending invites |
| `project_logs` | Activity history |
| `project_boards` | Whiteboard data |

## projects

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  retailer TEXT NOT NULL,
  due_date DATE,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## user_profiles

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id),
  display_name TEXT,
  team TEXT DEFAULT 'product_development',
  profile_image TEXT
);
```

## project_collaborators

```sql
CREATE TABLE project_collaborators (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES auth.users(id),
  permission_level TEXT CHECK (permission_level IN ('view', 'edit', 'admin')),
  UNIQUE(project_id, user_id)
);
```

## project_boards

```sql
CREATE TABLE project_boards (
  project_id UUID PRIMARY KEY REFERENCES projects(id),
  board_snapshot JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Items JSONB Structure

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Item Name",
      "hero_image": "https://...",
      "versions": [
        {
          "id": "uuid",
          "versionNumber": 1,
          "parts": [
            {
              "name": "Part",
              "finish": "Matte",
              "color": "#FF5733",
              "texture": "Smooth"
            }
          ]
        }
      ]
    }
  ]
}
```

---

← [Data Flow](./data-flow.md) | Next: [Features](../03-features/README.md) →

