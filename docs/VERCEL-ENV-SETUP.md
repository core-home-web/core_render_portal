# Vercel Environment Variables Setup

## Critical: Supabase URL Must Include Protocol

**IMPORTANT**: The `NEXT_PUBLIC_SUPABASE_URL` environment variable **MUST** include the `https://` protocol.

### ❌ Wrong
```
NEXT_PUBLIC_SUPABASE_URL=khqdzcynschnanvohztk.supabase.co
```

This will cause DNS resolution errors:
```
ERR_NAME_NOT_RESOLVED
Failed to fetch
TypeError: Failed to fetch at auth/v1/token
```

### ✅ Correct
```
NEXT_PUBLIC_SUPABASE_URL=https://khqdzcynschnanvohztk.supabase.co
```

## Environment Variables Required

For production deployment on Vercel, you need these environment variables set for **Production**, **Preview**, and **Development**:

### 1. Supabase Configuration

```bash
# Supabase URL (with https://)
NEXT_PUBLIC_SUPABASE_URL=https://khqdzcynschnanvohztk.supabase.co

# Supabase Anonymous Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. App Configuration

```bash
# Production URL
NEXT_PUBLIC_APP_URL=https://core-render-portal.vercel.app

# For preview/development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Set Environment Variables on Vercel

### Method 1: Via Vercel CLI (Recommended)

```bash
# Set production environment variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Then enter: https://khqdzcynschnanvohztk.supabase.co

# Set preview environment variable
vercel env add NEXT_PUBLIC_SUPABASE_URL preview

# Set development environment variable
vercel env add NEXT_PUBLIC_SUPABASE_URL development
```

### Method 2: Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `core-render-portal`
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://khqdzcynschnanvohztk.supabase.co`
   - Environments: Select Production, Preview, Development
5. Click **Save**

## Updating Environment Variables

If you need to update an existing variable:

```bash
# Remove old variable
vercel env rm NEXT_PUBLIC_SUPABASE_URL production

# Add new variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production
```

## After Updating Variables

**Always redeploy** after changing environment variables:

```bash
vercel --prod
```

Environment variables are **only loaded during build time**, so existing deployments won't pick up changes until you redeploy.

## Verifying Environment Variables

To check what variables are set:

```bash
vercel env ls
```

To pull environment variables to local `.env.local`:

```bash
vercel env pull .env.local
```

## Common Issues

### Issue: Login fails with "Failed to fetch"
**Cause**: Missing `https://` in `NEXT_PUBLIC_SUPABASE_URL`  
**Solution**: Update the variable to include `https://` and redeploy

### Issue: Changes not reflecting in production
**Cause**: Environment variables are only loaded at build time  
**Solution**: Run `vercel --prod` to trigger a new deployment

### Issue: Different behavior in dev vs production
**Cause**: Local `.env.local` has different values than Vercel  
**Solution**: Ensure consistency or use `vercel env pull`

## Security Notes

- ✅ `NEXT_PUBLIC_*` variables are exposed to the browser
- ✅ `SUPABASE_SERVICE_ROLE_KEY` is kept secret (server-side only)
- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Rotate keys if accidentally exposed

## References

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs#create-environment-variables)

