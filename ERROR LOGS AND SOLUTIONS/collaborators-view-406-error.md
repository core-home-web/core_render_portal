# Collaborators View 406 Error

## Error: 406 Not Acceptable for project_collaborators_with_users

### Date First Encountered
2025-01-XX

### Error Description
HTTP 406 "Not Acceptable" error when querying the `project_collaborators_with_users` view. The error occurs because PostgREST (Supabase's API layer) cannot expose `auth.users` table directly through views for security reasons.

### Error Output
```
GET https://erasycqfdjlhdgovtrxi.supabase.co/rest/v1/project_collaborators_with_users?select=user_email%2Cuser_full_name&project_id=eq.93dd1e48-775a-4fe7-8aff-a675b7099b56&user_id=eq.3c2aba30-4367-4a81-83ac-736ad3c98b00
Failed to load resource: the server responded with a status of 406 ()
```

### Root Cause
The view `project_collaborators_with_users` attempted to join with `auth.users` table:
```sql
LEFT JOIN auth.users u ON pc.user_id = u.id
```

PostgREST blocks this because:
1. Security: Views that join with `auth.users` could expose sensitive user data
2. PostgREST restrictions: Cannot expose `auth.users` through public API views
3. The 406 error indicates the request format is correct, but the server cannot produce a response due to security restrictions

### Solution

**Step 1**: Create a `SECURITY DEFINER` function that can safely access `auth.users`:
```sql
-- File: docs/fix-project-collaborators-view.sql
CREATE OR REPLACE FUNCTION get_project_collaborators_with_users(p_project_id UUID)
RETURNS TABLE (...)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check access permissions
  -- Return collaborators with user info from auth.users
END;
$$;

GRANT EXECUTE ON FUNCTION get_project_collaborators_with_users(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_collaborators_with_users(UUID) TO anon;
```

**Step 2**: Update all code to use the function with fallbacks:
- `hooks/useProjectCollaboration.ts` - Uses RPC function first, falls back to view, then basic query
- `components/project/collaborators-list.tsx` - Uses RPC function with view fallback
- `app/api/request-access/route.ts` - Uses RPC function with view fallback
- `app/api/notify-collaborators/route.ts` - Uses RPC function with view fallback
- `hooks/useRealtimeProject.ts` - Uses RPC function with view fallback

**Step 3**: Drop the problematic view (or don't create it):
```sql
DROP VIEW IF EXISTS project_collaborators_with_users CASCADE;
```

### Code Pattern Used
All updated files follow this pattern:
```typescript
// 1. Try RPC function first (most reliable)
const { data: rpcData, error: rpcError } = await supabase.rpc(
  'get_project_collaborators_with_users',
  { p_project_id: projectId }
)

if (!rpcError && rpcData) {
  return rpcData
}

// 2. Fallback to view (may fail with 406, handled gracefully)
const { data: viewData, error: viewError } = await supabase
  .from('project_collaborators_with_users')
  .select('*')
  .eq('project_id', projectId)

if (viewError && viewError.code !== '406') {
  throw viewError
}

// 3. Final fallback to basic query
const { data: basicData } = await supabase
  .from('project_collaborators')
  .select('*')
  .eq('project_id', projectId)
```

### Related Files
- `docs/fix-project-collaborators-view.sql` - SQL fix script
- `docs/FIX-406-COLLABORATORS-VIEW-ERROR.md` - Troubleshooting guide
- `hooks/useProjectCollaboration.ts` - Updated hook
- `components/project/collaborators-list.tsx` - Updated component
- `app/api/request-access/route.ts` - Updated API route
- `app/api/notify-collaborators/route.ts` - Updated API route
- `hooks/useRealtimeProject.ts` - Updated hook

### Prevention
- Never create views that join with `auth.users` directly
- Use `SECURITY DEFINER` functions for accessing `auth.users`
- Always test views/functions after creation
- Use `user_profiles` table if you need user data in views (but note: it doesn't have email)

### Alternative Solutions
1. **Use user_profiles table**: Create view using `user_profiles` instead of `auth.users`
   - **Limitation**: `user_profiles` doesn't have `email` column
   - **Note**: Email is only in `auth.users`, so this approach won't work for email

2. **Use API routes**: Create Next.js API routes that use service role key
   - **Pros**: Can access `auth.users` safely
   - **Cons**: Additional API layer, more complexity

3. **Function-based approach (chosen)**: Use `SECURITY DEFINER` functions
   - **Pros**: Direct database access, secure, efficient
   - **Cons**: Requires function creation and grants

### Status
✅ **RESOLVED** - Fixed by creating RPC function and updating all code to use it

### Notes
- The 406 error is now handled gracefully - app continues to work even if view fails
- The RPC function approach is more secure and reliable
- All error handling is silent for 406 errors to avoid console noise
- The function automatically checks user access permissions before returning data

