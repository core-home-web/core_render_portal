# Project Library & User Profiles - Complete Guide

## 🎉 New Features

Successfully implemented:
1. **Table-Style Project Library** - Professional project list view
2. **Profile Images** - User avatars throughout the app
3. **Due Date Management** - Track project deadlines
4. **Collaborator Avatars** - Visual team representation

---

## 📊 Project Library Table View

### **What It Shows**

Your new **"My Projects"** page displays projects in a professional table format with these columns:

| Column | Description | Example |
|--------|-------------|---------|
| **Project Name** | Icon + Title + Badge | [P] Product Launch (Owner) |
| **Items / Parts** | Count of items and total parts | 6 / 12 Items/Parts |
| **Retailer** | Project retailer name | Apple Store |
| **Due Date** | Target completion date | Dec 15, 2024 |
| **Collaborators** | Avatar stack with overflow | 👤👤👤 +2 |

### **Features**

✅ **Project Icons** - First letter of project name in team-colored circle  
✅ **Status Badges** - "Owner" or permission level (edit/view/admin)  
✅ **Item/Part Counts** - Shows "6 / 12 Items/Parts"  
✅ **Due Dates** - Calendar icon with formatted date  
✅ **Collaborator Avatars** - Stacked circular images, shows up to 5  
✅ **Overflow Counter** - "+N" indicator for additional collaborators  
✅ **Hover Effects** - Row highlights on hover  
✅ **Dark Theme** - Matches app design  
✅ **Team Colors** - Dynamic based on user's team  

### **Layout**

```
┌─────────────────────────────────────────────────────────────────┐
│ Project Library                            [+ New Project]      │
├─────────────────────────────────────────────────────────────────┤
│ PROJECT NAME  │ ITEMS/PARTS │ RETAILER │ DUE DATE │ COLLABORATORS│
├─────────────────────────────────────────────────────────────────┤
│ [P] Project 1 │   6 / 12    │  Apple   │ Dec 15   │ 👤👤👤 +2   │
│     Owner     │ Items/Parts │  Store   │   2024   │              │
├─────────────────────────────────────────────────────────────────┤
│ [T] Project 2 │   3 / 8     │  Target  │ Jan 20   │ 👤👤 +1     │
│     edit      │ Items/Parts │          │   2025   │              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👤 Profile Images

### **Upload Your Profile Image**

**Location:** Settings > User Profile

**Steps:**
1. Go to **Settings** (gear icon in sidebar)
2. Stay on **User Profile** tab
3. See your current avatar (team-colored circle with initial)
4. Click **"Upload Profile Image"** or drag & drop
5. Select image (JPG, PNG, GIF - max 5MB)
6. Click **"Save Changes"**

**Your avatar now appears:**
- ✅ In sidebar (top and bottom)
- ✅ In project library
- ✅ In collaborator lists
- ✅ In all team displays

### **Avatar Fallbacks**

If no profile image:
- Shows first letter of email
- Team-colored background
- White text
- Circular design

**Example:**
```
Email: john@example.com
Team: Product Development
Avatar: [J] in teal circle
```

### **Technical Details**

**Storage:**
- Images stored in Supabase Storage
- URL saved to `user_profiles.profile_image`
- Accessible via RLS policies
- Optimized for web display

**Sizes:**
- Settings preview: 96px × 96px
- Sidebar avatars: 32px × 32px
- Project library: 32px × 32px
- Profile images are responsive

---

## 📅 Due Date Management

### **Setting Due Dates**

**When Creating Projects:**

1. Go to **Create New Project**
2. **Step 1: Project Details**
3. Fill in title and retailer
4. Set **Due Date** (optional)
5. Dark themed date picker appears
6. Continue with project creation

**When Editing Projects:**

1. Open any project
2. Click **"Edit Project"**
3. See **"Project Details"** section at top
4. Edit Title, Retailer, or Due Date
5. Click **"Save Changes"**

**Who Can Edit:**
- ✅ Project Owner
- ✅ Collaborators with "edit" permission
- ✅ Collaborators with "admin" permission
- ❌ Collaborators with "view" permission

### **Where Due Dates Appear**

1. **Project Detail Page Header**
   - Shows: `Due: Dec 15, 2024`
   - Clock icon
   - Only if due date set

2. **Project Library Table**
   - Column: "Due Date"
   - Format: `Dec 15, 2024`
   - Calendar icon
   - Falls back to creation date if no due date

3. **Dashboard (Future)**
   - Could show upcoming deadlines
   - Overdue project warnings
   - Sorted by due date

### **Date Format**

**Display Format:** `MMM DD, YYYY`
- Dec 15, 2024
- Jan 1, 2025
- Mar 30, 2025

**Storage Format:** `TIMESTAMP WITH TIME ZONE`
- ISO 8601 format
- Includes timezone
- Sortable in database

---

## 👥 Collaborator Avatars

### **How It Works**

**In Project Library:**

Each project row shows collaborator avatars:
1. **Owner Avatar** - Always first (you)
2. **Collaborator Avatars** - Up to 5 additional
3. **Overflow Counter** - "+N" for remaining

**Example:**
```
[👤] [👤] [👤] [👤] [👤] [+3]
You   C1   C2   C3   C4   More
```

### **Avatar Sources**

**Priority Order:**
1. User's uploaded profile image
2. First letter of display name
3. First letter of email
4. Default "U" placeholder

**Styling:**
- Circular avatars
- 32px diameter in lists
- 2px border (matches container)
- Stacked with -8px overlap
- Hover shows full name

### **Data Fetching**

The system automatically:
- Fetches collaborators for each project
- Joins with user_profiles for images
- Loads display names
- Handles missing data gracefully

```typescript
// Automatic query
const { data } = await supabase
  .from('project_collaborators')
  .select(`
    user_id,
    user_profiles (
      display_name,
      profile_image
    )
  `)
  .eq('project_id', projectId)
```

---

## 🗄️ Database Changes Required

### **1. Run Profile Image & Due Date Migration**

**File:** `docs/add-profile-images-and-due-dates.sql`

```sql
-- Adds:
ALTER TABLE user_profiles ADD COLUMN profile_image TEXT;
ALTER TABLE projects ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;

-- Creates indexes and RLS policies
```

**Steps:**
1. Go to Supabase Dashboard
2. SQL Editor
3. Copy and paste the SQL
4. Run it
5. Done!

### **2. Update RPC Function**

**File:** `docs/update-project-rpc-with-due-date.sql`

```sql
-- Updates update_user_project function to accept due_date
CREATE OR REPLACE FUNCTION update_user_project(...)
```

**Steps:**
1. Supabase Dashboard > SQL Editor
2. Copy and paste the SQL
3. Run it
4. Function updated!

---

## 🎨 UI Design

### **Color System**

**Project Icons:**
- Background: Team color light (`colors.primaryLight`)
- Text: Team color (`colors.primary`)
- Size: 48px circle in table

**Badges:**
- Owner: Team colored background
- Collaborator: Orange background
- Permission level shown

**Date Picker:**
- Dark background: `#0d1117`
- Border: `#374151`
- Focus: Team colored border
- Color scheme: `dark` for native calendar

**Avatars:**
- Border: Container color (`#1a1e1f`)
- Background: Team color or gray
- Text: White
- Overlap: `-space-x-2`

### **Typography**

**Table Headers:**
- Size: `text-xs`
- Weight: `font-medium`
- Color: `#595d60`
- Transform: `uppercase`
- Tracking: `tracking-wider`

**Project Names:**
- Size: `text-white`
- Weight: `font-medium`
- Truncate: `line-clamp-1`

**Counts:**
- Primary number: White, bold
- Secondary text: Gray
- Format: "6 / 12 Items/Parts"

---

## 🧪 Testing Checklist

### **Profile Images**
- [ ] Upload image in Settings
- [ ] See avatar in sidebar
- [ ] See avatar in project library
- [ ] Avatar persists after refresh
- [ ] Fallback to initials works
- [ ] Team color applies to default avatar

### **Due Dates**
- [ ] Set due date when creating project
- [ ] Due date appears in review step
- [ ] Due date saves to database
- [ ] Edit due date in edit project view
- [ ] Due date shows in project detail page
- [ ] Due date appears in project library
- [ ] Date picker uses dark theme

### **Project Library**
- [ ] Table displays all projects
- [ ] Project icons show first letter
- [ ] Items/parts counts are correct
- [ ] Due dates display properly
- [ ] Collaborator avatars load
- [ ] Overflow counter shows (+N)
- [ ] Hover effects work
- [ ] Clicking row opens project

---

## 💡 Usage Examples

### **Create Project with Due Date**

```typescript
const projectData = {
  title: "Product Launch",
  retailer: "Apple Store",
  due_date: "2024-12-15",
  items: [...]
}
```

### **Upload Profile Image**

```typescript
// FileUpload component handles this automatically
<FileUpload
  value={profileImage}
  onChange={(url) => setProfileImage(url)}
  accept="image/*"
  maxSize={5}
/>
```

### **Display Collaborator Avatars**

```tsx
{collaborators.map((collab, idx) => (
  <div className="w-8 h-8 rounded-full...">
    {collab.profile_image ? (
      <img src={collab.profile_image} alt={collab.display_name} />
    ) : (
      <span>{collab.display_name?.charAt(0)}</span>
    )}
  </div>
))}
```

---

## 🔐 Security & Permissions

### **Profile Images**

**Who Can:**
- ✅ View: Everyone (in collaborator lists)
- ✅ Upload: Only own profile
- ✅ Update: Only own profile
- ❌ Delete: Must use storage policies

**RLS Policies:**
```sql
-- Users can update their own profile image
CREATE POLICY "Users can update their own profile image"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);
```

### **Due Dates**

**Who Can Set/Edit:**
- ✅ Project Owner
- ✅ Admin collaborators
- ✅ Edit collaborators
- ❌ View-only collaborators

**Enforced By:**
- RPC function permission checks
- Database RLS policies
- Frontend UI logic

---

## 📈 Impact

### **Before:**
- ❌ Simple card grid layout
- ❌ No due date tracking
- ❌ No profile images
- ❌ Text-only collaborator display
- ❌ Limited project metadata

### **After:**
- ✅ Professional table layout
- ✅ Due date management
- ✅ Profile image uploads
- ✅ Visual collaborator avatars
- ✅ Rich project metadata
- ✅ Better project overview
- ✅ Team collaboration visibility

---

## 🚀 Next Steps

### **Immediate (Database Setup):**

1. **Run SQL Migration #1:**
   - File: `docs/add-profile-images-and-due-dates.sql`
   - Adds: `profile_image` and `due_date` fields

2. **Run SQL Migration #2:**
   - File: `docs/update-project-rpc-with-due-date.sql`
   - Updates: RPC function for due date support

### **User Actions:**

1. **Upload Profile Image:**
   - Settings > User Profile > Upload Profile Image
   - Your avatar appears everywhere!

2. **Set Due Dates:**
   - Create new project → Set due date
   - Or edit existing project → Add/update due date

3. **View Project Library:**
   - My Projects page
   - See all projects in table format
   - View collaborators with avatars

---

## 🎨 Design Inspiration

This design was inspired by the Webflow template you provided, featuring:
- Clean table layout
- Project icons with initials
- Task/item counts
- Due date tracking
- Collaborator avatars with overflow
- Professional, organized presentation

**Adapted for Dark Theme:**
- Dark backgrounds instead of light
- Team-based dynamic colors
- Better contrast for accessibility
- Consistent with Core Home design system

---

## 📝 Files Modified

### **Created:**
1. `docs/add-profile-images-and-due-dates.sql` - Database migration
2. `docs/update-project-rpc-with-due-date.sql` - RPC function update
3. `docs/PROJECT-LIBRARY-AND-PROFILES.md` - This guide

### **Updated:**
1. `app/projects/page.tsx` - New table layout
2. `app/settings/page.tsx` - Profile image upload
3. `app/project/new/page.tsx` - Due date in creation
4. `app/project/[id]/page.tsx` - Due date display
5. `components/project/edit-project-form.tsx` - Due date editing
6. `types/index.ts` - Project interface with due_date

---

## 🔍 Technical Details

### **Profile Image Storage**

**Path:** Supabase Storage Bucket
- Bucket: `project-files` (or dedicated `profile-images`)
- Path: `/profile-images/{user_id}/{filename}`
- Public access via URL
- Cached by browser

**Field:** `user_profiles.profile_image` (TEXT)
- Stores full URL to image
- Null = use fallback avatar
- Validated on upload

### **Due Date Storage**

**Field:** `projects.due_date` (TIMESTAMP WITH TIME ZONE)
- ISO 8601 format
- Includes timezone
- Nullable (optional)
- Indexed for performance

**Display:**
```javascript
// JavaScript
new Date(due_date).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
})

// Output: "Dec 15, 2024"
```

### **Collaborator Fetching**

**Query:**
```sql
SELECT 
  pc.user_id,
  up.display_name,
  up.profile_image
FROM project_collaborators pc
LEFT JOIN user_profiles up ON pc.user_id = up.user_id
WHERE pc.project_id = $1
LIMIT 10;
```

**Optimization:**
- Fetched once per page load
- Cached in component state
- Lazy loaded (not blocking)

---

## 🎯 User Experience

### **Project Owner Flow:**

1. **Create Project** → Set due date
2. **Invite Collaborators** → They get avatars
3. **View Project Library** → See all projects in table
4. **Edit Project** → Update due date if needed
5. **Track Progress** → Monitor via due dates

### **Collaborator Flow:**

1. **Receive Invitation** → Accept via email
2. **Upload Profile Image** → Settings > User Profile
3. **View Shared Projects** → See in library table
4. **Your Avatar Appears** → In all projects you collaborate on
5. **Edit Projects** → If you have permission

---

## 🌟 Key Features Highlight

### **1. Visual Collaboration**
See at a glance who's working on each project with avatar stacks

### **2. Deadline Tracking**
Know when projects are due directly from the library view

### **3. Professional Presentation**
Table format provides clear, organized project overview

### **4. Personal Touch**
Profile images make the app more personal and team-oriented

### **5. Scalable Design**
Handles many projects and collaborators gracefully

---

## 🐛 Troubleshooting

### **Profile Image Not Appearing**

**Check:**
1. Did you run the SQL migration?
2. Is the image URL accessible?
3. Did you click "Save Changes"?
4. Try hard refresh (Cmd+Shift+R)

**Solution:**
```sql
-- Verify field exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_profiles' AND column_name = 'profile_image';
```

### **Due Date Not Saving**

**Check:**
1. Did you run both SQL migrations?
2. Does RPC function have p_due_date parameter?
3. Check browser console for errors

**Solution:**
```sql
-- Verify field exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'projects' AND column_name = 'due_date';

-- Test RPC function
SELECT update_user_project(
  'project-id',
  'Title',
  'Retailer',
  '2024-12-15'::timestamp,
  '[]'::jsonb
);
```

### **Collaborator Avatars Not Loading**

**Check:**
1. Are collaborators added to project?
2. Do collaborators have profiles?
3. Check browser console

**Solution:**
```sql
-- Check collaborators
SELECT pc.*, up.display_name, up.profile_image
FROM project_collaborators pc
LEFT JOIN user_profiles up ON pc.user_id = up.user_id
WHERE pc.project_id = 'your-project-id';
```

---

## ✅ What's Complete

- ✅ Project Library table view
- ✅ Profile image upload
- ✅ Profile image display
- ✅ Due date creation
- ✅ Due date editing
- ✅ Due date display
- ✅ Collaborator avatar loading
- ✅ Avatar overflow handling
- ✅ Dark theme throughout
- ✅ Team-based colors
- ✅ RLS policies
- ✅ Database migrations
- ✅ TypeScript types updated

---

## 📊 Summary

**Your Core Home Render Portal now has:**

1. **Professional Project Library**
   - Table layout
   - Rich metadata display
   - Easy navigation

2. **User Profiles**
   - Profile image upload
   - Avatar display everywhere
   - Personal branding

3. **Due Date Tracking**
   - Set deadlines
   - Track in library
   - Edit as needed

4. **Visual Collaboration**
   - See team members
   - Avatar stacks
   - Clear permissions

**All features work together to create a professional, team-oriented project management experience!** 🎉

---

*Created: November 6, 2025*  
*Core Home Render Portal - Project Management Features*

