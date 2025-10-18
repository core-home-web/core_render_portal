# Email Verification Setup for Project Invitations

## Overview

The project invitation system now includes robust email verification that ensures users can only accept invitations sent to their email address. When someone tries to open an invitation with the wrong email, they'll see a friendly notification and be guided to sign in with the correct account.

## What's New

✅ **Email Mismatch Detection**: System now checks if the logged-in user's email matches the invitation recipient
✅ **User-Friendly Notifications**: Clear yellow warning banner explaining the issue
✅ **Guided Sign-In Flow**: Button to redirect users to sign in with the correct email
✅ **Invitation Details Display**: Shows project name, permission level, and intended recipient email

## Required Database Update

**IMPORTANT**: You need to run a SQL migration to set up the complete invitation system in your Supabase database.

### Quick Setup Instructions

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `core_render_portal`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy the Complete Setup SQL**
   - Open the file: `docs/COMPLETE-INVITATION-SETUP.sql`
   - Copy the **entire contents** of the file

4. **Execute the Setup**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" or press `Cmd+Enter` / `Ctrl+Enter`
   - You should see success messages including: "✅ Project invitation system setup complete!"

5. **Verify the Setup**
   - Check that tables were created: `project_collaborators`, `project_invitations`
   - Verify functions exist: `invite_user_to_project`, `accept_project_invitation`, `get_invitation_details`

### What This Setup Does

The complete setup script (`COMPLETE-INVITATION-SETUP.sql`):
- ✅ Creates `project_collaborators` table
- ✅ Creates `project_invitations` table with correct `invited_email` field
- ✅ Sets up all necessary indexes for performance
- ✅ Configures Row Level Security (RLS) policies
- ✅ Creates database functions with email verification
- ✅ Handles existing tables gracefully (won't fail if already exists)

### What the Migration Does

The migration updates the `accept_project_invitation` function to:
- Use the correct field name (`invited_email` instead of `email`)
- Properly match the logged-in user's email with the invitation recipient
- Return appropriate error messages when emails don't match

## How It Works

### User Flow

1. **Invitation Sent**
   - Project owner sends invitation to `user@example.com`
   - Email is sent with unique invitation link

2. **Opening the Invitation**
   - **Scenario A: Correct Email**
     - User opens link while signed in as `user@example.com`
     - ✅ Invitation is accepted automatically
     - User is added as collaborator
     - Redirected to project page
   
   - **Scenario B: Wrong Email**
     - User opens link while signed in as `different@example.com`
     - ⚠️ Email mismatch detected
     - System shows notification with:
       - Yellow warning banner
       - Project details
       - Intended recipient email
       - Button to sign in with correct account
     - User clicks "Sign In as user@example.com"
     - Redirected to login page with pre-filled email
     - After signing in, redirected back to accept invitation
   
   - **Scenario C: Not Signed In**
     - User opens link without being authenticated
     - System shows invitation details
     - Options to "Create Account" or "Sign In"
     - Email is pre-filled in the auth form
     - After authentication, redirected to accept invitation

### Technical Implementation

**Frontend Changes:**
- `app/project/invite/[token]/page.tsx`
  - Added `email_mismatch` status state
  - New UI component for email mismatch warning
  - Displays invitation details clearly
  - Provides "Sign In as [email]" button
  - Redirects to auth page with pre-filled email

**Backend Changes:**
- `docs/fix-email-mismatch-function.sql`
  - Updated database function to use `invited_email` field
  - Improved error messaging for email mismatches
  - Better handling of authenticated vs unauthenticated users

**Database Function:**
```sql
-- Check if user email matches invitation
IF NOT EXISTS (
  SELECT 1 FROM auth.users 
  WHERE id = v_user_id AND email = v_invitation.invited_email
) THEN
  RAISE EXCEPTION 'Email does not match invitation';
END IF;
```

## Testing

### Manual Testing Steps

1. **Test Email Mismatch**
   - Sign in as `user1@example.com`
   - Have someone send invitation to `user2@example.com`
   - Open invitation link while signed in as `user1@example.com`
   - Should see email mismatch notification
   - Click "Sign In as user2@example.com"
   - Should redirect to login page with email pre-filled

2. **Test Correct Email**
   - Sign in as `user@example.com`
   - Open invitation sent to `user@example.com`
   - Should accept invitation automatically
   - Should redirect to project page

3. **Test Unauthenticated**
   - Sign out
   - Open any invitation link
   - Should see invitation details
   - Should have options to sign up or sign in
   - Email should be pre-filled

## Security Features

✅ **Email Verification**: Only the intended recipient can accept the invitation
✅ **Token Validation**: Invitations expire after 7 days
✅ **Single Use**: Invitations can only be accepted once
✅ **Project Ownership**: Only project owners can send invitations
✅ **No Duplicate Collaborators**: Prevents adding the same user twice

## Troubleshooting

### Issue: "Email does not match invitation" error persists after database update

**Solution:**
1. Verify the SQL migration was executed successfully
2. Check that you're using the correct Supabase project
3. Try refreshing the browser cache (Cmd+Shift+R / Ctrl+Shift+R)
4. Check browser console for any errors

### Issue: Invitation link doesn't redirect to auth page

**Solution:**
1. Verify the invitation token is valid (not expired)
2. Check that the invitation exists in the database
3. Clear browser cookies and try again

### Issue: Email not pre-filled on login page

**Solution:**
1. Check the URL parameters include `?invitation=TOKEN&email=EMAIL`
2. Verify the `handleSignIn` function is passing the correct parameters
3. Check the login form component properly reads the search params

## Next Steps

After deploying this update:

1. ✅ Run the SQL migration (see instructions above)
2. ✅ Test the invitation flow with different scenarios
3. ✅ Notify team members about the improved security
4. 🎯 Consider adding email confirmation for new invitations
5. 🎯 Add analytics to track invitation acceptance rates

## Files Modified

- `app/project/invite/[token]/page.tsx` - Email mismatch UI and flow
- `docs/fix-email-mismatch-function.sql` - Database function update
- `docs/project-collaboration-schema.sql` - Schema documentation
- `scripts/update-email-mismatch-function.js` - Migration script (alternative approach)

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Review the Supabase logs for database errors
3. Verify all environment variables are set correctly
4. Contact the development team for assistance

