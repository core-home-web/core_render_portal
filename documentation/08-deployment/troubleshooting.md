# Troubleshooting

Common issues and their solutions.

## Build Errors

### "Module not found"

**Error:**
```
Module not found: Can't resolve '@/components/xyz'
```

**Causes:**
- File doesn't exist
- Wrong import path
- Case sensitivity issue

**Solutions:**
1. Check file exists at the path
2. Verify exact file name (case-sensitive)
3. Check `tsconfig.json` paths configuration

### "Type error"

**Error:**
```
Type error: Property 'x' does not exist on type 'Y'
```

**Causes:**
- TypeScript type mismatch
- Missing type definitions

**Solutions:**
1. Fix the type error locally first
2. Run `pnpm type-check` before pushing
3. Update type definitions

### "Build failed - exit code 1"

**Causes:**
- Various build errors
- Check full build log

**Solutions:**
1. Read the complete error message
2. Build locally: `pnpm build`
3. Fix errors before pushing

---

## Runtime Errors

### "Invalid API key"

**Error:**
```
{"message":"Invalid API key"}
```

**Causes:**
- Wrong Supabase key
- Key not set in environment
- Using wrong key type

**Solutions:**
1. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
2. Check no extra spaces or newlines
3. Ensure using anon key (not service role) for client

### "No API key found"

**Error:**
```
{"message":"No API key found in request"}
```

**Causes:**
- Environment variables not set
- Variables not loading correctly

**Solutions:**
1. Check Vercel environment variables
2. Verify variable names match exactly
3. Redeploy after adding variables

### "relation does not exist"

**Error:**
```
relation "projects" does not exist
```

**Causes:**
- Database tables not created
- Wrong database/schema

**Solutions:**
1. Run database setup scripts
2. Verify Supabase project URL is correct
3. Check you're connected to right project

### "RLS policy violation"

**Error:**
```
new row violates row-level security policy
```

**Causes:**
- User doesn't have permission
- RLS policies blocking operation

**Solutions:**
1. Check user is authenticated
2. Verify RLS policies allow the operation
3. Check user has correct role/permission

---

## Authentication Issues

### Can't Sign In

**Symptoms:**
- Login fails silently
- "Invalid credentials" error

**Solutions:**
1. Verify email/password are correct
2. Check user exists in Supabase Auth
3. Verify email is confirmed (if required)
4. Check browser console for errors

### Session Not Persisting

**Symptoms:**
- User logged out on refresh
- Have to re-login frequently

**Solutions:**
1. Check cookies are enabled
2. Clear browser storage
3. Verify Supabase URL is correct
4. Check auth settings in Supabase

### Redirect Loop

**Symptoms:**
- Page keeps redirecting
- Can't access any page

**Solutions:**
1. Clear browser cookies
2. Check auth logic in components
3. Verify `NEXT_PUBLIC_APP_URL` is correct

---

## Whiteboard Issues

### Whiteboard Not Loading

**Symptoms:**
- Blank white area
- Loading spinner forever

**Solutions:**
1. Check browser console for errors
2. Verify Excalidraw CSS is imported
3. Check dynamic import is working
4. Verify project_boards table exists

### Changes Not Saving

**Symptoms:**
- Draw something, refresh, it's gone
- "Unsaved changes" always showing

**Solutions:**
1. Check network requests for errors
2. Verify RLS policies allow updates
3. Check save_project_board function exists
4. Verify user has edit permission

### Collaboration Not Working

**Symptoms:**
- Others don't see changes
- Cursors not showing

**Solutions:**
1. Verify Supabase Realtime is enabled
2. Check WebSocket connection in console
3. Ensure both users are authenticated
4. Check channel subscription is successful

---

## Deployment Issues

### Vercel Build Fails

**Check:**
1. View full build logs
2. Build locally first: `pnpm build`
3. Check environment variables are set

### Preview URL Not Working

**Check:**
1. Build succeeded (green checkmark)
2. Environment variables set for Preview
3. Try incognito window

### Custom Domain Not Working

**Check:**
1. DNS records are correct
2. Wait for propagation (up to 48h)
3. SSL certificate provisioned

---

## Database Issues

### "column reference is ambiguous"

**Cause:** Multiple tables with same column name in query

**Solution:** Use table aliases:
```sql
-- Bad
SELECT id FROM table1 JOIN table2

-- Good
SELECT t1.id FROM table1 t1 JOIN table2 t2
```

### "infinite recursion in policy"

**Cause:** RLS policies reference each other

**Solution:** Restructure policies, use functions:
```sql
-- Use functions to break recursion
CREATE FUNCTION check_access(p_id UUID) RETURNS BOOLEAN AS $$
  -- Logic here
$$ LANGUAGE sql SECURITY DEFINER;
```

### Slow Queries

**Check:**
1. Add indexes for filtered columns
2. Check query execution plans
3. Optimize complex joins

---

## Common Quick Fixes

### Clear Next.js Cache

```bash
rm -rf .next
pnpm dev
```

### Reinstall Dependencies

```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Force Redeploy

In Vercel dashboard:
1. Go to Deployments
2. Click latest deployment
3. Click "..." → "Redeploy"

### Check Supabase Status

Visit [status.supabase.com](https://status.supabase.com)

---

## Getting Help

### 1. Check Error Messages

Read the complete error message. Key info is often at the end.

### 2. Check Browser Console

```
F12 → Console tab
```

Look for red errors.

### 3. Check Network Tab

```
F12 → Network tab
```

Look for failed requests (red).

### 4. Check Server Logs

In Vercel:
1. Go to Functions
2. View function logs

### 5. Review Documentation

- Check this documentation
- `ERROR LOGS AND SOLUTIONS/` folder
- Supabase docs
- Next.js docs

---

← [Environment Variables](./environment-variables.md) | Next: [Development Overview](../09-development/README.md) →

