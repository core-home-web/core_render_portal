/**
 * useExcalidrawCollab Hook
 * 
 * Hook to enable real-time collaboration on Excalidraw boards using Supabase Realtime.
 * Broadcasts element changes and cursor positions to other users.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
// Types for Excalidraw elements
type ExcalidrawElement = any
type AppState = any
import { supabase } from '@/lib/supaClient'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface CollaboratorCursor {
  userId: string
  userName: string
  x: number
  y: number
  color: string
  lastActive: number
}

export interface CollaboratorPresence {
  userId: string
  userName: string
  color: string
  cursor?: { x: number; y: number }
  lastActive: number
}

export interface UseExcalidrawCollabOptions {
  /** User's display name */
  userName?: string
  /** User's unique ID */
  userId?: string
  /** Callback when elements change from remote */
  onRemoteChange?: (elements: ExcalidrawElement[]) => void
  /** Callback when collaborator cursors update */
  onCursorsChange?: (cursors: CollaboratorCursor[]) => void
  /** Enable cursor sharing (default: true) */
  enableCursors?: boolean
  /** Throttle interval for updates in ms (default: 50) */
  throttleMs?: number
}

export interface UseExcalidrawCollabReturn {
  /** Whether connected to the collaboration channel */
  isConnected: boolean
  /** List of active collaborators */
  collaborators: CollaboratorPresence[]
  /** Broadcast element changes to collaborators */
  broadcastElements: (elements: readonly ExcalidrawElement[]) => void
  /** Broadcast cursor position to collaborators */
  broadcastCursor: (x: number, y: number) => void
  /** Connect to the collaboration channel */
  connect: () => Promise<void>
  /** Disconnect from the collaboration channel */
  disconnect: () => void
}

// Color palette for collaborator cursors
const CURSOR_COLORS = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
]

/**
 * Get a consistent color for a user based on their ID
 */
function getUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash |= 0
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
}

/**
 * Hook to enable real-time collaboration on Excalidraw boards
 */
export function useExcalidrawCollab(
  projectId: string,
  options: UseExcalidrawCollabOptions = {}
): UseExcalidrawCollabReturn {
  const {
    userName = 'Anonymous',
    userId = Math.random().toString(36).substring(7),
    onRemoteChange,
    onCursorsChange,
    enableCursors = true,
    throttleMs = 50,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([])

  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastBroadcastRef = useRef<number>(0)
  const userColor = useRef(getUserColor(userId))

  /**
   * Broadcast element changes to collaborators
   */
  const broadcastElements = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      if (!channelRef.current || !isConnected) return

      // Throttle broadcasts
      const now = Date.now()
      if (now - lastBroadcastRef.current < throttleMs) return
      lastBroadcastRef.current = now

      // Only send changed elements to reduce payload size
      const changedElements = elements.filter(el => {
        // In a real implementation, track element versions
        return true
      })

      channelRef.current.send({
        type: 'broadcast',
        event: 'elements',
        payload: {
          userId,
          elements: changedElements,
          timestamp: now,
        },
      })
    },
    [isConnected, userId, throttleMs]
  )

  /**
   * Broadcast cursor position to collaborators
   */
  const broadcastCursor = useCallback(
    (x: number, y: number) => {
      if (!channelRef.current || !isConnected || !enableCursors) return

      // Throttle cursor updates
      const now = Date.now()
      if (now - lastBroadcastRef.current < throttleMs * 2) return
      lastBroadcastRef.current = now

      channelRef.current.send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          userId,
          userName,
          x,
          y,
          color: userColor.current,
          timestamp: now,
        },
      })
    },
    [isConnected, userId, userName, enableCursors, throttleMs]
  )

  /**
   * Connect to the collaboration channel
   */
  const connect = useCallback(async () => {
    if (channelRef.current) return

    const channelName = `whiteboard:${projectId}`
    
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    // Listen for element changes
    channel.on('broadcast', { event: 'elements' }, (payload) => {
      if (payload.payload.userId === userId) return // Ignore own changes
      
      if (onRemoteChange && payload.payload.elements) {
        onRemoteChange(payload.payload.elements)
      }
    })

    // Listen for cursor updates
    if (enableCursors) {
      channel.on('broadcast', { event: 'cursor' }, (payload) => {
        if (payload.payload.userId === userId) return // Ignore own cursor
        
        const cursor: CollaboratorCursor = {
          userId: payload.payload.userId,
          userName: payload.payload.userName,
          x: payload.payload.x,
          y: payload.payload.y,
          color: payload.payload.color,
          lastActive: payload.payload.timestamp,
        }

        if (onCursorsChange) {
          // This would need to be accumulated in state
          // For now, just pass single cursor updates
          onCursorsChange([cursor])
        }
      })
    }

    // Handle presence
    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState()
      const activeCollaborators: CollaboratorPresence[] = []

      Object.entries(presenceState).forEach(([key, presences]) => {
        if (key === userId) return // Don't include self
        
        const presence = presences[0] as any
        if (presence) {
          activeCollaborators.push({
            userId: key,
            userName: presence.userName || 'Anonymous',
            color: getUserColor(key),
            cursor: presence.cursor,
            lastActive: Date.now(),
          })
        }
      })

      setCollaborators(activeCollaborators)
    })

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log(`User ${key} joined the whiteboard`)
    })

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log(`User ${key} left the whiteboard`)
    })

    // Subscribe to channel
    const subscription = await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
        
        // Track presence
        await channel.track({
          userName: userName,
          joinedAt: new Date().toISOString(),
        })
      }
    })

    channelRef.current = channel
  }, [projectId, userId, userName, onRemoteChange, onCursorsChange, enableCursors])

  /**
   * Disconnect from the collaboration channel
   */
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe()
      channelRef.current = null
      setIsConnected(false)
      setCollaborators([])
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Clean up stale collaborators periodically
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      const now = Date.now()
      const staleThreshold = 30000 // 30 seconds

      setCollaborators(prev => 
        prev.filter(c => now - c.lastActive < staleThreshold)
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [isConnected])

  return {
    isConnected,
    collaborators,
    broadcastElements,
    broadcastCursor,
    connect,
    disconnect,
  }
}

export default useExcalidrawCollab
