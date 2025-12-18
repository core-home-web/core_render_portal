# Chapter 30: Troubleshooting

This chapter covers common issues and their solutions.

---

## Authentication Issues

### "Invalid login credentials"

**Cause:** Wrong email/password or email not confirmed

**Solution:**
1. Verify email is correct
2. Check if email confirmation is enabled
3. Check user exists in Supabase Auth dashboard

### "No session found"

**Cause:** User not logged in or session expired

**Solution:**
1. Check cookies are enabled
2. Verify redirect URLs in Supabase
3. Clear browser storage and sign in again

---

## Database Issues

### "Permission denied for table"

**Cause:** RLS policies blocking access

**Solution:**
1. Check RLS policies are set up correctly
2. Verify user is authenticated
3. Check `auth.uid()` matches expected user

### "Function does not exist"

**Cause:** RPC function not created

**Solution:**
1. Run the migration script
2. Check function exists in Supabase SQL editor
3. Verify function name spelling

---

## Storage Issues

### "Object not found"

**Cause:** File doesn't exist or wrong path

**Solution:**
1. Check file was uploaded successfully
2. Verify bucket name is correct
3. Check file path in Supabase dashboard

### "Storage policy violation"

**Cause:** User doesn't have permission

**Solution:**
1. Verify storage policies are configured
2. Check user is authenticated
3. Ensure bucket name matches policy

---

## Deployment Issues

### Build fails on Vercel

**Common causes:**
- Missing environment variables
- TypeScript errors
- Dependencies not installed

**Solution:**
1. Check build logs for specific error
2. Verify all env vars are set in Vercel
3. Run `pnpm build` locally first

---

*Next: [Chapter 31: Maintenance](./chapter-31-maintenance.md)*
