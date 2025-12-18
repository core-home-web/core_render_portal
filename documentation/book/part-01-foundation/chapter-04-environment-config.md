# Chapter 4: Environment Configuration

This chapter covers setting up the Supabase connection, environment variables, and the Supabase client libraries that power the application's backend.

---

## Environment Variables

### Create Environment File

Create a `.env.local` file in the project root:

```bash
touch .env.local
```

### Required Variables

Add the following to `.env.local`:

```bash
# ==============================================
# SUPABASE CONFIGURATION
# ==============================================

# Your Supabase project URL
# Found at: Supabase Dashboard → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anonymous/public key
# Found at: Supabase Dashboard → Settings → API → Project API keys → anon/public
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Your Supabase service role key (KEEP SECRET!)
# Found at: Supabase Dashboard → Settings → API → Project API keys → service_role
# WARNING: Never expose this in client-side code!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==============================================
# APPLICATION CONFIGURATION
# ==============================================

# Your application URL (for redirects and links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==============================================
# EMAIL CONFIGURATION (Optional)
# ==============================================

# Resend API key for sending invitation emails
# Get from: https://resend.com → API Keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### Getting Supabase Values

1. Go to your Supabase Dashboard
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

> **Security Warning:** The `service_role` key has full database access. Never expose it in client-side code or commit it to version control.

---

## Example Environment File

Create `.env.example` (safe to commit):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration
RESEND_API_KEY=your-resend-api-key
```

---

## Supabase Client Setup

### Client-Side Client (lib/supaClient.ts)

This client is used in browser-side code (React components, client hooks).

```typescript
// File: lib/supaClient.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('URL exists:', !!supabaseUrl)
  console.error('Anon Key exists:', !!supabaseAnonKey)
}

// Debug logging (remove in production)
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key exists:', !!supabaseAnonKey)
console.log('Supabase Anon Key length:', supabaseAnonKey?.length || 0)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,      // Keep user logged in
    autoRefreshToken: true,    // Refresh tokens automatically
    detectSessionInUrl: true,  // Handle OAuth redirects
    flowType: 'pkce'           // Secure auth flow
  },
  global: {
    headers: {
      'x-application-name': 'core-render-portal',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  },
  db: {
    schema: 'public',
  },
})
```

**Code Explanation:**

| Line | Purpose |
|------|---------|
| `process.env.NEXT_PUBLIC_*` | Access environment variables (NEXT_PUBLIC_ prefix makes them available in browser) |
| `createClient()` | Creates Supabase client instance |
| `persistSession: true` | Stores session in localStorage for persistence across page refreshes |
| `autoRefreshToken: true` | Automatically refreshes JWT tokens before they expire |
| `detectSessionInUrl: true` | Handles OAuth callback URLs |
| `flowType: 'pkce'` | Uses PKCE (Proof Key for Code Exchange) for secure auth |

### Server-Side Admin Client (lib/supaAdmin.ts)

This client is used in API routes and server components where elevated permissions are needed.

```typescript
// File: lib/supaAdmin.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'SET' : 'MISSING',
    serviceKey: supabaseServiceRoleKey ? 'SET' : 'MISSING'
  })
  throw new Error('Missing required Supabase environment variables')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,  // No need for admin
    persistSession: false,    // No session persistence
  },
})
```

**Code Explanation:**

| Line | Purpose |
|------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Uses service role key which bypasses Row Level Security |
| `autoRefreshToken: false` | Admin client doesn't need token refresh |
| `persistSession: false` | No session needed for server-side operations |

**When to Use Each Client:**

| Client | Use Case |
|--------|----------|
| `supabase` (client) | React components, hooks, client-side auth |
| `supabaseAdmin` (admin) | API routes, server actions, admin operations |

---

## Verifying the Connection

### Create Test Page

Create `app/test-connection/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supaClient'

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [details, setDetails] = useState<string>('')

  useEffect(() => {
    async function testConnection() {
      try {
        // Try to get the current session (doesn't require auth)
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus('error')
          setDetails(`Auth Error: ${error.message}`)
          return
        }

        // Try a simple database query (will fail if tables don't exist yet, but connection works)
        const { error: dbError } = await supabase
          .from('projects')
          .select('count')
          .limit(1)

        if (dbError && dbError.code !== 'PGRST116') {
          // PGRST116 means table doesn't exist, which is expected before setup
          setStatus('error')
          setDetails(`Database Error: ${dbError.message}`)
          return
        }

        setStatus('success')
        setDetails(
          dbError?.code === 'PGRST116'
            ? 'Connection successful! (Database tables not yet created)'
            : 'Connection successful! Database ready.'
        )
      } catch (err) {
        setStatus('error')
        setDetails(`Unexpected error: ${err}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070e0e]">
      <div className="bg-[#1a1e1f] rounded-2xl p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-white mb-6">
          Supabase Connection Test
        </h1>
        
        <div className={`p-4 rounded-lg ${
          status === 'loading' ? 'bg-yellow-900/20 text-yellow-400' :
          status === 'success' ? 'bg-green-900/20 text-green-400' :
          'bg-red-900/20 text-red-400'
        }`}>
          <div className="font-medium mb-2">
            {status === 'loading' && '⏳ Testing connection...'}
            {status === 'success' && '✅ Connected!'}
            {status === 'error' && '❌ Connection failed'}
          </div>
          {details && (
            <div className="text-sm opacity-80">
              {details}
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <h2 className="font-medium text-white mb-2">Environment Check:</h2>
          <ul className="space-y-1">
            <li>
              SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </li>
            <li>
              ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
```

### Run the Test

1. Start the dev server: `pnpm dev`
2. Visit: http://localhost:3000/test-connection
3. You should see "Connected!" with either:
   - "Database tables not yet created" (expected)
   - "Database ready." (if tables exist)

---

## Security Best Practices

### Environment Variable Security

| Variable | Prefix | Client Access | Server Access |
|----------|--------|---------------|---------------|
| `NEXT_PUBLIC_*` | `NEXT_PUBLIC_` | ✅ Yes | ✅ Yes |
| No prefix | None | ❌ No | ✅ Yes |

### Rules to Follow

1. **Never commit `.env.local`** - It contains secrets
2. **Use `NEXT_PUBLIC_` only for safe values** - The anon key is safe because RLS protects data
3. **Keep `SERVICE_ROLE_KEY` server-side only** - It bypasses all security
4. **Rotate keys if exposed** - Generate new keys in Supabase dashboard

### Adding to .gitignore

Ensure `.env.local` is in `.gitignore`:

```bash
# Verify it's ignored
cat .gitignore | grep env
```

Should show:
```
.env*.local
```

---

## Production Environment Variables

For production (Vercel), you'll need to set these in the Vercel dashboard:

### Vercel Setup

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service key | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | https://yourdomain.com | Production |
| `NEXT_PUBLIC_APP_URL` | (auto-generated) | Preview |
| `RESEND_API_KEY` | Your Resend key | Production, Preview |

---

## Troubleshooting

### "Missing Supabase environment variables"

**Cause:** Environment variables not loading

**Solution:**
1. Check `.env.local` exists in project root
2. Verify no typos in variable names
3. Restart the dev server after changes

### "Invalid API key"

**Cause:** Wrong key or copy error

**Solution:**
1. Go to Supabase Dashboard → Settings → API
2. Copy the key again (ensure complete)
3. Paste without extra spaces

### "Connection refused" or timeout

**Cause:** Supabase project paused or network issue

**Solution:**
1. Check Supabase dashboard for project status
2. If paused, restore the project
3. Check your internet connection

### "JWT expired"

**Cause:** Old session or clock skew

**Solution:**
1. Clear browser storage
2. Sign in again
3. Check system clock is correct

---

## Environment Files Summary

| File | Purpose | Git |
|------|---------|-----|
| `.env.local` | Local development secrets | **NEVER COMMIT** |
| `.env.example` | Template for required vars | ✅ Commit |
| `.env.production.example` | Production template | ✅ Commit |

---

## Chapter Summary

You have now:

1. Created the `.env.local` file with all required environment variables
2. Set up the Supabase client-side client (`supaClient.ts`)
3. Set up the Supabase server-side admin client (`supaAdmin.ts`)
4. Created a test page to verify the connection
5. Understood security best practices for environment variables

---

## Next Steps

The connection is configured. Next, we'll explore the overall architecture and how all the pieces fit together.

---

*Next: [Chapter 5: Architecture Overview](./chapter-05-architecture-overview.md) - Understand the system design*
