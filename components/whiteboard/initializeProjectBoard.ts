/**
 * Initialize Project Board
 * 
 * Functions to initialize an Excalidraw board with project data.
 * Creates a visual layout of items, versions, and parts.
 */

// Flexible types for Excalidraw
type ExcalidrawElement = any
type AppState = any
type BinaryFiles = Record<string, any>
import type { Project } from '../../types'
import type { ExcalidrawSnapshot } from './ExcalidrawBoard'
import {
  generateProjectBoardLayout,
  isBoardEmpty,
  getElementsBounds,
} from '../../lib/excalidraw-utils'

export interface InitializeBoardOptions {
  /** Force regeneration even if board has content */
  force?: boolean
  /** Theme for the board */
  theme?: 'light' | 'dark'
  /** Center the view on content after initialization */
  centerView?: boolean
}

/**
 * Initialize board with project data if it's empty
 * Returns the initial data to pass to Excalidraw
 */
export function initializeProjectBoard(
  project: Project,
  existingSnapshot?: ExcalidrawSnapshot,
  options: InitializeBoardOptions = {}
): ExcalidrawSnapshot {
  const { force = false, theme = 'light' } = options

  // Check if we should use existing data
  if (!force && existingSnapshot && !isBoardEmpty(existingSnapshot.elements)) {
    return existingSnapshot
  }

  // Check if project has any items to display
  if (!project.items || project.items.length === 0) {
    // Return empty board with default settings
    return {
      elements: [],
      appState: {
        viewBackgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        gridSize: null,
      },
      files: {},
    }
  }

  // Generate elements from project data
  const elements = generateProjectBoardLayout(project)

  // Calculate initial view state
  const bounds = getElementsBounds(elements)
  const padding = 50

  const appState: Partial<AppState> = {
    viewBackgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    scrollX: -bounds.minX + padding,
    scrollY: -bounds.minY + padding,
    zoom: { value: 1 as any },
    gridSize: null,
  }

  return {
    elements,
    appState,
    files: {},
  }
}

/**
 * Merge new project data with existing board
 * Preserves user-added elements while updating project elements
 */
export function mergeProjectDataWithBoard(
  project: Project,
  existingSnapshot: ExcalidrawSnapshot
): ExcalidrawSnapshot {
  // For now, just return existing snapshot
  // TODO: Implement smart merging that:
  // 1. Identifies project-generated elements (by custom metadata)
  // 2. Updates them with new project data
  // 3. Preserves user-added elements
  return existingSnapshot
}

/**
 * Check if board needs initialization
 */
export function shouldInitializeBoard(
  project: Project,
  existingSnapshot?: ExcalidrawSnapshot
): boolean {
  // No existing snapshot, should initialize
  if (!existingSnapshot) return true

  // Empty board and project has items
  if (isBoardEmpty(existingSnapshot.elements) && project.items?.length > 0) {
    return true
  }

  return false
}

/**
 * Get a summary of what the board contains
 */
export function getBoardSummary(elements: readonly ExcalidrawElement[]): {
  totalElements: number
  shapes: number
  text: number
  arrows: number
  images: number
} {
  const summary = {
    totalElements: 0,
    shapes: 0,
    text: 0,
    arrows: 0,
    images: 0,
  }

  elements.forEach(el => {
    if (el.isDeleted) return
    summary.totalElements++

    switch (el.type) {
      case 'rectangle':
      case 'ellipse':
      case 'diamond':
      case 'freedraw':
      case 'line':
        summary.shapes++
        break
      case 'text':
        summary.text++
        break
      case 'arrow':
        summary.arrows++
        break
      case 'image':
        summary.images++
        break
    }
  })

  return summary
}
