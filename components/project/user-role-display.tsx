'use client'

import { useState, useEffect } from 'react'
import { Crown, Shield, Eye } from 'lucide-react'
import { supabase } from '@/lib/supaClient'

interface UserRoleDisplayProps {
  projectId: string
  projectOwnerId: string
  currentUserId: string
}

export function UserRoleDisplay({
  projectId,
  projectOwnerId,
  currentUserId,
}: UserRoleDisplayProps) {
  const [userRole, setUserRole] = useState<{
    label: string
    description: string
    badge: string
    icon: typeof Crown
  } | null>(null)

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        if (currentUserId === projectOwnerId) {
          setUserRole({
            label: 'Project Owner',
            description: 'Full control over project',
            badge: 'Owner',
            icon: Crown,
          })
          return
        }

        const { data: collaborator } = await supabase
          .from('project_collaborators')
          .select('permission_level')
          .eq('project_id', projectId)
          .eq('user_id', currentUserId)
          .single()

        if (collaborator) {
          const roleMap = {
            admin: {
              label: 'Project Admin',
              description: 'Can view, edit, and manage collaborators',
              badge: 'Admin',
              icon: Crown,
            },
            edit: {
              label: 'Project Editor',
              description: 'Can view and edit project details',
              badge: 'Can Edit',
              icon: Shield,
            },
            view: {
              label: 'Project Viewer',
              description: 'Can view project details and history',
              badge: 'View Only',
              icon: Eye,
            },
          }

          setUserRole(roleMap[collaborator.permission_level as keyof typeof roleMap] || roleMap.view)
        } else {
          // Default to viewer if no permission found
          setUserRole({
            label: 'Project Viewer',
            description: 'Can view project details and history',
            badge: 'View Only',
            icon: Eye,
          })
        }
      } catch (error) {
        console.error('Error loading user role:', error)
        // Default to viewer on error
        setUserRole({
          label: 'Project Viewer',
          description: 'Can view project details and history',
          badge: 'View Only',
          icon: Eye,
        })
      }
    }

    loadUserRole()
  }, [projectId, currentUserId, projectOwnerId])

  if (!userRole) {
    return null
  }

  const Icon = userRole.icon

  return (
    <div className="bg-[#38bdbb]/10 border border-[#38bdbb]/30 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#38bdbb]" />
          <span className="text-white font-medium">{userRole.label}</span>
        </div>
        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-[#38bdbb]/20 text-[#38bdbb]">
          {userRole.badge}
        </span>
      </div>
      <p className="text-sm text-[#595d60]">{userRole.description}</p>
    </div>
  )
}

