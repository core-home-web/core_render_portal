# Deployment Overview

This section covers deploying the Core Render Portal to production.

## In This Section

| Document | Description |
|----------|-------------|
| [Vercel Setup](./vercel-setup.md) | Deploy to Vercel |
| [Environment Variables](./environment-variables.md) | Configure environment |
| [Troubleshooting](./troubleshooting.md) | Common issues |

## Deployment Options

### Recommended: Vercel

Vercel is the recommended platform because:
- Built by Next.js creators
- Zero-config deployment
- Automatic HTTPS
- Preview deployments for branches
- Edge functions support

### Alternatives

| Platform | Notes |
|----------|-------|
| Netlify | Good alternative, similar features |
| Railway | Good for full-stack with database |
| AWS Amplify | AWS ecosystem integration |
| Self-hosted | Requires more setup |

## Quick Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables

### 3. Deploy

Vercel automatically builds and deploys.

## Deployment Checklist

### Before Deploying

- [ ] All tests pass locally
- [ ] Build succeeds (`pnpm build`)
- [ ] Environment variables documented
- [ ] Database migrations applied
- [ ] Storage buckets created

### Environment Variables

Required for production:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
RESEND_API_KEY=re_xxx  # If using email
```

### Database

- [ ] Production Supabase project created
- [ ] All tables exist
- [ ] RLS policies active
- [ ] Functions deployed
- [ ] Storage buckets created

## Deployment Flow

```
Local Development
       │
       ▼
  git push
       │
       ▼
┌──────────────────┐
│     GitHub       │
│   (repository)   │
└────────┬─────────┘
         │ webhook
         ▼
┌──────────────────┐
│     Vercel       │
│   (build & host) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Production     │
│   (live site)    │
└──────────────────┘
```

## Branch Strategy

### Main Branch

- Production deployments
- Only merge tested code
- Protected branch (require reviews)

### Feature Branches

- Get preview deployments
- Test before merging
- Separate URLs for testing

### Example Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, commit
git add .
git commit -m "feat: add new feature"

# Push (creates preview deployment)
git push origin feature/new-feature

# Test on preview URL
# Create pull request
# Merge to main (triggers production deploy)
```

## Monitoring

### Vercel Analytics

Enable in Vercel dashboard:
- Page views
- Performance metrics
- Error tracking

### Supabase Monitoring

Monitor in Supabase dashboard:
- Database connections
- Query performance
- Storage usage
- Auth activity

---

← [SQL Scripts Guide](../07-database/sql-scripts-guide.md) | Next: [Vercel Setup](./vercel-setup.md) →

