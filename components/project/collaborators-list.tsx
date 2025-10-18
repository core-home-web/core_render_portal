'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useProjectCollaboration } from '@/hooks/useProjectCollaboration'
import { ProjectCollaborator, ProjectInvitation } from '@/types'
import {
  Users,
  Mail,
  Clock,
  Crown,
  Shield,
  UserX,
  MoreHorizontal,
} from 'lucide-react'

interface CollaboratorsListProps {
  projectId: string
  projectOwnerId: string
  currentUserId: string
}

export function CollaboratorsList({
  projectId,
  projectOwnerId,
  currentUserId,
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

  useEffect(() => {
    setIsOwner(currentUserId === projectOwnerId)
    loadCollaborationData()
  }, [projectId, currentUserId, projectOwnerId])

  const loadCollaborationData = async () => {
    const [collaboratorsData, invitationsData] = await Promise.all([
      getCollaborators(projectId),
      getInvitations(projectId),
    ])
    setCollaborators(collaboratorsData)
    setInvitations(invitationsData)
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
      admin: { color: 'bg-red-100 text-red-800', icon: Crown },
      edit: { color: 'bg-blue-100 text-blue-800', icon: Shield },
      view: { color: 'bg-gray-100 text-gray-800', icon: Users },
    }
    const variant =
      variants[permission as keyof typeof variants] || variants.view
    const Icon = variant.icon

    return (
      <Badge className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {permission}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!isOwner && collaborators.length === 0 && invitations.length === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Collaborators</span>
          <Badge variant="secondary" className="ml-auto">
            {collaborators.length + invitations.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Project Owner */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Project Owner</p>
              <p className="text-sm text-gray-600">Full control over project</p>
            </div>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">
            <Crown className="w-3 h-3 mr-1" />
            Owner
          </Badge>
        </div>

        {/* Active Collaborators */}
        {collaborators.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Active Collaborators
            </h4>
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {collaborator.user?.email ||
                        collaborator.user_email ||
                        'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Joined {formatDate(collaborator.joined_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {isOwner && (
                    <select
                      value={collaborator.permission_level}
                      onChange={(e) =>
                        handleUpdatePermission(
                          collaborator.user_id,
                          e.target.value as any
                        )
                      }
                      className="text-xs border rounded px-2 py-1"
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
                      className="text-red-600 hover:text-red-700"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Pending Invitations
            </h4>
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {invitation.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Invited {formatDate(invitation.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getPermissionBadge(invitation.permission_level)}
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {collaborators.length === 0 && invitations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No collaborators yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Invite team members to collaborate on this project
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
