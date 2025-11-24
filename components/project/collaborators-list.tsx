'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useProjectCollaboration } from '@/hooks/useProjectCollaboration'
import { ProjectCollaborator, ProjectInvitation } from '@/types'
import { supabase } from '@/lib/supaClient'
import {
  Users,
  Mail,
  Clock,
  Crown,
  Shield,
  UserX,
  MoreHorizontal,
  UserPlus,
} from 'lucide-react'

interface CollaboratorsListProps {
  projectId: string
  projectOwnerId: string
  currentUserId: string
  onInviteClick?: () => void // Callback to open invite modal
}

export function CollaboratorsList({
  projectId,
  projectOwnerId,
  currentUserId,
  onInviteClick,
}: CollaboratorsListProps) {
  const {
    getCollaborators,
    getInvitations,
    removeCollaborator,
    cancelInvitation,
    updateCollaboratorPermission,
    loading,
    error,
  } = useProjectCollaboration()

  const [collaborators, setCollaborators] = useState<ProjectCollaborator[]>([])
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [currentUserPermission, setCurrentUserPermission] = useState<'view' | 'edit' | 'admin' | 'owner'>('view')
  const [ownerInfo, setOwnerInfo] = useState<{ email: string; joined_at: string; profile_image?: string } | null>(null)
  const [collaboratorProfiles, setCollaboratorProfiles] = useState<Record<string, { profile_image?: string }>>({})

  useEffect(() => {
    setIsOwner(currentUserId === projectOwnerId)
    loadCollaborationData()
    loadOwnerInfo()
    loadCurrentUserPermission()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, currentUserId, projectOwnerId])

  const loadOwnerInfo = async () => {
    try {
      // Get project creation date for owner's joined date
      // Try using RPC function first to avoid RLS issues, fallback to direct query
      let projectData: { user_id: string; created_at: string } | null = null
      
      try {
        // Try RPC function if available
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_project', {
          p_project_id: projectId
        })
        
        if (!rpcError && rpcData && rpcData.length > 0) {
          projectData = {
            user_id: rpcData[0].user_id,
            created_at: rpcData[0].created_at
          }
        }
      } catch (e) {
        // RPC might not be available, try direct query
      }
      
      // Fallback to direct query if RPC didn't work
      if (!projectData) {
        const { data: directData, error: projectError } = await supabase
          .from('projects')
          .select('user_id, created_at')
          .eq('id', projectId)
          .single()

        if (projectError) {
          console.error('Error loading project data:', projectError)
          // Don't return - we can still try to get owner info from other sources
        } else {
          projectData = directData
        }
      }

      if (!projectData) {
        // If we can't get project data, we can't show owner info
        return
      }

      // Get owner's profile including email and profile_image (if column exists)
      let ownerEmail = projectOwnerId
      let ownerProfileImage: string | undefined = undefined
      
      try {
        const { data: ownerProfile } = await supabase
          .from('user_profiles')
          .select('user_id, display_name')
          .eq('user_id', projectOwnerId)
          .single()

        if (ownerProfile?.display_name) {
          ownerEmail = ownerProfile.display_name
        }
        
        // Note: profile_image fetching is disabled until column is added to database
        // Uncomment below once profile_image column exists in user_profiles table
        // try {
        //   const { data: profileWithImage } = await supabase
        //     .from('user_profiles')
        //     .select('profile_image')
        //     .eq('user_id', projectOwnerId)
        //     .single()
        //   
        //   ownerProfileImage = profileWithImage?.profile_image
        // } catch (e) {
        //   // profile_image column might not exist, that's okay
        // }
      } catch (e) {
        // user_profiles might not be accessible, that's okay
        console.log('Could not fetch owner profile')
      }

      // Try to get email from a view that might include it
      try {
        const { data: ownerData } = await supabase
          .from('project_collaborators_with_users')
          .select('user_email, user_full_name')
          .eq('project_id', projectId)
          .eq('user_id', projectOwnerId)
          .single()

        if (ownerData?.user_email) {
          ownerEmail = ownerData.user_email
        }
      } catch (e) {
        // View might not exist or have email, that's okay
      }

      // If current user is the owner, get email from session
      if (currentUserId === projectOwnerId) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          ownerEmail = session.user.email
        }
      }

      setOwnerInfo({
        email: ownerEmail,
        joined_at: projectData.created_at,
        profile_image: ownerProfileImage,
      })
    } catch (error) {
      console.error('Error loading owner info:', error)
    }
  }

  const loadCurrentUserPermission = async () => {
    try {
      if (currentUserId === projectOwnerId) {
        setCurrentUserPermission('owner')
        return
      }

      const { data: collaborator } = await supabase
        .from('project_collaborators')
        .select('permission_level')
        .eq('project_id', projectId)
        .eq('user_id', currentUserId)
        .single()

      if (collaborator) {
        setCurrentUserPermission(collaborator.permission_level as 'view' | 'edit' | 'admin')
      }
    } catch (error) {
      console.error('Error loading current user permission:', error)
    }
  }

  const loadCollaborationData = async () => {
    const [collaboratorsData, invitationsData] = await Promise.all([
      getCollaborators(projectId),
      getInvitations(projectId),
    ])
    setCollaborators(collaboratorsData)
    setInvitations(invitationsData)
    
    // Load profile images for all collaborators
    // Note: profile_image fetching is disabled until column is added to database
    // Uncomment below once profile_image column exists in user_profiles table
    // if (collaboratorsData.length > 0) {
    //   const userIds = collaboratorsData.map(c => c.user_id).filter(Boolean)
    //   if (userIds.length > 0) {
    //     try {
    //       const { data: profiles, error: profilesError } = await supabase
    //         .from('user_profiles')
    //         .select('user_id, profile_image')
    //         .in('user_id', userIds)
    //       
    //       if (profilesError) {
    //         console.error('Error loading collaborator profiles:', profilesError)
    //       } else if (profiles) {
    //         const profileMap: Record<string, { profile_image?: string }> = {}
    //         profiles.forEach(profile => {
    //           if (profile.user_id && profile.profile_image) {
    //             profileMap[profile.user_id] = { profile_image: profile.profile_image }
    //           }
    //         })
    //         setCollaboratorProfiles(profileMap)
    //       }
    //     } catch (error) {
    //       console.error('Error fetching collaborator profiles:', error)
    //     }
    //   }
    // }
  }

  const handleRemoveCollaborator = async (userId: string) => {
    if (await removeCollaborator(projectId, userId)) {
      setCollaborators(collaborators.filter((c) => c.user_id !== userId))
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (await cancelInvitation(invitationId)) {
      setInvitations(invitations.filter((i) => i.id !== invitationId))
    }
  }

  const handleUpdatePermission = async (
    userId: string,
    newPermission: 'view' | 'edit' | 'admin'
  ) => {
    if (await updateCollaboratorPermission(projectId, userId, newPermission)) {
      setCollaborators(
        collaborators.map((c) =>
          c.user_id === userId ? { ...c, permission_level: newPermission } : c
        )
      )
    }
  }

  const getPermissionBadge = (permission: string) => {
    const variants = {
      admin: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Crown },
      edit: { color: 'bg-[#38bdbb]/20 text-[#38bdbb] border-[#38bdbb]/30', icon: Shield },
      view: { color: 'bg-gray-700/50 text-[#595d60] border-gray-700', icon: Users },
    }
    const variant =
      variants[permission as keyof typeof variants] || variants.view
    const Icon = variant.icon

    return (
      <Badge className={`${variant.color} border text-xs`}>
        <Icon className="w-3 h-3 mr-1" />
        {permission}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Show collaborators list for all users (not just owners)
  // Only hide if there are no collaborators and no owner info
  if (!ownerInfo && collaborators.length === 0 && invitations.length === 0) {
    return null
  }

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* All Collaborators (including owner) */}
      {(ownerInfo || collaborators.length > 0) && (
        <div className="space-y-3">
          {/* Owner */}
          {ownerInfo && (
            <div
              className="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg border border-[#38bdbb]/30"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {ownerInfo.profile_image ? (
                  <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border border-[#38bdbb]/30">
                    <img
                      src={ownerInfo.profile_image}
                      alt={ownerInfo.email}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-[#38bdbb]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Crown className="w-4 h-4 text-[#38bdbb]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {ownerInfo.email}
                  </p>
                  <p className="text-sm text-[#595d60]">
                    Joined {formatDate(ownerInfo.joined_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Badge className="bg-[#38bdbb]/20 text-[#38bdbb] border-[#38bdbb]/30 border text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              </div>
            </div>
          )}

          {/* Other Collaborators */}
          {collaborators.map((collaborator) => {
            const profileImage = collaboratorProfiles[collaborator.user_id]?.profile_image
            const collaboratorEmail = collaborator.user?.email || collaborator.user_email || 'Unknown User'
            
            return (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg border border-gray-700"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {profileImage ? (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border border-gray-700">
                      <img
                        src={profileImage}
                        alt={collaboratorEmail}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-[#38bdbb]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-[#38bdbb]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {collaboratorEmail}
                    </p>
                    <p className="text-sm text-[#595d60]">
                      Joined {formatDate(collaborator.joined_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {isOwner && (
                    <select
                      value={collaborator.permission_level}
                      onChange={(e) =>
                        handleUpdatePermission(
                          collaborator.user_id,
                          e.target.value as any
                        )
                      }
                      className="text-xs bg-[#1a1e1f] border border-gray-700 rounded px-2 py-1 text-white"
                    >
                      <option value="view">View</option>
                      <option value="edit">Edit</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                  {getPermissionBadge(collaborator.permission_level)}
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveCollaborator(collaborator.user_id)
                      }
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg border border-orange-500/30"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {invitation.email}
                  </p>
                  <p className="text-sm text-[#595d60]">
                    Invited {formatDate(invitation.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {getPermissionBadge(invitation.permission_level)}
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State (only if no owner and no collaborators) */}
      {!ownerInfo && collaborators.length === 0 && invitations.length === 0 && (
        <div className="text-center py-6">
          <Users className="w-12 h-12 mx-auto mb-3 text-[#595d60]" />
          <p className="text-sm text-[#595d60] mb-2">No collaborators yet</p>
          {isOwner && onInviteClick && (
            <Button
              onClick={onInviteClick}
              className="mt-3 bg-[#38bdbb] text-white hover:bg-[#2ea9a7]"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Members
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
