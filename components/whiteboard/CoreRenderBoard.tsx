'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
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
 * CoreRenderBoard - Main whiteboard component using tldraw
 * 
 * This component provides an infinite canvas whiteboard with support for:
 * - Shapes (rectangles, ellipses, arrows, etc.)
 * - Rich text
 * - Images and media
 * - Real-time collaboration via tldraw sync
 * - Persistence to Supabase
 */
export function CoreRenderBoard({
  projectId,
  syncServerUrl,
  initialSnapshot,
  readOnly = false,
  onMount,
  onBoardChange,
  assetStore,
  className = '',
}: CoreRenderBoardProps) {
  const editorRef = useRef<Editor | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Use tldraw sync if a sync server URL is provided
  const syncStore = syncServerUrl
    ? useSync({
        uri: `${syncServerUrl}/connect/${projectId}`,
        assets: assetStore!,
      })
    : undefined

  // Handle editor mount
  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor

      // Load initial snapshot if provided and not using sync
      if (initialSnapshot && !syncServerUrl) {
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

      // Subscribe to store changes for persistence
      if (onBoardChange && !syncServerUrl) {
        const unsubscribe = editor.store.listen(
          () => {
            // Debounce the change callback to avoid excessive saves
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current)
            }
            debounceTimerRef.current = setTimeout(() => {
              const editorSnapshot = getSnapshot(editor.store)
              // Convert to the format expected by our persistence layer
              const snapshot: TLStoreSnapshot = {
                store: editorSnapshot.document.store,
                schema: editorSnapshot.document.schema,
              }
              onBoardChange(snapshot)
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
    [initialSnapshot, syncServerUrl, readOnly, onBoardChange, onMount]
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
      <Tldraw
        store={syncStore}
        onMount={handleMount}
      />
    </div>
  )
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
