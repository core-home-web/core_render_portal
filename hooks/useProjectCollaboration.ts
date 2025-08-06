import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supaClient'
import { 
  ProjectCollaborator, 
  ProjectInvitation, 
  InviteUserData 
} from '@/types'

export function useProjectCollaboration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Invite a user to a project
  const inviteUser = useCallback(async (
    projectId: string, 
    data: InviteUserData
  ): Promise<{ success: boolean; token?: string; error?: string }> => {
    setLoading(true)
    setError(null)
    
    try {
      // Call the database function to create invitation
      const { data: result, error } = await supabase.rpc('invite_user_to_project', {
        p_project_id: projectId,
        p_email: data.email,
        p_permission_level: data.permission_level
      })

      if (error) throw error

      // Send email with invitation link
      try {
        const invitationUrl = `${window.location.origin}/project/invite/${result}`
        
        // Call our API route to send email
        const emailResponse = await fetch('/api/send-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: data.email,
            invitationUrl,
            permissionLevel: data.permission_level,
            projectId
          })
        })

        if (!emailResponse.ok) {
          console.warn('Failed to send email:', await emailResponse.text())
        } else {
          console.log('Email sent successfully to:', data.email)
        }
        
      } catch (emailError) {
        console.warn('Failed to send email:', emailError)
        // Still return success since invitation was created
        // In production, you might want to handle this differently
      }

      return { success: true, token: result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invite user'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Get collaborators for a project
  const getCollaborators = useCallback(async (projectId: string): Promise<ProjectCollaborator[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('project_collaborators')
        .select(`
          *,
          user:user_id (
            email,
            raw_user_meta_data
          )
        `)
        .eq('project_id', projectId)
        .order('joined_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collaborators')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Get pending invitations for a project
  const getInvitations = useCallback(async (projectId: string): Promise<ProjectInvitation[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('project_invitations')
        .select('*')
        .eq('project_id', projectId)
        .is('accepted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invitations')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Remove a collaborator from a project
  const removeCollaborator = useCallback(async (
    projectId: string, 
    userId: string
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove collaborator')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Cancel a pending invitation
  const cancelInvitation = useCallback(async (invitationId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('project_invitations')
        .delete()
        .eq('id', invitationId)

      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invitation')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Update collaborator permission level
  const updateCollaboratorPermission = useCallback(async (
    projectId: string,
    userId: string,
    permissionLevel: 'view' | 'edit' | 'admin'
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('project_collaborators')
        .update({ permission_level: permissionLevel })
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update permission')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Get collaboration stats for a project
  const getCollaborationStats = useCallback(async (projectId: string): Promise<any | null> => {
    setLoading(true)
    setError(null)
    
    try {
      // Get project owner
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single()

      if (projectError) throw projectError

      // Get collaborator count
      const { count: collaboratorCount, error: collaboratorError } = await supabase
        .from('project_collaborators')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)

      if (collaboratorError) throw collaboratorError

      // Get pending invitation count
      const { count: invitationCount, error: invitationError } = await supabase
        .from('project_invitations')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .is('accepted_at', null)

      if (invitationError) throw invitationError

      return {
        total_collaborators: collaboratorCount || 0,
        pending_invitations: invitationCount || 0,
        project_owner: project.user_id
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collaboration stats')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Accept an invitation (for invited users)
  const acceptInvitation = useCallback(async (token: string): Promise<{ success: boolean; projectId?: string; error?: string }> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.rpc('accept_project_invitation', {
        p_token: token
      })

      if (error) throw error

      return { success: true, projectId: data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept invitation'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    inviteUser,
    getCollaborators,
    getInvitations,
    removeCollaborator,
    cancelInvitation,
    updateCollaboratorPermission,
    getCollaborationStats,
    acceptInvitation,
    loading,
    error
  }
} 