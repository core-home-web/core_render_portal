# 🚀 Deployment Guide for Core Render Portal

## Quick Deploy Options

### Option 1: Vercel (Recommended for Next.js)

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Vercel**: Go to [vercel.com](https://vercel.com) and connect your GitHub repo
3. **Set Environment Variables**: Copy from `env.production.example`
4. **Deploy**: Vercel will automatically build and deploy

### Option 2: Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Environment Variables**: Set in Netlify dashboard

### Option 3: Railway

1. **Connect Repository**: Link your GitHub repo
2. **Add PostgreSQL**: Railway will provide database URL
3. **Set Environment Variables**: Update Supabase config

## 🔄 **Update Workflow (After Initial Deployment)**

### **Automatic Deployments (Recommended)**

1. **Make changes locally** on your computer
2. **Test changes** with `npm run dev`
3. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "feat: Description of your changes"
   git push origin main
   ```
4. **Vercel automatically detects** changes and deploys
5. **Your live site updates** in ~2-3 minutes

### **Manual Deployments (Optional)**

- **Staging**: Push to a different branch for testing
- **Production**: Manually trigger deployment when ready
- **Rollback**: Revert to previous version if needed

### **Branch Strategy for Updates**

```bash
# For major features:
git checkout -b feature/new-feature
# ... make changes ...
git push origin feature/new-feature
# Create Pull Request on GitHub
# Merge to main when ready

# For quick fixes:
git checkout main
# ... make changes ...
git push origin main
# Automatic deployment
```

## 🔧 Pre-Deployment Checklist

### 1. Supabase Production Setup

- [ ] Create production Supabase project
- [ ] Run database migrations
- [ ] Set up storage buckets
- [ ] Configure RLS policies
- [ ] Test authentication flow

### 2. Environment Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL` (production)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (production)
- [ ] `NEXT_PUBLIC_APP_URL` (your domain)

### 3. File Storage

- [ ] Configure Supabase storage for production
- [ ] Set up proper CORS policies
- [ ] Test file uploads

### 4. Authentication

- [ ] Configure auth providers (if using external auth)
- [ ] Set up email templates
- [ ] Test signup/login flow

## 🚀 Vercel Deployment Steps

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy**:

   ```bash
   vercel
   ```

4. **Set Production Environment**:

   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_APP_URL
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## 🔍 Post-Deployment Testing

- [ ] Test user registration/login
- [ ] Test image uploads
- [ ] Test project creation
- [ ] Test image annotation
- [ ] Test visual editor
- [ ] Test export functionality
- [ ] Test real-time collaboration

## 📱 Custom Domain Setup

1. **Add Domain in Vercel Dashboard**
2. **Configure DNS Records**
3. **Update `NEXT_PUBLIC_APP_URL`**
4. **Wait for SSL Certificate**

## 🆘 Troubleshooting

### Common Issues:

- **Build Failures**: Check Node.js version compatibility
- **Environment Variables**: Ensure all required vars are set
- **Database Connection**: Verify Supabase credentials
- **File Uploads**: Check storage bucket permissions

### Support:

- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/support](https://supabase.com/support)
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
