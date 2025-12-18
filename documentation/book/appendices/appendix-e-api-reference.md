# Appendix E: API Reference

Complete reference for all API endpoints in the Core Render Portal.

---

## API Routes Overview

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/send-invitation` | POST | Send collaboration invitation email |
| `/api/notify-collaborators` | POST | Notify collaborators of changes |
| `/api/upload` | POST | Upload files to storage |
| `/api/request-access` | POST | Request access to a project |

---

## POST /api/send-invitation

Sends an email invitation to collaborate on a project.

### Request

```typescript
{
  to: string,              // Email address
  invitationUrl: string,   // Full invitation URL
  permissionLevel: string, // 'view' | 'edit' | 'admin'
  projectId: string,       // UUID of project
  projectTitle?: string    // Project name for email
}
```

### Response

```typescript
// Success (200)
{
  success: true,
  data: { id: string }     // Email ID from Resend
}

// Error (400)
{ error: 'Missing required fields' }

// Error (500)
{ error: 'Failed to send email' }
```

---

## POST /api/notify-collaborators

Sends notification emails to project collaborators.

### Request

```typescript
{
  projectId: string,       // UUID of project
  action: string,          // Action type
  actorEmail?: string,     // Email to exclude (the actor)
  details?: string         // Additional details
}
```

### Response

```typescript
// Success (200)
{
  success: true,
  notified: number         // Count of emails sent
}

// Error (404)
{ error: 'Project not found' }

// Error (500)
{ error: 'Failed to send notifications' }
```

---

## POST /api/upload

Uploads a file to Supabase Storage.

### Request (multipart/form-data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | The file to upload |
| `bucket` | string | No | Storage bucket (default: `project-images`) |
| `path` | string | No | Path prefix for file |

### Response

```typescript
// Success (200)
{
  success: true,
  url: string,            // Public URL
  path: string            // Storage path
}

// Error (400)
{ error: 'No file provided' }
{ error: 'File too large. Maximum size is 50MB' }
{ error: 'File type not allowed' }

// Error (500)
{ error: 'Upload failed' }
```

---

## POST /api/request-access

Sends an access request email to the project owner.

### Request

```typescript
{
  projectId: string,       // UUID of project
  requesterEmail: string,  // Requester's email
  requesterName?: string,  // Requester's name
  message?: string         // Optional message
}
```

### Response

```typescript
// Success (200)
{ success: true }

// Error (400)
{ error: 'Missing required fields' }

// Error (404)
{ error: 'Project not found' }

// Error (500)
{ error: 'Failed to send request' }
```

---

## Supabase RPC Functions

Called via `supabase.rpc()`:

| Function | Parameters | Returns |
|----------|------------|---------|
| `get_user_projects` | none | Array of projects |
| `get_user_project` | `p_project_id: uuid` | Single project |
| `update_user_project` | `p_project_id, p_title?, p_retailer?, p_items?, p_due_date?` | Updated project |
| `invite_user_to_project` | `p_project_id, p_email, p_permission_level?` | Invitation token |
| `accept_project_invitation` | `p_token: text` | Project UUID |
| `get_invitation_details` | `p_token: text` | Invitation details |
| `get_or_create_project_board` | `p_project_id: uuid` | Board record |
| `save_project_board` | `p_project_id, p_snapshot` | Updated board |
| `get_project_collaborators_with_users` | `p_project_id: uuid` | Collaborator list |

---

*Return to [Appendices](./README.md)*
