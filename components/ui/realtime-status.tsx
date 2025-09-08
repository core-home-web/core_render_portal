'use client'

import { Wifi, WifiOff, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface RealtimeStatusProps {
  isOnline: boolean
  lastUpdate: Date | null
  onRefresh?: () => void
  className?: string
}

export function RealtimeStatus({
  isOnline,
  lastUpdate,
  onRefresh,
  className,
}: RealtimeStatusProps) {
  const formatLastUpdate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(diff / 60000)

    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    return date.toLocaleTimeString()
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <Badge
          variant={isOnline ? 'default' : 'destructive'}
          className="text-xs"
        >
          {isOnline ? 'Live' : 'Offline'}
        </Badge>
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatLastUpdate(lastUpdate)}</span>
        </div>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}
