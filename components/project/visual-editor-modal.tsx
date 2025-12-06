'use client'

import React, { useCallback, useRef, useState, useMemo } from 'react'
import { Button } from '../ui/button'
import { X, Save, Download, Cloud, CloudOff, Users, Loader2 } from 'lucide-react'
import { Project, getAllItemParts } from '../../types'
import { CoreRenderBoard } from '../whiteboard'
import { useProjectBoard } from '@/hooks/useProjectBoard'
import { createBoardAssetStore } from '@/lib/board-asset-store'
import { Editor, getSnapshot, TLRecord, StoreSnapshot, createShapeId } from 'tldraw'

// Use the correct snapshot type
type TLStoreSnapshot = StoreSnapshot<TLRecord>

interface VisualEditorModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  onSave?: () => void
  onExport?: () => void
}

export function VisualEditorModal({
  isOpen,
  onClose,
  project,
  onSave,
  onExport,
}: VisualEditorModalProps) {
  const editorRef = useRef<Editor | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [exportingHtml, setExportingHtml] = useState(false)
  
  // Use the project board hook for persistence
  const {
    board,
    loading,
    error,
    hasUnsavedChanges,
    saveBoard,
    updateLocalBoard,
    forceSave,
    fetchBoard,
  } = useProjectBoard(project.id, {
    autoSaveInterval: 5000,
    enableAutoSave: true,
  })

  // Create asset store for file uploads
  const assetStore = useMemo(
    () =>
      createBoardAssetStore({
        projectId: project.id,
        onUploadStart: (file) => {
          console.log('Uploading asset:', file.name)
        },
        onUploadComplete: (asset, url) => {
          console.log('Asset uploaded:', url)
        },
        onUploadError: (error) => {
          console.error('Asset upload failed:', error)
        },
      }),
    [project.id]
  )

  // Get sync server URL from environment
  const syncServerUrl = process.env.NEXT_PUBLIC_TLDRAW_SYNC_URL || undefined

  // Initialize whiteboard with project items/parts if empty
  const initializeBoardWithProjectData = useCallback((editor: Editor) => {
    // Check if board is empty (no shapes on current page)
    const shapeIds = editor.getCurrentPageShapeIds()
    if (shapeIds.size > 0) {
      return // Board already has content, don't overwrite
    }

    // Check if we have project items
    if (!project.items || project.items.length === 0) {
      return // No items to display
    }

    // Also check if board snapshot exists and has content
    if (board?.board_snapshot && Object.keys(board.board_snapshot).length > 0) {
      // Check if snapshot has any shapes
      const snapshotStore = (board.board_snapshot as TLStoreSnapshot)?.store
      if (snapshotStore && Object.keys(snapshotStore).length > 0) {
        return // Board has saved content, don't initialize
      }
    }

    // Create shapes for project items and parts
    const shapes: any[] = []
    let yPosition = 100
    const xStart = 100
    const itemSpacing = 300
    const partSpacing = 150

    project.items.forEach((item, itemIndex) => {
      const itemX = xStart
      const itemY = yPosition

      // Create a text shape for the item name
      const itemShapeId = createShapeId()
      shapes.push({
        id: itemShapeId,
        typeName: 'shape',
        type: 'text',
        x: itemX,
        y: itemY,
        props: {
          text: item.name || `Item ${itemIndex + 1}`,
          fontSize: 24,
          fontWeight: 'bold',
          color: 'black',
          w: 400,
          h: 40,
        },
      })

      // Get all parts for this item
      const parts = getAllItemParts(item)
      
      if (parts.length > 0) {
        // Create a group/box for parts
        let partY = itemY + 50
        
        parts.forEach((part, partIndex) => {
          const partX = itemX + 20
          
          // Create text shape for part name
          const partNameId = createShapeId()
          shapes.push({
            id: partNameId,
            typeName: 'shape',
            type: 'text',
            x: partX,
            y: partY,
            props: {
              text: part.name || `Part ${partIndex + 1}`,
              fontSize: 18,
              fontWeight: '600',
              color: 'black',
              w: 350,
              h: 30,
            },
          })

          // Create text for part details
          const details: string[] = []
          if (part.finish) details.push(`Finish: ${part.finish}`)
          if (part.color) details.push(`Color: ${part.color}`)
          if (part.texture) details.push(`Texture: ${part.texture}`)
          
          if (details.length > 0) {
            partY += 30
            const partDetailsId = createShapeId()
            shapes.push({
              id: partDetailsId,
              typeName: 'shape',
              type: 'text',
              x: partX + 20,
              y: partY,
              props: {
                text: details.join(' • '),
                fontSize: 14,
                color: '#666',
                w: 500,
                h: 25,
              },
            })
          }

          partY += 50
        })

        yPosition = partY + 50
      } else {
        yPosition += 80
      }

      // Add spacing between items
      yPosition += 50
    })

    // Create all shapes
    if (shapes.length > 0) {
      // Use createShapes (plural) for batch creation
      editor.createShapes(shapes)
      
      // Save the initial state after a short delay to ensure shapes are created
      setTimeout(() => {
        const snapshot = getSnapshot(editor.store)
        const boardSnapshot: TLStoreSnapshot = {
          store: snapshot.document.store,
          schema: snapshot.document.schema,
        }
        updateLocalBoard(boardSnapshot)
      }, 100)
    }
  }, [project, updateLocalBoard])

  // Handle editor mount
  const handleEditorMount = useCallback((editor: Editor) => {
    editorRef.current = editor
    
    // Initialize board with project data if it's empty
    // Wait for board to load, then check if we need to initialize
    setTimeout(() => {
      // Only initialize if board is empty and we have items
      const shapeIds = editor.getCurrentPageShapeIds()
      const hasExistingContent = board?.board_snapshot && 
        Object.keys(board.board_snapshot).length > 0 &&
        (board.board_snapshot as TLStoreSnapshot)?.store &&
        Object.keys((board.board_snapshot as TLStoreSnapshot).store).length > 0
      
      if (shapeIds.size === 0 && !hasExistingContent && project.items && project.items.length > 0) {
        initializeBoardWithProjectData(editor)
      }
    }, 500) // Wait longer for board to fully initialize
  }, [initializeBoardWithProjectData, board, project])

  // Handle board state changes
  const handleBoardChange = useCallback(
    (snapshot: TLStoreSnapshot) => {
      updateLocalBoard(snapshot)
    },
    [updateLocalBoard]
  )

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

  // Export to HTML
  const handleExportHtml = useCallback(async () => {
    if (!editorRef.current) return

    setExportingHtml(true)
    try {
      const editor = editorRef.current
      
      // Get all shape IDs
      const shapeIds = editor.getCurrentPageShapeIds()
      
      if (shapeIds.size === 0) {
        alert('No content to export. Add some shapes to the whiteboard first.')
        return
      }

      // Export as SVG
      const svg = await editor.getSvgString(Array.from(shapeIds), {
        scale: 1,
        background: true,
      })

      if (!svg) {
        throw new Error('Failed to generate SVG')
      }

      // Generate HTML with embedded SVG
      const htmlContent = generateWhiteboardHTML(project, svg.svg)
      downloadHTML(htmlContent, `${project.title}_whiteboard.html`)

      if (onExport) {
        onExport()
      }
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export whiteboard. Please try again.')
    } finally {
      setExportingHtml(false)
    }
  }, [project, onExport])

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
    onClose()
  }, [hasUnsavedChanges, forceSave, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full h-full max-w-[98vw] max-h-[98vh] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Whiteboard - {project.title}
            </h2>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              {syncServerUrl ? (
                <span className="flex items-center gap-1 text-green-600">
                  <Users className="h-4 w-4" />
                  <span>Real-time sync</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-500">
                  <CloudOff className="h-4 w-4" />
                  <span>Local mode</span>
                </span>
              )}
            </div>

            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm">
              {hasUnsavedChanges ? (
                <span className="text-amber-600">Unsaved changes</span>
              ) : board?.updated_at ? (
                <span className="text-green-600 flex items-center gap-1">
                  <Cloud className="h-4 w-4" />
                  <span>
                    Saved{' '}
                    {new Date(board.updated_at).toLocaleTimeString()}
                  </span>
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="border-green-300 text-green-600 hover:bg-green-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>

            <Button
              onClick={handleExportHtml}
              disabled={exportingHtml}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {exportingHtml ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export HTML
            </Button>

            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Board Content */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading whiteboard...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchBoard} disabled={loading}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <CoreRenderBoard
              projectId={project.id}
              syncServerUrl={syncServerUrl}
              initialSnapshot={
                board?.board_snapshot &&
                Object.keys(board.board_snapshot).length > 0
                  ? (board.board_snapshot as TLStoreSnapshot)
                  : undefined
              }
              onMount={handleEditorMount}
              onBoardChange={handleBoardChange}
              assetStore={assetStore}
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Generate HTML document from whiteboard SVG
 */
function generateWhiteboardHTML(project: Project, svgContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.title} - Whiteboard Export</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f8fafc;
      min-height: 100vh;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .header h1 {
      font-size: 2.5rem;
      color: #1e293b;
      margin-bottom: 8px;
    }
    
    .header .metadata {
      color: #64748b;
      font-size: 0.875rem;
    }
    
    .whiteboard-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
      padding: 24px;
      overflow: auto;
    }
    
    .whiteboard-container svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #94a3b8;
      font-size: 0.75rem;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .whiteboard-container {
        box-shadow: none;
        border-radius: 0;
      }
      
      .footer {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>${project.title}</h1>
      <p class="metadata">
        ${project.retailer ? `Retailer: ${project.retailer} | ` : ''}
        Exported on ${new Date().toLocaleDateString()}
      </p>
    </header>
    
    <main class="whiteboard-container">
      ${svgContent}
    </main>
    
    <footer class="footer">
      Generated by Core Render Portal Whiteboard
    </footer>
  </div>
</body>
</html>`
}

/**
 * Download HTML content as a file
 */
function downloadHTML(htmlContent: string, filename: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
