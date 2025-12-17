# Environment Variables

Complete reference for all environment variables.

## Required Variables

### Supabase Configuration

```bash
# Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase anonymous/public key (safe for frontend)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase service role key (server-side only, NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Application URL

```bash
# Your app's URL (used for redirects, emails)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Optional Variables

### Email (Resend)

```bash
# Resend API key for sending invitation emails
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

## Variable Naming

### NEXT_PUBLIC_ Prefix

Variables starting with `NEXT_PUBLIC_` are:
- Exposed to the browser
- Available in client components
- Included in the JavaScript bundle

```typescript
// Client-side access
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
```

### Server-Only Variables

Variables WITHOUT `NEXT_PUBLIC_` are:
- Only available on the server
- Not included in the client bundle
- Safe for secrets

```typescript
// Server-side only (API routes, Server Components)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
```

## Getting Values

### From Supabase

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### From Resend

1. Go to [resend.com](https://resend.com)
2. Go to **API Keys**
3. Create new key
4. Copy → `RESEND_API_KEY`

## Local Development

### Create .env.local

```bash
cp env.example .env.local
```

### Edit Values

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_xxx
```

### Never Commit .env.local

`.env.local` is in `.gitignore`. Never commit it.

## Vercel Configuration

### Add Variables

1. Go to Project Settings
2. Click "Environment Variables"
3. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://xxx.supabase.co`
   - Environment: Production, Preview, Development

### Per-Environment Values

Use different values for different environments:

| Variable | Production | Preview |
|----------|------------|---------|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` | `https://preview.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase | Same or staging |

## Environment Files Reference

| File | Purpose | Committed |
|------|---------|-----------|
| `.env` | Default values | Yes (if no secrets) |
| `.env.local` | Local overrides | No |
| `.env.development` | Dev-only values | Yes (if no secrets) |
| `.env.production` | Prod values | No |
| `env.example` | Template | Yes |

## Security Best Practices

### 1. Never Commit Secrets

```bash
# .gitignore
.env.local
.env.production.local
```

### 2. Use Server-Only for Secrets

```typescript
// ❌ Bad - exposes to client
const key = process.env.NEXT_PUBLIC_SECRET_KEY

// ✅ Good - server only
const key = process.env.SECRET_KEY
```

### 3. Validate at Startup

```typescript
// lib/env.ts
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}
```

### 4. Rotate Keys Regularly

- Rotate service role keys periodically
- Immediately rotate if exposed
- Update in all environments

## Debugging

### Check Variable Exists

```typescript
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

### Vercel Environment

Check build logs for variable issues:

```
info  - Loaded env from .env.local
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `undefined` value | Variable not set | Add to Vercel/`.env.local` |
| Client can't access | Missing `NEXT_PUBLIC_` | Add prefix |
| Build fails | Missing required var | Check Vercel settings |
| Wrong value | Using wrong environment | Check Vercel env scope |

## Example Files

### env.example

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (optional)
RESEND_API_KEY=your_resend_api_key
```

### env.production.example

```bash
# Production values - copy to Vercel
NEXT_PUBLIC_SUPABASE_URL=https://production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
RESEND_API_KEY=re_production_key
```

---

← [Vercel Setup](./vercel-setup.md) | Next: [Troubleshooting](./troubleshooting.md) →

