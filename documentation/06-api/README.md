# API Overview

This section documents the API endpoints and Supabase functions.

## In This Section

| Document | Description |
|----------|-------------|
| [Endpoints](./endpoints.md) | Next.js API routes |
| [Supabase Functions](./supabase-functions.md) | Database RPC functions |

## API Architecture

The Core Render Portal uses two types of APIs:

### 1. Next.js API Routes

Server-side endpoints in `app/api/`:

```
app/api/
├── project/
│   └── route.ts          # Project CRUD
├── send-invitation/
│   └── route.ts          # Email invitations
├── request-access/
│   └── route.ts          # Access requests
├── notify-collaborators/
│   └── route.ts          # Notifications
└── upload/
    └── route.ts          # File uploads
```

### 2. Supabase RPC Functions

Database functions called via `supabase.rpc()`:

- `get_or_create_project_board`
- `save_project_board`
- `get_project_collaborators_with_users`
- `accept_project_invitation`

## Making API Calls

### From Client Components

```typescript
// Using fetch
const response = await fetch('/api/project', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
const result = await response.json()
```

### From Server Components

```typescript
// Direct database access
import { supabase } from '@/lib/supaClient'

const { data, error } = await supabase
  .from('projects')
  .select('*')
```

### Supabase RPC Calls

```typescript
const { data, error } = await supabase
  .rpc('function_name', { param1: value1 })
```

## Authentication

### Client Requests

API routes check authentication using the Supabase session:

```typescript
// In API route
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const supabase = createClient(/* credentials */)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Proceed with authenticated request
}
```

### Server-Side Admin

For privileged operations, use the service role:

```typescript
import { supabaseAdmin } from '@/lib/supaAdmin'

// Bypass RLS for admin operations
const { data } = await supabaseAdmin
  .from('projects')
  .select('*')
```

## Error Handling

### Standard Error Response

```typescript
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* optional details */ }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## Rate Limiting

Currently, no rate limiting is implemented. For production:

- Consider adding rate limiting middleware
- Use Vercel Edge Config for dynamic limits
- Implement per-user quotas

## CORS

API routes are same-origin by default. For cross-origin access:

```typescript
export async function OPTIONS(request: Request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

---

← [Hooks Reference](../05-hooks/hooks-reference.md) | Next: [API Endpoints](./endpoints.md) →

