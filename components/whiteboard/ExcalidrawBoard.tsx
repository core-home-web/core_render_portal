'use client'

import React, { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import dynamic from 'next/dynamic'

// Import Excalidraw styles - required for toolbar, color picker, and UI elements
import '@excalidraw/excalidraw/index.css'

// Use any types for flexibility across Excalidraw versions
type ExcalidrawElement = any
type AppState = any
type BinaryFiles = Record<string, any>
type ExcalidrawImperativeAPI = any

// Dynamically import Excalidraw to avoid SSR issues
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
)

// Export utilities (lazy loaded)
let exportUtils: {
  exportToBlob: any
  exportToSvg: any
  serializeAsJSON: any
} | null = null

async function loadExportUtils() {
  if (!exportUtils) {
    const excalidraw = await import('@excalidraw/excalidraw')
    exportUtils = {
      exportToBlob: excalidraw.exportToBlob,
      exportToSvg: excalidraw.exportToSvg,
      serializeAsJSON: excalidraw.serializeAsJSON,
    }
  }
  return exportUtils
}

/**
 * Excalidraw board snapshot for persistence
 */
export interface ExcalidrawSnapshot {
  elements: ExcalidrawElement[]
  appState: Partial<AppState>
  files: BinaryFiles
}

export interface ExcalidrawBoardProps {
  /** The project ID this board belongs to */
  projectId: string
  /** Initial data to load (from database) */
  initialData?: ExcalidrawSnapshot
  /** Whether the board is read-only */
  readOnly?: boolean
  /** Theme preference */
  theme?: 'light' | 'dark'
  /** Callback when the board content changes */
  onChange?: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void
  /** Callback when pointer updates (for collaboration cursors) */
  onPointerUpdate?: (payload: { pointer: { x: number; y: number }; button: string }) => void
  /** Callback when the Excalidraw API is ready */
  onReady?: (api: ExcalidrawImperativeAPI) => void
  /** Custom class name for the container */
  className?: string
  /** Debounce time for onChange in ms (default: 1000) */
  debounceMs?: number
  /** Whether collaboration is currently active */
  isCollaborating?: boolean
  /** Callback when the collaboration trigger is clicked */
  onCollaborationTrigger?: () => void
}

export interface ExcalidrawBoardRef {
  /** Get the current board snapshot */
  getSnapshot: () => ExcalidrawSnapshot | null
  /** Export to PNG blob */
  exportToPng: (options?: { scale?: number; background?: boolean }) => Promise<Blob | null>
  /** Export to SVG string */
  exportToSvg: () => Promise<SVGSVGElement | null>
  /** Export to JSON string */
  exportToJson: () => Promise<string | null>
  /** Get the Excalidraw API */
  getApi: () => ExcalidrawImperativeAPI | null
  /** Update elements programmatically */
  updateElements: (elements: ExcalidrawElement[]) => void
  /** Reset the view */
  resetView: () => void
}

/**
 * ExcalidrawBoard - Whiteboard component using Excalidraw
 */
export const ExcalidrawBoard = forwardRef<ExcalidrawBoardRef, ExcalidrawBoardProps>(
  function ExcalidrawBoard(
    {
      projectId,
      initialData,
      readOnly = false,
      theme = 'light',
      onChange,
      onPointerUpdate,
      onReady,
      className = '',
      debounceMs = 1000,
      isCollaborating = false,
      onCollaborationTrigger,
    },
    ref
  ) {
    const [isClient, setIsClient] = useState(false)
    const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const lastSnapshotRef = useRef<string>('')

    // Handle client-side rendering
    useEffect(() => {
      setIsClient(true)
    }, [])

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getSnapshot: () => {
        if (!apiRef.current) return null
        const elements = apiRef.current.getSceneElements()
        const appState = apiRef.current.getAppState()
        const files = apiRef.current.getFiles()
        return {
          elements: [...elements],
          appState: {
            viewBackgroundColor: appState.viewBackgroundColor,
            zoom: appState.zoom,
            scrollX: appState.scrollX,
            scrollY: appState.scrollY,
            gridSize: appState.gridSize,
          },
          files,
        }
      },
      exportToPng: async (options = {}) => {
        if (!apiRef.current) return null
        const utils = await loadExportUtils()
        const elements = apiRef.current.getSceneElements()
        const appState = apiRef.current.getAppState()
        const files = apiRef.current.getFiles()
        return utils.exportToBlob({
          elements,
          appState: {
            ...appState,
            exportWithDarkMode: theme === 'dark',
          },
          files,
          getDimensions: () => ({
            width: 1920,
            height: 1080,
            scale: options.scale ?? 2,
          }),
        })
      },
      exportToSvg: async () => {
        if (!apiRef.current) return null
        const utils = await loadExportUtils()
        const elements = apiRef.current.getSceneElements()
        const appState = apiRef.current.getAppState()
        const files = apiRef.current.getFiles()
        return utils.exportToSvg({
          elements,
          appState: {
            ...appState,
            exportWithDarkMode: theme === 'dark',
          },
          files,
        })
      },
      exportToJson: async () => {
        if (!apiRef.current) return null
        const utils = await loadExportUtils()
        const elements = apiRef.current.getSceneElements()
        const appState = apiRef.current.getAppState()
        const files = apiRef.current.getFiles()
        return utils.serializeAsJSON(
          elements,
          appState,
          files,
          'local'
        )
      },
      getApi: () => apiRef.current,
      updateElements: (elements: ExcalidrawElement[]) => {
        if (apiRef.current) {
          apiRef.current.updateScene({ elements })
        }
      },
      resetView: () => {
        if (apiRef.current) {
          apiRef.current.scrollToContent(apiRef.current.getSceneElements(), {
            fitToContent: true,
            animate: true,
          })
        }
      },
    }), [theme])

    // Handle onChange with debouncing
    const handleChange = useCallback(
      (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
        if (!onChange) return

        // Create a simple hash of elements to detect changes
        const elementsHash = JSON.stringify(elements.map((e: any) => ({ id: e.id, version: e.version })))
        if (elementsHash === lastSnapshotRef.current) return
        lastSnapshotRef.current = elementsHash

        // Debounce the onChange callback
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(() => {
          onChange(elements, appState, files)
        }, debounceMs)
      },
      [onChange, debounceMs]
    )

    // Cleanup debounce timer on unmount
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
      }
    }, [])

    // Don't render on server
    if (!isClient) {
      return (
        <div 
          className={`excalidraw-board-loading ${className}`}
          style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          }}
        >
          <div style={{ textAlign: 'center', color: theme === 'dark' ? '#fff' : '#333' }}>
            <div 
              style={{ 
                width: 48, 
                height: 48, 
                border: '4px solid currentColor', 
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }} 
            />
            <p>Loading whiteboard...</p>
          </div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )
    }

    return (
      <>
        {/* CSS to contain Excalidraw and ensure proper UI rendering */}
        <style>{`
          .excalidraw-board-container {
            width: 100%;
            height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
          }
          .excalidraw-board-container .excalidraw {
            width: 100%;
            height: 100%;
            flex: 1;
          }
          .excalidraw-board-container .excalidraw-container {
            width: 100% !important;
            height: 100% !important;
          }
          /* Ensure proper z-index for UI elements */
          .excalidraw-board-container .excalidraw .App-menu {
            z-index: 10;
          }
          .excalidraw-board-container .excalidraw .layer-ui__wrapper {
            z-index: 10;
          }
          /* Keep SVG icon size constraints for toolbar icons */
          .excalidraw-board-container .excalidraw .Island svg,
          .excalidraw-board-container .excalidraw .App-menu svg {
            max-width: 24px;
            max-height: 24px;
          }
          .excalidraw-board-container .excalidraw .ToolIcon__icon svg {
            width: 100%;
            height: 100%;
          }
        `}</style>
        <div 
          className={`excalidraw-board-container ${className}`}
        >
          <Excalidraw
            excalidrawAPI={(api: any) => {
              apiRef.current = api
              if (onReady) {
                onReady(api)
              }
            }}
            initialData={initialData ? {
              elements: initialData.elements,
              appState: {
                ...initialData.appState,
                theme,
              },
              files: initialData.files,
            } : {
              appState: { theme },
            }}
            onChange={handleChange}
            onPointerUpdate={onPointerUpdate}
            viewModeEnabled={readOnly}
            zenModeEnabled={false}
            gridModeEnabled={false}
            theme={theme}
            UIOptions={{
              canvasActions: {
                changeViewBackgroundColor: true,
                clearCanvas: !readOnly,
                export: { saveFileToDisk: true },
                loadScene: !readOnly,
                saveToActiveFile: false,
                toggleTheme: true,
              },
              tools: {
                image: true, // Enable image import
              },
            }}
          />
        </div>
      </>
    )
  }
)

export default ExcalidrawBoard
