import { useState, useCallback, useEffect, useRef } from 'react'
import { TLRecord, StoreSnapshot } from 'tldraw'
import { supabase } from '@/lib/supaClient'

// Use the correct snapshot type from tldraw
type TLStoreSnapshot = StoreSnapshot<TLRecord>

export interface ProjectBoard {
  project_id: string
  board_snapshot: TLStoreSnapshot | Record<string, never>
  created_at: string
  updated_at: string
}

export interface UseProjectBoardOptions {
  /** Auto-save interval in milliseconds (default: 5000) */
  autoSaveInterval?: number
  /** Enable auto-save (default: true) */
  enableAutoSave?: boolean
}

export interface UseProjectBoardReturn {
  /** The current board data */
  board: ProjectBoard | null
  /** Loading state */
  loading: boolean
  /** Error message if any */
  error: string | null
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean
  /** Fetch the board from Supabase */
  fetchBoard: () => Promise<ProjectBoard | null>
  /** Save the board snapshot to Supabase */
  saveBoard: (snapshot: TLStoreSnapshot) => Promise<boolean>
  /** Update local board state (triggers auto-save if enabled) */
  updateLocalBoard: (snapshot: TLStoreSnapshot) => void
  /** Force save immediately */
  forceSave: () => Promise<boolean>
}

/**
 * Hook to manage project board data with Supabase
 * 
 * @param projectId - The project ID to fetch/save board for
 * @param options - Configuration options
 */
export function useProjectBoard(
  projectId: string,
  options: UseProjectBoardOptions = {}
): UseProjectBoardReturn {
  const { autoSaveInterval = 5000, enableAutoSave = true } = options

  const [board, setBoard] = useState<ProjectBoard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Refs for auto-save
  const pendingSnapshotRef = useRef<TLStoreSnapshot | null>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isSavingRef = useRef(false)

  /**
   * Fetch board from Supabase using the RPC function
   */
  const fetchBoard = useCallback(async (): Promise<ProjectBoard | null> => {
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
        throw rpcError
      }

      if (!data || data.length === 0) {
        throw new Error('No board data returned')
      }

      const boardData: ProjectBoard = {
        project_id: data[0].project_id,
        board_snapshot: data[0].board_snapshot || {},
        created_at: data[0].created_at,
        updated_at: data[0].updated_at,
      }

      setBoard(boardData)
      setHasUnsavedChanges(false)
      return boardData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch board'
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
    async (snapshot: TLStoreSnapshot): Promise<boolean> => {
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
    (snapshot: TLStoreSnapshot) => {
      setBoard((prev) =>
        prev
          ? { ...prev, board_snapshot: snapshot, updated_at: new Date().toISOString() }
          : null
      )
      setHasUnsavedChanges(true)
      pendingSnapshotRef.current = snapshot

      // Clear existing auto-save timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      // Set up new auto-save timer if enabled
      if (enableAutoSave) {
        autoSaveTimerRef.current = setTimeout(() => {
          if (pendingSnapshotRef.current) {
            saveBoard(pendingSnapshotRef.current)
          }
        }, autoSaveInterval)
      }
    },
    [enableAutoSave, autoSaveInterval, saveBoard]
  )

  /**
   * Force save immediately
   */
  const forceSave = useCallback(async (): Promise<boolean> => {
    // Clear auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }

    if (pendingSnapshotRef.current) {
      return saveBoard(pendingSnapshotRef.current)
    }

    if (board?.board_snapshot && Object.keys(board.board_snapshot).length > 0) {
      return saveBoard(board.board_snapshot as TLStoreSnapshot)
    }

    return true // Nothing to save
  }, [board, saveBoard])

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
      // Save any pending changes before unmount
      if (pendingSnapshotRef.current && !isSavingRef.current) {
        // Note: This is a best-effort save on unmount
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
        
        // Try to save
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
    fetchBoard,
    saveBoard,
    updateLocalBoard,
    forceSave,
  }
}
