'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import {
  Tldraw,
  Editor,
  getSnapshot,
  loadSnapshot,
  TLAssetStore,
  TLRecord,
  StoreSnapshot,
} from 'tldraw'
import { useSync } from '@tldraw/sync'
import 'tldraw/tldraw.css'

// Use the correct snapshot type from tldraw
export type TLStoreSnapshot = StoreSnapshot<TLRecord>

export interface CoreRenderBoardProps {
  /** The project ID this board belongs to */
  projectId: string
  /** WebSocket URL for tldraw sync server */
  syncServerUrl?: string
  /** Initial snapshot to load (from Supabase) */
  initialSnapshot?: TLStoreSnapshot
  /** Whether the board is read-only */
  readOnly?: boolean
  /** Callback when the editor is mounted */
  onMount?: (editor: Editor) => void
  /** Callback when the board state changes (for persistence) */
  onBoardChange?: (snapshot: TLStoreSnapshot) => void
  /** Asset store for handling file uploads */
  assetStore?: TLAssetStore
  /** Custom class name for the container */
  className?: string
}

/**
 * Internal component that handles the actual Tldraw rendering
 */
function BoardRenderer({
  projectId,
  syncStore,
  initialSnapshot,
  readOnly = false,
  onMount,
  onBoardChange,
  className = '',
}: {
  projectId: string
  syncStore?: ReturnType<typeof useSync>
  initialSnapshot?: TLStoreSnapshot
  readOnly?: boolean
  onMount?: (editor: Editor) => void
  onBoardChange?: (snapshot: TLStoreSnapshot) => void
  className?: string
}) {
  const editorRef = useRef<Editor | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle editor mount
  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor

      // Load initial snapshot if provided and not using sync
      if (initialSnapshot && !syncStore) {
        try {
          loadSnapshot(editor.store, initialSnapshot)
        } catch (error) {
          console.error('Failed to load initial snapshot:', error)
        }
      }

      // Set read-only mode if specified
      if (readOnly) {
        editor.updateInstanceState({ isReadonly: true })
      }

      // Subscribe to store changes for persistence (only in local mode)
      if (onBoardChange && !syncStore) {
        const unsubscribe = editor.store.listen(
          () => {
            // Debounce the change callback to avoid excessive saves
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current)
            }
            debounceTimerRef.current = setTimeout(() => {
              try {
                const editorSnapshot = getSnapshot(editor.store)
                // Validate snapshot before processing
                if (editorSnapshot && editorSnapshot.document && editorSnapshot.document.store) {
                  // Convert to the format expected by our persistence layer
                  const snapshot: TLStoreSnapshot = {
                    store: editorSnapshot.document.store,
                    schema: editorSnapshot.document.schema,
                  }
                  onBoardChange(snapshot)
                }
              } catch (error) {
                console.error('Error processing board change:', error)
                // Don't crash - just log the error
              }
            }, 1000) // 1 second debounce
          },
          { source: 'user', scope: 'document' }
        )

        // Cleanup subscription on unmount
        return () => {
          unsubscribe()
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
          }
        }
      }

      // Call the onMount callback
      if (onMount) {
        onMount(editor)
      }
    },
    [initialSnapshot, syncStore, readOnly, onBoardChange, onMount]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <div
      className={`core-render-board ${className}`}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      <Tldraw store={syncStore} onMount={handleMount} />
    </div>
  )
}

/**
 * Component that uses tldraw sync for real-time collaboration
 */
function SyncedBoard(props: CoreRenderBoardProps) {
  const { syncServerUrl, projectId, assetStore } = props
  
  // Always call useSync hook (React rules require hooks to be called unconditionally)
  const syncStore = useSync({
    uri: `${syncServerUrl}/connect/${projectId}`,
    assets: assetStore!,
  })

  return <BoardRenderer {...props} syncStore={syncStore} />
}

/**
 * CoreRenderBoard - Main whiteboard component using tldraw
 * 
 * This component provides an infinite canvas whiteboard with support for:
 * - Shapes (rectangles, ellipses, arrows, etc.)
 * - Rich text
 * - Images and media
 * - Real-time collaboration via tldraw sync
 * - Persistence to Supabase
 */
export function CoreRenderBoard(props: CoreRenderBoardProps) {
  const { syncServerUrl, assetStore } = props

  // Conditionally render synced or local board based on syncServerUrl
  // This ensures hooks are always called in the same order
  if (syncServerUrl && assetStore) {
    return <SyncedBoard {...props} />
  }

  return <BoardRenderer {...props} syncStore={undefined} />
}

/**
 * Hook to get the current board snapshot
 * Can be used by parent components to save the board state
 */
export function useBoardSnapshot(editor: Editor | null) {
  const getBoardSnapshot = useCallback((): TLStoreSnapshot | null => {
    if (!editor) return null
    const editorSnapshot = getSnapshot(editor.store)
    return {
      store: editorSnapshot.document.store,
      schema: editorSnapshot.document.schema,
    }
  }, [editor])

  return { getSnapshot: getBoardSnapshot }
}

export default CoreRenderBoard
