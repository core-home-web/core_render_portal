# Database Function Permissions

## Error: Functions Exist But Return 400/403 Errors

### Date First Encountered
2025-01-XX

### Error Description
Database functions exist and are callable, but return 400 or 403 errors when called from the application. This is a common issue with `SECURITY DEFINER` functions in PostgreSQL/Supabase.

### Error Pattern
- Function exists in database (verified via `pg_proc`)
- Function signature is correct
- RPC call returns 400 Bad Request or 403 Forbidden
- No obvious syntax or logic errors in function definition

### Root Cause
**`SECURITY DEFINER` functions still require explicit `GRANT EXECUTE` permissions.**

Even though `SECURITY DEFINER` functions run with the privileges of the function creator (bypassing RLS), they still need:
1. Execute permissions granted to roles that will call them
2. Proper grants for `authenticated` and `anon` roles in Supabase
3. Function must be in `public` schema (or schema must be in search path)

### Solution

**Always include grants when creating functions:**
```sql
-- Create function
CREATE OR REPLACE FUNCTION my_function(param UUID)
RETURNS TABLE (...)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$ ... $$;

-- CRITICAL: Grant execute permissions
GRANT EXECUTE ON FUNCTION my_function(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION my_function(UUID) TO anon;
```

### Verification Query
```sql
SELECT 
  grantee,
  routine_name,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name = 'my_function';
```

Expected result: Should show `EXECUTE` privilege for both `authenticated` and `anon` roles.

### Related Files
- `docs/fix-board-function-permissions.sql` - Example fix script
- `docs/create-project-boards-table.sql` - Updated to include grants
- `docs/fix-project-collaborators-view.sql` - Includes grants for collaborators function

### Prevention Checklist
- [ ] Always add `GRANT EXECUTE` after creating `SECURITY DEFINER` functions
- [ ] Grant to both `authenticated` and `anon` roles
- [ ] Verify grants using `information_schema.routine_privileges`
- [ ] Include grants in initial setup scripts, not just fix scripts
- [ ] Test function calls after creation

### Common Mistakes
1. **Assuming SECURITY DEFINER is enough**: It's not - you still need grants
2. **Only granting to authenticated**: Also need `anon` for unauthenticated requests
3. **Forgetting to grant after function creation**: Must grant explicitly
4. **Wrong function signature in GRANT**: Must match exactly (including parameter types)

### Status
✅ **RESOLVED** - Documented and fixed in multiple functions

### Notes
- This is a PostgreSQL/Supabase quirk that catches many developers
- The error (400 vs 403) can be misleading
- Always test RPC functions after database migrations
- Consider creating a template/checklist for function creation

