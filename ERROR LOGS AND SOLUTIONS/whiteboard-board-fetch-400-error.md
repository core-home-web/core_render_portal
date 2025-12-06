# Whiteboard Board Fetch 400 Error

## Error: Failed to Fetch Board (400 Bad Request)

### Date First Encountered
2025-01-XX

### Error Description
Whiteboard component shows "Failed to fetch board" error with HTTP 400 status when trying to load a board. The error occurs when calling the `get_or_create_project_board` RPC function.

### Error Output
```
Error fetching board: Object
erasycqfdjlhdgovtrxi.supabase.co/rest/v1/rpc/get_or_create_project_board:1  
Failed to load resource: the server responded with a status of 400 ()
```

### Root Cause
The `get_or_create_project_board` and `save_project_board` functions existed in the database but lacked `EXECUTE` permissions for the `authenticated` and `anon` roles. Even though the functions use `SECURITY DEFINER`, they still require explicit `GRANT EXECUTE` permissions.

### Solution

**Step 1**: Run the permissions fix script:
```sql
-- File: docs/fix-board-function-permissions.sql
GRANT EXECUTE ON FUNCTION get_or_create_project_board(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_project_board(UUID) TO anon;
GRANT EXECUTE ON FUNCTION save_project_board(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION save_project_board(UUID, JSONB) TO anon;
```

**Step 2**: Improved error handling in code:
- Enhanced error messages in `hooks/useProjectBoard.ts`
- Added detailed error logging with error codes
- Better error context for debugging

**Step 3**: Fixed retry button:
- Changed from `window.location.reload()` to calling `fetchBoard()` directly
- Added `fetchBoard` to hook return values

### Related Files
- `hooks/useProjectBoard.ts` - Main hook for board management
- `components/project/visual-editor-modal.tsx` - UI component with retry button
- `docs/fix-board-function-permissions.sql` - SQL fix script
- `docs/create-project-boards-table.sql` - Updated to include grants
- `docs/FIX-WHITEBOARD-FETCH-ERROR.md` - Troubleshooting guide

### Prevention
- Always include `GRANT EXECUTE` statements when creating `SECURITY DEFINER` functions
- Verify function permissions in setup scripts
- Test RPC functions after database migrations

### Verification
Run verification script:
```sql
-- File: docs/verify-project-boards-setup.sql
SELECT 
  grantee,
  routine_name,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name IN ('get_or_create_project_board', 'save_project_board');
```

### Status
✅ **RESOLVED** - Fixed by granting execute permissions

### Notes
- `SECURITY DEFINER` functions still need explicit grants
- This is a common oversight in Supabase/PostgreSQL setups
- The error was misleading (400 instead of 403) because PostgREST returns 400 for missing permissions

