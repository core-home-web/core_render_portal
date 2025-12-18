# Chapter 17: Image Annotation

This chapter covers the image annotation system that allows users to place markers on product images and configure part specifications.

---

## Annotation System Overview

The annotation system enables:
- Uploading product images
- Placing annotation markers on specific parts
- Configuring part specifications (finish, color, texture)
- Managing multiple images per item

---

## Core Components

### Image Manager Hook

```typescript
// File: components/image-annotation/useImageManager.ts

import { useState, useCallback } from 'react'

interface AnnotationPoint {
  id: string
  x: number
  y: number
  partId?: string
}

interface ManagedImage {
  id: string
  src: string
  name: string
  width: number
  height: number
  uploadedAt: string
  annotations: AnnotationPoint[]
}

interface ImageManagerState {
  images: ManagedImage[]
  activeImageId: string | null
  placementMode: boolean
  selectedPointId: string | null
}

export function useImageManager() {
  const [state, setState] = useState<ImageManagerState>({
    images: [],
    activeImageId: null,
    placementMode: false,
    selectedPointId: null,
  })

  const addImages = useCallback((newImages: Omit<ManagedImage, 'annotations'>[]) => {
    setState(prev => ({
      ...prev,
      images: [
        ...prev.images,
        ...newImages.map(img => ({ ...img, annotations: [] }))
      ],
      activeImageId: prev.activeImageId || newImages[0]?.id || null,
    }))
  }, [])

  const setActiveImage = useCallback((id: string) => {
    setState(prev => ({ ...prev, activeImageId: id }))
  }, [])

  const togglePlacementMode = useCallback(() => {
    setState(prev => ({ ...prev, placementMode: !prev.placementMode }))
  }, [])

  const addAnnotationPoint = useCallback((x: number, y: number) => {
    setState(prev => {
      if (!prev.activeImageId) return prev
      
      const newPoint: AnnotationPoint = {
        id: crypto.randomUUID(),
        x,
        y,
      }
      
      return {
        ...prev,
        images: prev.images.map(img =>
          img.id === prev.activeImageId
            ? { ...img, annotations: [...img.annotations, newPoint] }
            : img
        ),
        selectedPointId: newPoint.id,
      }
    })
  }, [])

  const removeAnnotationPoint = useCallback((pointId: string) => {
    setState(prev => ({
      ...prev,
      images: prev.images.map(img => ({
        ...img,
        annotations: img.annotations.filter(p => p.id !== pointId)
      })),
      selectedPointId: prev.selectedPointId === pointId ? null : prev.selectedPointId,
    }))
  }, [])

  const getActiveImage = useCallback(() => {
    return state.images.find(img => img.id === state.activeImageId) || null
  }, [state.images, state.activeImageId])

  return {
    state,
    addImages,
    setActiveImage,
    togglePlacementMode,
    addAnnotationPoint,
    removeAnnotationPoint,
    getActiveImage,
  }
}
```

---

## Image Canvas Component

```typescript
// File: components/image-annotation/ImageCanvas.tsx

'use client'

import { useRef, useState, useEffect } from 'react'
import { useImageCanvas } from './useImageCanvas'

interface ImageCanvasProps {
  image?: {
    id: string
    src: string
    width: number
    height: number
    name: string
  }
  className?: string
  onCanvasClick?: (x: number, y: number) => void
}

export function ImageCanvas({ image, className, onCanvasClick }: ImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const { zoom, pan, handleWheel, handlePanStart, handlePanMove, handlePanEnd } = useImageCanvas()

  // Calculate container dimensions
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setDimensions({ width, height })
    }
  }, [])

  if (!image) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 rounded-lg ${className}`}>
        <p className="text-gray-400">No image selected</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden bg-gray-900 rounded-lg ${className}`}
      onWheel={handleWheel}
      onMouseDown={handlePanStart}
      onMouseMove={handlePanMove}
      onMouseUp={handlePanEnd}
      onMouseLeave={handlePanEnd}
    >
      <div
        className="absolute transition-transform"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center',
        }}
      >
        <img
          src={image.src}
          alt={image.name}
          className="max-w-none"
          draggable={false}
        />
      </div>
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button className="p-2 bg-gray-800 rounded text-white">
          {Math.round(zoom * 100)}%
        </button>
      </div>
    </div>
  )
}
```

---

## Annotation Workspace

```typescript
// File: components/image-annotation/AnnotationWorkspace.tsx

'use client'

import { useCallback } from 'react'
import { ImageCanvas } from './ImageCanvas'
import { FileUpload } from './FileUpload'
import { ImageTabs } from './ImageTabs'
import { useImageManager } from './useImageManager'
import { Target, Trash2 } from 'lucide-react'

export function AnnotationWorkspace() {
  const {
    state,
    addImages,
    setActiveImage,
    togglePlacementMode,
    addAnnotationPoint,
    removeAnnotationPoint,
    getActiveImage,
  } = useImageManager()

  const activeImage = getActiveImage()

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!state.placementMode) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    addAnnotationPoint(x, y)
  }, [state.placementMode, addAnnotationPoint])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-white">Image Annotation</h2>
        <button
          onClick={togglePlacementMode}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            state.placementMode 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          <Target className="w-4 h-4" />
          {state.placementMode ? 'Placement Mode ON' : 'Place Markers'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <div className="relative" onClick={handleCanvasClick}>
            <ImageCanvas
              image={activeImage}
              className="w-full h-[500px]"
            />
            
            {/* Annotation markers */}
            {activeImage?.annotations.map((point, index) => (
              <div
                key={point.id}
                className="absolute w-6 h-6 rounded-full bg-red-500 border-2 border-white cursor-pointer"
                style={{ left: point.x - 12, top: point.y - 12 }}
                onClick={(e) => {
                  e.stopPropagation()
                  // Select or edit point
                }}
              >
                <span className="text-white text-xs font-bold flex items-center justify-center h-full">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ImageTabs
            images={state.images}
            activeImageId={state.activeImageId}
            onImageSelect={setActiveImage}
          />
          
          <FileUpload onFilesAdded={addImages} />
          
          {activeImage && activeImage.annotations.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Markers ({activeImage.annotations.length})</h3>
              <div className="space-y-2">
                {activeImage.annotations.map((point, index) => (
                  <div key={point.id} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                    <span className="text-white text-sm">Marker {index + 1}</span>
                    <button
                      onClick={() => removeAnnotationPoint(point.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Part Configuration

Each annotation point links to a part with specifications:

```typescript
interface Part {
  id: string
  name: string
  finish: string       // "Matte", "Gloss", "Satin", etc.
  color: string        // Hex color code
  texture: string      // "Leather", "Fabric", "Metal", etc.
  files?: string[]     // Reference files
  notes?: string       // Additional notes
  annotation_data?: {
    x: number
    y: number
    id: string
  }
}
```

---

## Chapter Summary

Image annotation includes:

1. **Image manager** - State management for images and annotations
2. **Image canvas** - Display with zoom/pan controls
3. **Annotation points** - Clickable markers on images
4. **Part configuration** - Specifications for each marker

Key features:
- Toggle placement mode to add markers
- Click to place annotation points
- Link markers to part specifications
- Support multiple images per item

---

*Next: [Chapter 18: Whiteboard](./chapter-18-whiteboard.md) - Excalidraw integration*
