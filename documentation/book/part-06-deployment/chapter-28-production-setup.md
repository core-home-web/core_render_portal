# Chapter 28: Production Setup

This chapter covers deploying the Core Render Portal to Vercel for production use.

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                               │
│                                                                  │
│  ┌────────────────┐        ┌────────────────┐                   │
│  │    Vercel      │        │   Supabase     │                   │
│  │  (Frontend)    │───────▶│   (Backend)    │                   │
│  │                │        │                │                   │
│  │  - Next.js     │        │  - PostgreSQL  │                   │
│  │  - API Routes  │        │  - Auth        │                   │
│  │  - Edge CDN    │        │  - Storage     │                   │
│  └────────────────┘        └────────────────┘                   │
│                                                                  │
│  ┌────────────────┐                                             │
│  │    Resend      │                                             │
│  │   (Email)      │                                             │
│  └────────────────┘                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Pre-Deployment Checklist

### Supabase Production Project

1. Create a **new** Supabase project for production
2. Run the migration script from Chapter 10
3. Configure storage buckets
4. Note your production API keys

### Environment Variables

Prepare these values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[production-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[production-service-key]
NEXT_PUBLIC_APP_URL=https://yourdomain.com
RESEND_API_KEY=[your-resend-api-key]
```

---

## Vercel Deployment

### Option 1: GitHub Integration (Recommended)

1. **Push code to GitHub**
   ```bash
   git remote add origin https://github.com/username/core-render-portal.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add each variable:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_APP_URL`
     - `RESEND_API_KEY`
   - Select "Production" and "Preview" environments

4. **Deploy**
   - Click "Deploy"
   - Wait for build (~2-3 minutes)

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel env add RESEND_API_KEY

# Deploy to production
vercel --prod
```

---

## Custom Domain Setup

### In Vercel Dashboard

1. Go to Project Settings → Domains
2. Add your domain (e.g., `renderportal.yourcompany.com`)
3. Follow DNS configuration instructions:

```
# For apex domain (yourcompany.com)
Type: A
Name: @
Value: 76.76.21.21

# For subdomain (app.yourcompany.com)
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

4. Wait for SSL certificate (~5 minutes)
5. Update `NEXT_PUBLIC_APP_URL` to your domain

### In Supabase

1. Go to Authentication → URL Configuration
2. Add your domain to "Redirect URLs":
   - `https://yourdomain.com/**`

---

## Supabase Production Configuration

### Email Templates

1. Go to Authentication → Email Templates
2. Customize:
   - Confirmation email
   - Invite user email
   - Magic link email
   - Password reset email

### Auth Settings

1. Go to Authentication → Providers
2. For production, ensure:
   - "Confirm email" is **enabled**
   - Site URL is set to production domain

### Storage

1. Verify buckets exist:
   - `project-images`
   - `profile-images`
   - `board-assets`

2. Check storage policies are applied

---

## Post-Deployment Verification

### Test Checklist

- [ ] Home page loads
- [ ] User can sign up
- [ ] User receives confirmation email
- [ ] User can sign in
- [ ] Dashboard shows correctly
- [ ] Can create new project
- [ ] Can upload images
- [ ] Whiteboard loads and saves
- [ ] Can invite collaborators
- [ ] Invitation email is sent
- [ ] Export functions work

### Common Issues

**Build fails:**
- Check Node.js version (18+)
- Verify all dependencies in package.json
- Check for TypeScript errors

**Images don't load:**
- Verify Supabase storage policies
- Check bucket exists
- Confirm URLs are public

**Auth fails:**
- Verify environment variables
- Check redirect URLs in Supabase
- Ensure cookies are working (HTTPS required)

---

## Monitoring & Logs

### Vercel Logs

1. Go to Project → Deployments
2. Select a deployment
3. View "Functions" tab for API logs
4. View "Build Logs" for build issues

### Supabase Logs

1. Go to your project
2. Select "Logs" from sidebar
3. View:
   - API logs
   - Auth logs
   - Realtime logs
   - Storage logs

---

## Continuous Deployment

With GitHub integration, every push to `main` triggers:

1. Vercel detects changes
2. Builds the application
3. Runs any tests
4. Deploys to production
5. Updates live in ~2-3 minutes

### Branch Deployments

- **main** → Production
- **Other branches** → Preview URLs (unique URL per branch)

---

## Environment Configuration

### Production vs Preview

```
Production:
  NEXT_PUBLIC_APP_URL=https://yourdomain.com

Preview (automatic):
  NEXT_PUBLIC_APP_URL=https://[branch]-[project].vercel.app
```

### Secrets Management

Never commit:
- `.env.local`
- Service role keys
- API keys

Always use Vercel's environment variables.

---

## Chapter Summary

Production deployment involves:

1. Create production Supabase project
2. Run database migrations
3. Deploy to Vercel (via GitHub or CLI)
4. Configure environment variables
5. Set up custom domain (optional)
6. Verify all features work

Key considerations:
- Use separate Supabase project for production
- Enable email confirmation for production
- Monitor logs for issues
- Use branch deployments for testing

---

*Next: [Chapter 29: Testing](./chapter-29-testing.md) - Testing strategies*
