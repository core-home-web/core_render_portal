import React, { useState, useRef, useCallback } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Plus, Trash2, Copy, Move, Image, Type, Square } from 'lucide-react'
import { Project, Item, Part } from '../../types'
import { TextEditor } from './text-editor'
import { DraggableElement } from './draggable-element'

interface SlideElement {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number
  y: number
  width: number
  height: number
  content: string
  style: {
    fontSize: number
    fontWeight: string
    fontStyle: string
    textDecoration: string
    color: string
    backgroundColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
    textAlign: string
    lineHeight: number
    letterSpacing: number
  }
}

interface Slide {
  id: string
  title: string
  type: 'title' | 'content' | 'image' | 'parts' | 'custom'
  elements: SlideElement[]
  background: {
    type: 'color' | 'image'
    value: string
  }
}

interface SlideEditorProps {
  project: Project
  onSave: (slides: Slide[]) => void
  onClose: () => void
}

export function SlideEditor({ project, onSave, onClose }: SlideEditorProps) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize with default slides based on project
  React.useEffect(() => {
    if (project && slides.length === 0) {
      const defaultSlides = createDefaultSlides(project)
      setSlides(defaultSlides)
    }
  }, [project, slides.length])

  const createDefaultSlides = (project: Project): Slide[] => {
    const defaultSlides: Slide[] = [
      {
        id: 'slide-1',
        title: 'Title Slide',
        type: 'title',
        elements: [
          {
            id: 'title-1',
            type: 'text',
            x: 50,
            y: 30,
            width: 400,
            height: 80,
            content: project.title,
            style: {
              fontSize: 48,
              fontWeight: 'bold',
              fontStyle: 'normal',
              textDecoration: 'none',
              color: '#2E5BBA',
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              borderWidth: 0,
              borderRadius: 0,
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: 0
            }
          },
          {
            id: 'subtitle-1',
            type: 'text',
            x: 50,
            y: 50,
            width: 400,
            height: 40,
            content: `Generated on ${new Date().toLocaleDateString()}`,
            style: {
              fontSize: 24,
              fontWeight: 'normal',
              fontStyle: 'normal',
              textDecoration: 'none',
              color: '#666666',
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              borderWidth: 0,
              borderRadius: 0,
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: 0
            }
          }
        ],
        background: {
          type: 'color',
          value: '#f8fafc'
        }
      }
    ]

    // Add content slides if project has items
    if (project.items && project.items.length > 0) {
      project.items.forEach((item, index) => {
        if (item.hero_image) {
          defaultSlides.push({
            id: `slide-${index + 2}`,
            title: `Item: ${item.name || `Item ${index + 1}`}`,
            type: 'image',
            elements: [
              {
                id: `image-${index + 1}`,
                type: 'image',
                x: 50,
                y: 20,
                width: 300,
                height: 200,
                content: item.hero_image,
                style: {
                  fontSize: 16,
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textDecoration: 'none',
                  color: '#000000',
                  backgroundColor: 'transparent',
                  borderColor: '#e2e8f0',
                  borderWidth: 2,
                  borderRadius: 8,
                  textAlign: 'left',
                  lineHeight: 1.2,
                  letterSpacing: 0
                }
              }
            ],
            background: {
              type: 'color',
              value: '#ffffff'
            }
          })
        }
      })
    }

    return defaultSlides
  }

  const handleElementSelect = (elementId: string) => {
    setSelectedElement(elementId)
  }

  const handleElementMove = useCallback((elementId: string, newX: number, newY: number) => {
    setSlides(prevSlides => {
      const updatedSlides = [...prevSlides]
      const slide = updatedSlides[currentSlideIndex]
      if (slide) {
        const element = slide.elements.find(el => el.id === elementId)
        if (element) {
          element.x = newX
          element.y = newY
        }
      }
      return updatedSlides
    })
  }, [currentSlideIndex])

  const handleElementResize = useCallback((elementId: string, newWidth: number, newHeight: number) => {
    setSlides(prevSlides => {
      const updatedSlides = [...prevSlides]
      const slide = updatedSlides[currentSlideIndex]
      if (slide) {
        const element = slide.elements.find(el => el.id === elementId)
        if (element) {
          element.width = newWidth
          element.height = newHeight
        }
      }
      return updatedSlides
    })
  }, [currentSlideIndex])

  const addNewSlide = () => {
    const newSlide: Slide = {
      id: `slide-${slides.length + 1}`,
      title: `New Slide ${slides.length + 1}`,
      type: 'custom',
      elements: [],
      background: {
        type: 'color',
        value: '#ffffff'
      }
    }
    setSlides(prev => [...prev, newSlide])
    setCurrentSlideIndex(slides.length)
  }

  const deleteSlide = (slideIndex: number) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, index) => index !== slideIndex)
      setSlides(newSlides)
      setCurrentSlideIndex(Math.min(currentSlideIndex, newSlides.length - 1))
    }
  }

  const duplicateSlide = (slideIndex: number) => {
    const slideToDuplicate = slides[slideIndex]
    const duplicatedSlide: Slide = {
      ...slideToDuplicate,
      id: `slide-${Date.now()}`,
      title: `${slideToDuplicate.title} (Copy)`,
      elements: slideToDuplicate.elements.map(el => ({
        ...el,
        id: `${el.id}-${Date.now()}`
      }))
    }
    setSlides(prev => [...prev, duplicatedSlide])
  }

  const currentSlide = slides[currentSlideIndex]

  if (!currentSlide) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No slides available</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Slide List */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Slides</h3>
          <Button onClick={addNewSlide} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                index === currentSlideIndex
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setCurrentSlideIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{slide.title}</p>
                  <p className="text-xs text-gray-500">{slide.type}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateSlide(index)
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {slides.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSlide(index)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">{currentSlide.title}</h2>
              <span className="text-sm text-gray-500">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Type className="h-4 w-4 mr-2" />
                Add Text
              </Button>
              <Button variant="outline" size="sm">
                <Image className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              <Button variant="outline" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Add Shape
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-8 overflow-auto">
          <div
            ref={canvasRef}
            className="relative mx-auto bg-white border border-gray-300 rounded-lg shadow-lg"
            style={{
              width: '800px',
              height: '600px',
              background: currentSlide.background.type === 'color' 
                ? currentSlide.background.value 
                : `url(${currentSlide.background.value})`
            }}
          >
            {currentSlide.elements.map((element) => (
              <DraggableElement
                key={element.id}
                id={element.id}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                isSelected={selectedElement === element.id}
                onSelect={handleElementSelect}
                onMove={handleElementMove}
                onResize={handleElementResize}
                minWidth={element.type === 'text' ? 100 : 50}
                minHeight={element.type === 'text' ? 30 : 50}
              >
                {element.type === 'text' && (
                  <div
                    className="w-full h-full flex items-center justify-center p-2"
                    style={{
                      fontSize: `${element.style.fontSize}px`,
                      fontWeight: element.style.fontWeight,
                      fontStyle: element.style.fontStyle,
                      textDecoration: element.style.textDecoration,
                      color: element.style.color,
                      backgroundColor: element.style.backgroundColor,
                      border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
                      borderRadius: `${element.style.borderRadius}px`,
                      textAlign: element.style.textAlign as any,
                      lineHeight: element.style.lineHeight,
                      letterSpacing: `${element.style.letterSpacing}px`
                    }}
                  >
                    {element.content}
                  </div>
                )}
                {element.type === 'image' && (
                  <img
                    src={element.content}
                    alt="Slide element"
                    className="w-full h-full object-cover"
                    style={{
                      border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
                      borderRadius: `${element.style.borderRadius}px`
                    }}
                  />
                )}
              </DraggableElement>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        {selectedElement ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Element Type</Label>
              <p className="text-sm text-gray-600 mt-1">
                {currentSlide.elements.find(el => el.id === selectedElement)?.type}
              </p>
            </div>
            
            {/* Text Editor for Text Elements */}
            {currentSlide.elements.find(el => el.id === selectedElement)?.type === 'text' && (
              <TextEditor
                element={currentSlide.elements.find(el => el.id === selectedElement)!}
                onUpdate={(updates) => {
                  setSlides(prevSlides => {
                    const updatedSlides = [...prevSlides]
                    const slide = updatedSlides[currentSlideIndex]
                    if (slide) {
                      const element = slide.elements.find(el => el.id === selectedElement)
                      if (element) {
                        if (updates.content !== undefined) {
                          element.content = updates.content
                        }
                        if (updates.style) {
                          element.style = { ...element.style, ...updates.style }
                        }
                      }
                    }
                    return updatedSlides
                  })
                }}
                onClose={() => setSelectedElement(null)}
              />
            )}
            
            {/* General Element Properties */}
            <div>
              <Label className="text-sm font-medium">Position</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="X %"
                  value={currentSlide.elements.find(el => el.id === selectedElement)?.x || 0}
                  onChange={(e) => {
                    const element = currentSlide.elements.find(el => el.id === selectedElement)
                    if (element) {
                      handleElementMove(selectedElement, parseInt(e.target.value), element.y)
                    }
                  }}
                />
                <Input
                  type="number"
                  placeholder="Y %"
                  value={currentSlide.elements.find(el => el.id === selectedElement)?.y || 0}
                  onChange={(e) => {
                    const element = currentSlide.elements.find(el => el.id === selectedElement)
                    if (element) {
                      handleElementMove(selectedElement, element.x, parseInt(e.target.value))
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Size</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Width"
                  value={currentSlide.elements.find(el => el.id === selectedElement)?.width || 0}
                  onChange={(e) => {
                    const element = currentSlide.elements.find(el => el.id === selectedElement)
                    if (element) {
                      handleElementResize(selectedElement, parseInt(e.target.value), element.height)
                    }
                  }}
                />
                <Input
                  type="number"
                  placeholder="Height"
                  value={currentSlide.elements.find(el => el.id === selectedElement)?.height || 0}
                  onChange={(e) => {
                    const element = currentSlide.elements.find(el => el.id === selectedElement)
                    if (element) {
                      handleElementResize(selectedElement, element.width, parseInt(e.target.value))
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Select an element to edit its properties</p>
        )}
      </div>
    </div>
  )
}
