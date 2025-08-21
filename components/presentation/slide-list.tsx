import React, { useState, useRef, useCallback } from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Plus, Trash2, Copy, GripVertical, Eye } from 'lucide-react'
import { Slide } from './slide-editor'

interface SlideListProps {
  slides: Slide[]
  currentSlideIndex: number
  onSlideSelect: (index: number) => void
  onSlideDelete: (index: number) => void
  onSlideDuplicate: (index: number) => void
  onSlideReorder: (fromIndex: number, toIndex: number) => void
  onAddSlide: () => void
}

export function SlideList({
  slides,
  currentSlideIndex,
  onSlideSelect,
  onSlideDelete,
  onSlideDuplicate,
  onSlideReorder,
  onAddSlide
}: SlideListProps) {
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedSlideIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index.toString())
    
    if (dragRef.current) {
      dragRef.current.style.opacity = '0.5'
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedSlideIndex !== null && draggedSlideIndex !== dropIndex) {
      onSlideReorder(draggedSlideIndex, dropIndex)
    }
    
    setDraggedSlideIndex(null)
    setDragOverIndex(null)
    
    if (dragRef.current) {
      dragRef.current.style.opacity = '1'
    }
  }, [draggedSlideIndex, onSlideReorder])

  const handleDragEnd = useCallback(() => {
    setDraggedSlideIndex(null)
    setDragOverIndex(null)
    
    if (dragRef.current) {
      dragRef.current.style.opacity = '1'
    }
  }, [])

  const getSlidePreview = (slide: Slide) => {
    if (slide.elements.length === 0) {
      return (
        <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center">
          <span className="text-gray-400 text-xs">Empty</span>
        </div>
      )
    }

    // Show first text element or image element as preview
    const firstElement = slide.elements[0]
    if (firstElement.type === 'text') {
      return (
        <div className="w-full h-16 bg-white border rounded p-2 flex items-center">
          <div className="text-xs text-gray-600 truncate">
            {firstElement.content || 'No content'}
          </div>
        </div>
      )
    }
    
    if (firstElement.type === 'image') {
      return (
        <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center">
          <span className="text-gray-400 text-xs">Image</span>
        </div>
      )
    }

    return (
      <div className="w-full h-16 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-gray-400 text-xs">{slide.type}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Slides ({slides.length})</h3>
        <Button onClick={onAddSlide} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Slide List */}
      <div className="space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            ref={index === draggedSlideIndex ? dragRef : null}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`group relative ${
              index === currentSlideIndex
                ? 'ring-2 ring-blue-500'
                : 'hover:ring-1 hover:ring-gray-300'
            } ${
              index === dragOverIndex
                ? 'border-t-2 border-blue-500'
                : ''
            } transition-all`}
          >
            <Card
              className={`p-3 cursor-pointer transition-all ${
                index === currentSlideIndex
                  ? 'bg-blue-50 border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSlideSelect(index)}
            >
              {/* Drag Handle */}
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing" />
              </div>

              {/* Slide Content */}
              <div className="ml-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{slide.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{slide.type}</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSlideDuplicate(index)
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    {slides.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSlideDelete(index)
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Slide Preview */}
                {getSlidePreview(slide)}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {slides.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No slides yet</p>
          <p className="text-xs">Click the + button to add your first slide</p>
        </div>
      )}
    </div>
  )
}
