'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { X, Save, Cloud, CloudOff, Users, Loader2, RefreshCw, Maximize2 } from 'lucide-react'
import { Project } from '../../types'
import { ExcalidrawBoard, ExcalidrawBoardRef, ExcalidrawSnapshot } from '../whiteboard'
import { ExportMenu } from '../whiteboard/ExportMenu'
import { useExcalidrawBoard } from '@/hooks/useExcalidrawBoard'
import { useExcalidrawCollab } from '@/hooks/useExcalidrawCollab'
import { initializeProjectBoard, shouldInitializeBoard } from '../whiteboard/initializeProjectBoard'

// Types from Excalidraw - use any for flexibility since types may vary by version
type ExcalidrawElement = any
type AppState = any
type BinaryFiles = Record<string, any>
type ExcalidrawImperativeAPI = any

interface VisualEditorModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  onSave?: () => void
}

export function VisualEditorModal({
  isOpen,
  onClose,
  project,
  onSave,
}: VisualEditorModalProps) {
  const boardRef = useRef<ExcalidrawBoardRef>(null)
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Use the Excalidraw board hook for persistence
  const {
    board,
    loading,
    error,
    hasUnsavedChanges,
    lastSavedAt,
    saveBoard,
    updateLocalBoard,
    forceSave,
    fetchBoard,
    getInitialData,
  } = useExcalidrawBoard(project.id, {
    autoSaveInterval: 3000,
    enableAutoSave: true,
    debounceMs: 1000,
  })

  // Use the collaboration hook
  const {
    isConnected: isCollabConnected,
    collaborators,
    broadcastElements,
    broadcastCursor,
    connect: connectCollab,
    disconnect: disconnectCollab,
  } = useExcalidrawCollab(project.id, {
    userName: 'User', // TODO: Get from auth context
    userId: 'user-id', // TODO: Get from auth context
    enableCursors: true,
  })

  // Get initial data for Excalidraw
  const getInitialSnapshot = useCallback((): ExcalidrawSnapshot | undefined => {
    const existingData = getInitialData()
    
    if (existingData && existingData.elements && existingData.elements.length > 0) {
      return existingData as ExcalidrawSnapshot
    }

    // Check if we should initialize with project data
    if (shouldInitializeBoard(project, existingData as ExcalidrawSnapshot | undefined)) {
      const initialData = initializeProjectBoard(project, undefined, { theme })
      return initialData
    }

    return existingData as ExcalidrawSnapshot | undefined
  }, [getInitialData, project, theme])

  // Handle board changes
  const handleBoardChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      updateLocalBoard(elements, appState, files)
      
      // Broadcast to collaborators if connected
      if (isCollabConnected) {
        broadcastElements(elements)
      }
    },
    [updateLocalBoard, isCollabConnected, broadcastElements]
  )

  // Handle pointer updates for collaboration
  const handlePointerUpdate = useCallback(
    (payload: { pointer: { x: number; y: number }; button: string }) => {
      if (isCollabConnected) {
        broadcastCursor(payload.pointer.x, payload.pointer.y)
      }
    },
    [isCollabConnected, broadcastCursor]
  )

  // Handle Excalidraw ready
  const handleReady = useCallback((api: ExcalidrawImperativeAPI) => {
    setExcalidrawApi(api)
    setIsInitialized(true)
  }, [])

  // Manual save
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await forceSave()
      if (onSave) {
        onSave()
      }
    } finally {
      setIsSaving(false)
    }
  }, [forceSave, onSave])

  // Handle close with unsaved changes warning
  const handleClose = useCallback(async () => {
    if (hasUnsavedChanges) {
      const shouldSave = window.confirm(
        'You have unsaved changes. Would you like to save before closing?'
      )
      if (shouldSave) {
        await forceSave()
      }
    }
    disconnectCollab()
    onClose()
  }, [hasUnsavedChanges, forceSave, disconnectCollab, onClose])

  // Reset view to fit content
  const handleResetView = useCallback(() => {
    if (boardRef.current) {
      boardRef.current.resetView()
    }
  }, [])

  // Regenerate board from project data
  const handleRegenerateBoard = useCallback(() => {
    if (!excalidrawApi) return
    
    const confirmed = window.confirm(
      'This will replace the current board with project data. Continue?'
    )
    if (!confirmed) return

    const newData = initializeProjectBoard(project, undefined, { force: true, theme })
    excalidrawApi.updateScene({
      elements: newData.elements,
      appState: newData.appState,
    })
  }, [excalidrawApi, project, theme])

  // Connect to collaboration on mount
  useEffect(() => {
    if (isOpen && !loading && board) {
      // Auto-connect to collaboration (optional - can be triggered by user)
      // connectCollab()
    }
  }, [isOpen, loading, board])

  if (!isOpen) return null

  const initialSnapshot = getInitialSnapshot()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-0 sm:p-2">
      <div className="w-full h-full sm:max-w-[98vw] sm:max-h-[98vh] bg-white sm:rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header - Responsive */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-3 shrink-0">
          {/* Mobile: Stacked layout, Desktop: Single row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            {/* Title and Status Row */}
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 min-w-0">
              <h2 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                {project.title}
              </h2>
              
              {/* Collaboration Status - Compact on mobile */}
              <div className="flex items-center gap-2 text-xs sm:text-sm shrink-0">
                {isCollabConnected ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{collaborators.length + 1} online</span>
                  </span>
                ) : (
                  <button
                    onClick={connectCollab}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Connect for collaboration"
                  >
                    <CloudOff className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Connect</span>
                  </button>
                )}
              </div>

              {/* Save Status - Compact on mobile */}
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shrink-0">
                {hasUnsavedChanges ? (
                  <span className="text-amber-600 flex items-center gap-1" title="Unsaved changes">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    <span className="hidden sm:inline">Unsaved</span>
                  </span>
                ) : lastSavedAt ? (
                  <span className="text-green-600 flex items-center gap-1" title={`Saved ${lastSavedAt.toLocaleTimeString()}`}>
                    <Cloud className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden md:inline">
                      Saved {lastSavedAt.toLocaleTimeString()}
                    </span>
                  </span>
                ) : null}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-end gap-1 sm:gap-2 md:gap-3">
              {/* View Controls - Icon only on mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetView}
                title="Reset view"
                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateBoard}
                title="Regenerate from project data"
                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              {/* Save Button - Icon only on mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="border-green-300 text-green-600 hover:bg-green-50 h-8 sm:h-9 px-2 sm:px-3"
                title="Save whiteboard"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="hidden sm:inline ml-2">Save</span>
              </Button>

              {/* Export Menu */}
              <ExportMenu
                boardRef={boardRef}
                projectName={project.title}
                disabled={loading || !isInitialized}
              />

              {/* Close Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                title="Close whiteboard"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Board Content */}
        <div className="flex-1 relative min-h-0">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading whiteboard...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchBoard} disabled={loading}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <ExcalidrawBoard
              ref={boardRef}
              projectId={project.id}
              initialData={initialSnapshot}
              theme={theme}
              onChange={handleBoardChange}
              onPointerUpdate={handlePointerUpdate}
              onReady={handleReady}
              debounceMs={1000}
              className="w-full h-full"
            />
          )}
        </div>

        {/* Collaborator Avatars (if connected) */}
        {isCollabConnected && collaborators.length > 0 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
            <span className="text-xs text-gray-500 mr-1">Collaborators:</span>
            {collaborators.map((collab) => (
              <div
                key={collab.userId}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: collab.color }}
                title={collab.userName}
              >
                {collab.userName.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VisualEditorModal
