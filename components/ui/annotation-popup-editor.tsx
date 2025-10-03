'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScreenColorPicker } from '@/components/ui/screen-color-picker'
import { X, Target, Plus, Save, RotateCcw } from 'lucide-react'

interface AnnotationPoint {
  id: string
  x: number // Relative position (0-100)
  y: number // Relative position (0-100)
  name: string
  finish: string
  color: string
  texture: string
  notes?: string
}

interface AnnotationPopupEditorProps {
  item: {
    name: string
    hero_image?: string
    image_url?: string
    parts?: Array<{
      name: string
      finish: string
      color: string
      texture: string
      notes?: string
    }>
  }
  isOpen: boolean
  onClose: () => void
  onSave: (annotations: AnnotationPoint[]) => void
}

export function AnnotationPopupEditor({ 
  item, 
  isOpen, 
  onClose, 
  onSave 
}: AnnotationPopupEditorProps) {
  const [annotations, setAnnotations] = useState<AnnotationPoint[]>([])
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [placementMode, setPlacementMode] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize annotations from parts
  React.useEffect(() => {
    if (item.parts && item.parts.length > 0) {
      const initialAnnotations: AnnotationPoint[] = item.parts.map((part, index) => ({
        id: `annotation-${index}`,
        x: 20 + (index * 15), // Spread them out horizontally
        y: 30 + (index * 10), // Slight vertical offset
        name: part.name || `Part ${index + 1}`,
        finish: part.finish || '',
        color: part.color || '#3b82f6',
        texture: part.texture || '',
        notes: part.notes || ''
      }))
      setAnnotations(initialAnnotations)
    }
  }, [item.parts])

  const addAnnotation = useCallback(() => {
    const newAnnotation: AnnotationPoint = {
      id: `annotation-${Date.now()}`,
      x: 50, // Center position
      y: 50,
      name: '',
      finish: '',
      color: '#3b82f6',
      texture: '',
      notes: ''
    }
    setAnnotations(prev => [...prev, newAnnotation])
    setSelectedAnnotationId(newAnnotation.id)
    setPlacementMode(false)
  }, [])

  const removeAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id))
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null)
    }
  }, [selectedAnnotationId])

  const updateAnnotation = useCallback((id: string, field: string, value: string) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, [field]: value } : ann
    ))
  }, [])

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!placementMode || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const newAnnotation: AnnotationPoint = {
      id: `annotation-${Date.now()}`,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      name: '',
      finish: '',
      color: '#3b82f6',
      texture: '',
      notes: ''
    }

    setAnnotations(prev => [...prev, newAnnotation])
    setSelectedAnnotationId(newAnnotation.id)
    setPlacementMode(false)
  }, [placementMode])

  const handleAnnotationMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setIsDragging(true)
    setSelectedAnnotationId(id)
    
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect()
      const annotation = annotations.find(ann => ann.id === id)
      if (annotation) {
        const absX = (annotation.x / 100) * rect.width
        const absY = (annotation.y / 100) * rect.height
        setDragOffset({
          x: e.clientX - absX,
          y: e.clientY - absY
        })
      }
    }
  }, [annotations])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedAnnotationId || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - dragOffset.x) / rect.width) * 100
    const y = ((e.clientY - dragOffset.y) / rect.height) * 100

    setAnnotations(prev => prev.map(ann => 
      ann.id === selectedAnnotationId 
        ? { ...ann, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
        : ann
    ))
  }, [isDragging, selectedAnnotationId, dragOffset])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleSave = () => {
    onSave(annotations)
    onClose()
  }

  const selectedAnnotation = annotations.find(ann => ann.id === selectedAnnotationId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">
            Annotate {item.name}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex h-full gap-4 overflow-hidden">
          {/* Left Panel - Image with Annotations */}
          <div className="flex-1 flex flex-col">
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={() => setPlacementMode(!placementMode)}
                variant={placementMode ? "default" : "outline"}
                size="sm"
              >
                <Target className="h-4 w-4 mr-1" />
                {placementMode ? 'Cancel' : 'Place Point'}
              </Button>
              <Button onClick={addAnnotation} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Part
              </Button>
            </div>

            <div className="flex-1 relative border rounded-lg overflow-hidden bg-gray-50">
              {item.hero_image || item.image_url ? (
                <img
                  ref={imageRef}
                  src={item.hero_image || item.image_url}
                  alt={item.name}
                  className="w-full h-full object-contain cursor-crosshair"
                  onClick={handleImageClick}
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No image available
                </div>
              )}

              {/* Annotation Points */}
              {annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className={`absolute w-6 h-6 rounded-full cursor-pointer border-2 transition-all duration-200 hover:scale-110 ${
                    selectedAnnotationId === annotation.id
                      ? 'border-yellow-400 shadow-lg ring-2 ring-yellow-200'
                      : 'border-white shadow-md'
                  }`}
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: annotation.color,
                  }}
                  onMouseDown={(e) => handleAnnotationMouseDown(e, annotation.id)}
                  title={annotation.name || 'Unnamed part'}
                >
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                    {annotations.indexOf(annotation) + 1}
                  </div>
                </div>
              ))}

              {placementMode && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-10 pointer-events-none flex items-center justify-center">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
                    Click on the image to place a part
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Annotation Details */}
          <div className="w-80 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {selectedAnnotation ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Part Details</h3>
                    <Button
                      onClick={() => removeAnnotation(selectedAnnotation.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Part Name</label>
                      <input
                        type="text"
                        value={selectedAnnotation.name}
                        onChange={(e) => updateAnnotation(selectedAnnotation.id, 'name', e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                        placeholder="Enter part name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Finish</label>
                      <input
                        type="text"
                        value={selectedAnnotation.finish}
                        onChange={(e) => updateAnnotation(selectedAnnotation.id, 'finish', e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                        placeholder="Enter finish type"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Color</label>
                      <ScreenColorPicker
                        currentColor={selectedAnnotation.color}
                        onColorSelect={(color, format) => updateAnnotation(selectedAnnotation.id, 'color', color)}
                        className="mb-2"
                      />
                      <input
                        type="text"
                        value={selectedAnnotation.color}
                        onChange={(e) => updateAnnotation(selectedAnnotation.id, 'color', e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                        placeholder="Or enter color manually"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Texture</label>
                      <input
                        type="text"
                        value={selectedAnnotation.texture}
                        onChange={(e) => updateAnnotation(selectedAnnotation.id, 'texture', e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                        placeholder="Enter texture"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Notes</label>
                      <textarea
                        value={selectedAnnotation.notes || ''}
                        onChange={(e) => updateAnnotation(selectedAnnotation.id, 'notes', e.target.value)}
                        className="w-full p-2 border rounded-md text-sm h-20 resize-none"
                        placeholder="Add notes..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select an annotation to edit details</p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="border-t pt-4 space-y-2">
              <div className="text-xs text-gray-500">
                {annotations.length} part{annotations.length !== 1 ? 's' : ''} annotated
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="h-4 w-4 mr-1" />
                  Save Annotations
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
