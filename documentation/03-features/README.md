# Features Overview

This section documents all the major features of the Core Render Portal.

## In This Section

| Feature | Description |
|---------|-------------|
| [Authentication](./authentication.md) | User signup, login, and sessions |
| [Projects](./projects.md) | Creating and managing render projects |
| [Collaboration](./collaboration.md) | Inviting users and sharing projects |
| [Whiteboard](./whiteboard.md) | Interactive Excalidraw whiteboard |
| [Image Annotation](./image-annotation.md) | Annotating images with parts |
| [Export](./export.md) | Exporting projects and presentations |

## Feature Summary

### Authentication

Users can create accounts and sign in with email/password. The system supports two teams (Product Development and Industrial Design) with different color themes.

**Key capabilities:**
- Email/password signup and login
- Team selection (teal or orange theme)
- Profile management
- Session persistence

### Project Management

The core feature - creating and managing 3D render project specifications.

**Key capabilities:**
- Multi-step project creation form
- Add items with hero images
- Define versions for each item
- Specify parts with finish, color, and texture
- Due date tracking
- Project history and restore

### Collaboration

Share projects with team members with role-based access control.

**Key capabilities:**
- Invite users via email
- Permission levels (view, edit, admin)
- Real-time collaboration
- Activity tracking

### Whiteboard

An interactive canvas for visual project planning using Excalidraw.

**Key capabilities:**
- Drawing tools (shapes, text, arrows)
- Real-time multi-user collaboration
- Auto-populated project data
- Export to PNG, SVG, JSON, HTML
- Persistent storage

### Image Annotation

Annotate hero images with part markers and specifications.

**Key capabilities:**
- Click to add part markers
- Define part specifications inline
- Visual part identification
- Coordinate tracking

### Export

Export project data and presentations in various formats.

**Key capabilities:**
- Whiteboard export (PNG, SVG, JSON, HTML)
- Project data export
- Presentation generation

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | Complete | Email/password auth |
| Project CRUD | Complete | Full functionality |
| Collaboration | Complete | Invitations + permissions |
| Whiteboard | Complete | Excalidraw with real-time sync |
| Image Annotation | Complete | Basic annotation |
| Export | Complete | Multiple formats |
| Real-time Updates | Complete | Via Supabase Realtime |

## Feature Dependencies

```
Authentication
     │
     ▼
Project Management ◀─────────────────┐
     │                               │
     ├──────────────┐                │
     │              │                │
     ▼              ▼                │
Whiteboard    Image Annotation       │
     │                               │
     ▼                               │
   Export                            │
                                     │
Collaboration ───────────────────────┘
```

## Using This Section

Each feature document includes:

1. **Overview** - What the feature does
2. **How It Works** - Technical implementation
3. **Usage Examples** - Code and UI examples
4. **Related Components** - Files involved
5. **Troubleshooting** - Common issues

---

← [Database Schema](../02-architecture/database-schema.md) | Next: [Authentication](./authentication.md) →

