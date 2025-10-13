# 🚀 Quick Start: Project Invitations

## Error You Just Encountered

```
ERROR: 42P01: relation "project_invitations" does not exist
```

**Translation:** The invitation tables haven't been created in your database yet.

## ✅ Solution (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Run the Setup Script

1. Open file: `docs/COMPLETE-INVITATION-SETUP.sql`
2. **Copy the entire file** (all 400+ lines)
3. **Paste** into Supabase SQL Editor
4. Click **"Run"** or press `Cmd+Enter`

### Step 3: Verify Success

You should see this message:
```
✅ Project invitation system setup complete!
📋 Tables created: project_collaborators, project_invitations
🔐 RLS policies configured
⚙️ Functions created: invite_user_to_project, accept_project_invitation, get_invitation_details
```

## 🎉 That's It!

Your invitation system is now ready. The app is already deployed and working - it just needed the database tables.

## 📖 What This Sets Up

- **Tables:**
  - `project_collaborators` - Tracks who has access to projects
  - `project_invitations` - Tracks pending invitations

- **Functions:**
  - `invite_user_to_project()` - Sends invitations
  - `accept_project_invitation()` - Accepts invitations with email verification
  - `get_invitation_details()` - Gets invitation info

- **Security:**
  - Row Level Security (RLS) policies
  - Email verification
  - Token expiration (7 days)

## 🧪 Testing After Setup

1. **Send an Invitation:**
   - Go to any project
   - Click "Invite User"
   - Enter an email address
   - Choose permission level
   - Click "Send Invitation"

2. **Test Email Mismatch:**
   - Sign in as a different user
   - Open the invitation link
   - You should see the yellow warning notification
   - Click "Sign In as [invited-email]"

3. **Accept Invitation:**
   - Sign in with the correct email
   - Open the invitation link
   - Should automatically accept and redirect to project

## ❓ Need Help?

- **Setup Issues:** Check `docs/INVITATION-EMAIL-VERIFICATION-SETUP.md`
- **Database Schema:** See `docs/COMPLETE-INVITATION-SETUP.sql`
- **Troubleshooting:** All errors and solutions documented

## 🔗 Related Files

- `COMPLETE-INVITATION-SETUP.sql` - Complete database setup (run this!)
- `INVITATION-EMAIL-VERIFICATION-SETUP.md` - Full documentation
- `fix-email-mismatch-function.sql` - Email verification only (old, don't use)
- `project-collaboration-schema.sql` - Original schema (reference only)

