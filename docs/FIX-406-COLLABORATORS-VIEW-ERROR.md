# Fix: 406 Error for project_collaborators_with_users

## Problem
Getting a 406 "Not Acceptable" error when querying `project_collaborators_with_users` view. This happens because PostgREST (Supabase's API layer) cannot expose `auth.users` directly through views for security reasons.

## Root Cause
The view `project_collaborators_with_users` tries to join with `auth.users` table:
```sql
LEFT JOIN auth.users u ON pc.user_id = u.id
```

PostgREST blocks this because it would expose sensitive user data. The 406 error indicates the request format is correct, but the server cannot produce a response in the format requested due to security restrictions.

## Solution

### Step 1: Run the Fix Script
Run this in your Supabase SQL Editor:

```sql
-- File: docs/fix-project-collaborators-view.sql
```

This script:
1. Creates a `SECURITY DEFINER` function `get_project_collaborators_with_users()` that can safely access `auth.users`
2. Attempts to create a view using `user_profiles` table if it exists (safer alternative)
3. Grants execute permissions on the function

### Step 2: Code Updates (Already Done)
The following files have been updated to use the function with fallbacks:

- `hooks/useProjectCollaboration.ts` - Uses RPC function, falls back to view, then basic query
- `components/project/collaborators-list.tsx` - Uses RPC function with view fallback
- `app/api/request-access/route.ts` - Uses RPC function with view fallback
- `app/api/notify-collaborators/route.ts` - Uses RPC function with view fallback
- `hooks/useRealtimeProject.ts` - Uses RPC function with view fallback

### Step 3: Verify the Fix
After running the SQL script:

1. Check browser console - 406 errors should be gone
2. Collaborators should load properly
3. The function will be used automatically by the updated code

## How It Works

The code now follows this fallback pattern:

1. **First**: Try RPC function `get_project_collaborators_with_users(project_id)`
   - Most reliable, can access `auth.users` safely
   
2. **Second**: Try view `project_collaborators_with_users`
   - May work if using `user_profiles` instead of `auth.users`
   - Will fail with 406 if still using `auth.users` (handled gracefully)
   
3. **Third**: Fall back to basic `project_collaborators` query
   - No user email/name, but basic collaborator data works

## Testing

Test the function directly in SQL:
```sql
SELECT * FROM get_project_collaborators_with_users('your-project-id-here');
```

## Notes

- The 406 error is now handled gracefully - the app will continue to work even if the view fails
- The RPC function approach is more secure and reliable
- If you have a `user_profiles` table, the view will work and be used as a fallback
- All error handling is silent for 406 errors to avoid console noise

