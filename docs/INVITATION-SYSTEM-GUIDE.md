# Project Invitation System - Complete Guide

## Overview

The Core Home Render Portal now has a **fully functional invitation system** that:
- Sends real emails to invited users
- Handles both existing and new users
- Automatically adds projects to dashboard after acceptance
- Uses dark theme with team-based colors
- Provides seamless signup/login flow

---

## 🎯 How It Works

### **Complete Flow:**

```
1. Project Owner clicks "Invite Users"
   ↓
2. Enters email & selects permission level
   ↓
3. System sends REAL email to recipient
   ↓
4. Recipient clicks link in email
   ↓
5. If not logged in → Signup/Login page (with invitation token)
   ↓
6. After authentication → Invitation auto-accepted
   ↓
7. Project appears in recipient's dashboard
   ↓
8. Recipient can immediately view/edit project
```

---

## 📧 Email System

### **Sending Invitations:**

**Email Service:** Resend  
**From Address:** `Core Home Render Portal <onboarding@resend.dev>`  
**Recipient:** Actual email entered (NOT test email anymore!)

### **Email Design:**
- ✅ Dark theme matching app
- ✅ "Core Home" branding with gradient
- ✅ Teal accent color (#38bdbb)
- ✅ Professional HTML template
- ✅ Clear CTA button
- ✅ Project title in subject
- ✅ Permission level details
- ✅ 7-day expiration notice

---

## 🚀 How to Invite Users

### **Step 1: Open Project**
1. Go to any project you own
2. Click **"Invite Users"** button in top right

### **Step 2: Fill Invitation Form**
- **Email:** Enter the real email address
- **Permission Level:** Choose from:
  - **View Only:** Can view project details
  - **Can Edit:** Can view and edit
  - **Admin:** Can manage everything

### **Step 3: Send**
1. Click **"Send Invitation"**
2. Email sent to recipient immediately
3. Success message appears
4. Modal auto-closes after 5 seconds

---

## 📬 What Recipients Receive

### **Email Contents:**

**Subject:**
```
Project Collaboration Invitation: [Project Name]
```

**Email Body:**
```
Core Home
━━━━━━━ (gradient line)
Render Portal

🎉 You've Been Invited!

You've been invited to collaborate on a render project: [Project Name]

Permission Level: [view/edit/admin]
• Description of what they can do

[Accept Invitation →] (Teal button)

Or copy this link: [full URL]

This invitation will expire in 7 days.
```

---

## 🔐 Invitation Acceptance Flow

### **Scenario 1: User Has Account**

1. User clicks link in email
2. If logged in → Invitation accepted automatically
3. If not logged in → "Sign In" page
4. After login → Invitation accepted
5. Redirected to project page
6. Project now in their "My Projects"

### **Scenario 2: New User (No Account)**

1. User clicks link in email
2. Sees "Create Account" or "Sign In" options
3. Email is pre-filled from invitation
4. User creates account
5. Invitation automatically accepted
6. Project appears in dashboard
7. User can immediately access project

### **Scenario 3: Email Mismatch**

1. User clicks link but is logged in with different email
2. See clear warning message
3. Prompted to sign in with correct email
4. After correct login → Invitation accepted

---

## 🎨 Dark Theme UI

### **Invite Modal:**
```
Dark background: #1a1e1f
Border: Gray
Header: Team color icon
Email input: Dark with team color focus
Permission cards: Team color when selected
Buttons: Team colored
Success icon: Team colored
```

### **Invitation Acceptance Page:**
```
Background: #070e0e (dark)
Card: #1a1e1f (charcoal)
Icons: Status-colored
Buttons: Team colored
All text: White/gray for readability
```

---

## 📊 Permission Levels

### **View Only**
- ✓ View project details
- ✓ See all items and parts
- ✓ View project history
- ✗ Cannot edit
- ✗ Cannot invite others

### **Can Edit**
- ✓ Everything in View
- ✓ Edit project details
- ✓ Add/edit items
- ✓ Modify parts
- ✗ Cannot invite others

### **Admin**
- ✓ Everything in Edit
- ✓ Invite other collaborators
- ✓ Manage collaborator permissions
- ✓ Remove collaborators
- ✗ Cannot delete project (owner only)

---

## 🧪 Testing the System

### **Test 1: Basic Invitation**

1. **As Project Owner:**
   - Open a project
   - Click "Invite Users"
   - Enter a real email address (yours or colleague's)
   - Select "Can Edit"
   - Click "Send Invitation"

2. **Check Email:**
   - Recipient should receive email within seconds
   - Email should have Core Home branding
   - Subject includes project name
   - Click "Accept Invitation" button

3. **As Recipient:**
   - If logged in → Should see success message
   - Project should appear in dashboard
   - Should be able to access project

### **Test 2: New User Flow**

1. **Send invitation to NEW email:**
   - Email that's not in your database
   - Any real email address you can access

2. **Recipient clicks link:**
   - Should see "Create Account" option
   - Email should be pre-filled
   - Should show project details

3. **Create account:**
   - Fill in password
   - Select team
   - Submit

4. **Auto-acceptance:**
   - Invitation should auto-accept
   - Project appears in dashboard
   - Can immediately access project

### **Test 3: Email Mismatch**

1. Send invitation to email A
2. Log in with email B
3. Click invitation link
4. Should see mismatch warning
5. Should prompt to sign in with email A

---

## 🔍 Troubleshooting

### **Email Not Received**

**Check:**
- Is email address correct?
- Check spam folder
- Verify Resend API key is valid
- Check browser console for email API errors

**Solution:**
```javascript
// Check console logs:
"📧 Email API called with: ..."
"✅ Email sent successfully"
```

### **Invitation Not Accepting**

**Check:**
- Is user logged in with correct email?
- Is invitation expired? (7 days)
- Check browser console for RPC errors

**Solution:**
- Sign out and sign in with correct email
- Ask project owner to resend invitation

### **Project Not in Dashboard**

**Check:**
- Did acceptance succeed?
- Refresh dashboard page
- Check "My Projects" page (not just dashboard)

**Solution:**
```sql
-- Check if collaborator was added:
SELECT * FROM project_collaborators 
WHERE user_id = 'your-user-id' 
AND project_id = 'project-id';
```

---

## 🗄️ Database Tables

### **project_invitations**
```sql
- id (UUID)
- project_id (UUID)
- invited_email (TEXT)
- permission_level (TEXT)
- token (UUID)
- invited_by (UUID)
- accepted_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)
```

### **project_collaborators**
```sql
- id (UUID)
- project_id (UUID)
- user_id (UUID)
- permission_level (TEXT)
- invited_by (UUID)
- created_at (TIMESTAMP)
```

---

## 🔐 Security Features

✅ **Token-based invitations** - Unique, secure tokens  
✅ **Email verification** - Must match invited email  
✅ **Expiration** - Invitations expire after 7 days  
✅ **Permission levels** - Granular access control  
✅ **RLS policies** - Row-level security enforced  
✅ **Audit trail** - Tracks who invited whom  

---

## 📝 Development Notes

### **Adding Invitation Button:**

```tsx
import { InviteUserModal } from '@/components/project/invite-user-modal'

const [showInviteModal, setShowInviteModal] = useState(false)

// Button
<button onClick={() => setShowInviteModal(true)}>
  Invite Users
</button>

// Modal
<InviteUserModal
  isOpen={showInviteModal}
  onClose={() => setShowInviteModal(false)}
  projectId={project.id}
  projectTitle={project.title}
  onInviteSuccess={() => {
    // Refresh collaborators list
  }}
/>
```

### **Checking User Permissions:**

```tsx
// Get user's permission level for a project
const { data } = await supabase
  .from('project_collaborators')
  .select('permission_level')
  .eq('project_id', projectId)
  .eq('user_id', userId)
  .single()

const canEdit = data?.permission_level === 'edit' || data?.permission_level === 'admin'
```

---

## 🎨 Customization

### **Change Email Colors:**

Edit `app/api/send-invitation/route.ts`:
```javascript
// For Product Development (teal):
background-color: #38bdbb

// For Industrial Design (orange):
background-color: #f9903c
```

You could make emails team-colored based on project owner's team!

---

## ✅ What's Now Working

### **Invitation Creation:**
- ✅ Dark themed modal
- ✅ Team colored UI
- ✅ Permission selection
- ✅ Email validation
- ✅ Success feedback

### **Email Sending:**
- ✅ Sends to REAL emails
- ✅ Core Home branding
- ✅ Professional design
- ✅ Dark theme email
- ✅ Includes project title

### **Acceptance Flow:**
- ✅ Dark themed pages
- ✅ Handles all states
- ✅ Pre-fills email
- ✅ Auto-accepts after auth
- ✅ Redirects to project

### **Dashboard Integration:**
- ✅ Projects appear automatically
- ✅ Shows owned vs collaborated
- ✅ Correct permissions applied
- ✅ Seamless experience

---

## 🎉 Summary

**Your invitation system is production-ready!**

Users can now:
- ✅ Invite real people via real email
- ✅ Collaborate on projects
- ✅ See projects automatically in dashboard
- ✅ Have appropriate permissions
- ✅ Beautiful dark-themed experience

**Try it out:**
1. Go to a project
2. Click "Invite Users"
3. Enter a real email
4. Send invitation
5. Check that email - you'll receive a beautiful branded invitation!

---

*Last updated: November 6, 2025*

