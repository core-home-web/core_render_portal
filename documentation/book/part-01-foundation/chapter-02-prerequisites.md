# Chapter 2: Prerequisites

Before building the Core Render Portal, you need to set up your development environment and create the necessary accounts. This chapter walks through everything required.

---

## Required Knowledge

### Essential Skills

| Skill | Level Required | Notes |
|-------|----------------|-------|
| **JavaScript** | Intermediate | ES6+ features, async/await |
| **TypeScript** | Basic | Type annotations, interfaces |
| **React** | Intermediate | Hooks, components, state |
| **HTML/CSS** | Basic | Structure and styling |
| **SQL** | Basic | SELECT, INSERT, UPDATE, DELETE |
| **Git** | Basic | Clone, commit, push, pull |

### Helpful But Not Required

- Node.js ecosystem knowledge
- Tailwind CSS experience
- PostgreSQL experience
- Vercel deployment experience

---

## Required Tools

### 1. Node.js (v18+)

Node.js is required to run the development server and build the application.

**Installation:**

```bash
# macOS (using Homebrew)
brew install node

# Windows (using Chocolatey)
choco install nodejs

# Or download from https://nodejs.org
```

**Verify Installation:**

```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### 2. pnpm Package Manager

We use pnpm for faster, more efficient package management.

**Installation:**

```bash
# Using npm
npm install -g pnpm

# Or using Homebrew (macOS)
brew install pnpm
```

**Verify Installation:**

```bash
pnpm --version  # Should show 8.x.x or higher
```

### 3. Git

Git is required for version control.

**Installation:**

```bash
# macOS
brew install git

# Windows
choco install git

# Or download from https://git-scm.com
```

**Verify Installation:**

```bash
git --version  # Should show git version 2.x.x
```

### 4. Code Editor

We recommend Visual Studio Code with these extensions:

| Extension | Purpose |
|-----------|---------|
| **ESLint** | JavaScript/TypeScript linting |
| **Prettier** | Code formatting |
| **Tailwind CSS IntelliSense** | CSS class autocomplete |
| **TypeScript Importer** | Auto-import TypeScript |
| **Prisma** | Database syntax highlighting |

**VS Code Settings (Recommended):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Required Accounts

### 1. GitHub Account

Used for:
- Code repository hosting
- Vercel integration
- CI/CD workflows

**Create Account:** https://github.com/signup

### 2. Supabase Account

Used for:
- Database hosting
- Authentication
- File storage
- Realtime subscriptions

**Create Account:** https://supabase.com

**Important:** Supabase offers a free tier with:
- 500MB database storage
- 1GB file storage
- 2GB bandwidth
- Unlimited API requests

### 3. Vercel Account (Optional for Development)

Used for:
- Production deployment
- Preview deployments
- Edge functions

**Create Account:** https://vercel.com

**Note:** You can connect your GitHub account for seamless deployment.

### 4. Resend Account (For Email)

Used for:
- Sending invitation emails
- Notification emails

**Create Account:** https://resend.com

**Free Tier:** 100 emails/day, 3,000 emails/month

---

## Setting Up Supabase

This is a critical step. Follow carefully.

### Step 1: Create a New Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in the details:
   - **Name:** `core-render-portal` (or your preference)
   - **Database Password:** Generate a strong password and **save it securely**
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is sufficient for development

4. Click "Create new project"
5. Wait for project to initialize (~2 minutes)

### Step 2: Get API Keys

Once your project is ready:

1. Go to **Settings** → **API**
2. Note down these values:

| Setting | Where to Find | What It Is |
|---------|---------------|------------|
| **Project URL** | Under "Project URL" | `https://xxx.supabase.co` |
| **anon/public key** | Under "Project API keys" | Public key for client-side |
| **service_role key** | Under "Project API keys" | Secret key for server-side |

> **Warning:** Never expose the `service_role` key in client-side code!

### Step 3: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Ensure "Email" is enabled
3. Go to **Authentication** → **URL Configuration**
4. Add redirect URLs:
   - `http://localhost:3000/**` (development)
   - `https://your-domain.com/**` (production, add later)

### Step 4: Enable Email Confirmation (Optional)

For development, you might want to disable email confirmation:

1. Go to **Authentication** → **Providers** → **Email**
2. Toggle off "Confirm email"

> **Note:** Enable this for production!

---

## Setting Up Resend (Email Service)

### Step 1: Create API Key

1. Sign in to https://resend.com
2. Go to **API Keys**
3. Click "Create API Key"
4. Name it `core-render-portal`
5. Copy the key immediately (shown only once)

### Step 2: Verify Domain (Optional)

For production, verify your domain:

1. Go to **Domains** → **Add Domain**
2. Add DNS records as instructed
3. Wait for verification

For development, you can use Resend's test domain.

---

## Local Development Environment

### Directory Structure

Create a workspace directory:

```bash
# Create project directory
mkdir -p ~/Projects/core-render-portal
cd ~/Projects/core-render-portal
```

### Environment File Template

Create `.env.local` file (we'll populate this in Chapter 4):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (Resend)
RESEND_API_KEY=
```

---

## Verification Checklist

Before proceeding, verify each item:

### Tools Installed

```bash
# Run these commands and verify output
node --version      # v18.0.0 or higher ✓
pnpm --version      # 8.0.0 or higher ✓
git --version       # git version 2.x.x ✓
code --version      # VS Code version (optional)
```

### Accounts Created

- [ ] GitHub account created and logged in
- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Supabase API keys noted
- [ ] Resend account created (optional for initial development)
- [ ] Resend API key created (optional for initial development)

### VS Code Extensions

- [ ] ESLint installed
- [ ] Prettier installed
- [ ] Tailwind CSS IntelliSense installed

---

## Troubleshooting Common Issues

### Node.js Version Too Old

```bash
# Using nvm (Node Version Manager)
nvm install 18
nvm use 18
```

### pnpm Not Found After Install

```bash
# Add to PATH (macOS/Linux)
export PATH="$PATH:$(npm config get prefix)/bin"

# Or reinstall globally
npm install -g pnpm
```

### Git Authentication Issues

```bash
# Set up SSH key
ssh-keygen -t ed25519 -C "your@email.com"
# Add to GitHub: Settings → SSH Keys → New SSH Key
```

### Supabase Connection Issues

1. Check that your IP isn't blocked
2. Verify API keys are correct
3. Ensure project is fully initialized (not paused)

---

## Hardware Recommendations

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 8 GB | 16 GB |
| **Storage** | 10 GB free | 20 GB SSD |
| **CPU** | Dual core | Quad core |
| **Display** | 1080p | 1440p or higher |

---

## Browser Compatibility

The application supports:

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

> **Note:** Internet Explorer is not supported.

---

## Chapter Summary

You now have:

1. **Node.js** and **pnpm** installed for running the application
2. **Git** configured for version control
3. **VS Code** (or your editor) set up with recommended extensions
4. **Supabase** account with a new project and API keys
5. **Resend** account for email functionality (optional)
6. A verification checklist to ensure everything is ready

---

## Next Steps

With all prerequisites in place, you're ready to create the Next.js project and set up the folder structure.

---

*Next: [Chapter 3: Initial Project Setup](./chapter-03-initial-setup.md) - Create the Next.js application*
