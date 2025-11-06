'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Eye,
  TrendingUp,
  Package,
  Clock,
  Users as UsersIcon,
  AlertCircle,
} from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { useAuth } from '@/lib/auth-context'
import { Project } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function ProgressPage() {
  const { getProjects, loading, error } = useProject()
  const [projects, setProjects] = useState<Project[]>([])
  const { user, loading: authLoading, signOut } = useAuth()
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

  // Filter for in-progress projects (those with items but not marked complete)
  // You can extend this logic based on your status tracking
  const inProgressProjects = projects.filter(
    (p: any) => p.items && p.items.length > 0 && p.status !== 'completed'
  )

  const totalItems = inProgressProjects.reduce(
    (sum: number, p: any) => sum + (p.items?.length || 0),
    0
  )

  return (
    <DashboardLayout user={user} onSignOut={handleSignOut}>
      <div className="p-8 lg:p-12 text-white">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-medium mb-3">Project Progress</h1>
              <p className="text-[#595d60] text-base">
                Track active projects being worked on by the Industrial Design team
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1a1e1f] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#f9903c]/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#f9903c]" />
              </div>
              <div>
                <p className="text-sm text-[#595d60]">In Progress</p>
                <h3 className="text-3xl font-medium">{inProgressProjects.length}</h3>
              </div>
            </div>
            <p className="text-xs text-[#595d60]">
              Projects currently being worked on
            </p>
          </div>

          <div className="bg-[#1a1e1f] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#38bdbb]/10 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-[#38bdbb]" />
              </div>
              <div>
                <p className="text-sm text-[#595d60]">Total Items</p>
                <h3 className="text-3xl font-medium">{totalItems}</h3>
              </div>
            </div>
            <p className="text-xs text-[#595d60]">
              Items across all active projects
            </p>
          </div>

          <div className="bg-[#1a1e1f] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#f9903c]/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#f9903c]" />
              </div>
              <div>
                <p className="text-sm text-[#595d60]">Industrial Design</p>
                <h3 className="text-3xl font-medium">{inProgressProjects.length}</h3>
              </div>
            </div>
            <p className="text-xs text-[#595d60]">
              Projects with Industrial Design team
            </p>
          </div>
        </div>

        {/* In Progress Projects */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-[#38bdbb] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl">
            Error: {error}
          </div>
        ) : inProgressProjects.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1e1f] rounded-2xl">
            <AlertCircle className="w-16 h-16 text-[#595d60] mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Active Projects</h3>
            <p className="text-[#595d60] mb-6">
              No projects are currently in progress
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-[#38bdbb] hover:bg-[#2ea9a7] text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              View All Projects
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-[#f9903c] rounded-full"></div>
              <h2 className="text-2xl font-medium">
                Active Projects ({inProgressProjects.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressProjects.map((project: any) => (
                <Link
                  key={project.project_id}
                  href={`/project/${project.project_id}`}
                  className="bg-[#1a1e1f] rounded-2xl p-6 hover:bg-[#222a31] transition-colors group relative overflow-hidden"
                >
                  {/* Progress Indicator */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#222a31]">
                    <div className="h-full bg-[#f9903c] w-2/3 animate-pulse"></div>
                  </div>

                  <div className="flex items-start justify-between mb-4 mt-2">
                    <span className="inline-flex px-3 py-1 rounded-full bg-[#f9903c]/10 text-[#f9903c] text-xs font-medium">
                      In Progress
                    </span>
                    {project.is_owner ? (
                      <span className="inline-flex px-2 py-1 rounded-full bg-[#38bdbb]/10 text-[#38bdbb] text-xs">
                        Owner
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs">
                        Collaborator
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-medium text-white mb-2 line-clamp-1">
                    {project.project_title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-[#595d60]">
                      Retailer: {project.project_retailer}
                    </p>
                    <p className="text-sm text-[#595d60]">
                      {project.items?.length || 0} items configured
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[#595d60] text-sm mb-4">
                    <Calendar className="w-4 h-4 text-[#f9903c]" />
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[#f9903c] group-hover:text-[#e88030] transition-colors text-sm font-medium">
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

