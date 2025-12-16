'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Save, 
  Cloud, 
  CloudOff, 
  Users, 
  Loader2, 
  RefreshCw, 
  Maximize2 
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ExcalidrawBoard, ExcalidrawBoardRef, ExcalidrawSnapshot } from '@/components/whiteboard'
import { ExportMenu } from '@/components/whiteboard/ExportMenu'
import { useProject } from '@/hooks/useProject'
import { useExcalidrawBoard } from '@/hooks/useExcalidrawBoard'
import { useExcalidrawCollab } from '@/hooks/useExcalidrawCollab'
import { initializeProjectBoard, shouldInitializeBoard } from '@/components/whiteboard/initializeProjectBoard'
import { Project } from '@/types'
import { supabase } from '@/lib/supaClient'

// Types from Excalidraw - use any for flexibility since types may vary by version
type ExcalidrawElement = any
type AppState = any
type BinaryFiles = Record<string, any>
type ExcalidrawImperativeAPI = any

export default function WhiteboardPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const { getProject, loading: projectLoading, error: projectError } = useProject()
  const [project, setProject] = useState<Project | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const boardRef = useRef<ExcalidrawBoardRef>(null)
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        const projectData = await getProject(projectId)
        if (projectData) {
          setProject(projectData)
        }
      }
    }
    fetchProject()
  }, [projectId, getProject])

  // Fetch current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        setCurrentUser(session.user)
      }
    }
    getCurrentUser()
  }, [])

  // Use the Excalidraw board hook for persistence
  const {
    board,
    loading: boardLoading,
    error: boardError,
    hasUnsavedChanges,
    lastSavedAt,
    updateLocalBoard,
    forceSave,
    fetchBoard,
    getInitialData,
  } = useExcalidrawBoard(projectId, {
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
  } = useExcalidrawCollab(projectId, {
    userName: currentUser?.email || 'User',
    userId: currentUser?.id || 'user-id',
    enableCursors: true,
  })

  // Get initial data for Excalidraw
  const getInitialSnapshot = useCallback((): ExcalidrawSnapshot | undefined => {
    if (!project) return undefined
    
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
    } finally {
      setIsSaving(false)
    }
  }, [forceSave])

  // Handle navigation back with unsaved changes warning
  const handleBack = useCallback(async () => {
    if (hasUnsavedChanges) {
      const shouldSave = window.confirm(
        'You have unsaved changes. Would you like to save before leaving?'
      )
      if (shouldSave) {
        await forceSave()
      }
    }
    disconnectCollab()
    router.push(`/project/${projectId}`)
  }, [hasUnsavedChanges, forceSave, disconnectCollab, router, projectId])

  // Reset view to fit content
  const handleResetView = useCallback(() => {
    if (boardRef.current) {
      boardRef.current.resetView()
    }
  }, [])

  // Regenerate board from project data
  const handleRegenerateBoard = useCallback(() => {
    if (!excalidrawApi || !project) return
    
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

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Loading state
  if (projectLoading) {
    return (
      <DashboardLayout user={currentUser} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#38bdbb] mx-auto mb-4" />
            <p className="text-white">Loading project...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (projectError || !project) {
    return (
      <DashboardLayout user={currentUser} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-400 mb-4">{projectError || 'Project not found'}</p>
            <Link href="/dashboard">
              <Button className="bg-[#38bdbb] text-white hover:bg-[#2ea9a7]">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const initialSnapshot = getInitialSnapshot()

  return (
    <DashboardLayout user={currentUser} onSignOut={handleSignOut}>
      <div className="flex flex-col h-[calc(100vh-60px)] lg:h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Project</span>
            </button>
            
            <div className="h-6 w-px bg-gray-300 hidden sm:block" />
            
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {project.title}
            </h1>
            
            {/* Collaboration Status */}
            <div className="flex items-center gap-2 text-sm shrink-0">
              {isCollabConnected ? (
                <span className="flex items-center gap-1 text-green-600">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">{collaborators.length + 1} online</span>
                </span>
              ) : (
                <button
                  onClick={connectCollab}
                  className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Connect for collaboration"
                >
                  <CloudOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Connect</span>
                </button>
              )}
            </div>

            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm shrink-0">
              {hasUnsavedChanges ? (
                <span className="text-amber-600 flex items-center gap-1" title="Unsaved changes">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="hidden sm:inline">Unsaved</span>
                </span>
              ) : lastSavedAt ? (
                <span className="text-green-600 flex items-center gap-1" title={`Saved ${lastSavedAt.toLocaleTimeString()}`}>
                  <Cloud className="h-4 w-4" />
                  <span className="hidden md:inline">
                    Saved {lastSavedAt.toLocaleTimeString()}
                  </span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            {/* View Controls */}
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

            {/* Save Button */}
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
              disabled={boardLoading || !isInitialized}
            />
          </div>
        </div>

        {/* Board Content - Full height with min-h-0 for proper flex sizing */}
        <div className="flex-1 relative min-h-0 bg-white">
          {boardLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading whiteboard...</p>
              </div>
            </div>
          ) : boardError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-md">
                <p className="text-red-600 mb-4">{boardError}</p>
                <Button onClick={fetchBoard} disabled={boardLoading}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0">
              <ExcalidrawBoard
                ref={boardRef}
                projectId={projectId}
                initialData={initialSnapshot}
                theme={theme}
                onChange={handleBoardChange}
                onPointerUpdate={handlePointerUpdate}
                onReady={handleReady}
                debounceMs={1000}
                className="w-full h-full"
              />
            </div>
          )}
        </div>

        {/* Collaborator Avatars (if connected) */}
        {isCollabConnected && collaborators.length > 0 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg z-10">
            <span className="text-xs text-gray-500 mr-1 hidden sm:inline">Collaborators:</span>
            {collaborators.slice(0, 5).map((collab) => (
              <div
                key={collab.userId}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-medium"
                style={{ backgroundColor: collab.color }}
                title={collab.userName}
              >
                {collab.userName.charAt(0).toUpperCase()}
              </div>
            ))}
            {collaborators.length > 5 && (
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-gray-400 text-white text-[10px] sm:text-xs font-medium">
                +{collaborators.length - 5}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

