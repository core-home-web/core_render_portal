/**
 * Excalidraw Utilities
 * 
 * Utility functions for creating Excalidraw elements from project data
 * and managing whiteboard state.
 */

// Flexible type for Excalidraw elements
type ExcalidrawElement = any
import type { Project, Item, Part, Version } from '../types'

// Excalidraw element types
type ExcalidrawElementType = 
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'text'
  | 'arrow'
  | 'line'
  | 'freedraw'
  | 'image'
  | 'frame'

// Color palette for project items
const COLORS = {
  item: {
    fill: '#e3f2fd',
    stroke: '#1976d2',
  },
  part: {
    fill: '#f3e5f5',
    stroke: '#7b1fa2',
  },
  version: {
    fill: '#e8f5e9',
    stroke: '#388e3c',
  },
  arrow: {
    stroke: '#757575',
  },
  text: {
    primary: '#212121',
    secondary: '#616161',
  },
}

// Layout constants
const LAYOUT = {
  itemWidth: 400,
  itemHeight: 80,
  partWidth: 350,
  partHeight: 60,
  versionWidth: 300,
  versionHeight: 50,
  horizontalGap: 50,
  verticalGap: 30,
  groupPadding: 20,
}

/**
 * Generate a unique ID for Excalidraw elements
 */
export function generateElementId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

/**
 * Create a base Excalidraw element with common properties
 */
function createBaseElement(
  type: ExcalidrawElementType,
  x: number,
  y: number,
  width: number,
  height: number
): Partial<ExcalidrawElement> {
  return {
    id: generateElementId(),
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: { type: 3 },
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 100000),
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
  }
}

/**
 * Create a rectangle element
 */
export function createRectangle(
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fillColor?: string
    strokeColor?: string
    label?: string
  } = {}
): ExcalidrawElement {
  return {
    ...createBaseElement('rectangle', x, y, width, height),
    backgroundColor: options.fillColor || 'transparent',
    strokeColor: options.strokeColor || '#000000',
  } as ExcalidrawElement
}

/**
 * Create a text element
 */
export function createText(
  text: string,
  x: number,
  y: number,
  options: {
    fontSize?: number
    fontFamily?: number
    textAlign?: 'left' | 'center' | 'right'
    color?: string
    width?: number
  } = {}
): ExcalidrawElement {
  const fontSize = options.fontSize || 20
  const width = options.width || text.length * fontSize * 0.6
  const height = fontSize * 1.5

  return {
    ...createBaseElement('text', x, y, width, height),
    type: 'text',
    text,
    fontSize,
    fontFamily: options.fontFamily || 1, // 1 = Hand-drawn, 2 = Normal, 3 = Mono
    textAlign: options.textAlign || 'left',
    verticalAlign: 'top',
    strokeColor: options.color || COLORS.text.primary,
    baseline: fontSize,
    containerId: null,
    originalText: text,
    lineHeight: 1.25,
  } as unknown as ExcalidrawElement
}

/**
 * Create an arrow element connecting two points
 */
export function createArrow(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: {
    strokeColor?: string
    startBinding?: { elementId: string; focus: number; gap: number }
    endBinding?: { elementId: string; focus: number; gap: number }
  } = {}
): ExcalidrawElement {
  const width = Math.abs(endX - startX)
  const height = Math.abs(endY - startY)

  return {
    ...createBaseElement('arrow', Math.min(startX, endX), Math.min(startY, endY), width, height),
    type: 'arrow',
    strokeColor: options.strokeColor || COLORS.arrow.stroke,
    points: [
      [0, 0],
      [endX - startX, endY - startY],
    ],
    startBinding: options.startBinding || null,
    endBinding: options.endBinding || null,
    startArrowhead: null,
    endArrowhead: 'arrow',
  } as unknown as ExcalidrawElement
}

/**
 * Create an item card element (rectangle with text)
 */
export function createProjectItemCard(
  item: Item,
  x: number,
  y: number
): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = []
  const groupId = generateElementId()

  // Create the card rectangle
  const cardRect = createRectangle(x, y, LAYOUT.itemWidth, LAYOUT.itemHeight, {
    fillColor: COLORS.item.fill,
    strokeColor: COLORS.item.stroke,
  })
  cardRect.groupIds = [groupId]
  elements.push(cardRect)

  // Create the item name text
  const nameText = createText(item.name, x + 15, y + 15, {
    fontSize: 24,
    fontFamily: 1,
    color: COLORS.text.primary,
    width: LAYOUT.itemWidth - 30,
  })
  nameText.groupIds = [groupId]
  elements.push(nameText)

  // Add item details (part count)
  const partCount = item.versions?.length 
    ? item.versions.reduce((sum, v) => sum + (v.parts?.length || 0), 0)
    : item.parts?.length || 0
  
  const detailText = createText(
    `${partCount} part${partCount !== 1 ? 's' : ''} • ${item.versions?.length || 0} version${(item.versions?.length || 0) !== 1 ? 's' : ''}`,
    x + 15,
    y + 50,
    {
      fontSize: 14,
      fontFamily: 2,
      color: COLORS.text.secondary,
      width: LAYOUT.itemWidth - 30,
    }
  )
  detailText.groupIds = [groupId]
  elements.push(detailText)

  return elements
}

/**
 * Create a part element
 */
export function createPartElement(
  part: Part,
  x: number,
  y: number
): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = []
  const groupId = generateElementId()

  // Create the part rectangle
  const partRect = createRectangle(x, y, LAYOUT.partWidth, LAYOUT.partHeight, {
    fillColor: COLORS.part.fill,
    strokeColor: COLORS.part.stroke,
  })
  partRect.groupIds = [groupId]
  elements.push(partRect)

  // Create the part name text
  const nameText = createText(part.name, x + 10, y + 10, {
    fontSize: 18,
    fontFamily: 1,
    color: COLORS.text.primary,
    width: LAYOUT.partWidth - 20,
  })
  nameText.groupIds = [groupId]
  elements.push(nameText)

  // Create part details
  const details: string[] = []
  if (part.finish) details.push(part.finish)
  if (part.color) details.push(part.color)
  if (part.texture) details.push(part.texture)

  if (details.length > 0) {
    const detailText = createText(details.join(' • '), x + 10, y + 35, {
      fontSize: 12,
      fontFamily: 2,
      color: COLORS.text.secondary,
      width: LAYOUT.partWidth - 20,
    })
    detailText.groupIds = [groupId]
    elements.push(detailText)
  }

  return elements
}

/**
 * Create a version badge element
 */
export function createVersionBadge(
  version: Version,
  x: number,
  y: number
): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = []
  const groupId = generateElementId()

  // Create the version rectangle
  const versionRect = createRectangle(x, y, LAYOUT.versionWidth, LAYOUT.versionHeight, {
    fillColor: COLORS.version.fill,
    strokeColor: COLORS.version.stroke,
  })
  versionRect.groupIds = [groupId]
  elements.push(versionRect)

  // Create the version text
  const versionLabel = version.versionName || `Version ${version.versionNumber}`
  const versionText = createText(versionLabel, x + 10, y + 12, {
    fontSize: 16,
    fontFamily: 2,
    color: COLORS.text.primary,
    width: LAYOUT.versionWidth - 20,
  })
  versionText.groupIds = [groupId]
  elements.push(versionText)

  return elements
}

/**
 * Create a connection arrow between two elements
 */
export function createConnectionArrow(
  fromElement: ExcalidrawElement,
  toElement: ExcalidrawElement
): ExcalidrawElement {
  const fromCenterX = fromElement.x + (fromElement.width || 0) / 2
  const fromBottomY = fromElement.y + (fromElement.height || 0)
  const toCenterX = toElement.x + (toElement.width || 0) / 2
  const toTopY = toElement.y

  return createArrow(fromCenterX, fromBottomY, toCenterX, toTopY, {
    strokeColor: COLORS.arrow.stroke,
    startBinding: {
      elementId: fromElement.id,
      focus: 0,
      gap: 5,
    },
    endBinding: {
      elementId: toElement.id,
      focus: 0,
      gap: 5,
    },
  })
}

/**
 * Generate a complete board layout from project data
 */
export function generateProjectBoardLayout(project: Project): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = []
  
  // Starting position
  let currentY = 100
  const startX = 100

  // Create title
  const titleText = createText(project.title, startX, currentY - 60, {
    fontSize: 32,
    fontFamily: 1,
    color: COLORS.text.primary,
  })
  elements.push(titleText)

  // Create project metadata
  const metaText = createText(
    `Retailer: ${project.retailer || 'N/A'} • Due: ${project.due_date || 'Not set'}`,
    startX,
    currentY - 20,
    {
      fontSize: 14,
      fontFamily: 2,
      color: COLORS.text.secondary,
    }
  )
  elements.push(metaText)

  // Process each item
  project.items?.forEach((item, itemIndex) => {
    // Create item card
    const itemX = startX
    const itemY = currentY
    const itemElements = createProjectItemCard(item, itemX, itemY)
    elements.push(...itemElements)

    // Get the main item element for connections
    const itemRect = itemElements[0]

    // Position for parts/versions
    let partX = startX + LAYOUT.itemWidth + LAYOUT.horizontalGap
    let partY = currentY

    // Check if using versions
    if (item.versions && item.versions.length > 0) {
      item.versions.forEach((version, versionIndex) => {
        // Create version badge
        const versionElements = createVersionBadge(version, partX, partY)
        elements.push(...versionElements)
        const versionRect = versionElements[0]

        // Arrow from item to version
        elements.push(createConnectionArrow(itemRect, versionRect))

        // Create parts under version
        let versionPartY = partY + LAYOUT.versionHeight + LAYOUT.verticalGap

        version.parts?.forEach((part, partIndex) => {
          const partElements = createPartElement(part, partX + 20, versionPartY)
          elements.push(...partElements)

          // Arrow from version to part
          elements.push(createConnectionArrow(versionRect, partElements[0]))

          versionPartY += LAYOUT.partHeight + LAYOUT.verticalGap
        })

        // Move to next column for next version
        partX += LAYOUT.partWidth + LAYOUT.horizontalGap + 40
      })

      // Update Y position for next item
      const maxPartsInVersion = Math.max(
        ...item.versions.map(v => v.parts?.length || 0),
        1
      )
      currentY += Math.max(
        LAYOUT.itemHeight,
        LAYOUT.versionHeight + (maxPartsInVersion * (LAYOUT.partHeight + LAYOUT.verticalGap))
      ) + LAYOUT.verticalGap * 2
    } else if (item.parts && item.parts.length > 0) {
      // Legacy parts format
      item.parts.forEach((part, partIndex) => {
        const partElements = createPartElement(part, partX, partY)
        elements.push(...partElements)

        // Arrow from item to part
        elements.push(createConnectionArrow(itemRect, partElements[0]))

        partY += LAYOUT.partHeight + LAYOUT.verticalGap
      })

      currentY = Math.max(currentY + LAYOUT.itemHeight, partY) + LAYOUT.verticalGap * 2
    } else {
      currentY += LAYOUT.itemHeight + LAYOUT.verticalGap * 2
    }
  })

  return elements
}

/**
 * Check if elements array is empty or has no content
 */
export function isBoardEmpty(elements: readonly ExcalidrawElement[] | undefined): boolean {
  if (!elements || elements.length === 0) return true
  // Check if all elements are deleted
  return elements.every(el => el.isDeleted)
}

/**
 * Get bounding box of all elements
 */
export function getElementsBounds(elements: readonly ExcalidrawElement[]): {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
} {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  elements.forEach(el => {
    if (el.isDeleted) return
    minX = Math.min(minX, el.x)
    minY = Math.min(minY, el.y)
    maxX = Math.max(maxX, el.x + (el.width || 0))
    maxY = Math.max(maxY, el.y + (el.height || 0))
  })

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}
