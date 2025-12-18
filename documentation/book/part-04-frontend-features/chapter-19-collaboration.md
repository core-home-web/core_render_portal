# Chapter 19: Collaboration System

This chapter covers the invitation and permission system that enables team collaboration on projects.

---

## Collaboration Overview

The collaboration system provides:
- Email-based invitations with secure tokens
- Three permission levels (view, edit, admin)
- Collaborator management interface
- Real-time access updates

---

## Permission Levels

| Level | View | Edit | Manage Collaborators |
|-------|------|------|---------------------|
| **View** | ✅ | ❌ | ❌ |
| **Edit** | ✅ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ |

---

## Collaboration Hook

```typescript
// File: hooks/useProjectCollaboration.ts

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supaClient'
import { ProjectCollaborator, ProjectInvitation, InviteUserData } from '@/types'

export function useProjectCollaboration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Invite user to project
  const inviteUser = useCallback(async (
    projectId: string,
    data: InviteUserData
  ): Promise<{ success: boolean; token?: string; error?: string }> => {
    setLoading(true)
    setError(null)

    try {
      // Create invitation via RPC
      const { data: token, error: rpcError } = await supabase.rpc(
        'invite_user_to_project',
        {
          p_project_id: projectId,
          p_email: data.email,
          p_permission_level: data.permission_level,
        }
      )

      if (rpcError) throw rpcError

      // Send invitation email
      const invitationUrl = `${window.location.origin}/project/invite/${token}`
      
      await fetch('/api/send-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.email,
          invitationUrl,
          permissionLevel: data.permission_level,
          projectId,
        }),
      })

      return { success: true, token }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to invite user'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Get collaborators
  const getCollaborators = useCallback(async (projectId: string): Promise<ProjectCollaborator[]> => {
    try {
      const { data, error } = await supabase.rpc(
        'get_project_collaborators_with_users',
        { p_project_id: projectId }
      )
      if (error) throw error
      return data || []
    } catch {
      return []
    }
  }, [])

  // Get pending invitations
  const getInvitations = useCallback(async (projectId: string): Promise<ProjectInvitation[]> => {
    try {
      const { data, error } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('project_id', projectId)
        .is('accepted_at', null)
      if (error) throw error
      return data || []
    } catch {
      return []
    }
  }, [])

  // Remove collaborator
  const removeCollaborator = useCallback(async (projectId: string, userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)
      return !error
    } catch {
      return false
    }
  }, [])

  // Cancel invitation
  const cancelInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('project_invitations')
        .delete()
        .eq('id', invitationId)
      return !error
    } catch {
      return false
    }
  }, [])

  return {
    inviteUser,
    getCollaborators,
    getInvitations,
    removeCollaborator,
    cancelInvitation,
    loading,
    error,
  }
}
```

---

## Invite Modal

```typescript
// File: components/project/invite-user-modal.tsx

'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import { useProjectCollaboration } from '@/hooks/useProjectCollaboration'
import { X, Send, Mail } from 'lucide-react'

interface InviteUserModalProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function InviteUserModal({ projectId, isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const { colors } = useTheme()
  const { inviteUser, loading } = useProjectCollaboration()
  
  const [email, setEmail] = useState('')
  const [permissionLevel, setPermissionLevel] = useState<'view' | 'edit' | 'admin'>('view')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = await inviteUser(projectId, { email, permission_level: permissionLevel })
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
        setEmail('')
        setSuccess(false)
      }, 2000)
    } else {
      setError(result.error || 'Failed to send invitation')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-[#1a1e1f] rounded-2xl p-8 w-full max-w-md">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primaryLight }}>
            <Mail className="w-5 h-5" style={{ color: colors.primary }} />
          </div>
          <h2 className="text-xl font-medium text-white">Invite Collaborator</h2>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-white">Invitation sent to {email}!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white"
                placeholder="colleague@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Permission Level
              </label>
              <select
                value={permissionLevel}
                onChange={(e) => setPermissionLevel(e.target.value as any)}
                className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white"
              >
                <option value="view">View - Can view project details</option>
                <option value="edit">Edit - Can modify project</option>
                <option value="admin">Admin - Full access</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-white"
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
```

---

## Invitation Accept Page

```typescript
// File: app/project/invite/[token]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supaClient'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const { user, loading: authLoading } = useAuth()
  const [invitation, setInvitation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch invitation details
  useEffect(() => {
    async function fetchInvitation() {
      try {
        const { data, error } = await supabase.rpc('get_invitation_details', {
          p_token: token
        })
        
        if (error || !data || data.length === 0) {
          setError('Invalid or expired invitation')
          return
        }
        
        setInvitation(data[0])
      } catch (err) {
        setError('Failed to load invitation')
      } finally {
        setLoading(false)
      }
    }
    
    fetchInvitation()
  }, [token])

  // Accept invitation
  const handleAccept = async () => {
    try {
      const { data, error } = await supabase.rpc('accept_project_invitation', {
        p_token: token
      })
      
      if (error) throw error
      
      router.push(`/project/${data}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070e0e]">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070e0e]">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-[#38bdbb]"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // Check if user needs to sign in
  if (!user || user.email !== invitation?.invited_email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070e0e]">
        <div className="bg-[#1a1e1f] rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-2xl text-white mb-4">Project Invitation</h2>
          <p className="text-gray-400 mb-6">
            You've been invited to collaborate on "{invitation?.project_title}"
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please sign in with {invitation?.invited_email} to accept
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full py-3 bg-[#38bdbb] text-white rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070e0e]">
      <div className="bg-[#1a1e1f] rounded-2xl p-8 max-w-md text-center">
        <h2 className="text-2xl text-white mb-4">Accept Invitation</h2>
        <p className="text-gray-400 mb-2">
          You've been invited to collaborate on:
        </p>
        <p className="text-xl text-white font-medium mb-4">
          {invitation?.project_title}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Permission: {invitation?.permission_level}
        </p>
        <button
          onClick={handleAccept}
          className="w-full py-3 bg-[#38bdbb] text-white rounded-lg"
        >
          Accept Invitation
        </button>
      </div>
    </div>
  )
}
```

---

## Collaborators List

```typescript
// File: components/project/collaborators-list.tsx

'use client'

import { useEffect, useState } from 'react'
import { useProjectCollaboration } from '@/hooks/useProjectCollaboration'
import { useTheme } from '@/lib/theme-context'
import { InviteUserModal } from './invite-user-modal'
import { UserPlus, Trash2, Clock } from 'lucide-react'

export function CollaboratorsList({ projectId }: { projectId: string }) {
  const { colors } = useTheme()
  const { getCollaborators, getInvitations, removeCollaborator, cancelInvitation } = useProjectCollaboration()
  
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)

  const refresh = async () => {
    const [collabData, inviteData] = await Promise.all([
      getCollaborators(projectId),
      getInvitations(projectId)
    ])
    setCollaborators(collabData)
    setInvitations(inviteData)
  }

  useEffect(() => {
    refresh()
  }, [projectId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-white">Team Members</h3>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: colors.primary }}
        >
          <UserPlus className="w-4 h-4" />
          Invite
        </button>
      </div>

      {/* Active Collaborators */}
      <div className="space-y-3">
        {collaborators.map((collab) => (
          <div key={collab.id} className="flex items-center justify-between bg-[#0d1117] p-4 rounded-lg">
            <div>
              <p className="text-white">{collab.user_email}</p>
              <p className="text-sm text-gray-500">{collab.permission_level}</p>
            </div>
            <button
              onClick={async () => {
                await removeCollaborator(projectId, collab.user_id)
                refresh()
              }}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Pending Invitations</h4>
          <div className="space-y-2">
            {invitations.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between bg-yellow-900/20 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-white">{invite.invited_email}</span>
                </div>
                <button
                  onClick={async () => {
                    await cancelInvitation(invite.id)
                    refresh()
                  }}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <InviteUserModal
        projectId={projectId}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={refresh}
      />
    </div>
  )
}
```

---

## Chapter Summary

Collaboration system includes:

1. **Permission levels** - View, edit, admin
2. **Invitation flow** - Email with secure token
3. **Collaborator management** - Add, remove, update permissions
4. **Accept flow** - Token validation and access grant

Key features:
- Secure token-based invitations
- Email notifications via Resend
- Database-enforced permissions via RLS
- Real-time collaborator updates

---

*Next: [Chapter 20: Export](./chapter-20-export.md) - Export functionality*
