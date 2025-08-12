import { useState, useCallback, useRef } from 'react'
import { ImageData } from './types'
import { FileUpload as FileUploadType } from './upload-types'

export interface ManagedImage extends ImageData {
  uploadId: string
  isActive: boolean
  annotations: AnnotationPoint[]
}

export interface AnnotationPoint {
  id: string
  x: number
  y: number
  partId?: string
  groupId?: string
  notes?: string
}

export interface ImageManagerState {
  images: ManagedImage[]
  activeImageId: string | null
  selectedPointId: string | null
  placementMode: boolean
}

export function useImageManager() {
  const [state, setState] = useState<ImageManagerState>({
    images: [],
    activeImageId: null,
    selectedPointId: null,
    placementMode: false
  })

  // Add images from uploads
  const addImages = useCallback((uploads: FileUploadType[]) => {
    const newImages: ManagedImage[] = uploads.map(upload => ({
      id: upload.id,
      uploadId: upload.id,
      src: upload.preview || '',
      width: 800, // Default dimensions, will be updated when image loads
      height: 600,
      name: upload.name,
      uploadedAt: new Date(),
      isActive: false,
      annotations: []
    }))

    setState(prev => {
      const updatedImages = [...prev.images, ...newImages]
      
      // Set first image as active if no active image
      let activeId = prev.activeImageId
      if (!activeId && newImages.length > 0) {
        activeId = newImages[0].id
      }

      return {
        ...prev,
        images: updatedImages,
        activeImageId: activeId
      }
    })

    return newImages
  }, [])

  // Remove image
  const removeImage = useCallback((imageId: string) => {
    setState(prev => {
      const updatedImages = prev.images.filter(img => img.id !== imageId)
      let activeId = prev.activeImageId

      // If removing active image, switch to first available
      if (prev.activeImageId === imageId) {
        activeId = updatedImages.length > 0 ? updatedImages[0].id : null
      }

      return {
        ...prev,
        images: updatedImages,
        activeImageId: activeId
      }
    })
  }, [])

  // Set active image
  const setActiveImage = useCallback((imageId: string) => {
    setState(prev => ({
      ...prev,
      activeImageId: imageId,
      images: prev.images.map(img => ({
        ...img,
        isActive: img.id === imageId
      }))
    }))
  }, [])

  // Get active image
  const getActiveImage = useCallback(() => {
    return state.images.find(img => img.id === state.activeImageId) || null
  }, [state.images, state.activeImageId])

  // Toggle placement mode
  const togglePlacementMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      placementMode: !prev.placementMode
    }))
  }, [])

  // Add annotation point
  const addAnnotationPoint = useCallback((x: number, y: number, imageId?: string) => {
    const targetImageId = imageId || state.activeImageId
    if (!targetImageId) return null

    const newPoint: AnnotationPoint = {
      id: crypto.randomUUID(),
      x,
      y,
      notes: ''
    }

    setState(prev => ({
      ...prev,
      images: prev.images.map(img => 
        img.id === targetImageId 
          ? { ...img, annotations: [...img.annotations, newPoint] }
          : img
      ),
      selectedPointId: newPoint.id
    }))

    return newPoint
  }, [state.activeImageId])

  // Remove annotation point
  const removeAnnotationPoint = useCallback((pointId: string, imageId?: string) => {
    const targetImageId = imageId || state.activeImageId
    if (!targetImageId) return

    setState(prev => ({
      ...prev,
      images: prev.images.map(img => 
        img.id === targetImageId 
          ? { ...img, annotations: img.annotations.filter(p => p.id !== pointId) }
          : img
      ),
      selectedPointId: prev.selectedPointId === pointId ? null : prev.selectedPointId
    }))
  }, [state.activeImageId])

  // Select annotation point
  const selectAnnotationPoint = useCallback((pointId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedPointId: pointId
    }))
  }, [])

  // Update annotation point
  const updateAnnotationPoint = useCallback((
    pointId: string, 
    updates: Partial<AnnotationPoint>, 
    imageId?: string
  ) => {
    const targetImageId = imageId || state.activeImageId
    if (!targetImageId) return

    setState(prev => ({
      ...prev,
      images: prev.images.map(img => 
        img.id === targetImageId 
          ? {
              ...img,
              annotations: img.annotations.map(p => 
                p.id === pointId ? { ...p, ...updates } : p
              )
            }
          : img
      )
    }))
  }, [state.activeImageId])

  // Group annotation points
  const groupAnnotationPoints = useCallback((pointIds: string[], groupId: string, imageId?: string) => {
    const targetImageId = imageId || state.activeImageId
    if (!targetImageId) return

    setState(prev => ({
      ...prev,
      images: prev.images.map(img => 
        img.id === targetImageId 
          ? {
              ...img,
              annotations: img.annotations.map(p => 
                pointIds.includes(p.id) ? { ...p, groupId } : p
              )
            }
          : img
      )
    }))
  }, [state.activeImageId])

  // Clear all annotations
  const clearAnnotations = useCallback((imageId?: string) => {
    const targetImageId = imageId || state.activeImageId
    if (!targetImageId) return

    setState(prev => ({
      ...prev,
      images: prev.images.map(img => 
        img.id === targetImageId 
          ? { ...img, annotations: [] }
          : img
      ),
      selectedPointId: null
    }))
  }, [state.activeImageId])

  return {
    state,
    addImages,
    removeImage,
    setActiveImage,
    getActiveImage,
    togglePlacementMode,
    addAnnotationPoint,
    removeAnnotationPoint,
    selectAnnotationPoint,
    updateAnnotationPoint,
    groupAnnotationPoints,
    clearAnnotations
  }
}
