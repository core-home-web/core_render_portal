/**
 * Excalidraw Utilities
 * 
 * Utility functions for creating Excalidraw elements from project data.
 * Includes support for loading hero images from items.
 */

type ExcalidrawElement = any
import type { Project, Item, Part, Version } from '../types'

type ExcalidrawElementType = 
  | 'rectangle' | 'ellipse' | 'diamond' | 'text' | 'arrow' | 'line' | 'freedraw' | 'image' | 'frame'

const COLORS = {
  item: { fill: '#e3f2fd', stroke: '#1976d2' },
  part: { fill: '#f3e5f5', stroke: '#7b1fa2' },
  version: { fill: '#e8f5e9', stroke: '#388e3c' },
  arrow: { stroke: '#757575' },
  text: { primary: '#212121', secondary: '#616161' },
}

const LAYOUT = {
  itemWidth: 400, itemHeight: 80, itemWithImageHeight: 280,
  imageWidth: 200, imageHeight: 150,
  partWidth: 350, partHeight: 60,
  versionWidth: 300, versionHeight: 50,
  horizontalGap: 50, verticalGap: 30, groupPadding: 20,
}

export interface ExcalidrawImageFile {
  mimeType: string; id: string; dataURL: string; created: number;
}

const imageFilesStore: Record<string, ExcalidrawImageFile> = {}

export function generateElementId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function createBaseElement(type: ExcalidrawElementType, x: number, y: number, width: number, height: number): Partial<ExcalidrawElement> {
  return {
    id: generateElementId(), type, x, y, width, height, angle: 0,
    strokeColor: '#000000', backgroundColor: 'transparent', fillStyle: 'solid',
    strokeWidth: 2, strokeStyle: 'solid', roughness: 1, opacity: 100,
    groupIds: [], frameId: null, roundness: { type: 3 },
    seed: Math.floor(Math.random() * 100000), version: 1,
    versionNonce: Math.floor(Math.random() * 100000), isDeleted: false,
    boundElements: null, updated: Date.now(), link: null, locked: false,
  }
}

export function createRectangle(x: number, y: number, width: number, height: number, options: { fillColor?: string; strokeColor?: string } = {}): ExcalidrawElement {
  return { ...createBaseElement('rectangle', x, y, width, height), backgroundColor: options.fillColor || 'transparent', strokeColor: options.strokeColor || '#000000' } as ExcalidrawElement
}

export function createText(text: string, x: number, y: number, options: { fontSize?: number; fontFamily?: number; textAlign?: 'left' | 'center' | 'right'; color?: string; width?: number } = {}): ExcalidrawElement {
  const fontSize = options.fontSize || 20
  const width = options.width || text.length * fontSize * 0.6
  const height = fontSize * 1.5
  return { ...createBaseElement('text', x, y, width, height), type: 'text', text, fontSize, fontFamily: options.fontFamily || 1, textAlign: options.textAlign || 'left', verticalAlign: 'top', strokeColor: options.color || COLORS.text.primary, baseline: fontSize, containerId: null, originalText: text, lineHeight: 1.25 } as unknown as ExcalidrawElement
}

export function createImageElement(fileId: string, x: number, y: number, width: number, height: number): ExcalidrawElement {
  return { ...createBaseElement('image', x, y, width, height), type: 'image', fileId, status: 'saved', scale: [1, 1] } as unknown as ExcalidrawElement
}

export async function fetchImageAsDataURL(imageUrl: string): Promise<{ dataURL: string; mimeType: string } | null> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) return null
    const blob = await response.blob()
    const mimeType = blob.type || 'image/png'
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve({ dataURL: reader.result as string, mimeType })
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch { return null }
}

export function addImageToStore(dataURL: string, mimeType: string): string {
  const fileId = generateElementId()
  imageFilesStore[fileId] = { mimeType, id: fileId, dataURL, created: Date.now() }
  return fileId
}

export function getImageFiles(): Record<string, ExcalidrawImageFile> { return { ...imageFilesStore } }
export function clearImageFilesStore(): void { Object.keys(imageFilesStore).forEach(key => delete imageFilesStore[key]) }

export function createArrow(startX: number, startY: number, endX: number, endY: number, options: { strokeColor?: string; startBinding?: { elementId: string; focus: number; gap: number }; endBinding?: { elementId: string; focus: number; gap: number } } = {}): ExcalidrawElement {
  const width = Math.abs(endX - startX), height = Math.abs(endY - startY)
  return { ...createBaseElement('arrow', Math.min(startX, endX), Math.min(startY, endY), width, height), type: 'arrow', strokeColor: options.strokeColor || COLORS.arrow.stroke, points: [[0, 0], [endX - startX, endY - startY]], startBinding: options.startBinding || null, endBinding: options.endBinding || null, startArrowhead: null, endArrowhead: 'arrow' } as unknown as ExcalidrawElement
}

export function createProjectItemCard(item: Item, x: number, y: number, imageFileId?: string): { elements: ExcalidrawElement[]; height: number } {
  const elements: ExcalidrawElement[] = []
  const groupId = generateElementId()
  const hasImage = !!imageFileId
  const cardHeight = hasImage ? LAYOUT.itemWithImageHeight : LAYOUT.itemHeight

  const cardRect = createRectangle(x, y, LAYOUT.itemWidth, cardHeight, { fillColor: COLORS.item.fill, strokeColor: COLORS.item.stroke })
  cardRect.groupIds = [groupId]; elements.push(cardRect)

  const nameText = createText(item.name, x + 15, y + 15, { fontSize: 24, fontFamily: 1, color: COLORS.text.primary, width: LAYOUT.itemWidth - 30 })
  nameText.groupIds = [groupId]; elements.push(nameText)

  const partCount = item.versions?.length ? item.versions.reduce((sum, v) => sum + (v.parts?.length || 0), 0) : item.parts?.length || 0
  const versionCount = item.versions?.length || 0
  const detailText = createText(`${partCount} part${partCount !== 1 ? 's' : ''} • ${versionCount} version${versionCount !== 1 ? 's' : ''}`, x + 15, y + 50, { fontSize: 14, fontFamily: 2, color: COLORS.text.secondary, width: LAYOUT.itemWidth - 30 })
  detailText.groupIds = [groupId]; elements.push(detailText)

  if (hasImage && imageFileId) {
    const imageX = x + (LAYOUT.itemWidth - LAYOUT.imageWidth) / 2, imageY = y + 80
    const imageElement = createImageElement(imageFileId, imageX, imageY, LAYOUT.imageWidth, LAYOUT.imageHeight)
    imageElement.groupIds = [groupId]; elements.push(imageElement)
  }
  return { elements, height: cardHeight }
}

export function createPartElement(part: Part, x: number, y: number): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = [], groupId = generateElementId()
  const partRect = createRectangle(x, y, LAYOUT.partWidth, LAYOUT.partHeight, { fillColor: COLORS.part.fill, strokeColor: COLORS.part.stroke })
  partRect.groupIds = [groupId]; elements.push(partRect)
  const nameText = createText(part.name, x + 10, y + 10, { fontSize: 18, fontFamily: 1, color: COLORS.text.primary, width: LAYOUT.partWidth - 20 })
  nameText.groupIds = [groupId]; elements.push(nameText)
  const details: string[] = []
  if (part.finish) details.push(part.finish); if (part.color) details.push(part.color); if (part.texture) details.push(part.texture)
  if (details.length > 0) { const dt = createText(details.join(' • '), x + 10, y + 35, { fontSize: 12, fontFamily: 2, color: COLORS.text.secondary, width: LAYOUT.partWidth - 20 }); dt.groupIds = [groupId]; elements.push(dt) }
  return elements
}

export function createVersionBadge(version: Version, x: number, y: number): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = [], groupId = generateElementId()
  const vRect = createRectangle(x, y, LAYOUT.versionWidth, LAYOUT.versionHeight, { fillColor: COLORS.version.fill, strokeColor: COLORS.version.stroke })
  vRect.groupIds = [groupId]; elements.push(vRect)
  const vText = createText(version.versionName || `Version ${version.versionNumber}`, x + 10, y + 12, { fontSize: 16, fontFamily: 2, color: COLORS.text.primary, width: LAYOUT.versionWidth - 20 })
  vText.groupIds = [groupId]; elements.push(vText)
  return elements
}

export function createConnectionArrow(fromElement: ExcalidrawElement, toElement: ExcalidrawElement): ExcalidrawElement {
  const fromCenterX = fromElement.x + (fromElement.width || 0) / 2, fromBottomY = fromElement.y + (fromElement.height || 0)
  const toCenterX = toElement.x + (toElement.width || 0) / 2, toTopY = toElement.y
  return createArrow(fromCenterX, fromBottomY, toCenterX, toTopY, { strokeColor: COLORS.arrow.stroke, startBinding: { elementId: fromElement.id, focus: 0, gap: 5 }, endBinding: { elementId: toElement.id, focus: 0, gap: 5 } })
}

export function generateProjectBoardLayout(project: Project): ExcalidrawElement[] {
  const elements: ExcalidrawElement[] = []
  let currentY = 100; const startX = 100
  elements.push(createText(project.title, startX, currentY - 60, { fontSize: 32, fontFamily: 1, color: COLORS.text.primary }))
  elements.push(createText(`Retailer: ${project.retailer || 'N/A'} • Due: ${project.due_date || 'Not set'}`, startX, currentY - 20, { fontSize: 14, fontFamily: 2, color: COLORS.text.secondary }))
  project.items?.forEach((item) => {
    const { elements: itemElements, height: itemHeight } = createProjectItemCard(item, startX, currentY)
    elements.push(...itemElements); const itemRect = itemElements[0]
    let partX = startX + LAYOUT.itemWidth + LAYOUT.horizontalGap, partY = currentY
    if (item.versions && item.versions.length > 0) {
      item.versions.forEach((version) => {
        const vElements = createVersionBadge(version, partX, partY); elements.push(...vElements); const vRect = vElements[0]
        elements.push(createConnectionArrow(itemRect, vRect))
        let vPartY = partY + LAYOUT.versionHeight + LAYOUT.verticalGap
        version.parts?.forEach((part) => { const pEl = createPartElement(part, partX + 20, vPartY); elements.push(...pEl); elements.push(createConnectionArrow(vRect, pEl[0])); vPartY += LAYOUT.partHeight + LAYOUT.verticalGap })
        partX += LAYOUT.partWidth + LAYOUT.horizontalGap + 40
      })
      const maxParts = Math.max(...item.versions.map(v => v.parts?.length || 0), 1)
      currentY += Math.max(itemHeight, LAYOUT.versionHeight + (maxParts * (LAYOUT.partHeight + LAYOUT.verticalGap))) + LAYOUT.verticalGap * 2
    } else if (item.parts && item.parts.length > 0) {
      item.parts.forEach((part) => { const pEl = createPartElement(part, partX, partY); elements.push(...pEl); elements.push(createConnectionArrow(itemRect, pEl[0])); partY += LAYOUT.partHeight + LAYOUT.verticalGap })
      currentY = Math.max(currentY + itemHeight, partY) + LAYOUT.verticalGap * 2
    } else { currentY += itemHeight + LAYOUT.verticalGap * 2 }
  })
  return elements
}

export async function generateProjectBoardLayoutWithImages(project: Project): Promise<{ elements: ExcalidrawElement[]; files: Record<string, ExcalidrawImageFile> }> {
  const elements: ExcalidrawElement[] = []; clearImageFilesStore()
  let currentY = 100; const startX = 100
  elements.push(createText(project.title, startX, currentY - 60, { fontSize: 32, fontFamily: 1, color: COLORS.text.primary }))
  const dueDate = project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'
  elements.push(createText(`Retailer: ${project.retailer || 'N/A'} • Due: ${dueDate}`, startX, currentY - 20, { fontSize: 14, fontFamily: 2, color: COLORS.text.secondary }))
  for (const item of project.items || []) {
    let imageFileId: string | undefined
    if (item.hero_image) { try { const imgData = await fetchImageAsDataURL(item.hero_image); if (imgData) imageFileId = addImageToStore(imgData.dataURL, imgData.mimeType) } catch { } }
    const { elements: itemElements, height: itemHeight } = createProjectItemCard(item, startX, currentY, imageFileId)
    elements.push(...itemElements); const itemRect = itemElements[0]
    let partX = startX + LAYOUT.itemWidth + LAYOUT.horizontalGap, partY = currentY
    if (item.versions && item.versions.length > 0) {
      for (const version of item.versions) {
        const vElements = createVersionBadge(version, partX, partY); elements.push(...vElements); const vRect = vElements[0]
        elements.push(createConnectionArrow(itemRect, vRect))
        let vPartY = partY + LAYOUT.versionHeight + LAYOUT.verticalGap
        for (const part of version.parts || []) { const pEl = createPartElement(part, partX + 20, vPartY); elements.push(...pEl); elements.push(createConnectionArrow(vRect, pEl[0])); vPartY += LAYOUT.partHeight + LAYOUT.verticalGap }
        partX += LAYOUT.partWidth + LAYOUT.horizontalGap + 40
      }
      const maxParts = Math.max(...item.versions.map(v => v.parts?.length || 0), 1)
      currentY += Math.max(itemHeight, LAYOUT.versionHeight + (maxParts * (LAYOUT.partHeight + LAYOUT.verticalGap))) + LAYOUT.verticalGap * 2
    } else if (item.parts && item.parts.length > 0) {
      for (const part of item.parts) { const pEl = createPartElement(part, partX, partY); elements.push(...pEl); elements.push(createConnectionArrow(itemRect, pEl[0])); partY += LAYOUT.partHeight + LAYOUT.verticalGap }
      currentY = Math.max(currentY + itemHeight, partY) + LAYOUT.verticalGap * 2
    } else { currentY += itemHeight + LAYOUT.verticalGap * 2 }
  }
  return { elements, files: getImageFiles() }
}

export function isBoardEmpty(elements: readonly ExcalidrawElement[] | undefined): boolean {
  if (!elements || elements.length === 0) return true; return elements.every(el => el.isDeleted)
}

export function getElementsBounds(elements: readonly ExcalidrawElement[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  if (elements.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  elements.forEach(el => { if (el.isDeleted) return; minX = Math.min(minX, el.x); minY = Math.min(minY, el.y); maxX = Math.max(maxX, el.x + (el.width || 0)); maxY = Math.max(maxY, el.y + (el.height || 0)) })
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}
