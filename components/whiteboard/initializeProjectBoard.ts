/**
 * Initialize Project Board
 * 
 * Functions to initialize an Excalidraw board with project data.
 * Creates a visual layout of items, versions, and parts.
 * Supports loading hero images from items.
 */

// Flexible types for Excalidraw
type ExcalidrawElement = any
type AppState = any
type BinaryFiles = Record<string, any>
import type { Project } from '../../types'
import type { ExcalidrawSnapshot } from './ExcalidrawBoard'
import {
  generateProjectBoardLayout,
  generateProjectBoardLayoutWithImages,
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
  /** Load hero images from items (async) */
  loadImages?: boolean
}

/**
 * Initialize board with project data if it's empty (sync version, no images)
 */
export function initializeProjectBoard(
  project: Project,
  existingSnapshot?: ExcalidrawSnapshot,
  options: InitializeBoardOptions = {}
): ExcalidrawSnapshot {
  const { force = false, theme = 'light' } = options

  if (!force && existingSnapshot && !isBoardEmpty(existingSnapshot.elements)) {
    return existingSnapshot
  }

  if (!project.items || project.items.length === 0) {
    return {
      elements: [],
      appState: {
        viewBackgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        gridSize: null,
      },
      files: {},
    }
  }

  const elements = generateProjectBoardLayout(project)
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
 * Initialize board with project data AND images (async version)
 */
export async function initializeProjectBoardWithImages(
  project: Project,
  existingSnapshot?: ExcalidrawSnapshot,
  options: InitializeBoardOptions = {}
): Promise<ExcalidrawSnapshot> {
  const { force = false, theme = 'light' } = options

  if (!force && existingSnapshot && !isBoardEmpty(existingSnapshot.elements)) {
    return existingSnapshot
  }

  if (!project.items || project.items.length === 0) {
    return {
      elements: [],
      appState: {
        viewBackgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        gridSize: null,
      },
      files: {},
    }
  }

  const { elements, files } = await generateProjectBoardLayoutWithImages(project)
  const bounds = getElementsBounds(elements)
  const padding = 50

  const appState: Partial<AppState> = {
    viewBackgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    scrollX: -bounds.minX + padding,
    scrollY: -bounds.minY + padding,
    zoom: { value: 0.8 as any },
    gridSize: null,
  }

  return {
    elements,
    appState,
    files,
  }
}

export function mergeProjectDataWithBoard(
  project: Project,
  existingSnapshot: ExcalidrawSnapshot
): ExcalidrawSnapshot {
  return existingSnapshot
}

export function shouldInitializeBoard(
  project: Project,
  existingSnapshot?: ExcalidrawSnapshot
): boolean {
  if (!existingSnapshot) return true
  if (isBoardEmpty(existingSnapshot.elements) && project.items?.length > 0) {
    return true
  }
  return false
}

export function getBoardSummary(elements: readonly ExcalidrawElement[]): {
  totalElements: number
  shapes: number
  text: number
  arrows: number
  images: number
} {
  const summary = { totalElements: 0, shapes: 0, text: 0, arrows: 0, images: 0 }
  elements.forEach(el => {
    if (el.isDeleted) return
    summary.totalElements++
    switch (el.type) {
      case 'rectangle': case 'ellipse': case 'diamond': case 'freedraw': case 'line':
        summary.shapes++; break
      case 'text': summary.text++; break
      case 'arrow': summary.arrows++; break
      case 'image': summary.images++; break
    }
  })
  return summary
}
