# Chapter 15: Project Management

This chapter covers the complete project management system including creating, viewing, editing, and deleting projects.

---

## Project Data Model

Projects are the core entity in the application:

```typescript
interface Project {
  id: string              // UUID
  title: string           // Project name
  retailer: string        // Client/retailer
  due_date?: string       // Target completion date
  items: Item[]           // Products to render
  user_id?: string        // Owner's ID
  created_at: string      // Creation timestamp
  updated_at: string      // Last update timestamp
}

interface Item {
  id: string
  name: string
  hero_image?: string
  parts?: Part[]
  versions?: Version[]
}

interface Part {
  id?: string
  name: string
  finish: string
  color: string
  texture: string
  files?: string[]
  annotation_data?: { x: number; y: number; id: string }
}
```

---

## useProject Hook

The main hook for project operations:

```typescript
// File: hooks/useProject.ts

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supaClient'
import { Project, CreateProjectData } from '@/types'

export function useProject() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Create a new project
   */
  const createProject = async (data: CreateProjectData): Promise<Project | null> => {
    setLoading(true)
    setError(null)

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session found')

      // Add user_id to project data
      const projectData = {
        ...data,
        user_id: session.user.id,
      }

      // Insert project
      const { data: project, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (error) throw error
      return project
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
      return null
    } finally {
      setLoading(false)
    }
  }

  /**
   * Get all projects for current user (owned + shared)
   */
  const getProjects = useCallback(async (): Promise<Project[]> => {
    setLoading(true)
    setError(null)

    try {
      // Use database function for proper access control
      const { data: projects, error } = await supabase.rpc('get_user_projects')

      if (error) throw error

      // Map RPC response to Project type
      return (projects || []).map((p: any) => ({
        id: p.project_id || p.id,
        title: p.project_title || p.title,
        retailer: p.project_retailer || p.retailer,
        due_date: p.due_date,
        items: p.project_items || p.items || [],
        user_id: p.project_user_id || p.user_id,
        created_at: p.project_created_at || p.created_at,
        updated_at: p.project_updated_at || p.updated_at,
        // Additional fields
        project_id: p.project_id,
        project_title: p.project_title,
        is_owner: p.is_owner,
        permission_level: p.permission_level,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get single project by ID with access check
   */
  const getProject = useCallback(async (id: string): Promise<Project | null> => {
    setLoading(true)
    setError(null)

    try {
      const { data: projectData, error } = await supabase.rpc(
        'get_user_project',
        { p_project_id: id }
      )

      if (error) throw error

      if (!projectData || projectData.length === 0) {
        throw new Error('Project not found or access denied')
      }

      const project = projectData[0]

      return {
        id: project.id,
        title: project.title,
        retailer: project.retailer,
        due_date: project.due_date,
        items: project.items || [],
        user_id: project.user_id,
        created_at: project.created_at,
        updated_at: project.updated_at,
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Restore project to previous version
   */
  const restoreProject = useCallback(
    async (projectId: string, logId: string): Promise<Project | null> => {
      setLoading(true)
      setError(null)

      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) throw new Error('No session found')

        // Get log entry with previous data
        const { data: logEntry, error: logError } = await supabase
          .from('project_logs')
          .select('*')
          .eq('id', logId)
          .eq('project_id', projectId)
          .single()

        if (logError) throw logError
        if (!logEntry) throw new Error('Log entry not found')

        const previousData = logEntry.details?.previous_data
        if (!previousData) {
          throw new Error('No previous data available')
        }

        // Update project with previous data
        const { data: restoredProjectData, error: updateError } =
          await supabase.rpc('update_user_project', {
            p_project_id: projectId,
            p_title: previousData.title,
            p_retailer: previousData.retailer,
            p_items: previousData.items,
          })

        if (updateError) throw updateError

        // Log the restore action
        await supabase.from('project_logs').insert([{
          project_id: projectId,
          user_id: session.user.id,
          action: 'project_restored',
          details: {
            restored_from_log_id: logId,
          },
          timestamp: new Date().toISOString(),
        }])

        const rawProject = restoredProjectData[0]
        return {
          id: rawProject.project_id,
          title: rawProject.project_title,
          retailer: rawProject.project_retailer,
          items: rawProject.project_items,
          user_id: rawProject.project_user_id,
          created_at: rawProject.project_created_at,
          updated_at: rawProject.project_updated_at,
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to restore project')
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    createProject,
    getProjects,
    getProject,
    restoreProject,
    loading,
    error,
  }
}
```

---

## Dashboard Page

The main projects list:

```typescript
// File: app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, Eye } from 'lucide-react'
import { useProject } from '@/hooks/useProject'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { Project } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ThemedButton } from '@/components/ui/themed-button'
import { formatDateForDisplay } from '@/lib/date-utils'

export default function DashboardPage() {
  const { getProjects, loading, error } = useProject()
  const [projects, setProjects] = useState<Project[]>([])
  const { user, loading: authLoading, signOut } = useAuth()
  const { colors } = useTheme()
  const router = useRouter()

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        const projectsData = await getProjects()
        setProjects(projectsData)
      }
    }
    fetchProjects()
  }, [user, getProjects])

  // Refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        getProjects().then(setProjects)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, getProjects])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Loading states
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070e0e]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  // Calculate statistics
  const totalProjects = projects.length
  const inProgressProjects = projects.filter((p: any) => p.status === 'in_progress').length
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length

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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1a1e1f] rounded-2xl p-6">
            <h3 className="text-[#595d60] text-sm mb-2">Total Projects</h3>
            <p className="text-3xl font-bold">{totalProjects}</p>
          </div>
          <div className="bg-[#1a1e1f] rounded-2xl p-6">
            <h3 className="text-[#595d60] text-sm mb-2">In Progress</h3>
            <p className="text-3xl font-bold" style={{ color: colors.primary }}>
              {inProgressProjects}
            </p>
          </div>
          <div className="bg-[#1a1e1f] rounded-2xl p-6">
            <h3 className="text-[#595d60] text-sm mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-400">{completedProjects}</p>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-[#1a1e1f] rounded-2xl p-12 text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Plus className="w-8 h-8" style={{ color: colors.primary }} />
            </div>
            <p className="text-[#595d60] mb-4">
              No projects found. Create your first project to get started.
            </p>
            <Link href="/project/new">
              <ThemedButton variant="primary">Create Project</ThemedButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <div
                key={project.project_id || project.id}
                className="bg-[#1a1e1f] rounded-2xl p-6 hover:bg-[#222a31] transition-colors cursor-pointer"
                onClick={() => router.push(`/project/${project.project_id || project.id}`)}
              >
                {/* Badge */}
                <div className="flex items-start justify-between mb-4">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                    style={{ 
                      backgroundColor: project.is_owner ? colors.primaryLight : 'rgba(249, 144, 60, 0.1)',
                      color: project.is_owner ? colors.primary : '#f9903c'
                    }}
                  >
                    {project.is_owner ? 'Owner' : project.permission_level}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-medium mb-4 line-clamp-1">
                  {project.project_title || project.title}
                </h2>

                {/* Details */}
                <div className="mb-4">
                  <p className="text-sm text-[#595d60] mb-1">
                    Retailer: {project.project_retailer || project.retailer}
                  </p>
                  <p className="text-sm text-[#595d60]">
                    {(project.project_items || project.items || [])?.length || 0} items
                  </p>
                </div>

                {/* Dates */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-[#595d60] text-sm">
                    <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
                    <span>Created: {formatDateForDisplay(project.project_created_at || project.created_at)}</span>
                  </div>
                  {project.due_date && (
                    <div className="flex items-center gap-2 text-[#595d60] text-sm">
                      <Calendar className="w-4 h-4" style={{ color: colors.primary }} />
                      <span>Due: {formatDateForDisplay(project.due_date)}</span>
                    </div>
                  )}
                </div>

                {/* View link */}
                <div 
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ color: colors.primary }}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Project →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
```

---

## Project View Page

Individual project view with editing:

```typescript
// File: app/project/[id]/page.tsx (simplified)

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProject } from '@/hooks/useProject'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { Project } from '@/types'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { EditProjectForm } from '@/components/project/edit-project-form'
import { CollaboratorsList } from '@/components/project/collaborators-list'
import { ProjectLogs } from '@/components/project/project-logs'
import { ArrowLeft, Brush, Users, History } from 'lucide-react'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const { getProject, loading, error } = useProject()
  const { user, loading: authLoading, signOut } = useAuth()
  const { colors } = useTheme()
  
  const [project, setProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'collaborators' | 'history'>('details')

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Fetch project
  useEffect(() => {
    if (user && projectId) {
      getProject(projectId).then(setProject)
    }
  }, [user, projectId, getProject])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070e0e]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  if (error || !project) {
    return (
      <DashboardLayout user={user} onSignOut={handleSignOut}>
        <div className="p-8 text-white">
          <p className="text-red-400">{error || 'Project not found'}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-[#38bdbb]"
          >
            ← Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} onSignOut={handleSignOut}>
      <div className="p-8 lg:p-12 text-white">
        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 mb-6 transition-colors"
          style={{ color: colors.primary }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium">{project.title}</h1>
          <p className="text-[#595d60]">Retailer: {project.retailer}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'details' 
                ? 'border-b-2' 
                : 'text-[#595d60] hover:text-white'
            }`}
            style={{ 
              borderColor: activeTab === 'details' ? colors.primary : 'transparent',
              color: activeTab === 'details' ? colors.primary : undefined
            }}
          >
            <Brush className="w-4 h-4 inline mr-2" />
            Details
          </button>
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'collaborators' 
                ? 'border-b-2' 
                : 'text-[#595d60] hover:text-white'
            }`}
            style={{ 
              borderColor: activeTab === 'collaborators' ? colors.primary : 'transparent',
              color: activeTab === 'collaborators' ? colors.primary : undefined
            }}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Collaborators
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'history' 
                ? 'border-b-2' 
                : 'text-[#595d60] hover:text-white'
            }`}
            style={{ 
              borderColor: activeTab === 'history' ? colors.primary : 'transparent',
              color: activeTab === 'history' ? colors.primary : undefined
            }}
          >
            <History className="w-4 h-4 inline mr-2" />
            History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <EditProjectForm 
            project={project} 
            onUpdate={(updated) => setProject(updated)}
          />
        )}
        {activeTab === 'collaborators' && (
          <CollaboratorsList projectId={projectId} />
        )}
        {activeTab === 'history' && (
          <ProjectLogs 
            projectId={projectId}
            onRestore={(restored) => setProject(restored)}
          />
        )}

        {/* Whiteboard Link */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <button
            onClick={() => router.push(`/project/${projectId}/whiteboard`)}
            className="w-full p-6 bg-[#1a1e1f] rounded-2xl text-left hover:bg-[#222a31] transition-colors"
          >
            <h3 className="text-xl font-medium mb-2">Open Whiteboard</h3>
            <p className="text-[#595d60]">
              Collaborate visually with Excalidraw
            </p>
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
```

---

## Deleting Projects

Project deletion with confirmation:

```typescript
// In project view or dashboard
const handleDelete = async (projectId: string) => {
  if (!confirm('Are you sure you want to delete this project?')) {
    return
  }

  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) throw error
    
    // Redirect to dashboard
    router.push('/dashboard')
  } catch (err) {
    console.error('Delete failed:', err)
    alert('Failed to delete project')
  }
}
```

---

## Chapter Summary

Project management includes:

1. **useProject hook** - All project operations
2. **Dashboard** - List all accessible projects
3. **Project view** - View and edit individual projects
4. **Statistics** - Project counts by status
5. **Restoration** - Restore from history

Key patterns:
- Use RPC functions for access control
- Handle loading and error states
- Refresh data on visibility change
- Support both owned and shared projects

---

*Next: [Chapter 16: Multi-Step Forms](./chapter-16-multi-step-forms.md) - Form wizard implementation*
