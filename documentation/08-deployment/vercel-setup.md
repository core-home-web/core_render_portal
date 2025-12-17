# Vercel Setup

Step-by-step guide to deploy on Vercel.

## Prerequisites

- GitHub account with repository access
- Vercel account (free tier works)
- Supabase project configured

## Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended)

## Step 2: Import Project

1. Click "New Project" on Vercel dashboard
2. Select "Import Git Repository"
3. Find and select your repository
4. Click "Import"

## Step 3: Configure Project

### Framework Preset

Vercel auto-detects Next.js. Verify settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `.` |
| Build Command | `npm run build` or `pnpm build` |
| Output Directory | Leave blank (auto) |

### Environment Variables

Add these in the "Environment Variables" section:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**For email invitations (optional):**
```
RESEND_API_KEY=re_xxx
```

## Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Access your live site at the provided URL

## Custom Domain

### Add Domain

1. Go to Project Settings → Domains
2. Enter your domain (e.g., `app.yourcompany.com`)
3. Click "Add"

### Configure DNS

Add these records at your DNS provider:

**For apex domain (yourcompany.com):**
```
A     @     76.76.21.21
```

**For subdomain (app.yourcompany.com):**
```
CNAME app   cname.vercel-dns.com
```

### Verify

1. Wait for DNS propagation (up to 48 hours)
2. Vercel automatically provisions SSL
3. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Automatic Deployments

### Push to Main = Production

```bash
git push origin main
# Triggers production deployment
```

### Push to Branch = Preview

```bash
git push origin feature/my-feature
# Creates preview deployment at unique URL
```

### Preview URL Format

```
https://project-name-git-branch-name-username.vercel.app
```

## Build Settings

### package.json Scripts

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### next.config.js

Ensure configuration is production-ready:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration here
}

module.exports = nextConfig
```

## Environment Variable Scopes

| Scope | When Applied |
|-------|-------------|
| Production | Main branch deployments |
| Preview | All other branches |
| Development | Local (not in Vercel) |

Set different values per environment if needed.

## Vercel CLI (Optional)

### Install

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Deploy Manually

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Set Environment Variables

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Follow prompts
```

## Build Logs

### Viewing Logs

1. Go to Vercel dashboard
2. Select deployment
3. Click "Building" or deployment ID
4. View full build output

### Common Build Errors

| Error | Solution |
|-------|----------|
| "Module not found" | Check import paths |
| "Type error" | Fix TypeScript errors |
| "Build failed" | Check build logs for details |

## Performance

### Enable Analytics

1. Go to Project Settings
2. Enable "Analytics"
3. View performance metrics

### Edge Functions

For faster API routes:

```typescript
// app/api/route.ts
export const runtime = 'edge'

export async function GET() {
  // Runs at edge
}
```

## Rollback

### Via Dashboard

1. Go to Deployments
2. Find previous working deployment
3. Click "..." menu
4. Select "Promote to Production"

### Via CLI

```bash
vercel rollback
```

## Team Collaboration

### Add Team Members

1. Go to Team Settings
2. Invite members by email
3. Set role (Viewer, Developer, Admin)

### Protected Branches

1. Go to Project Settings → Git
2. Enable "Production Branch Protection"
3. Require reviews before deploy

---

← [Deployment Overview](./README.md) | Next: [Environment Variables](./environment-variables.md) →

