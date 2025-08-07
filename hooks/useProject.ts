import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supaClient'
import { Project, CreateProjectData } from '@/types'

export function useProject() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProject = async (data: CreateProjectData): Promise<Project | null> => {
    setLoading(true)
    setError(null)
    
    try {
      // Get current session to get user ID
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      // Add user_id to the project data
      const projectData = {
        ...data,
        user_id: session.user.id
      }

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

  const getProjects = useCallback(async (): Promise<Project[]> => {
    setLoading(true)
    setError(null)
    
    try {
      // Use the database function to get all projects user has access to
      const { data: projects, error } = await supabase.rpc('get_user_projects')

      if (error) {
        throw error
      }
      
      return projects || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const getProject = useCallback(async (id: string): Promise<Project | null> => {
    setLoading(true)
    setError(null)
    
    try {
      // Use the new RPC function to get project details with proper access control
      const { data: projectData, error } = await supabase.rpc('get_user_project', {
        p_project_id: id
      })

      if (error) {
        throw error
      }

      if (!projectData || projectData.length === 0) {
        throw new Error('Project not found or access denied')
      }

      const project = projectData[0]
      
      // Convert the project format to match the Project type
      const projectResult: Project = {
        id: project.id,
        title: project.title,
        retailer: project.retailer,
        items: project.items || [],
        user_id: project.user_id,
        created_at: project.created_at,
        updated_at: project.updated_at,
      }

      return projectResult
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const restoreProject = useCallback(async (projectId: string, logId: string): Promise<Project | null> => {
    setLoading(true)
    setError(null)
    
    try {
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      // Get the specific log entry to restore from
      const { data: logEntry, error: logError } = await supabase
        .from('project_logs')
        .select('*')
        .eq('id', logId)
        .eq('project_id', projectId)
        .single()

      if (logError) throw logError
      if (!logEntry) throw new Error('Log entry not found')

      // Get the previous data from the log entry
      const previousData = logEntry.details?.previous_data
      if (!previousData) {
        throw new Error('No previous data available for this version')
      }

      // Update the project with the previous data
      const { data: restoredProject, error: updateError } = await supabase
        .from('projects')
        .update({
          title: previousData.title,
          retailer: previousData.retailer,
          items: previousData.items,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single()

      if (updateError) throw updateError

      // Log the restore action
      const restoreLogData = {
        project_id: projectId,
        user_id: session.user.id,
        action: 'project_restored',
        details: {
          previous_data: restoredProject,
          new_data: previousData,
          restored_from_log_id: logId,
          changes: {
            title: restoredProject.title !== previousData.title ? { from: restoredProject.title, to: previousData.title } : null,
            retailer: restoredProject.retailer !== previousData.retailer ? { from: restoredProject.retailer, to: previousData.retailer } : null,
            items_count: restoredProject.items.length !== previousData.items.length ? { from: restoredProject.items.length, to: previousData.items.length } : null
          }
        },
        timestamp: new Date().toISOString()
      }

      const { error: restoreLogError } = await supabase
        .from('project_logs')
        .insert([restoreLogData])

      if (restoreLogError) {
        console.error('Failed to log restore action:', restoreLogError)
      }

      return restoredProject
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore project')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createProject,
    getProjects,
    getProject,
    restoreProject,
    loading,
    error,
  }
} 