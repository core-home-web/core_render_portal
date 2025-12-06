# tldraw Sync Server Setup

This directory contains the configuration for deploying a tldraw sync server to Cloudflare Workers with Durable Objects.

## Prerequisites

1. A Cloudflare account with Workers and Durable Objects enabled
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Logged in to Cloudflare (`wrangler login`)

## Quick Setup

### Option 1: Use the tldraw Demo Server (Development Only)

For quick prototyping, you can use the tldraw demo server. This is NOT recommended for production as data is ephemeral and not secure.

```typescript
// In your component
import { useSyncDemo } from '@tldraw/sync'

function Board({ projectId }) {
  const store = useSyncDemo({ roomId: projectId })
  return <Tldraw store={store} />
}
```

### Option 2: Deploy Your Own Sync Server (Production)

1. **Clone the tldraw sync Cloudflare template:**

```bash
npx degit tldraw/tldraw-sync-cloudflare tldraw-sync-server
cd tldraw-sync-server
npm install
```

2. **Configure wrangler.toml:**

Edit the `wrangler.toml` file with your account details:

```toml
name = "core-render-board-sync"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[durable_objects]
bindings = [
  { name = "ROOMS", class_name = "TLDrawRoom" }
]

[[migrations]]
tag = "v1"
new_classes = ["TLDrawRoom"]
```

3. **Deploy to Cloudflare:**

```bash
npx wrangler deploy
```

4. **Get your worker URL:**

After deployment, you'll get a URL like:
`https://core-render-board-sync.your-subdomain.workers.dev`

5. **Add to your environment variables:**

In your `.env.local`:
```
NEXT_PUBLIC_TLDRAW_SYNC_URL=wss://core-render-board-sync.your-subdomain.workers.dev
```

## Integration with Core Render Portal

Once deployed, update the whiteboard component to use your sync server:

```typescript
import { CoreRenderBoard } from '@/components/whiteboard'

function WhiteboardPage({ projectId }) {
  return (
    <CoreRenderBoard
      projectId={projectId}
      syncServerUrl={process.env.NEXT_PUBLIC_TLDRAW_SYNC_URL}
    />
  )
}
```

## Security Considerations

1. **Authentication**: The default template doesn't include authentication. Consider adding:
   - JWT verification in the Worker
   - API key validation
   - Supabase JWT verification

2. **Rate Limiting**: Add rate limiting to prevent abuse

3. **Room Access Control**: Verify that users have access to the project/room they're connecting to

## Example Authentication Implementation

```typescript
// In your Cloudflare Worker
async fetch(request: Request, env: Env) {
  const url = new URL(request.url)
  const roomId = url.pathname.split('/')[2] // /connect/{roomId}
  
  // Extract token from request
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Verify token against Supabase
  const isValid = await verifySupabaseToken(token, roomId, env)
  
  if (!isValid) {
    return new Response('Forbidden', { status: 403 })
  }
  
  // Continue with WebSocket upgrade...
}
```

## Troubleshooting

### WebSocket Connection Issues

1. Ensure CORS is properly configured in your Worker
2. Check that the sync URL uses `wss://` protocol
3. Verify your Cloudflare plan supports WebSockets

### Data Persistence

The Cloudflare Durable Objects template includes automatic persistence. Data is stored in the Durable Object's storage and persists between connections.

### Scaling

Cloudflare Durable Objects automatically scale. Each room (project) gets its own Durable Object instance.

## Resources

- [tldraw Sync Documentation](https://tldraw.dev/docs/collaboration)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [tldraw GitHub](https://github.com/tldraw/tldraw)
