# 🗄️ Backend Setup Guide - Core Home Render Portal

Complete guide to setting up a secure, production-ready Supabase backend.

---

## 📋 Overview

This guide will set up:
- ✅ **user_profiles** table with auto-creation on signup
- ✅ **Automatic profile migration** for existing users
- ✅ **Row Level Security (RLS)** policies
- ✅ **Security fixes** for all Supabase warnings
- ✅ **Team system** (Product Development / Industrial Design)
- ✅ **Profile images** and user preferences

---

## 🎯 Current Situation

### ✅ What's Working:
- 6 users in `auth.users` table
- Projects table exists
- Project collaborators system
- Authentication flow

### ❌ What's Broken:
- `user_profiles` table is empty (0 records)
- 406 errors when fetching user profiles
- 400 errors when saving settings
- No auto-profile creation on signup
- Security warnings in Supabase

---

## 🛠️ Step-by-Step Fix

### **Step 1: Run User Profiles Setup** ⭐ **START HERE**

This script will:
- Create/fix `user_profiles` table
- Add the `profile_image` column
- Create auto-profile trigger
- Migrate all 6 existing users
- Set up RLS policies

**Instructions:**
1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **"New Query"**
4. Copy the entire contents of: `docs/complete-user-profiles-setup.sql`
5. Paste and click **"Run"**

**Expected Output:**
```
✅ Added profile_image column
🔄 Starting user migration...
✅ Migrated 6 users to user_profiles
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SETUP COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Auth Users: 6
User Profiles: 6
```

---

### **Step 2: Fix Security Warnings** (Optional but Recommended)

This script will:
- Add `search_path` to 8 functions
- Remove insecure views exposing `auth.users`
- Create secure alternatives
- Fix all Security Advisor warnings

**Instructions:**
1. Stay in **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of: `docs/fix-security-warnings.sql`
4. Paste and click **"Run"**

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ SECURITY FIXES APPLIED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fixed:
✓ 8 functions - Added search_path
✓ Removed insecure auth.users view
✓ Created secure collaborators view
```

---

### **Step 3: Verify Setup**

**Check user_profiles table:**
1. Go to **Table Editor** in Supabase
2. Select `user_profiles` table
3. You should see **6 records** (one for each user)
4. Each should have:
   - `user_id` (UUID)
   - `display_name` (from email)
   - `team` ('product_development' by default)
   - `profile_image` (NULL initially)

**Check the data:**
```sql
SELECT 
  up.display_name,
  up.team,
  u.email
FROM user_profiles up
JOIN auth.users u ON up.user_id = u.id;
```

You should see all 6 users!

---

### **Step 4: Push Code to Production**

Your local fixes need to be deployed:

```bash
# In your terminal:
cd /Users/elombe.kisala/Desktop/core_render_portal

# Push the 2 commits with fixes:
git push origin main
```

**Commits being pushed:**
- `6319c8a` - Supabase 406/400 fixes
- `8c3aad3` - CSP fixes (Google Fonts)

After push, Vercel will auto-deploy in ~2 minutes.

---

### **Step 5: Test Everything**

#### **A. Test Locally** (http://localhost:3000)

1. **Sign in** with your account
2. **Check console** - should see:
   - ✅ No 406 errors
   - ✅ No 400 errors
   - ✅ No CSP violations
   - ✅ Theme loads (teal or orange based on team)

3. **Go to Settings** → User Profile
   - Upload a profile image
   - Should save successfully!

4. **Go to Settings** → Team Settings
   - Switch between Product Development (teal) and Industrial Design (orange)
   - Entire app should change colors instantly!

#### **B. Test Production** (After deployment)

1. Visit: https://core-render-portal.vercel.app
2. Same tests as above
3. Everything should work!

---

## 📊 Database Schema Overview

### **user_profiles**
```sql
id                      UUID PRIMARY KEY
user_id                 UUID UNIQUE (→ auth.users)
display_name            TEXT
profile_image           TEXT
team                    TEXT ('product_development' | 'industrial_design')
notification_preferences JSONB
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

### **Automatic Behaviors:**

1. **On User Signup:**
   ```
   User signs up → Trigger fires → user_profile created automatically
   ```

2. **On User Login:**
   ```
   User logs in → Theme context loads → Colors applied based on team
   ```

3. **On Profile Update:**
   ```
   User saves settings → updated_at auto-updates → Changes sync
   ```

---

## 🔐 Security Features

### **Row Level Security (RLS):**
- ✅ Users can only view/edit their own profile
- ✅ Projects are isolated by ownership/collaboration
- ✅ Invitations verified by email
- ✅ No direct exposure of `auth.users`

### **Function Security:**
- ✅ All functions use `SECURITY DEFINER`
- ✅ All functions have `SET search_path = public`
- ✅ Prevents SQL injection attacks
- ✅ Proper permission checks

### **Data Protection:**
- ✅ Profile images stored securely
- ✅ Team preferences encrypted
- ✅ Email addresses not exposed to anon users
- ✅ Audit trails in `project_logs`

---

## 🎨 Team System

### **Product Development Team**
- **Color:** Teal (`#38bdbb`)
- **Role:** Project managers, coordinators
- **Default:** Yes (all new users start here)

### **Industrial Design Team**
- **Color:** Orange (`#f9903c`)
- **Role:** 3D artists, rendering specialists
- **Default:** No (users must switch manually)

### **How It Works:**
1. User selects team in Settings
2. `user_profiles.team` is updated
3. `ThemeProvider` detects change
4. All UI colors update instantly
5. No page reload required!

---

## 🐛 Troubleshooting

### **Problem: Still getting 406 errors**
**Solution:**
```sql
-- Verify RLS policies exist:
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Should see 3 policies: SELECT, INSERT, UPDATE
```

### **Problem: user_profiles still empty**
**Solution:**
```sql
-- Run the migration again:
INSERT INTO user_profiles (user_id, display_name, team, created_at, updated_at)
SELECT 
  id,
  split_part(email, '@', 1),
  'product_development',
  created_at,
  NOW()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

### **Problem: Trigger not working**
**Solution:**
```sql
-- Verify trigger exists:
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If missing, run complete-user-profiles-setup.sql again
```

### **Problem: Colors not changing**
**Solution:**
1. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache
3. Check console for errors
4. Verify user has a team assigned in database

---

## ✅ Success Checklist

Before considering the setup complete, verify:

- [ ] `user_profiles` table exists with 6 records
- [ ] All existing users have profiles
- [ ] Trigger is active (`on_auth_user_created`)
- [ ] RLS policies are enabled
- [ ] Security warnings resolved (run Security Advisor)
- [ ] No 406 errors in browser console
- [ ] No 400 errors in browser console
- [ ] CSP violations fixed
- [ ] Profile image upload works
- [ ] Team switching works and changes colors
- [ ] Code pushed to GitHub
- [ ] Production deployment successful

---

## 📚 SQL Scripts Reference

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `complete-user-profiles-setup.sql` | **Main setup** | Run first, always |
| `fix-security-warnings.sql` | Security fixes | After main setup |
| `add-profile-images-and-due-dates.sql` | Add columns only | If needed |
| `update-project-rpc-with-due-date.sql` | Update RPC | If needed |

---

## 🚀 What Happens Next

After completing this setup:

1. **New signups automatically get:**
   - User profile created
   - Default team (Product Development)
   - Display name from email
   - Ready to use immediately

2. **Existing users will have:**
   - Profiles created for all 6 users
   - Default team assigned
   - Can upload profile images
   - Can switch teams anytime

3. **App will work properly:**
   - No more 406 errors
   - No more 400 errors
   - Theme system functional
   - Profile images working
   - Settings save correctly

---

## 📞 Need Help?

If you encounter issues:

1. **Check the console** - Look for specific error messages
2. **Verify database** - Ensure all scripts ran successfully
3. **Re-run scripts** - Safe to run multiple times (uses `IF NOT EXISTS`)
4. **Check RLS** - Ensure policies are enabled
5. **Clear cache** - Browser cache can cause stale data

---

**🎉 Once complete, your backend will be production-ready and secure!**

