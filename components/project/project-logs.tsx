'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supaClient'

interface ProjectLog {
  id: string
  project_id: string
  user_id: string
  action: string
  details: {
    previous_data?: any
    new_data?: any
    changes?: {
      title?: { from: string; to: string }
      retailer?: { from: string; to: string }
      items_count?: { from: number; to: number }
    }
  }
  timestamp: string
}

interface ProjectLogsProps {
  projectId: string
}

export function ProjectLogs({ projectId }: ProjectLogsProps) {
  const [logs, setLogs] = useState<ProjectLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        console.log('Fetching logs for project:', projectId)
        
        const { data, error } = await supabase
          .from('project_logs')
          .select('*')
          .eq('project_id', projectId)
          .order('timestamp', { ascending: false })

        console.log('Logs response:', { data, error })

        if (error) throw error
        setLogs(data || [])
      } catch (err) {
        console.error('Error fetching logs:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch logs')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [projectId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project History</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading logs...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading logs: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No activity logged yet.</p>
        </CardContent>
      </Card>
    )
  }

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const getChangePreview = (changes: any) => {
    const changeList = []
    if (changes?.title) changeList.push(`Title: "${changes.title.from}" → "${changes.title.to}"`)
    if (changes?.retailer) changeList.push(`Retailer: "${changes.retailer.from}" → "${changes.retailer.to}"`)
    if (changes?.items_count) changeList.push(`Items: ${changes.items_count.from} → ${changes.items_count.to}`)
    
    if (changeList.length === 0) return "No specific changes detected"
    
    const preview = changeList.slice(0, 2).join(', ')
    return changeList.length > 2 ? `${preview}...` : preview
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => {
            const isExpanded = expandedLogs.has(log.id)
            const hasChanges = log.details?.changes && Object.keys(log.details.changes).some(key => (log.details.changes as any)[key] !== null)
            
            return (
              <div key={log.id} className="border-l-2 border-blue-500 pl-4 py-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">
                      {log.action === 'project_updated' ? 'Project Updated' : log.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                    {hasChanges && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {getChangePreview(log.details.changes)}
                      </p>
                    )}
                  </div>
                  {hasChanges && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLogExpansion(log.id)}
                      className="ml-2"
                    >
                      {isExpanded ? 'Hide Details' : 'View Changes'}
                    </Button>
                  )}
                </div>
                
                {isExpanded && log.details?.changes && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-md">
                    <p className="font-medium text-sm text-muted-foreground mb-2">Detailed Changes:</p>
                    <ul className="space-y-2 text-sm">
                      {log.details.changes.title && (
                        <li className="flex items-start">
                          <span className="font-medium min-w-[60px]">Title:</span>
                          <span className="flex-1">
                            <span className="line-through text-red-600">"{log.details.changes.title.from}"</span>
                            <span className="mx-2">→</span>
                            <span className="text-green-600">"{log.details.changes.title.to}"</span>
                          </span>
                        </li>
                      )}
                      {log.details.changes.retailer && (
                        <li className="flex items-start">
                          <span className="font-medium min-w-[60px]">Retailer:</span>
                          <span className="flex-1">
                            <span className="line-through text-red-600">"{log.details.changes.retailer.from}"</span>
                            <span className="mx-2">→</span>
                            <span className="text-green-600">"{log.details.changes.retailer.to}"</span>
                          </span>
                        </li>
                      )}
                      {log.details.changes.items_count && (
                        <li className="flex items-start">
                          <span className="font-medium min-w-[60px]">Items:</span>
                          <span className="flex-1">
                            <span className="line-through text-red-600">{log.details.changes.items_count.from}</span>
                            <span className="mx-2">→</span>
                            <span className="text-green-600">{log.details.changes.items_count.to}</span>
                          </span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 