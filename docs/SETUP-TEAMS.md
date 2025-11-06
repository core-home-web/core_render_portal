# Team System Setup Guide

## Overview
The Core Home Render Portal now includes a two-team system to organize users and projects:

### Teams
1. **Product Development Team** (Teal #38bdbb)
   - Manage product renders and specifications
   - Create and manage projects
   - Assign work to Industrial Design team

2. **Industrial Design Team** (Orange #f9903c)
   - Execute renders and deliver assets
   - Work on active/in-progress projects
   - Collaborate on assigned projects

## Database Setup

### Step 1: Create user_profiles Table

Run the SQL script to create the user profiles table:

```bash
# Run this SQL in your Supabase SQL Editor
cat docs/setup-user-profiles.sql
```

Or manually execute:
```sql
-- See docs/setup-user-profiles.sql for complete script
```

### Step 2: Verify Table Creation

Check that the table exists:
```sql
SELECT * FROM user_profiles LIMIT 1;
```

### Step 3: Migrate Existing Users (Optional)

If you have existing users, create profiles for them:
```sql
INSERT INTO user_profiles (user_id, display_name, team)
SELECT 
  id,
  email,
  'product_development' -- Default team
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

## Features

### Signup Flow
- Users select their team during registration
- Team selection is required
- Team is saved to user_profiles table
- Visual indicators with team colors

### Settings Page
- Users can change their team
- Update display name
- Manage notification preferences
- Security settings

### Progress Page
- Shows projects marked "in progress"
- Filtered for Industrial Design team workload
- Statistics about active projects
- Status indicators

### My Projects Page
- Separates owned projects vs. collaborations
- Color-coded by ownership
- Grid view of all accessible projects

## Team Colors

### Product Development (Teal)
```
Color: #38bdbb
RGB: 56, 189, 187
Usage: Badges, indicators, owned projects
```

### Industrial Design (Orange)
```
Color: #f9903c
RGB: 249, 144, 60
Usage: Badges, indicators, in-progress work
```

## Navigation Updates

### Sidebar Menu Items:
1. **Dashboard** - Overview of all projects
2. **My Projects** - Grid view filtered by ownership/collaboration
3. **Progress** - In-progress projects (Industrial Design focus)
4. **Settings** - User, team, notification, security settings

### Teams Section:
- Product Development (teal dot)
- Industrial Design (orange dot)
- Add project link

## Using Team Data

### In Your Code:

```tsx
// Get user's team
const { data } = await supabase
  .from('user_profiles')
  .select('team')
  .eq('user_id', user.id)
  .single()

const userTeam = data?.team // 'product_development' | 'industrial_design'

// Filter projects by team
if (userTeam === 'industrial_design') {
  // Show in-progress projects
}
```

### Team-Based UI:

```tsx
{userTeam === 'product_development' ? (
  <span className="text-[#38bdbb]">Product Development</span>
) : (
  <span className="text-[#f9903c]">Industrial Design</span>
)}
```

## Troubleshooting

### Table doesn't exist
- Run the setup-user-profiles.sql script
- Check Supabase dashboard for errors
- Verify RLS policies are enabled

### Users can't save team
- Check RLS policies allow INSERT/UPDATE
- Verify user is authenticated
- Check browser console for errors

### Team not showing
- Verify user_profiles table has data
- Check JOIN in your queries
- Ensure user_id matches auth.users.id

## Production Checklist

- [ ] Run setup-user-profiles.sql in production
- [ ] Migrate existing users
- [ ] Test signup flow with team selection
- [ ] Test settings page team switching
- [ ] Verify RLS policies work correctly
- [ ] Test progress page filtering
- [ ] Check team colors display correctly

---

*Last updated: November 6, 2025*

