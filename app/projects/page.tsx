'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, Package, Users as UsersIcon, Eye } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { Project } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ThemedButton } from '@/components/ui/themed-button'
import { supabase } from '@/lib/supaClient'

interface ProjectWithDetails {
  id: string
  title: string
  retailer: string
  project_logo?: string
  due_date?: string
  items: any[]
  created_at: string
  updated_at: string
  is_owner?: boolean
  permission_level?: string
  // Aliases for compatibility
  project_id?: string
  project_title?: string
  project_retailer?: string
  collaborators?: Array<{
    user_id: string
    email?: string
    display_name?: string
    profile_image?: string
  }>
  total_parts?: number
}

export default function ProjectLibraryPage() {
  const { getProjects, loading, error } = useProject()
  const [projects, setProjects] = useState<ProjectWithDetails[]>([])
  const [collaboratorsMap, setCollaboratorsMap] = useState<Record<string, any[]>>({})
  const { user, loading: authLoading, signOut } = useAuth()
  const { colors } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    const fetchProjectsAndCollaborators = async () => {
      if (user) {
        const projectsData = await getProjects()
        setProjects(projectsData as ProjectWithDetails[])

        // Fetch collaborators for each project
        const collabMap: Record<string, any[]> = {}
        for (const project of projectsData) {
          const projectId = (project as any).project_id || project.id
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

          if (data) {
            collabMap[projectId] = data.map((c: any) => ({
              user_id: c.user_id,
              display_name: c.user_profiles?.display_name,
              profile_image: c.user_profiles?.profile_image,
            }))
          }
        }
        setCollaboratorsMap(collabMap)
      }
    }
    fetchProjectsAndCollaborators()
  }, [user, authLoading, router, getProjects])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
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

  const calculateTotalParts = (project: ProjectWithDetails) => {
    return project.items?.reduce((sum, item) => sum + (item.parts?.length || 0), 0) || 0
  }

  const getProjectInitial = (title: string) => {
    return title?.charAt(0)?.toUpperCase() || 'P'
  }

  const getProjectId = (project: ProjectWithDetails) => {
    return (project as any).project_id || project.id
  }

  const getProjectTitle = (project: ProjectWithDetails) => {
    return (project as any).project_title || project.title
  }

  const getProjectRetailer = (project: ProjectWithDetails) => {
    return (project as any).project_retailer || project.retailer
  }

  return (
    <DashboardLayout user={user} onSignOut={handleSignOut}>
      <div className="p-8 lg:p-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Project Library</h1>
              <p className="text-[#595d60]">
                View and manage all your projects and collaborations
              </p>
            </div>
            <Link href="/project/new">
              <ThemedButton variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </ThemedButton>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary, borderTopColor: 'transparent' }}></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl">
            Error: {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-[#1a1e1f] rounded-2xl border border-gray-800">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
              <Package className="w-10 h-10" style={{ color: colors.primary }} />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Projects Yet</h3>
            <p className="text-[#595d60] mb-6 max-w-md mx-auto">
              Create your first project to get started with Core Home Render Portal
            </p>
            <Link href="/project/new">
              <ThemedButton variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </ThemedButton>
            </Link>
          </div>
        ) : (
          /* Table View */
          <div className="bg-[#1a1e1f] rounded-2xl border border-gray-800 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-800 bg-[#0d1117]">
              <div className="col-span-4">
                <span className="text-xs font-medium text-[#595d60] uppercase tracking-wider">Project Name</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-medium text-[#595d60] uppercase tracking-wider">Items / Parts</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-medium text-[#595d60] uppercase tracking-wider">Retailer</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-medium text-[#595d60] uppercase tracking-wider">Due Date</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs font-medium text-[#595d60] uppercase tracking-wider">Collaborators</span>
              </div>
            </div>

            {/* Table Rows */}
            <div>
              {projects.map((project, index) => {
                const projectId = getProjectId(project)
                const projectTitle = getProjectTitle(project)
                const projectRetailer = getProjectRetailer(project)
                const totalParts = calculateTotalParts(project)
                const collaborators = collaboratorsMap[projectId] || []
                const displayCollaborators = collaborators.slice(0, 5)
                const remainingCount = Math.max(0, collaborators.length - 5)

                return (
                  <Link
                    key={projectId}
                    href={`/project/${projectId}`}
                    className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-[#222a31] transition-colors ${
                      index !== projects.length - 1 ? 'border-b border-gray-800' : ''
                    }`}
                  >
                    {/* Project Name with Icon */}
                    <div className="col-span-4 flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
                        style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
                      >
                        {getProjectInitial(projectTitle)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-medium mb-1 line-clamp-1">
                          {projectTitle}
                        </h3>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style={
                          project.is_owner 
                            ? { backgroundColor: colors.primaryLight, color: colors.primary }
                            : { backgroundColor: 'rgba(249, 144, 60, 0.1)', color: '#f9903c' }
                        }>
                          {project.is_owner ? 'Owner' : project.permission_level || 'Collaborator'}
                        </span>
                      </div>
                    </div>

                    {/* Items / Parts */}
                    <div className="col-span-2 flex items-center">
                      <div className="text-sm">
                        <span className="text-white font-medium">{project.items?.length || 0}</span>
                        <span className="text-[#595d60]"> / </span>
                        <span className="text-white font-medium">{totalParts}</span>
                        <div className="text-xs text-[#595d60] mt-0.5">
                          {project.items?.length === 1 ? 'Item' : 'Items'} / {totalParts === 1 ? 'Part' : 'Parts'}
                        </div>
                      </div>
                    </div>

                    {/* Retailer */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-white line-clamp-1">
                        {projectRetailer}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="col-span-2 flex items-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1117] border border-gray-700">
                        <Calendar className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                        <span className="text-sm text-white">
                          {project.due_date 
                            ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          }
                        </span>
                      </div>
                    </div>

                    {/* Collaborators */}
                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center -space-x-2">
                        {/* Owner Avatar */}
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-[#1a1e1f] flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                          style={{ backgroundColor: colors.primary }}
                          title={user.email}
                        >
                          {user.email?.charAt(0).toUpperCase()}
                        </div>

                        {/* Collaborator Avatars */}
                        {displayCollaborators.map((collab, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full border-2 border-[#1a1e1f] flex items-center justify-center text-white text-xs font-medium flex-shrink-0 bg-[#222a31]"
                            title={collab.display_name || collab.user_id}
                          >
                            {collab.profile_image ? (
                              <img
                                src={collab.profile_image}
                                alt={collab.display_name || 'User'}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span>{(collab.display_name || 'U').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                        ))}

                        {/* Remaining Count */}
                        {remainingCount > 0 && (
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-[#1a1e1f] flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                            style={{ backgroundColor: '#222a31' }}
                            title={`${remainingCount} more collaborator${remainingCount !== 1 ? 's' : ''}`}
                          >
                            +{remainingCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

