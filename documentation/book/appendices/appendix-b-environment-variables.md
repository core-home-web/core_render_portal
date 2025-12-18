# Appendix B: Environment Variables Reference

Complete reference for all environment variables used in the Core Render Portal.

---

## Required Variables

### Supabase Configuration

| Variable | Required | Client | Description |
|----------|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | No | Supabase service role key (admin) |

### Application Configuration

| Variable | Required | Client | Description |
|----------|----------|--------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | Your application URL |

### Email Configuration

| Variable | Required | Client | Description |
|----------|----------|--------|-------------|
| `RESEND_API_KEY` | No* | No | Resend API key for emails |

*Required for invitation emails to work

---

## Variable Details

### NEXT_PUBLIC_SUPABASE_URL

**Purpose:** The URL of your Supabase project

**Format:** `https://[project-ref].supabase.co`

**Where to find:** Supabase Dashboard → Settings → API → Project URL

**Example:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
```

### NEXT_PUBLIC_SUPABASE_ANON_KEY

**Purpose:** Public API key for client-side Supabase operations

**Format:** JWT string (starts with `eyJ...`)

**Where to find:** Supabase Dashboard → Settings → API → Project API keys → anon/public

**Security:** Safe to expose - RLS protects data

**Example:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### SUPABASE_SERVICE_ROLE_KEY

**Purpose:** Admin API key that bypasses RLS

**Format:** JWT string (starts with `eyJ...`)

**Where to find:** Supabase Dashboard → Settings → API → Project API keys → service_role

**Security:** NEVER expose in client code. Server-only.

**Example:**
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### NEXT_PUBLIC_APP_URL

**Purpose:** Base URL for the application (used in emails, redirects)

**Format:** Full URL with protocol, no trailing slash

**Values:**
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

**Example:**
```
NEXT_PUBLIC_APP_URL=https://renderportal.yourcompany.com
```

### RESEND_API_KEY

**Purpose:** API key for Resend email service

**Format:** Starts with `re_`

**Where to find:** Resend Dashboard → API Keys

**Example:**
```
RESEND_API_KEY=re_123456789_abcdefghijklmnop
```

---

## Environment Files

### .env.local (Development)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email
RESEND_API_KEY=re_...
```

### .env.example (Template)

```bash
# Copy this to .env.local and fill in values

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (optional for development)
RESEND_API_KEY=
```

---

## Vercel Configuration

In Vercel dashboard (Settings → Environment Variables):

| Name | Environment | Value |
|------|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | All | Your service role key |
| `NEXT_PUBLIC_APP_URL` | Production | `https://yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | Preview | Leave empty (auto-generated) |
| `RESEND_API_KEY` | All | Your Resend key |

---

## Security Notes

1. **Never commit `.env.local`** - Contains secrets
2. **NEXT_PUBLIC_ prefix** - Makes variable available in browser
3. **Service role key** - Use ONLY in API routes, never in components
4. **Rotate keys if exposed** - Generate new in Supabase dashboard

---

*Return to [Appendices](./README.md)*
