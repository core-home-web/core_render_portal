'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Target, Plus, X, Move } from 'lucide-react'
import { ImageData } from './types'
import { FileUpload as FileUploadType } from './upload-types'

interface PartNode {
  id: string
  x: number
  y: number
  name: string
  finish: string
  color: string
  texture: string
}

interface UnifiedImageViewportProps {
  projectImage?: string
  onImageUpdate?: (imageUrl: string) => void
  onPartsUpdate?: (parts: PartNode[]) => void
  className?: string
}

type ViewportState = 'preview' | 'upload' | 'annotation'

export function UnifiedImageViewport({ 
  projectImage, 
  onImageUpdate, 
  onPartsUpdate,
  className = '' 
}: UnifiedImageViewportProps) {
  const [currentState, setCurrentState] = useState<ViewportState>('preview')
  const [parts, setParts] = useState<PartNode[]>([])
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImageUpdate) {
      // Simulate upload and get URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageUpdate(result)
        setCurrentState('preview')
      }
      reader.readAsDataURL(file)
    }
  }, [onImageUpdate])

  // Add new part
  const handleAddPart = useCallback(() => {
    if (!projectImage) return
    
    const newPart: PartNode = {
      id: `part-${Date.now()}`,
      x: 100, // Default position
      y: 100,
      name: `Part ${parts.length + 1}`,
      finish: '',
      color: '#000000',
      texture: ''
    }
    
    const updatedParts = [...parts, newPart]
    setParts(updatedParts)
    setSelectedPartId(newPart.id)
    setCurrentState('annotation')
    
    if (onPartsUpdate) {
      onPartsUpdate(updatedParts)
    }
  }, [projectImage, parts, onPartsUpdate])

  // Handle part dragging
  const handlePartMouseDown = useCallback((e: React.MouseEvent, partId: string) => {
    e.stopPropagation()
    setSelectedPartId(partId)
    setIsDragging(true)
    
    const part = parts.find(p => p.id === partId)
    if (part) {
      const rect = e.currentTarget.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }, [parts])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedPartId) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y
    
    setParts(prev => prev.map(part => 
      part.id === selectedPartId 
        ? { ...part, x: Math.max(0, Math.min(newX, rect.width - 20)), y: Math.max(0, Math.min(newY, rect.height - 20)) }
        : part
    ))
  }, [isDragging, selectedPartId, dragOffset])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (onPartsUpdate) {
      onPartsUpdate(parts)
    }
  }, [parts, onPartsUpdate])

  // Remove part
  const handleRemovePart = useCallback((partId: string) => {
    const updatedParts = parts.filter(p => p.id !== partId)
    setParts(updatedParts)
    if (selectedPartId === partId) {
      setSelectedPartId(null)
    }
    if (onPartsUpdate) {
      onPartsUpdate(updatedParts)
    }
  }, [parts, selectedPartId, onPartsUpdate])

  // Render viewport content based on state
  const renderViewportContent = () => {
    switch (currentState) {
      case 'upload':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Upload className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Upload Project Image</p>
            <p className="text-sm text-gray-500 mb-4">Drag & drop or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              Choose Image
            </Button>
          </div>
        )

      case 'annotation':
        return (
          <div className="relative h-full">
            {projectImage && (
              <img 
                src={projectImage} 
                alt="Project" 
                className="w-full h-full object-contain"
              />
            )}
            {/* Part nodes */}
            {parts.map((part) => (
              <div
                key={part.id}
                className={`absolute w-5 h-5 bg-blue-500 rounded-full cursor-move border-2 ${
                  selectedPartId === part.id ? 'border-yellow-400' : 'border-white'
                }`}
                style={{ left: part.x, top: part.y }}
                onMouseDown={(e) => handlePartMouseDown(e, part.id)}
                title={`${part.name} - ${part.finish}`}
              >
                <Move className="w-3 h-3 text-white m-0.5" />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemovePart(part.id)
                  }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-2 h-2" />
                </button>
              </div>
            ))}
          </div>
        )

      default: // preview
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            {projectImage ? (
              <div className="relative w-full h-full">
                <img 
                  src={projectImage} 
                  alt="Project Preview" 
                  className="w-full h-full object-contain rounded-lg"
                />
                {/* Show part indicators */}
                {parts.map((part) => (
                  <div
                    key={part.id}
                    className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white"
                    style={{ left: part.x, top: part.y }}
                    title={`${part.name} - ${part.finish}`}
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">No Project Image</p>
                <p className="text-sm text-gray-500 mb-4">Upload an image to get started</p>
                <Button onClick={() => setCurrentState('upload')} variant="outline">
                  Upload Image
                </Button>
              </>
            )}
          </div>
        )
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">
              {currentState === 'preview' && 'Project Preview'}
              {currentState === 'upload' && 'Upload Image'}
              {currentState === 'annotation' && 'Part Annotation'}
            </CardTitle>
            <CardDescription>
              {currentState === 'preview' && 'Current project image and visual reference'}
              {currentState === 'upload' && 'Upload a new project image'}
              {currentState === 'annotation' && 'Click and drag parts to position them'}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            {currentState === 'preview' && (
              <>
                <Button 
                  onClick={() => setCurrentState('upload')} 
                  variant="outline" 
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                {projectImage && (
                  <Button 
                    onClick={handleAddPart} 
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Part
                  </Button>
                )}
              </>
            )}
            
            {currentState === 'upload' && (
              <Button 
                onClick={() => setCurrentState('preview')} 
                variant="outline" 
                size="sm"
              >
                Cancel
              </Button>
            )}
            
            {currentState === 'annotation' && (
              <>
                <Button 
                  onClick={handleAddPart} 
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Part
                </Button>
                <Button 
                  onClick={() => setCurrentState('preview')} 
                  variant="outline" 
                  size="sm"
                >
                  Done
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          className="w-full h-[500px] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {renderViewportContent()}
        </div>
        
        {/* Parts summary */}
        {parts.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Parts ({parts.length})</h4>
            <div className="space-y-2">
              {parts.map((part) => (
                <div key={part.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{part.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{part.finish}</span>
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: part.color }}
                    />
                    <Button
                      onClick={() => handleRemovePart(part.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
