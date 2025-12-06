# Fix: "Failed to fetch board" Error

## Problem
The whiteboard component shows "Failed to fetch board" with a 400 error when trying to load a board.

## Root Cause
The error typically occurs when:
1. The `get_or_create_project_board` database function doesn't exist
2. The `project_boards` table hasn't been created
3. **Execute permissions are missing on the function** (most common if functions exist)
4. Database permissions/RLS policies are misconfigured

## Solution

### Step 1: Verify Current Setup
Run the verification script to check what's missing:

```sql
-- Run this in Supabase SQL Editor
-- File: docs/verify-project-boards-setup.sql
```

### Step 2: Fix Function Permissions (Most Common Fix)
If the functions exist but you're still getting 400 errors, run the permissions fix:

```sql
-- Run this in Supabase SQL Editor
-- File: docs/fix-board-function-permissions.sql
```

This grants execute permissions to `authenticated` and `anon` roles, which is required even for `SECURITY DEFINER` functions.

### Step 3: Create Missing Database Objects
If the verification shows missing objects, run the setup script:

```sql
-- Run this in Supabase SQL Editor
-- File: docs/create-project-boards-table.sql
```

This script will:
- Create the `project_boards` table
- Set up RLS policies
- Create the `get_or_create_project_board` function
- Create the `save_project_board` function
- **Grant execute permissions** (included in updated version)

### Step 4: Verify the Fix
After running the fix script, verify everything is working:

1. Check the browser console for detailed error messages
2. Try accessing the whiteboard again
3. The error should be resolved after granting permissions

### Step 5: Test the Function (Optional)
If you want to test the function directly in SQL:

```sql
-- Run this in Supabase SQL Editor
-- File: docs/test-board-function.sql
-- Replace the project ID with one you have access to
```

## Common Error Codes

- **400 Bad Request**: Usually means function exists but lacks execute permissions - Run `fix-board-function-permissions.sql`
- **42883**: Function does not exist - Run `create-project-boards-table.sql`
- **42501**: Permission denied - Check RLS policies or function grants
- **PGRST116**: Resource not found - Function may not exist or wrong schema

## Important Note

Even though the functions use `SECURITY DEFINER`, they still need explicit `GRANT EXECUTE` permissions for the `authenticated` and `anon` roles. This is a common oversight that causes 400 errors even when functions exist.

## Testing

After setup, test the whiteboard:
1. Navigate to a project
2. Open the whiteboard/visual editor
3. The board should load without errors
4. You should be able to draw and save

## Additional Notes

- The function uses `SECURITY DEFINER` to run with elevated privileges
- RLS policies ensure users can only access boards for projects they own or collaborate on
- The function automatically creates a board if one doesn't exist

