# Ambiguous Column References in SQL Functions

## Error: Column Reference is Ambiguous

### Date First Encountered
2025-01-XX

### Error Description
SQL functions return 400 errors with "column reference is ambiguous" messages when called. The errors occur in UNION queries within function access checks.

### Error Output
```
column reference "project_id" is ambiguous
column reference "id" is ambiguous
Failed to load resource: the server responded with a status of 400 ()
```

### Affected Functions
1. `get_project_collaborators_with_users(p_project_id UUID)`
2. `get_or_create_project_board(p_project_id UUID)`
3. `save_project_board(p_project_id UUID, p_snapshot JSONB)`

### Root Cause
There are two types of ambiguous column reference issues:

1. **UNION Query Ambiguity**: When using UNION queries with multiple tables that have columns with the same name, all column references must be fully qualified with table aliases.

2. **RETURNS TABLE Variable Conflict**: When a function has `RETURNS TABLE (project_id UUID, ...)`, PostgreSQL creates a variable named `project_id` in the function scope. When referencing `project_id` in INSERT column lists or ON CONFLICT clauses, PostgreSQL can't determine if you mean the return column variable or the table column.

The access check queries in these functions used UNION without fully qualifying column references:

**Problematic Code:**
```sql
IF NOT EXISTS (
  SELECT 1 FROM projects WHERE id = p_project_id AND user_id = auth.uid()
  UNION
  SELECT 1 FROM project_collaborators 
  WHERE project_id = p_project_id AND user_id = auth.uid()
) THEN
```

The issue is that:
- `id` exists in both `projects` and potentially other tables in context
- `project_id` exists in `project_collaborators` but could be ambiguous in UNION context
- `user_id` exists in both `projects` and `project_collaborators`

PostgreSQL cannot determine which table's column to use when they're not qualified.

### Solution

**Fully qualify all column references with table aliases:**

```sql
IF NOT EXISTS (
  SELECT 1 FROM projects p WHERE p.id = p_project_id AND p.user_id = auth.uid()
  UNION
  SELECT 1 FROM project_collaborators pc 
  WHERE pc.project_id = p_project_id AND pc.user_id = auth.uid()
) THEN
```

**Key Changes:**
1. Added table aliases: `projects p` and `project_collaborators pc`
2. Qualified all column references: `p.id`, `p.user_id`, `pc.project_id`, `pc.user_id`
3. Applied same pattern to `permission_level` in `save_project_board`: `pc.permission_level`
4. **Fixed RETURNS TABLE conflict**: Changed `ON CONFLICT (project_id)` to `ON CONFLICT ON CONSTRAINT project_boards_pkey` to avoid ambiguity with the return column variable

### Implementation

**Files Fixed:**
- `docs/fix-project-collaborators-view.sql` - Fixed `get_project_collaborators_with_users`
- `docs/create-project-boards-table.sql` - Fixed `get_or_create_project_board` and `save_project_board`
- `docs/fix-ambiguous-column-references.sql` - Standalone fix script with all three functions

### Related Files
- `docs/fix-project-collaborators-view.sql` - Collaborators function definition
- `docs/create-project-boards-table.sql` - Board functions definition
- `docs/fix-ambiguous-column-references.sql` - Standalone fix script
- `hooks/useProjectBoard.ts` - Calls `get_or_create_project_board`
- `hooks/useProjectCollaboration.ts` - Calls `get_project_collaborators_with_users`

### Prevention

**Best Practices:**
1. **Always use table aliases** in multi-table queries (UNION, JOIN, etc.)
2. **Fully qualify all column references** when tables have overlapping column names
3. **Test functions after creation** to catch ambiguous reference errors early
4. **Use consistent alias patterns** (e.g., `p` for projects, `pc` for project_collaborators)

**Code Review Checklist:**
- [ ] All UNION queries use table aliases
- [ ] All column references in UNION queries are qualified
- [ ] All JOIN queries use table aliases
- [ ] All WHERE clause column references are qualified when multiple tables are involved

### Testing

After applying fixes, test all functions:
```sql
-- Test collaborators function
SELECT * FROM get_project_collaborators_with_users('project-id-here');

-- Test board functions
SELECT * FROM get_or_create_project_board('project-id-here');
SELECT * FROM save_project_board('project-id-here', '{}'::jsonb);
```

### Alternative Solutions

1. **Use EXISTS instead of UNION** (if logic allows):
   ```sql
   IF NOT EXISTS (
     SELECT 1 FROM projects p 
     WHERE p.id = p_project_id AND p.user_id = auth.uid()
   ) AND NOT EXISTS (
     SELECT 1 FROM project_collaborators pc 
     WHERE pc.project_id = p_project_id AND pc.user_id = auth.uid()
   ) THEN
   ```
   - **Pros**: No UNION ambiguity
   - **Cons**: Slightly different logic (AND vs OR)

2. **Use subqueries** (if performance allows):
   ```sql
   IF (SELECT COUNT(*) FROM (
     SELECT 1 FROM projects p WHERE p.id = p_project_id AND p.user_id = auth.uid()
     UNION
     SELECT 1 FROM project_collaborators pc WHERE pc.project_id = p_project_id AND pc.user_id = auth.uid()
   ) sub) = 0 THEN
   ```
   - **Pros**: Explicit subquery context
   - **Cons**: More verbose, potential performance impact

3. **Chosen Solution**: Fully qualified column references with aliases
   - **Pros**: Simple, clear, maintains original logic, best performance
   - **Cons**: Requires discipline to always qualify

### Status
✅ **RESOLVED** - Fixed by fully qualifying all column references with table aliases

### Notes
- This is a common PostgreSQL/SQL issue when working with multiple tables
- The error can be misleading (400 instead of a clearer SQL error)
- Always test UNION queries thoroughly as they're prone to this issue
- Consider using a linter or SQL formatter that flags unqualified column references

