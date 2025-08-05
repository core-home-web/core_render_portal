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
      const { data: project, error } = await supabase
        .from('projects')
        .insert([data])
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
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

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
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return project
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createProject,
    getProjects,
    getProject,
    loading,
    error,
  }
} 