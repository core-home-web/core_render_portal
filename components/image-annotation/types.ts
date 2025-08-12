// Type definitions for the Image Annotation System

export interface CanvasTransform {
  scale: number
  translateX: number
  translateY: number
}

export interface ImageData {
  id: string
  src: string
  width: number
  height: number
  name: string
  uploadedAt: Date
}

export interface CanvasState {
  transform: CanvasTransform
  isDragging: boolean
  lastMousePos: { x: number; y: number } | null
  image: ImageData | null
  containerSize: { width: number; height: number }
}

export interface ZoomLimits {
  min: number
  max: number
}

export interface CanvasProps {
  image?: ImageData
  className?: string
  zoomLimits?: ZoomLimits
  initialZoom?: 'fit' | '100%'
}
