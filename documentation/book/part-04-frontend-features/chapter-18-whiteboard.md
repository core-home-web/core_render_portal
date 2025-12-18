# Chapter 18: Whiteboard Integration

This chapter covers integrating Excalidraw as a collaborative whiteboard for visual project planning.

---

## Why Excalidraw?

Excalidraw provides:
- Open-source virtual whiteboard
- Hand-drawn style aesthetics
- Real-time collaboration support
- Export to PNG, SVG, JSON
- Embeddable React component

---

## Dynamic Import

Excalidraw must be loaded client-side only:

```typescript
// File: components/whiteboard/ExcalidrawBoard.tsx

import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
)
```

---

## Board Component

```typescript
'use client'

import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'
import '@excalidraw/excalidraw/index.css'

const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
)

interface ExcalidrawBoardProps {
  projectId: string
  initialData?: any
  readOnly?: boolean
  theme?: 'light' | 'dark'
  onChange?: (elements: any[], appState: any, files: any) => void
}

export const ExcalidrawBoard = forwardRef(function ExcalidrawBoard(
  { projectId, initialData, readOnly = false, theme = 'dark', onChange }: ExcalidrawBoardProps,
  ref
) {
  const [isClient, setIsClient] = useState(false)
  const apiRef = useRef<any>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      if (!apiRef.current) return null
      return {
        elements: apiRef.current.getSceneElements(),
        appState: apiRef.current.getAppState(),
        files: apiRef.current.getFiles(),
      }
    },
    exportToPng: async () => {
      // Export implementation
    },
    exportToSvg: async () => {
      // Export implementation
    },
  }))

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <p className="text-white">Loading whiteboard...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Excalidraw
        excalidrawAPI={(api: any) => {
          apiRef.current = api
        }}
        initialData={initialData}
        onChange={onChange}
        viewModeEnabled={readOnly}
        theme={theme}
        UIOptions={{
          canvasActions: {
            export: { saveFileToDisk: true },
            toggleTheme: true,
          },
        }}
      />
    </div>
  )
})
```

---

## Board Persistence Hook

```typescript
// File: hooks/useExcalidrawBoard.ts

import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supaClient'

export function useExcalidrawBoard(projectId: string) {
  const [board, setBoard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const pendingSnapshotRef = useRef<any>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch board from database
  const fetchBoard = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_or_create_project_board', {
        p_project_id: projectId
      })
      
      if (error) throw error
      
      const boardData = Array.isArray(data) ? data[0] : data
      setBoard(boardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Save board to database
  const saveBoard = useCallback(async (snapshot: any) => {
    try {
      const { error } = await supabase.rpc('save_project_board', {
        p_project_id: projectId,
        p_snapshot: snapshot,
      })
      
      if (error) throw error
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error('Save failed:', err)
    }
  }, [projectId])

  // Handle changes with debounced auto-save
  const updateLocalBoard = useCallback((elements: any[], appState: any, files: any) => {
    const snapshot = {
      elements,
      appState: {
        viewBackgroundColor: appState.viewBackgroundColor,
        zoom: appState.zoom,
      },
      files,
    }
    
    pendingSnapshotRef.current = snapshot
    setHasUnsavedChanges(true)
    
    // Debounced auto-save
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      if (pendingSnapshotRef.current) {
        saveBoard(pendingSnapshotRef.current)
      }
    }, 3000)
  }, [saveBoard])

  // Load board on mount
  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  return {
    board,
    loading,
    error,
    hasUnsavedChanges,
    fetchBoard,
    saveBoard,
    updateLocalBoard,
  }
}
```

---

## Whiteboard Page

```typescript
// File: app/project/[id]/whiteboard/page.tsx

'use client'

import { useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useExcalidrawBoard } from '@/hooks/useExcalidrawBoard'
import { ExcalidrawBoard } from '@/components/whiteboard/ExcalidrawBoard'
import { ArrowLeft, Save, Download } from 'lucide-react'

export default function WhiteboardPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const boardRef = useRef<any>(null)
  
  const { user } = useAuth()
  const { board, loading, error, hasUnsavedChanges, updateLocalBoard, saveBoard } = useExcalidrawBoard(projectId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070e0e]">
        <p className="text-white">Loading whiteboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070e0e]">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  const initialData = board?.board_snapshot?.elements 
    ? board.board_snapshot 
    : undefined

  return (
    <div className="h-screen flex flex-col bg-[#070e0e]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={() => router.push(`/project/${projectId}`)}
          className="flex items-center gap-2 text-[#38bdbb]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </button>
        
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <span className="text-yellow-400 text-sm">Unsaved changes</span>
          )}
          <button
            onClick={() => {
              const snapshot = boardRef.current?.getSnapshot()
              if (snapshot) saveBoard(snapshot)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#38bdbb] text-white rounded-lg"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ExcalidrawBoard
          ref={boardRef}
          projectId={projectId}
          initialData={initialData}
          theme="dark"
          onChange={updateLocalBoard}
        />
      </div>
    </div>
  )
}
```

---

## Export Functions

```typescript
// Export to PNG
async function exportToPng(api: any) {
  const { exportToBlob } = await import('@excalidraw/excalidraw')
  const elements = api.getSceneElements()
  const appState = api.getAppState()
  const files = api.getFiles()
  
  return exportToBlob({
    elements,
    appState,
    files,
    getDimensions: () => ({ width: 1920, height: 1080, scale: 2 }),
  })
}

// Export to SVG
async function exportToSvg(api: any) {
  const { exportToSvg } = await import('@excalidraw/excalidraw')
  const elements = api.getSceneElements()
  const appState = api.getAppState()
  const files = api.getFiles()
  
  return exportToSvg({ elements, appState, files })
}
```

---

## Chapter Summary

Whiteboard integration includes:

1. **Dynamic import** - Load Excalidraw client-side only
2. **Board component** - Wrapper with ref methods
3. **Persistence hook** - Auto-save to database
4. **Whiteboard page** - Full-screen editing experience
5. **Export functions** - PNG and SVG export

Key features:
- Auto-save with debouncing
- Dark theme integration
- Export capabilities
- Full-screen editing mode

---

*Next: [Chapter 19: Collaboration](./chapter-19-collaboration.md) - Invitations and permissions*
