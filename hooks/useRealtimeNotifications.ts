import { useEffect, useRef } from 'react'
import { useNotifications } from './useNotifications'
import { useRealtimeProject } from './useRealtimeProject'

export function useRealtimeNotifications(projectId: string) {
  const { addNotification } = useNotifications()
  const { project, logs, collaborators, isOnline, lastUpdate, loading, error, refresh } = useRealtimeProject(projectId)
  const lastLogId = useRef<string | null>(null)
  const lastProjectUpdate = useRef<Date | null>(null)

  // Track project changes (simplified for now)
  useEffect(() => {
    if (project && lastUpdate && lastUpdate !== lastProjectUpdate.current) {
      lastProjectUpdate.current = lastUpdate
      
      // Only show notification if this is a real update (not initial load)
      if (lastProjectUpdate.current) {
        addNotification({
          type: 'info',
          title: 'Project Updated',
          message: `"${project.title}" has been updated`,
          projectId: project.id,
          action: {
            label: 'View Changes',
            onClick: () => {
              // Scroll to top or refresh view
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }
        })
      }
    }
  }, [project, lastUpdate, addNotification])

  // Track new log entries (simplified)
  useEffect(() => {
    if (logs.length > 0) {
      const latestLog = logs[0]
      
      // Only notify if this is a new log entry
      if (latestLog.id !== lastLogId.current && lastLogId.current !== null) {
        lastLogId.current = latestLog.id
        
        // Determine notification type based on action
        let notificationType: 'info' | 'success' | 'warning' | 'error' = 'info'
        let title = 'Project Activity'
        let message = 'A change was made to the project'

        switch (latestLog.action) {
          case 'project_updated':
            notificationType = 'info'
            title = 'Project Updated'
            message = `"${project?.title}" was modified`
            break
          case 'project_restored':
            notificationType = 'success'
            title = 'Project Restored'
            message = `"${project?.title}" was restored to a previous version`
            break
          case 'item_added':
            notificationType = 'success'
            title = 'Item Added'
            message = 'A new item was added to the project'
            break
          case 'item_updated':
            notificationType = 'info'
            title = 'Item Updated'
            message = 'An item was modified'
            break
          case 'collaborator_added':
            notificationType = 'success'
            title = 'Collaborator Added'
            message = 'A new collaborator joined the project'
            break
          case 'collaborator_removed':
            notificationType = 'warning'
            title = 'Collaborator Removed'
            message = 'A collaborator was removed from the project'
            break
        }

        addNotification({
          type: notificationType,
          title,
          message,
          projectId: project?.id,
          action: {
            label: 'View Details',
            onClick: () => {
              // Scroll to logs section
              const logsSection = document.querySelector('[data-section="logs"]')
              if (logsSection) {
                logsSection.scrollIntoView({ behavior: 'smooth' })
              }
            }
          }
        })
      } else if (lastLogId.current === null) {
        // Set initial log ID
        lastLogId.current = latestLog.id
      }
    }
  }, [logs, project, addNotification])

  // Track connection status changes (simplified)
  useEffect(() => {
    if (!isOnline) {
      addNotification({
        type: 'warning',
        title: 'Connection Lost',
        message: 'Real-time updates are temporarily unavailable. Changes will sync when connection is restored.',
        projectId: project?.id
      })
    } else if (isOnline && lastUpdate) {
      addNotification({
        type: 'success',
        title: 'Connection Restored',
        message: 'Real-time updates are now active',
        projectId: project?.id
      })
    }
  }, [isOnline, addNotification, project?.id, lastUpdate])

  return {
    project,
    logs,
    collaborators,
    isOnline,
    lastUpdate,
    loading,
    error,
    refresh
  }
} 