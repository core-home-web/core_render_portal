'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Lock,
  Users as UsersIcon,
  Bell,
  Palette,
  Save,
  Mail,
  Key,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { supabase } from '@/lib/supaClient'

type Team = 'product_development' | 'industrial_design' | null

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'user' | 'team' | 'notifications' | 'security'>('user')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // User settings
  const [displayName, setDisplayName] = useState('')
  const [userTeam, setUserTeam] = useState<Team>(null)
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [projectUpdates, setProjectUpdates] = useState(true)
  const [collaboratorInvites, setCollaboratorInvites] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    // Load user settings
    const loadUserSettings = async () => {
      if (user) {
        // Get user metadata (team info would be stored here)
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (data) {
          setUserTeam(data.team as Team)
          setDisplayName(data.display_name || '')
        }
      }
    }

    loadUserSettings()
  }, [user, authLoading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSaveUserSettings = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          display_name: displayName,
          team: userTeam,
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Save notification preferences
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          notification_preferences: {
            email: emailNotifications,
            project_updates: projectUpdates,
            collaborator_invites: collaboratorInvites,
          },
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      setMessage('Notification settings saved!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error saving notifications:', err)
      setError('Failed to save notification settings')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070e0e]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const tabs = [
    { id: 'user', label: 'User Profile', icon: User },
    { id: 'team', label: 'Team Settings', icon: UsersIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ] as const

  return (
    <DashboardLayout user={user} onSignOut={handleSignOut}>
      <div className="p-8 lg:p-12 text-white">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-medium mb-3">Settings</h1>
          <p className="text-[#595d60] text-base">
            Manage your account, preferences, and team settings
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 bg-green-900/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1e1f] rounded-2xl p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#38bdbb]/10 text-[#38bdbb]'
                        : 'text-[#595d60] hover:bg-[#222a31] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-[#1a1e1f] rounded-2xl p-8">
              {/* User Profile Tab */}
              {activeTab === 'user' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium mb-6">User Profile</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#595d60]" />
                      <span className="text-[#595d60]">{user.email}</span>
                    </div>
                    <p className="text-xs text-[#595d60] mt-2">
                      Email address cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-[#595d60] focus:border-[#38bdbb] focus:ring-1 focus:ring-[#38bdbb] transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleSaveUserSettings}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-[#38bdbb] text-white rounded-lg hover:bg-[#2ea9a7] disabled:opacity-50 transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {/* Team Settings Tab */}
              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium mb-6">Team Settings</h2>
                    <p className="text-[#595d60] mb-6">
                      Select which team you're part of to help organize projects and workflows
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-white mb-4">
                      Your Team
                    </label>

                    {/* Product Development Team */}
                    <div
                      onClick={() => setUserTeam('product_development')}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        userTeam === 'product_development'
                          ? 'border-[#38bdbb] bg-[#38bdbb]/10'
                          : 'border-gray-700 bg-[#0d1117] hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#38bdbb]/20 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-[#38bdbb]"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white mb-1">
                            Product Development Team
                          </h3>
                          <p className="text-sm text-[#595d60]">
                            Manage product renders, specifications, and deliverables
                          </p>
                        </div>
                        {userTeam === 'product_development' && (
                          <div className="w-6 h-6 bg-[#38bdbb] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Industrial Design Team */}
                    <div
                      onClick={() => setUserTeam('industrial_design')}
                      className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        userTeam === 'industrial_design'
                          ? 'border-[#f9903c] bg-[#f9903c]/10'
                          : 'border-gray-700 bg-[#0d1117] hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#f9903c]/20 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-[#f9903c]"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white mb-1">
                            Industrial Design Team
                          </h3>
                          <p className="text-sm text-[#595d60]">
                            Execute renders, manage active projects, and deliver assets
                          </p>
                        </div>
                        {userTeam === 'industrial_design' && (
                          <div className="w-6 h-6 bg-[#f9903c] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveUserSettings}
                    disabled={loading || !userTeam}
                    className="flex items-center gap-2 px-6 py-3 bg-[#38bdbb] text-white rounded-lg hover:bg-[#2ea9a7] disabled:opacity-50 transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Team Selection'}
                  </button>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium mb-6">Notification Preferences</h2>
                    <p className="text-[#595d60] mb-6">
                      Manage how and when you receive notifications
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg border border-gray-700">
                      <div>
                        <h4 className="font-medium text-white mb-1">Email Notifications</h4>
                        <p className="text-sm text-[#595d60]">
                          Receive email updates about your projects
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#38bdbb] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#38bdbb]"></div>
                      </label>
                    </div>

                    {/* Project Updates */}
                    <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg border border-gray-700">
                      <div>
                        <h4 className="font-medium text-white mb-1">Project Updates</h4>
                        <p className="text-sm text-[#595d60]">
                          Get notified when projects you own are updated
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={projectUpdates}
                          onChange={(e) => setProjectUpdates(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#38bdbb] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#38bdbb]"></div>
                      </label>
                    </div>

                    {/* Collaborator Invites */}
                    <div className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg border border-gray-700">
                      <div>
                        <h4 className="font-medium text-white mb-1">Collaboration Invites</h4>
                        <p className="text-sm text-[#595d60]">
                          Receive notifications when invited to collaborate
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={collaboratorInvites}
                          onChange={(e) => setCollaboratorInvites(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#38bdbb] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#38bdbb]"></div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-[#38bdbb] text-white rounded-lg hover:bg-[#2ea9a7] disabled:opacity-50 transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-medium mb-6">Security Settings</h2>
                    <p className="text-[#595d60] mb-6">
                      Manage your password and authentication settings
                    </p>
                  </div>

                  <div className="bg-[#0d1117] border border-gray-700 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#38bdbb]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Key className="w-6 h-6 text-[#38bdbb]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-2">
                          Change Password
                        </h3>
                        <p className="text-sm text-[#595d60] mb-4">
                          Update your password to keep your account secure
                        </p>
                        <button
                          onClick={() => {
                            // Trigger password reset email
                            supabase.auth.resetPasswordForEmail(user.email || '')
                            setMessage('Password reset email sent! Check your inbox.')
                          }}
                          className="text-[#38bdbb] hover:text-[#2ea9a7] transition-colors text-sm font-medium"
                        >
                          Send Password Reset Email →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0d1117] border border-gray-700 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lock className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-2">
                          Active Sessions
                        </h3>
                        <p className="text-sm text-[#595d60] mb-4">
                          You're currently signed in on this device
                        </p>
                        <button
                          onClick={handleSignOut}
                          className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                        >
                          Sign Out from All Devices →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

