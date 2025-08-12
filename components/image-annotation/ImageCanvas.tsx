'use client'

import React, { useRef, useEffect } from 'react'
import { useImageCanvas } from './useImageCanvas'
import { ImageData, ZoomLimits } from './types'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react'

interface ImageCanvasProps {
  image?: ImageData
  className?: string
  zoomLimits?: ZoomLimits
  initialZoom?: 'fit' | '100%'
  onImageLoad?: (image: ImageData) => void
}

export function ImageCanvas({
  image,
  className = '',
  zoomLimits,
  initialZoom = 'fit',
  onImageLoad
}: ImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    state,
    canvasRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
    fitImageToContainer,
    handleZoom
  } = useImageCanvas(image, containerRef, zoomLimits, initialZoom)

  // Set up wheel event listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const wheelHandler = (e: WheelEvent) => handleWheel(e)
    container.addEventListener('wheel', wheelHandler, { passive: false })

    return () => {
      container.removeEventListener('wheel', wheelHandler)
    }
  }, [handleWheel])

  // Handle image load callback
  useEffect(() => {
    if (image && onImageLoad) {
      onImageLoad(image)
    }
  }, [image, onImageLoad])

  // Handle cursor style
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = state.isDragging ? 'grabbing' : 'grab'
    }
  }, [state.isDragging])

  return (
    <div className={`relative ${className}`}>
      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ touchAction: 'none' }}
        />

        {/* No Image State */}
        {!image && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-lg font-medium">No Image Selected</p>
              <p className="text-sm">Upload an image to get started</p>
            </div>
          </div>
        )}

        {/* Zoom Info Overlay */}
        {image && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {Math.round(state.transform.scale * 100)}%
          </div>
        )}
      </div>

      {/* Control Buttons */}
      {image && (
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (containerRef.current && image) {
                const container = containerRef.current
                const rect = container.getBoundingClientRect()
                handleZoom(1, rect.width / 2, rect.height / 2)
              }
            }}
            className="bg-white/90 hover:bg-white text-gray-700"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (containerRef.current && image) {
                const container = containerRef.current
                const rect = container.getBoundingClientRect()
                handleZoom(-1, rect.width / 2, rect.height / 2)
              }
            }}
            className="bg-white/90 hover:bg-white text-gray-700"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={resetView}
            className="bg-white/90 hover:bg-white text-gray-700"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Instructions Overlay */}
      {image && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-2 rounded text-xs">
          <p>🖱️ Scroll to zoom • 🖱️ Drag to pan • 🔄 Reset to fit</p>
        </div>
      )}
    </div>
  )
}
