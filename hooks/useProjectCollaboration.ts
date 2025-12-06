import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supaClient'
import { ProjectCollaborator, ProjectInvitation, InviteUserData } from '@/types'

export function useProjectCollaboration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Invite a user to a project
  const inviteUser = useCallback(
    async (
      projectId: string,
      data: InviteUserData
    ): Promise<{ success: boolean; token?: string; error?: string }> => {
      setLoading(true)
      setError(null)

      try {
        console.log('🔍 Starting invitation process...')
        console.log('📋 Project ID:', projectId)
        console.log('📧 Email:', data.email)
        console.log('🔐 Permission Level:', data.permission_level)

        // Get current session to verify authentication
        const {
          data: { session },
        } = await supabase.auth.getSession()
        console.log('👤 Current user session:', session?.user?.id)
        console.log('👤 Current user email:', session?.user?.email)

        // Call the database function to create invitation
        console.log('🔄 Calling invite_user_to_project RPC...')
        const { data: result, error } = await supabase.rpc(
          'invite_user_to_project',
          {
            p_project_id: projectId,
            p_email: data.email,
            p_permission_level: data.permission_level,
          }
        )

        console.log('📊 RPC Result:', result)
        console.log('❌ RPC Error:', error)

        if (error) {
          console.error('🚨 Database function error:', error)
          throw error
        }

        console.log('✅ Database function succeeded, token:', result)

        // Send email with invitation link using API route
        try {
          const invitationUrl = `${window.location.origin}/project/invite/${result}`
          console.log('📧 Sending email to:', data.email)
          console.log('🔗 Invitation URL:', invitationUrl)

          // Get project title for email
          const { data: projectData } = await supabase
            .from('projects')
            .select('title')
            .eq('id', projectId)
            .single()

          const emailResponse = await fetch('/api/send-invitation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: data.email,
              invitationUrl,
              permissionLevel: data.permission_level,
              projectId,
              projectTitle: projectData?.title || 'a project',
            }),
          })

          const emailResult = await emailResponse.json()
          console.log('📧 Email API response:', emailResult)

          if (!emailResponse.ok) {
            console.warn('⚠️ Email sending failed:', emailResult.error)
            // Don't fail the invitation if email fails
          } else {
            console.log('✅ Email sent successfully')
          }
        } catch (emailError) {
          console.warn('⚠️ Email sending error:', emailError)
          // Don't fail the invitation if email fails
        }

        return { success: true, token: result }
      } catch (err) {
        console.error('🚨 Invitation error:', err)
        setError(err instanceof Error ? err.message : 'Failed to invite user')
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Failed to invite user',
        }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Get collaborators for a project
  const getCollaborators = useCallback(
    async (projectId: string): Promise<ProjectCollaborator[]> => {
      try {
        console.log('🔍 Fetching collaborators for project:', projectId)

        // First try to use the RPC function (most reliable)
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'get_project_collaborators_with_users',
          { p_project_id: projectId }
        )

        if (!rpcError && rpcData) {
          console.log('Collaborators data from RPC:', rpcData)
          return rpcData || []
        }

        // If RPC function doesn't exist, try the view
        if (rpcError && rpcError.code === '42883') {
          console.log('RPC function not found, trying view')
          const { data: viewData, error: viewError } = await supabase
            .from('project_collaborators_with_users')
            .select('*')
            .eq('project_id', projectId)

          // Handle 406 error (view can't access auth.users) or view doesn't exist
          if (viewError && (viewError.code === '406' || viewError.code === '42P01')) {
            console.log('View not accessible, using basic query')
            const { data: basicData, error: basicError } = await supabase
              .from('project_collaborators')
              .select('*')
              .eq('project_id', projectId)

            if (basicError) {
              console.error('Error fetching collaborators:', basicError)
              throw basicError
            }

            console.log('Basic collaborators data:', basicData)
            return basicData || []
          }

          if (viewError) {
            console.error('Error fetching collaborators from view:', viewError)
            throw viewError
          }

          console.log('Collaborators data from view:', viewData)
          return viewData || []
        }

        // If RPC had a different error, try basic query as fallback
        if (rpcError) {
          console.warn('RPC error, falling back to basic query:', rpcError.message)
          const { data: basicData, error: basicError } = await supabase
            .from('project_collaborators')
            .select('*')
            .eq('project_id', projectId)

          if (basicError) {
            console.error('Error fetching collaborators:', basicError)
            throw basicError
          }

          console.log('Basic collaborators data:', basicData)
          return basicData || []
        }

        return []
      } catch (err) {
        console.error('Error fetching collaborators:', err)
        return []
      }
    },
    []
  )

  // Get invitations for a project
  const getInvitations = useCallback(
    async (projectId: string): Promise<ProjectInvitation[]> => {
      try {
        const { data, error } = await supabase
          .from('project_invitations')
          .select('*')
          .eq('project_id', projectId)
          .is('accepted_at', null)

        if (error) throw error
        return data || []
      } catch (err) {
        console.error('Error fetching invitations:', err)
        return []
      }
    },
    []
  )

  // Remove a collaborator from a project
  const removeCollaborator = useCallback(
    async (projectId: string, userId: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from('project_collaborators')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', userId)

        if (error) throw error
        return true
      } catch (err) {
        console.error('Error removing collaborator:', err)
        return false
      }
    },
    []
  )

  // Cancel an invitation
  const cancelInvitation = useCallback(
    async (invitationId: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from('project_invitations')
          .delete()
          .eq('id', invitationId)

        if (error) throw error
        return true
      } catch (err) {
        console.error('Error canceling invitation:', err)
        return false
      }
    },
    []
  )

  // Update collaborator permission level
  const updateCollaboratorPermission = useCallback(
    async (
      projectId: string,
      userId: string,
      permissionLevel: 'view' | 'edit' | 'admin'
    ): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from('project_collaborators')
          .update({ permission_level: permissionLevel })
          .eq('project_id', projectId)
          .eq('user_id', userId)

        if (error) throw error
        return true
      } catch (err) {
        console.error('Error updating collaborator permission:', err)
        return false
      }
    },
    []
  )

  return {
    inviteUser,
    getCollaborators,
    getInvitations,
    removeCollaborator,
    cancelInvitation,
    updateCollaboratorPermission,
    loading,
    error,
  }
}
