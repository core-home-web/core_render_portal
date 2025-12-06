import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supaClient'
import { Project, ProjectLog } from '@/types'

interface RealtimeProjectData {
  project: Project | null
  logs: ProjectLog[]
  collaborators: any[]
  isOnline: boolean
  lastUpdate: Date | null
}

export function useRealtimeProject(projectId: string) {
  const [data, setData] = useState<RealtimeProjectData>({
    project: null,
    logs: [],
    collaborators: [],
    isOnline: false,
    lastUpdate: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch project data
      const { data: projectData, error: projectError } = await supabase.rpc(
        'get_user_project',
        {
          p_project_id: projectId,
        }
      )

      if (projectError) throw projectError

      // Fetch logs
      const { data: logsData, error: logsError } = await supabase
        .from('project_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: false })
        .limit(50)

      if (logsError) throw logsError

      // Fetch collaborators - try RPC function first
      let collaboratorsData: any[] = []
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_project_collaborators_with_users',
        { p_project_id: projectId }
      )

      if (!rpcError && rpcData) {
        collaboratorsData = rpcData
      } else {
        // Fallback to view (may fail with 406, that's okay)
        const { data: viewData, error: viewError } = await supabase
          .from('project_collaborators_with_users')
          .select('*')
          .eq('project_id', projectId)

        // Only throw if it's not a 406 error (which is expected)
        if (viewError && viewError.code !== '406') {
          throw viewError
        }

        if (viewData) {
          collaboratorsData = viewData
        }
      }

      setData({
        project: projectData?.[0] || null,
        logs: logsData || [],
        collaborators: collaboratorsData || [],
        isOnline: true,
        lastUpdate: new Date(),
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch project data'
      )
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Set up real-time subscriptions (simplified for now)
  useEffect(() => {
    if (!projectId) return

    // Fetch initial data
    fetchInitialData()

    // For now, just set up a simple polling mechanism
    // We'll add real-time subscriptions back later
    const interval = setInterval(() => {
      fetchInitialData()
    }, 30000) // Poll every 30 seconds

    return () => {
      clearInterval(interval)
    }
  }, [projectId, fetchInitialData])

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchInitialData()
  }, [fetchInitialData])

  return {
    ...data,
    loading,
    error,
    refresh,
  }
}
