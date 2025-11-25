'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { supabase } from '@/lib/supaClient'
import { ProjectLog } from '@/types'
import { formatDateForDisplay } from '@/lib/date-utils'

interface ProjectLogsProps {
  projectId: string
  onProjectRestored?: () => void
  refreshTrigger?: number // When this changes, refresh logs
}

export function ProjectLogs({
  projectId,
  onProjectRestored,
  refreshTrigger,
}: ProjectLogsProps) {
  const [logs, setLogs] = useState<ProjectLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [restoreDialog, setRestoreDialog] = useState<{
    isOpen: boolean
    logId: string
    logAction: string
    timestamp: string
  }>({
    isOpen: false,
    logId: '',
    logAction: '',
    timestamp: '',
  })

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        console.log('Fetching logs for project:', projectId)

        // Fetch logs first
        const { data: logsData, error: logsError } = await supabase
          .from('project_logs')
          .select('*')
          .eq('project_id', projectId)
          .order('timestamp', { ascending: false })

        if (logsError) {
          console.error('❌ Error fetching logs:', logsError)
          console.error('Logs error details:', {
            code: logsError.code,
            message: logsError.message,
            details: logsError.details,
            hint: logsError.hint,
          })
          throw logsError
        }

        console.log('📋 Fetched logs:', logsData?.length || 0, 'entries')

        // Fetch user profiles separately for each unique user_id
        const userIds = Array.from(new Set((logsData || []).map(log => log.user_id).filter(Boolean)))
        const userProfilesMap = new Map()

        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('user_profiles')
            .select('user_id, display_name')
            .in('user_id', userIds)

          if (!profilesError && profilesData) {
            profilesData.forEach(profile => {
              userProfilesMap.set(profile.user_id, profile)
            })
          }
        }

        // Combine logs with user profile data
        const data = (logsData || []).map(log => ({
          ...log,
          user_profiles: userProfilesMap.get(log.user_id) || null
        }))

        console.log('Logs response:', { data })
        setLogs(data || [])
      } catch (err) {
        console.error('Error fetching logs:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch logs')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [projectId, refreshTrigger])

  const handleRestore = async () => {
    try {
      // Get current session for auth
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      // Get the specific log entry to restore from
      const { data: logEntry, error: logError } = await supabase
        .from('project_logs')
        .select('*')
        .eq('id', restoreDialog.logId)
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
          updated_at: new Date().toISOString(),
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
          restored_from_log_id: restoreDialog.logId,
          changes: {
            title:
              restoredProject.title !== previousData.title
                ? { from: restoredProject.title, to: previousData.title }
                : null,
            retailer:
              restoredProject.retailer !== previousData.retailer
                ? { from: restoredProject.retailer, to: previousData.retailer }
                : null,
            items_count:
              restoredProject.items.length !== previousData.items.length
                ? {
                    from: restoredProject.items.length,
                    to: previousData.items.length,
                  }
                : null,
          },
        },
        timestamp: new Date().toISOString(),
      }

      const { error: restoreLogError } = await supabase
        .from('project_logs')
        .insert([restoreLogData])

      if (restoreLogError) {
        console.error('Failed to log restore action:', restoreLogError)
      }

      // Refresh logs and notify parent component
      const { data: updatedLogs, error: refreshError } = await supabase
        .from('project_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: false })

      if (!refreshError) {
        setLogs(updatedLogs || [])
      }

      onProjectRestored?.()
    } catch (err) {
      console.error('Error restoring project:', err)
      setError(err instanceof Error ? err.message : 'Failed to restore project')
    }
  }

  const openRestoreDialog = (
    logId: string,
    action: string,
    timestamp: string
  ) => {
    setRestoreDialog({
      isOpen: true,
      logId,
      logAction: action,
      timestamp,
    })
  }

  const closeRestoreDialog = () => {
    setRestoreDialog({
      isOpen: false,
      logId: '',
      logAction: '',
      timestamp: '',
    })
  }

  if (loading) {
    return (
      <Card className="bg-[#1a1e1f] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Project History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#595d60]">Loading logs...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-[#1a1e1f] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Project History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400">Error loading logs: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (logs.length === 0) {
    return (
      <Card className="bg-[#1a1e1f] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Project History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[#595d60]">No activity logged yet.</p>
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
    if (changes?.title)
      changeList.push(`Title: "${changes.title.from}" → "${changes.title.to}"`)
    if (changes?.retailer)
      changeList.push(
        `Retailer: "${changes.retailer.from}" → "${changes.retailer.to}"`
      )
    if (changes?.items_count)
      changeList.push(
        `Items: ${changes.items_count.from} → ${changes.items_count.to}`
      )

    // Display detailed item and part changes
    Object.keys(changes).forEach((key) => {
      if (key.startsWith('item_') && changes[key]) {
        const change = changes[key]
        if (key.includes('_name')) {
          changeList.push(`Item Name: "${change.from}" → "${change.to}"`)
        } else if (key.includes('_hero_image')) {
          changeList.push(`Item Image: "${change.from}" → "${change.to}"`)
        } else if (key.includes('_parts_count')) {
          changeList.push(`Item Parts: ${change.from} → ${change.to}`)
        } else if (key.includes('_part_') && key.includes('_name')) {
          changeList.push(`Part Name: "${change.from}" → "${change.to}"`)
        } else if (key.includes('_part_') && key.includes('_finish')) {
          changeList.push(`Part Finish: "${change.from}" → "${change.to}"`)
        } else if (key.includes('_part_') && key.includes('_color')) {
          changeList.push(`Part Color: "${change.from}" → "${change.to}"`)
        } else if (key.includes('_part_') && key.includes('_texture')) {
          changeList.push(`Part Texture: "${change.from}" → "${change.to}"`)
        }
      }
    })

    if (changeList.length === 0) return 'No specific changes detected'

    const preview = changeList.slice(0, 2).join(', ')
    return changeList.length > 2 ? `${preview}...` : preview
  }

  const canRestore = (log: ProjectLog) => {
    // Can only restore from project_updated actions that have previous_data
    return log.action === 'project_updated' && log.details?.previous_data
  }

  return (
    <>
      <Card className="bg-[#1a1e1f] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Project History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => {
              const isExpanded = expandedLogs.has(log.id)
              const hasChanges =
                log.details?.changes &&
                Object.keys(log.details.changes).some(
                  (key) => (log.details.changes as any)[key] !== null
                )
              const isDueDateUpdate = log.action === 'due_date_updated'
              const hasDueDateDetails = isDueDateUpdate && (log.details?.previous_due_date !== undefined || log.details?.new_due_date !== undefined)
              const canRestoreThis = canRestore(log)
              
              // Get user display name
              const userProfile = (log as any).user_profiles
              const changedBy = log.details?.changed_by || userProfile?.display_name || 'Unknown user'

              return (
                <div
                  key={log.id}
                  className="border-l-2 border-[#38bdbb] pl-4 py-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {log.action === 'project_updated'
                          ? 'Project Updated'
                          : log.action === 'project_restored'
                            ? 'Project Restored'
                            : log.action === 'due_date_updated'
                              ? 'Due Date Updated'
                              : log.action}
                      </p>
                      <p className="text-sm text-[#595d60]">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {isDueDateUpdate && hasDueDateDetails && (
                        <div className="text-sm text-[#595d60] mt-1 space-y-1">
                          <p>
                            <span className="font-medium text-white">Changed by:</span> <span className="text-white">{changedBy}</span>
                          </p>
                          <p>
                            <span className="font-medium text-white">From:</span>{' '}
                            <span className="line-through text-red-400">
                              {formatDateForDisplay(log.details?.previous_due_date)}
                            </span>
                            {' '}→{' '}
                            <span className="text-green-400 font-medium">
                              {formatDateForDisplay(log.details?.new_due_date)}
                            </span>
                          </p>
                        </div>
                      )}
                      {hasChanges && !isDueDateUpdate && (
                        <p className="text-sm text-[#595d60] mt-1">
                          {getChangePreview(log.details.changes)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {(hasChanges || hasDueDateDetails) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLogExpansion(log.id)}
                          className="text-white hover:bg-[#222a31]"
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </Button>
                      )}
                      {canRestoreThis && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openRestoreDialog(log.id, log.action, log.timestamp)
                          }
                          className="border-gray-700 text-white hover:bg-[#222a31]"
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 p-3 bg-[#0d1117] rounded-md border border-gray-700">
                      {isDueDateUpdate && hasDueDateDetails ? (
                        <div className="space-y-2 text-sm">
                          <p className="font-medium text-sm text-white mb-2">
                            Due Date Change Details:
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <span className="font-medium min-w-[100px] text-white">Changed by:</span>
                              <span className="flex-1 text-white">{changedBy}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-medium min-w-[100px] text-white">Previous date:</span>
                              <span className="flex-1 line-through text-red-400">
                                {formatDateForDisplay(log.details?.previous_due_date)}
                              </span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-medium min-w-[100px] text-white">New date:</span>
                              <span className="flex-1 text-green-400 font-medium">
                                {formatDateForDisplay(log.details?.new_due_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : log.details?.changes ? (
                        <>
                          <p className="font-medium text-sm text-white mb-2">
                            Detailed Changes:
                          </p>
                          <ul className="space-y-2 text-sm">
                        {log.details.changes.title && (
                          <li className="flex items-start">
                            <span className="font-medium min-w-[60px] text-white">
                              Title:
                            </span>
                            <span className="flex-1">
                              <span className="line-through text-red-400">
                                "{log.details.changes.title.from}"
                              </span>
                              <span className="mx-2 text-[#595d60]">→</span>
                              <span className="text-green-400">
                                "{log.details.changes.title.to}"
                              </span>
                            </span>
                          </li>
                        )}
                        {log.details.changes.retailer && (
                          <li className="flex items-start">
                            <span className="font-medium min-w-[60px] text-white">
                              Retailer:
                            </span>
                            <span className="flex-1">
                              <span className="line-through text-red-400">
                                "{log.details.changes.retailer.from}"
                              </span>
                              <span className="mx-2 text-[#595d60]">→</span>
                              <span className="text-green-400">
                                "{log.details.changes.retailer.to}"
                              </span>
                            </span>
                          </li>
                        )}
                        {log.details.changes.items_count && (
                          <li className="flex items-start">
                            <span className="font-medium min-w-[60px] text-white">
                              Items:
                            </span>
                            <span className="flex-1">
                              <span className="line-through text-red-400">
                                {log.details.changes.items_count.from}
                              </span>
                              <span className="mx-2 text-[#595d60]">→</span>
                              <span className="text-green-400">
                                {log.details.changes.items_count.to}
                              </span>
                            </span>
                          </li>
                        )}

                        {/* Display detailed item and part changes */}
                        {log.details.changes &&
                          Object.keys(log.details.changes).map((key) => {
                            if (
                              key.startsWith('item_') &&
                              (log.details.changes as any)[key]
                            ) {
                              const change = (log.details.changes as any)[key]
                              let label = ''
                              let fromValue = change.from
                              let toValue = change.to

                              if (key.includes('_name')) {
                                label = 'Item Name'
                              } else if (key.includes('_hero_image')) {
                                label = 'Item Image'
                              } else if (key.includes('_parts_count')) {
                                label = 'Item Parts'
                              } else if (
                                key.includes('_part_') &&
                                key.includes('_name')
                              ) {
                                label = 'Part Name'
                              } else if (
                                key.includes('_part_') &&
                                key.includes('_finish')
                              ) {
                                label = 'Part Finish'
                              } else if (
                                key.includes('_part_') &&
                                key.includes('_color')
                              ) {
                                label = 'Part Color'
                              } else if (
                                key.includes('_part_') &&
                                key.includes('_texture')
                              ) {
                                label = 'Part Texture'
                              }

                              if (label) {
                                return (
                                  <li key={key} className="flex items-start">
                                    <span className="font-medium min-w-[80px] text-white">
                                      {label}:
                                    </span>
                                    <span className="flex-1">
                                      <span className="line-through text-red-400">
                                        "{fromValue}"
                                      </span>
                                      <span className="mx-2 text-[#595d60]">→</span>
                                      <span className="text-green-400">
                                        "{toValue}"
                                      </span>
                                    </span>
                                  </li>
                                )
                              }
                            }
                            return null
                          })}
                          </ul>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={restoreDialog.isOpen}
        onClose={closeRestoreDialog}
        onConfirm={handleRestore}
        title="Restore Project Version"
        description={`Are you sure you want to restore this project to its state from ${new Date(restoreDialog.timestamp).toLocaleString()}? This action cannot be undone.`}
        confirmText="Restore"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  )
}
