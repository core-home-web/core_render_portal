'use client'

import React from 'react'
import { CheckCircle, X, AlertCircle, Info, XCircle } from 'lucide-react'
import { Button } from './button'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationProps {
  type: NotificationType
  title: string
  message?: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconColors = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
}

export function Notification({
  type,
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
}: NotificationProps) {
  const Icon = icons[type]

  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`rounded-lg border p-4 shadow-lg ${colors[type]}`}>
        <div className="flex items-start">
          <Icon className={`h-5 w-5 mt-0.5 mr-3 ${iconColors[type]}`} />
          <div className="flex-1">
            <h4 className="text-sm font-medium">{title}</h4>
            {message && (
              <p className="text-sm mt-1 opacity-90">{message}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-2 h-6 w-6 p-0 hover:bg-black/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hook for managing notifications
export function useNotification() {
  const [notifications, setNotifications] = React.useState<Array<{
    id: string
    type: NotificationType
    title: string
    message?: string
  }>>([])

  const showNotification = React.useCallback((
    type: NotificationType,
    title: string,
    message?: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { id, type, title, message }])
    return id
  }, [])

  const hideNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const showSuccess = React.useCallback((title: string, message?: string) => {
    return showNotification('success', title, message)
  }, [showNotification])

  const showError = React.useCallback((title: string, message?: string) => {
    return showNotification('error', title, message)
  }, [showNotification])

  const showWarning = React.useCallback((title: string, message?: string) => {
    return showNotification('warning', title, message)
  }, [showNotification])

  const showInfo = React.useCallback((title: string, message?: string) => {
    return showNotification('info', title, message)
  }, [showNotification])

  const NotificationContainer = React.useMemo(() => (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isVisible={true}
          onClose={() => hideNotification(notification.id)}
          duration={5000}
        />
      ))}
    </>
  ), [notifications, hideNotification])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    NotificationContainer,
  }
}
