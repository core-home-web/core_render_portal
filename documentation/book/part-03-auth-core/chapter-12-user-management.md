# Chapter 12: User Management

This chapter covers user profiles, team assignment, and user settings that personalize the application experience.

---

## User Profile System

The Core Render Portal supports user profiles with:

- **Display name**: Custom name for display
- **Team assignment**: Product Development or Industrial Design
- **Profile image**: Avatar/profile picture
- **Default settings**: Due date defaults

---

## User Profile Types

```typescript
// File: types/index.ts (partial)

// Team type for theming
type Team = 'product_development' | 'industrial_design' | null

// User profile interface
interface UserProfile {
  user_id: string
  display_name?: string
  team?: Team
  profile_image?: string
  default_due_date_value?: number
  default_due_date_unit?: 'days' | 'weeks' | 'months'
  created_at?: string
  updated_at?: string
}
```

---

## Settings Page Implementation

```typescript
// File: app/settings/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { supabase } from '@/lib/supaClient'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileUpload } from '@/components/ui/file-upload'
import { User, Palette, Clock, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { team, setTeam, colors } = useTheme()
  const router = useRouter()

  // Profile state
  const [displayName, setDisplayName] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<string>(team || '')
  const [dueDateValue, setDueDateValue] = useState(14)
  const [dueDateUnit, setDueDateUnit] = useState('days')
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error)
        }

        if (data) {
          setDisplayName(data.display_name || '')
          setProfileImage(data.profile_image || '')
          setSelectedTeam(data.team || '')
          setDueDateValue(data.default_due_date_value || 14)
          setDueDateUnit(data.default_due_date_unit || 'days')
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  // Save profile
  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    setMessage(null)

    try {
      const profileData = {
        user_id: user.id,
        display_name: displayName || null,
        team: selectedTeam || null,
        profile_image: profileImage || null,
        default_due_date_value: dueDateValue,
        default_due_date_unit: dueDateUnit,
        updated_at: new Date().toISOString(),
      }

      // Upsert profile
      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { onConflict: 'user_id' })

      if (error) throw error

      // Update theme context if team changed
      if (selectedTeam && selectedTeam !== team) {
        setTeam(selectedTeam as any)
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch (err) {
      console.error('Save error:', err)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070e0e]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <DashboardLayout user={user} onSignOut={handleSignOut}>
      <div className="p-8 lg:p-12 text-white max-w-3xl">
        <h1 className="text-3xl font-medium mb-8">Settings</h1>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900/20 border border-green-500/50 text-green-400'
              : 'bg-red-900/20 border border-red-500/50 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Section */}
        <section className="bg-[#1a1e1f] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5" style={{ color: colors.primary }} />
            <h2 className="text-xl font-medium">Profile</h2>
          </div>

          <div className="space-y-6">
            {/* Profile Image */}
            <div>
              <Label className="text-white mb-2 block">Profile Picture</Label>
              <div className="flex items-center gap-4">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                    style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
                  >
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}
                <FileUpload
                  value={profileImage}
                  onChange={setProfileImage}
                  bucket="profile-images"
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                />
              </div>
            </div>

            {/* Display Name */}
            <div>
              <Label htmlFor="displayName" className="text-white">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="mt-2 bg-[#0d1117] border-gray-700 text-white"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <Label className="text-white">Email</Label>
              <Input
                value={user.email || ''}
                disabled
                className="mt-2 bg-[#0d1117] border-gray-700 text-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-[#1a1e1f] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5" style={{ color: colors.primary }} />
            <h2 className="text-xl font-medium">Team & Theme</h2>
          </div>

          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Select your team to customize the application theme colors.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Product Development */}
              <button
                onClick={() => setSelectedTeam('product_development')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedTeam === 'product_development'
                    ? 'border-[#38bdbb] bg-[#38bdbb]/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#38bdbb] mb-3" />
                <p className="font-medium">Product Development</p>
                <p className="text-sm text-gray-400">Teal theme</p>
              </button>

              {/* Industrial Design */}
              <button
                onClick={() => setSelectedTeam('industrial_design')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedTeam === 'industrial_design'
                    ? 'border-[#f9903c] bg-[#f9903c]/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#f9903c] mb-3" />
                <p className="font-medium">Industrial Design</p>
                <p className="text-sm text-gray-400">Orange theme</p>
              </button>
            </div>
          </div>
        </section>

        {/* Default Settings Section */}
        <section className="bg-[#1a1e1f] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5" style={{ color: colors.primary }} />
            <h2 className="text-xl font-medium">Default Settings</h2>
          </div>

          <div>
            <Label className="text-white mb-2 block">Default Due Date Offset</Label>
            <p className="text-sm text-gray-400 mb-3">
              New projects will have a due date this far in the future from creation.
            </p>
            
            <div className="flex gap-3">
              <Input
                type="number"
                min="1"
                max="365"
                value={dueDateValue}
                onChange={(e) => setDueDateValue(parseInt(e.target.value) || 14)}
                className="w-24 bg-[#0d1117] border-gray-700 text-white"
              />
              <select
                value={dueDateUnit}
                onChange={(e) => setDueDateUnit(e.target.value)}
                className="px-4 py-2 bg-[#0d1117] border border-gray-700 rounded-lg text-white"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
          style={{ backgroundColor: colors.primary }}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </DashboardLayout>
  )
}
```

---

## User Settings Utility

```typescript
// File: lib/user-settings.ts

import { supabase } from './supaClient'

/**
 * Get user's default due date settings
 */
export async function getUserDefaultDueDate(userId: string): Promise<{
  value: number
  unit: 'days' | 'weeks' | 'months'
}> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('default_due_date_value, default_due_date_unit')
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !data) {
      // Return default values
      return { value: 14, unit: 'days' }
    }

    return {
      value: data.default_due_date_value || 14,
      unit: data.default_due_date_unit || 'days',
    }
  } catch (err) {
    return { value: 14, unit: 'days' }
  }
}

/**
 * Update user's default due date settings
 */
export async function updateUserDefaultDueDate(
  userId: string,
  value: number,
  unit: 'days' | 'weeks' | 'months'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        default_due_date_value: value,
        default_due_date_unit: unit,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    return !error
  } catch {
    return false
  }
}

/**
 * Get user's team
 */
export async function getUserTeam(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('team')
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !data) return null
    return data.team
  } catch {
    return null
  }
}
```

---

## Date Utilities

```typescript
// File: lib/date-utils.ts

/**
 * Calculate a due date based on creation date and offset
 */
export function calculateDefaultDueDate(
  createdAt: string,
  offsetValue: number,
  offsetUnit: 'days' | 'weeks' | 'months'
): string {
  const date = new Date(createdAt)
  
  switch (offsetUnit) {
    case 'days':
      date.setDate(date.getDate() + offsetValue)
      break
    case 'weeks':
      date.setDate(date.getDate() + (offsetValue * 7))
      break
    case 'months':
      date.setMonth(date.getMonth() + offsetValue)
      break
  }
  
  return date.toISOString()
}

/**
 * Convert date input (YYYY-MM-DD) to ISO string
 * Uses UTC to avoid timezone shifts
 */
export function dateInputToISO(dateInput: string): string | null {
  if (!dateInput) return null
  
  // Parse as UTC to avoid timezone issues
  const [year, month, day] = dateInput.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  
  return date.toISOString()
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: string | undefined | null): string {
  if (!date) return 'Not set'
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
export function formatDateForInput(date: string | undefined | null): string {
  if (!date) return ''
  
  try {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  } catch {
    return ''
  }
}
```

---

## Chapter Summary

User management includes:

1. **User profiles table** - Stores preferences and settings
2. **Settings page** - UI for editing profile
3. **Team selection** - Controls app theme
4. **Default settings** - Personalized due dates
5. **Utility functions** - Helpers for dates and settings

Key features:
- Profiles are created on-demand (upsert pattern)
- Team selection persists and affects theming
- Default due date applies to new projects
- Profile images stored in Supabase Storage

---

*Next: [Chapter 13: API Routes](./chapter-13-api-routes.md) - Server-side endpoints*
