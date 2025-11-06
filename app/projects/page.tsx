'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Eye, Plus, Package, Users as UsersIcon } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { Project } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ThemedButton } from '@/components/ui/themed-button'

export default function MyProjectsPage() {
  const { getProjects, loading, error } = useProject()
  const [projects, setProjects] = useState<Project[]>([])
  const { user, loading: authLoading, signOut } = useAuth()
  const { colors } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    const fetchProjects = async () => {
      if (user) {
        const projectsData = await getProjects()
        setProjects(projectsData)
      }
    }
    fetchProjects()
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

  // Separate owned and collaborated projects
  const ownedProjects = projects.filter((p: any) => p.is_owner)
  const collaboratedProjects = projects.filter((p: any) => !p.is_owner)

  return (
    <DashboardLayout user={user} onSignOut={handleSignOut}>
      <div className="p-8 lg:p-12 text-white">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-medium mb-3">My Projects</h1>
              <p className="text-[#595d60] text-base">
                All your projects and collaborations in one place
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
            <div className="w-12 h-12 border-4 border-[#38bdbb] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl">
            Error: {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1e1f] rounded-2xl">
            <Package className="w-16 h-16 text-[#595d60] mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Projects Yet</h3>
            <p className="text-[#595d60] mb-6">
              Create your first project to get started
            </p>
            <Link
              href="/project/new"
              className="inline-flex items-center gap-2 bg-[#38bdbb] hover:bg-[#2ea9a7] text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Owned Projects */}
            {ownedProjects.length > 0 && (
              <div>
                <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6 text-[#38bdbb]" />
                  My Projects ({ownedProjects.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {ownedProjects.map((project: any) => (
                    <Link
                      key={project.project_id}
                      href={`/project/${project.project_id}`}
                      className="bg-[#1a1e1f] rounded-2xl p-6 hover:bg-[#222a31] transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="inline-flex px-3 py-1 rounded-full bg-[#38bdbb]/10 text-[#38bdbb] text-xs font-medium">
                          Owner
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2 line-clamp-1">
                        {project.project_title}
                      </h3>
                      <p className="text-sm text-[#595d60] mb-1">
                        Retailer: {project.project_retailer}
                      </p>
                      <p className="text-sm text-[#595d60] mb-4">
                        {project.items?.length || 0} items
                      </p>
                      <div className="flex items-center gap-2 text-[#595d60] text-sm mb-4">
                        <Calendar className="w-4 h-4 text-[#38bdbb]" />
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#38bdbb] group-hover:text-[#2ea9a7] transition-colors text-sm font-medium">
                        <Eye className="w-4 h-4" />
                        <span>View Project</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborated Projects */}
            {collaboratedProjects.length > 0 && (
              <div>
                <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
                  <UsersIcon className="w-6 h-6 text-[#f9903c]" />
                  Collaborating On ({collaboratedProjects.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {collaboratedProjects.map((project: any) => (
                    <Link
                      key={project.project_id}
                      href={`/project/${project.project_id}`}
                      className="bg-[#1a1e1f] rounded-2xl p-6 hover:bg-[#222a31] transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="inline-flex px-3 py-1 rounded-full bg-[#f9903c]/10 text-[#f9903c] text-xs font-medium">
                          {project.permission_level}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2 line-clamp-1">
                        {project.project_title}
                      </h3>
                      <p className="text-sm text-[#595d60] mb-1">
                        Retailer: {project.project_retailer}
                      </p>
                      <p className="text-sm text-[#595d60] mb-4">
                        {project.items?.length || 0} items
                      </p>
                      <div className="flex items-center gap-2 text-[#595d60] text-sm mb-4">
                        <Calendar className="w-4 h-4 text-[#f9903c]" />
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#f9903c] group-hover:text-[#e88030] transition-colors text-sm font-medium">
                        <Eye className="w-4 h-4" />
                        <span>View Project</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

