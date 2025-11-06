'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, MoreVertical, Plus, Eye } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { Project } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ThemedButton } from '@/components/ui/themed-button'

export default function DashboardPage() {
  const { getProjects, loading, error } = useProject()
  const [projects, setProjects] = useState<Project[]>([])
  const { user, loading: authLoading, signOut } = useAuth()
  const { colors } = useTheme()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070e0e]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  if (loading) {
    return (
      <DashboardLayout user={user} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center h-screen">
          <p className="text-white">Loading projects...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout user={user} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </DashboardLayout>
    )
  }

  // Calculate statistics
  const totalProjects = projects.length
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length
  const inProgressProjects = projects.filter((p: any) => p.status === 'in_progress').length

  return (
    <DashboardLayout user={user} onSignOut={handleSignOut}>
      <div className="p-8 lg:p-12 text-white">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-4">
        <div>
              <h1 className="text-4xl font-medium mb-3">Manage your projects</h1>
              <p className="text-[#595d60] text-base">
                Track your projects, tasks & team activity here
            </p>
        </div>
          <Link href="/project/new">
              <ThemedButton variant="primary" size="md">
                <Plus className="w-4 h-4 mr-2" />
                <span>New Project</span>
              </ThemedButton>
          </Link>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Overall Information Card */}
          <div className="bg-[#1a1e1f] rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-medium">Overall Information</h2>
              <button className="text-[#595d60] hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-3xl font-medium border-r border-gray-700 pr-4">
                {totalProjects}
              </h2>
              <h2 className="text-3xl font-medium text-[#595d60]">
                {projects.filter((p: any) => p.items?.length > 0).length}
              </h2>
              <p className="text-sm text-[#595d60]">tasks done</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-4" style={{ background: `linear-gradient(to bottom right, ${colors.primaryDark}, ${colors.primaryLight})` }}>
                <div className="w-10 h-10 rounded-lg mb-3" style={{ backgroundColor: colors.primaryDark }}></div>
                <h2 className="text-2xl font-medium mb-1">{inProgressProjects}</h2>
                <p className="text-sm text-[#595d60]">In Progress</p>
              </div>
              <div className="bg-gradient-to-br from-[#f9903c]/20 to-[#f9903c]/5 rounded-xl p-4">
                <div className="w-10 h-10 bg-[#f9903c]/20 rounded-lg mb-3"></div>
                <h2 className="text-2xl font-medium mb-1">{completedProjects}</h2>
                <p className="text-sm text-[#595d60]">Completed</p>
              </div>
        </div>
      </div>

          {/* Recent Projects */}
      {projects.length === 0 ? (
            <div className="bg-[#1a1e1f] rounded-2xl p-6 flex flex-col items-center justify-center text-center col-span-full">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.primaryLight }}>
                <Plus className="w-8 h-8" style={{ color: colors.primary }} />
              </div>
              <p className="text-[#595d60] mb-4">
              No projects found. Create your first project to get started.
            </p>
            <Link href="/project/new">
                <ThemedButton variant="primary">
                  Create Project
                </ThemedButton>
            </Link>
                  </div>
          ) : (
            projects.slice(0, 2).map((project: any) => (
              <div
                key={project.project_id}
                className="bg-[#1a1e1f] rounded-2xl p-6 hover:bg-[#222a31] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm" style={{ backgroundColor: colors.primaryLight, color: colors.primary }}>
                    #{project.is_owner ? 'Owner' : project.permission_level}
                  </div>
                  <button className="text-[#595d60] hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-xl font-medium mb-4 line-clamp-1">
                  {project.project_title}
                </h2>
                <div className="mb-4">
                  <p className="text-sm text-[#595d60] mb-1">
                    Retailer: {project.project_retailer}
                  </p>
                  <p className="text-sm text-[#595d60]">
                    {project.items?.length || 0} items
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#595d60] text-sm mb-4">
                  <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                <Link
                  href={`/project/${project.project_id}`}
                  className="flex items-center gap-2 transition-colors text-sm font-medium"
                  style={{ color: colors.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primaryHover}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.primary}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Project</span>
                </Link>
              </div>
            ))
          )}
        </div>

        {/* All Projects Table */}
        {projects.length > 0 && (
          <div className="bg-[#1a1e1f] rounded-2xl p-6">
            <h2 className="text-2xl font-medium mb-6">All Projects</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
                      Project Name
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
                      Retailer
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
                      Items
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
                      Created
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-medium text-[#595d60]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project: any) => (
                    <tr
                      key={project.project_id}
                      className="border-b border-gray-800 hover:bg-[#222a31] transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-medium" style={{ backgroundColor: colors.primaryLight, color: colors.primary }}>
                            {project.project_title[0].toUpperCase()}
                          </div>
                          <span className="font-medium">{project.project_title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#595d60]">
                        {project.project_retailer}
                      </td>
                      <td className="py-4 px-4 text-[#595d60]">
                        {project.items?.length || 0}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className="inline-flex px-3 py-1 rounded-full text-xs font-medium"
                          style={project.is_owner ? {
                            backgroundColor: colors.primaryLight,
                            color: colors.primary
                          } : {
                            backgroundColor: 'rgba(249, 144, 60, 0.1)',
                            color: '#f9903c'
                          }}
                        >
                          {project.is_owner ? 'Owner' : project.permission_level}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#595d60]">
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          href={`/project/${project.project_id}`}
                          className="transition-colors text-sm font-medium"
                          style={{ color: colors.primary }}
                          onMouseEnter={(e) => e.currentTarget.style.color = colors.primaryHover}
                          onMouseLeave={(e) => e.currentTarget.style.color = colors.primary}
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  )
}
