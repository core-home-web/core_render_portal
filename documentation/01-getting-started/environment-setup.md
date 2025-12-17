# Environment Setup

Configure Supabase and environment variables.

## Step 1: Create Environment File

```bash
cp env.example .env.local
```

## Step 2: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Configure .env.local

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_xxx  # Optional: for email invitations
```

## Step 4: Set Up Database

1. Go to Supabase SQL Editor
2. Run `docs/PRODUCTION-SETUP-COMPLETE.sql`
3. Verify tables exist in Table Editor

## Step 5: Set Up Storage

Create buckets in Supabase Storage:
- `project-images` (public)
- `board-assets` (public)
- `profile-images` (public)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side key |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL |
| `RESEND_API_KEY` | No | For email invitations |

---

← [Installation](./installation.md) | Next: [First Run](./first-run.md) →

