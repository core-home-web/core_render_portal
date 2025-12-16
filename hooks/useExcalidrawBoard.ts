/**
 * useExcalidrawBoard Hook
 * 
 * Hook to manage Excalidraw board persistence with Supabase.
 * Handles loading, saving, and auto-saving of board state.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
// Flexible types for Excalidraw compatibility
type ExcalidrawElement = any
type AppState = any
type BinaryFiles = Record<string, any>
import { supabase } from '@/lib/supaClient'

/**
 * Excalidraw board snapshot structure
 */
export interface ExcalidrawBoardSnapshot {
  elements: ExcalidrawElement[]
  appState: Partial<AppState>
  files: BinaryFiles
}

/**
 * Database board record structure
 */
export interface ExcalidrawBoardRecord {
  project_id: string
  board_snapshot: ExcalidrawBoardSnapshot | Record<string, never>
  created_at: string
  updated_at: string
}

export interface UseExcalidrawBoardOptions {
  /** Auto-save interval in milliseconds (default: 3000) */
  autoSaveInterval?: number
  /** Enable auto-save (default: true) */
  enableAutoSave?: boolean
  /** Debounce time for onChange in ms (default: 1000) */
  debounceMs?: number
}

export interface UseExcalidrawBoardReturn {
  /** The current board data */
  board: ExcalidrawBoardRecord | null
  /** Loading state */
  loading: boolean
  /** Error message if any */
  error: string | null
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean
  /** Last saved timestamp */
  lastSavedAt: Date | null
  /** Fetch the board from Supabase */
  fetchBoard: () => Promise<ExcalidrawBoardRecord | null>
  /** Save the board snapshot to Supabase */
  saveBoard: (snapshot: ExcalidrawBoardSnapshot) => Promise<boolean>
  /** Update local board state (triggers auto-save if enabled) */
  updateLocalBoard: (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => void
  /** Force save immediately */
  forceSave: () => Promise<boolean>
  /** Get initial data for Excalidraw */
  getInitialData: () => { elements: ExcalidrawElement[]; appState: Partial<AppState>; files: BinaryFiles } | undefined
}

/**
 * Hook to manage Excalidraw board data with Supabase
 */
export function useExcalidrawBoard(
  projectId: string,
  options: UseExcalidrawBoardOptions = {}
): UseExcalidrawBoardReturn {
  const { 
    autoSaveInterval = 3000, 
    enableAutoSave = true,
    debounceMs = 1000,
  } = options

  const [board, setBoard] = useState<ExcalidrawBoardRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  // Refs for auto-save
  const pendingSnapshotRef = useRef<ExcalidrawBoardSnapshot | null>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isSavingRef = useRef(false)
  const lastSnapshotHashRef = useRef<string>('')

  /**
   * Create a simple hash of elements to detect changes
   */
  const hashSnapshot = useCallback((elements: readonly ExcalidrawElement[]): string => {
    return JSON.stringify(elements.map(e => ({ 
      id: e.id, 
      version: e.version,
      isDeleted: e.isDeleted,
    })))
  }, [])

  /**
   * Fetch board from Supabase using the RPC function
   */
  const fetchBoard = useCallback(async (): Promise<ExcalidrawBoardRecord | null> => {
    if (!projectId) {
      setError('No project ID provided')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc(
        'get_or_create_project_board',
        { p_project_id: projectId }
      )

      if (rpcError) {
        console.error('RPC Error:', rpcError)
        throw rpcError
      }

      if (!data) {
        throw new Error('No data returned from get_or_create_project_board')
      }

      // Handle both array and single object responses
      const boardResult = Array.isArray(data) ? data[0] : data

      if (!boardResult) {
        throw new Error('No board data returned')
      }

      // Parse the board snapshot
      let boardSnapshot: ExcalidrawBoardSnapshot | Record<string, never> = {}
      
      if (boardResult.board_snapshot) {
        const snapshot = boardResult.board_snapshot
        
        // Check if it's already in Excalidraw format
        if (Array.isArray(snapshot.elements)) {
          boardSnapshot = {
            elements: snapshot.elements || [],
            appState: snapshot.appState || {},
            files: snapshot.files || {},
          }
        } else if (snapshot.store) {
          // Legacy tldraw format - start fresh
          console.log('Legacy tldraw format detected, starting with empty board')
          boardSnapshot = {}
        } else {
          boardSnapshot = snapshot
        }
      }

      const boardData: ExcalidrawBoardRecord = {
        project_id: boardResult.project_id,
        board_snapshot: boardSnapshot,
        created_at: boardResult.created_at,
        updated_at: boardResult.updated_at,
      }

      setBoard(boardData)
      setHasUnsavedChanges(false)
      
      if (boardResult.updated_at) {
        setLastSavedAt(new Date(boardResult.updated_at))
      }
      
      return boardData
    } catch (err) {
      let errorMessage = 'Failed to fetch board'
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null) {
        const errorObj = err as { message?: string; details?: string; hint?: string; code?: string }
        errorMessage = errorObj.message || errorObj.details || errorObj.hint || errorMessage
        
        // Provide helpful error messages
        if (errorObj.code === '42883' || errorMessage.includes('function')) {
          errorMessage = 'Database function not found. Please ensure the project_boards table and functions are set up.'
        } else if (errorObj.code === '42501' || errorMessage.includes('permission')) {
          errorMessage = 'Access denied. You may not have permission to access this board.'
        }
      }
      
      setError(errorMessage)
      console.error('Error fetching board:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [projectId])

  /**
   * Save board snapshot to Supabase
   */
  const saveBoard = useCallback(
    async (snapshot: ExcalidrawBoardSnapshot): Promise<boolean> => {
      if (!projectId) {
        setError('No project ID provided')
        return false
      }

      if (isSavingRef.current) {
        // Queue the snapshot for later
        pendingSnapshotRef.current = snapshot
        return false
      }

      isSavingRef.current = true

      try {
        const { data, error: rpcError } = await supabase.rpc(
          'save_project_board',
          {
            p_project_id: projectId,
            p_snapshot: snapshot as unknown as Record<string, unknown>,
          }
        )

        if (rpcError) {
          throw rpcError
        }

        if (data && data.length > 0) {
          setBoard({
            project_id: data[0].project_id,
            board_snapshot: data[0].board_snapshot || {},
            created_at: data[0].created_at,
            updated_at: data[0].updated_at,
          })
          setLastSavedAt(new Date())
        }

        setHasUnsavedChanges(false)
        setError(null)
        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save board'
        setError(errorMessage)
        console.error('Error saving board:', err)
        return false
      } finally {
        isSavingRef.current = false

        // Check if there's a pending snapshot to save
        if (pendingSnapshotRef.current) {
          const pending = pendingSnapshotRef.current
          pendingSnapshotRef.current = null
          // Save the pending snapshot after a short delay
          setTimeout(() => saveBoard(pending), 100)
        }
      }
    },
    [projectId]
  )

  /**
   * Update local board state (triggers auto-save if enabled)
   */
  const updateLocalBoard = useCallback(
    (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles
    ) => {
      // Check if elements actually changed
      const currentHash = hashSnapshot(elements)
      if (currentHash === lastSnapshotHashRef.current) {
        return
      }
      lastSnapshotHashRef.current = currentHash

      const snapshot: ExcalidrawBoardSnapshot = {
        elements: [...elements] as ExcalidrawElement[],
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          zoom: appState.zoom,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
          gridSize: appState.gridSize,
        },
        files,
      }

      // Update local state
      setBoard((prev) =>
        prev
          ? { ...prev, board_snapshot: snapshot, updated_at: new Date().toISOString() }
          : null
      )
      setHasUnsavedChanges(true)
      pendingSnapshotRef.current = snapshot

      // Debounce the auto-save
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      if (enableAutoSave) {
        debounceTimerRef.current = setTimeout(() => {
          // Clear existing auto-save timer
          if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current)
          }

          // Set up new auto-save timer
          autoSaveTimerRef.current = setTimeout(() => {
            if (pendingSnapshotRef.current) {
              saveBoard(pendingSnapshotRef.current).catch((error) => {
                console.error('Auto-save failed:', error)
              })
            }
          }, autoSaveInterval)
        }, debounceMs)
      }
    },
    [enableAutoSave, autoSaveInterval, debounceMs, saveBoard, hashSnapshot]
  )

  /**
   * Force save immediately
   */
  const forceSave = useCallback(async (): Promise<boolean> => {
    // Clear timers
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    if (pendingSnapshotRef.current) {
      return saveBoard(pendingSnapshotRef.current)
    }

    const snapshot = board?.board_snapshot
    if (snapshot && 'elements' in snapshot && Array.isArray(snapshot.elements)) {
      return saveBoard(snapshot as ExcalidrawBoardSnapshot)
    }

    return true // Nothing to save
  }, [board, saveBoard])

  /**
   * Get initial data for Excalidraw component
   */
  const getInitialData = useCallback(() => {
    const snapshot = board?.board_snapshot
    
    if (!snapshot || Object.keys(snapshot).length === 0) {
      return undefined
    }

    if ('elements' in snapshot && Array.isArray(snapshot.elements)) {
      return {
        elements: snapshot.elements,
        appState: snapshot.appState || {},
        files: snapshot.files || {},
      }
    }

    return undefined
  }, [board])

  // Fetch board on mount
  useEffect(() => {
    if (projectId) {
      fetchBoard()
    }
  }, [projectId, fetchBoard])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      
      // Save any pending changes before unmount
      if (pendingSnapshotRef.current && !isSavingRef.current) {
        supabase
          .rpc('save_project_board', {
            p_project_id: projectId,
            p_snapshot: pendingSnapshotRef.current as unknown as Record<string, unknown>,
          })
          .then(({ error }) => {
            if (error) console.error('Error saving on unmount:', error)
          })
      }
    }
  }, [projectId])

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault()
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        
        // Try to save using sendBeacon
        if (pendingSnapshotRef.current) {
          navigator.sendBeacon(
            '/api/boards/save-beacon',
            JSON.stringify({
              projectId,
              snapshot: pendingSnapshotRef.current,
            })
          )
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, projectId])

  return {
    board,
    loading,
    error,
    hasUnsavedChanges,
    lastSavedAt,
    fetchBoard,
    saveBoard,
    updateLocalBoard,
    forceSave,
    getInitialData,
  }
}

export default useExcalidrawBoard
