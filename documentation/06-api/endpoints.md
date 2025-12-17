# API Endpoints

Documentation for Next.js API routes.

## Project API

### POST /api/project

Create a new project.

**Request:**
```typescript
{
  "title": "Project Title",
  "retailer": "Retailer Name",
  "due_date": "2024-12-31",
  "items": [
    {
      "name": "Item Name",
      "hero_image": "https://...",
      "versions": [
        {
          "versionNumber": 1,
          "parts": [
            {
              "name": "Part Name",
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

**Response (201):**
```typescript
{
  "id": "uuid",
  "title": "Project Title",
  "retailer": "Retailer Name",
  "items": [...],
  "user_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `400` - Invalid data
- `401` - Unauthorized

### GET /api/project?id={projectId}

Get a single project.

**Response (200):**
```typescript
{
  "id": "uuid",
  "title": "Project Title",
  "retailer": "Retailer Name",
  // ... full project data
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Project not found

### PUT /api/project

Update a project.

**Request:**
```typescript
{
  "id": "uuid",
  "title": "Updated Title",
  "items": [...]
}
```

**Response (200):**
```typescript
{
  // Updated project data
}
```

### DELETE /api/project?id={projectId}

Delete a project.

**Response (200):**
```typescript
{
  "success": true
}
```

---

## Invitation API

### POST /api/send-invitation

Send a project invitation email.

**Request:**
```typescript
{
  "projectId": "uuid",
  "email": "user@example.com",
  "permissionLevel": "edit",
  "projectTitle": "Project Name"
}
```

**Response (200):**
```typescript
{
  "success": true,
  "invitationId": "uuid"
}
```

**Errors:**
- `400` - Invalid email or permission
- `401` - Unauthorized
- `403` - Not project owner
- `500` - Email sending failed

### Implementation

```typescript
// app/api/send-invitation/route.ts
import { Resend } from 'resend'
import { supabase } from '@/lib/supaClient'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { projectId, email, permissionLevel, projectTitle } = await request.json()
  
  // Verify user is owner/admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Create invitation
  const { data: invitation, error } = await supabase
    .from('project_invitations')
    .insert({
      project_id: projectId,
      invited_email: email,
      permission_level: permissionLevel,
      invited_by: user.id
    })
    .select()
    .single()

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  // Send email
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/project/invite?token=${invitation.token}`
  
  await resend.emails.send({
    from: 'Core Home <onboarding@resend.dev>',
    to: email,
    subject: `Project Invitation: ${projectTitle}`,
    html: `
      <h1>You've been invited!</h1>
      <p>You've been invited to collaborate on "${projectTitle}"</p>
      <a href="${inviteUrl}">Accept Invitation</a>
    `
  })

  return Response.json({ success: true, invitationId: invitation.id })
}
```

---

## Access Request API

### POST /api/request-access

Request access to a project.

**Request:**
```typescript
{
  "projectId": "uuid",
  "message": "Optional message"
}
```

**Response (200):**
```typescript
{
  "success": true,
  "requestId": "uuid"
}
```

---

## Notification API

### POST /api/notify-collaborators

Send notifications to project collaborators.

**Request:**
```typescript
{
  "projectId": "uuid",
  "message": "Project was updated",
  "type": "update"
}
```

**Response (200):**
```typescript
{
  "success": true,
  "notifiedCount": 3
}
```

---

## Upload API

### POST /api/upload

Upload a file to Supabase Storage.

**Request:**
```
Content-Type: multipart/form-data

file: <binary>
bucket: "project-images"
folder: "hero-images"
```

**Response (200):**
```typescript
{
  "url": "https://supabase.storage/...",
  "path": "hero-images/filename.jpg"
}
```

**Errors:**
- `400` - No file provided
- `413` - File too large
- `415` - Unsupported file type

### Implementation

```typescript
// app/api/upload/route.ts
import { supabaseAdmin } from '@/lib/supaAdmin'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const bucket = formData.get('bucket') as string
  const folder = formData.get('folder') as string

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const fileName = `${folder}/${Date.now()}-${file.name}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false
    })

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return Response.json({ url: publicUrl, path: data.path })
}
```

---

## Error Handling Pattern

All API routes follow this pattern:

```typescript
export async function POST(request: Request) {
  try {
    // Validate authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate input
    const body = await request.json()
    const validated = schema.parse(body)  // Zod validation

    // Perform operation
    const result = await doSomething(validated)

    // Return success
    return Response.json(result)

  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

← [API Overview](./README.md) | Next: [Supabase Functions](./supabase-functions.md) →

