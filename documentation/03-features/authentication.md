# Authentication

The Core Render Portal uses Supabase Auth for user authentication.

## Overview

- **Provider:** Supabase Auth (email/password)
- **Session Storage:** Browser cookies (HTTP-only)
- **Token Type:** JWT (JSON Web Token)

## User Flow

### Sign Up

```
1. User visits /auth/signup
2. Enters email, password, team selection
3. Supabase creates user in auth.users
4. Trigger creates user_profiles record
5. User redirected to dashboard
```

### Sign In

```
1. User visits /auth/login
2. Enters email and password
3. Supabase validates credentials
4. JWT stored in cookie
5. User redirected to dashboard
```

### Sign Out

```
1. User clicks "Sign Out"
2. Supabase clears session
3. Cookie removed
4. User redirected to login
```

## Teams

Users belong to one of two teams:

| Team | Color | Theme |
|------|-------|-------|
| Product Development | Teal (#38bdbb) | Default |
| Industrial Design | Orange (#f9903c) | Optional |

The team selection affects the UI color scheme throughout the app.

## Implementation

### Auth Context

The `AuthContext` provides authentication state throughout the app:

```typescript
// lib/auth-context.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supaClient'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ... methods
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### Login Form

```typescript
// components/auth/login-form.tsx
export function LoginForm() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit">Sign In</Button>
    </form>
  )
}
```

### Protected Routes

Pages that require authentication check for a user:

```typescript
// Example protected page
'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <div>Welcome, {user.email}</div>
}
```

## User Profile

When a user signs up, a profile is automatically created:

```sql
-- Trigger function
CREATE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (user_id, display_name, team)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1),
    'product_development'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Security

### Row Level Security

All database queries are filtered by the authenticated user:

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (user_id = auth.uid());
```

### JWT Verification

The JWT is automatically included in all Supabase requests:

```typescript
// supaClient.ts creates a client that includes auth headers
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## Related Files

| File | Purpose |
|------|---------|
| `lib/auth-context.tsx` | Auth context provider |
| `lib/supaClient.ts` | Supabase client |
| `components/auth/login-form.tsx` | Login form component |
| `components/auth/signup-form.tsx` | Signup form component |
| `app/auth/login/page.tsx` | Login page |
| `app/auth/signup/page.tsx` | Signup page |

## Troubleshooting

### "Invalid login credentials"

- Verify email is correct
- Check password (case-sensitive)
- Ensure user account exists

### Session Not Persisting

- Check cookies are enabled
- Clear browser storage and try again
- Verify Supabase URL is correct

### "User not found" After Signup

- Check the trigger is active in Supabase
- Verify user_profiles table exists
- Check for database errors in Supabase logs

---

← [Features Overview](./README.md) | Next: [Projects](./projects.md) →

