import React, { useState, useRef, useCallback } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Plus, Trash2, Copy, Move, Image, Type, Square } from 'lucide-react'
import { Project, Item, Part } from '../../types'
import { TextEditor } from './text-editor'
import { DraggableElement } from './draggable-element'
import { SlideTemplateSelector, SlideTemplate } from './slide-templates'
import { SlideList } from './slide-list'
import { DeleteSlideDialog } from './delete-slide-dialog'

export interface SlideElement {
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

export interface Slide {
  id: string
  title: string
  type:
    | 'title'
    | 'content'
    | 'image'
    | 'parts'
    | 'custom'
    | 'text'
    | 'chart'
    | 'team'
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
  initialSlides?: Slide[]
}

export function SlideEditor({
  project,
  onSave,
  onClose,
  initialSlides,
}: SlideEditorProps) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides || [])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [slideToDelete, setSlideToDelete] = useState<number | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Memoize the onSave callback to prevent infinite loops
  const memoizedOnSave = React.useCallback(
    (updatedSlides: Slide[]) => {
      onSave(updatedSlides)
    },
    [onSave]
  )

  // Sync slides with parent component changes
  React.useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      setSlides(initialSlides)
      console.log('Slides synced from parent:', initialSlides)
    }
  }, [initialSlides])

  // Initialize with default slides based on project
  React.useEffect(() => {
    if (project && slides.length === 0) {
      const defaultSlides = createDefaultSlides(project)
      console.log('Creating default slides:', defaultSlides)
      setSlides(defaultSlides)
    }
  }, [project]) // Remove slides.length dependency to prevent infinite loop

  // Auto-save slides whenever they change
  React.useEffect(() => {
    if (slides.length > 0) {
      console.log('Auto-saving slides:', slides)
      memoizedOnSave(slides)
    }
  }, [slides, memoizedOnSave])

  const createDefaultSlides = (project: Project): Slide[] => {
    const defaultSlides: Slide[] = [
      {
        id: `slide-1-${Date.now()}`,
        title: 'Title Slide',
        type: 'title',
        elements: [
          {
            id: `title-1-${Date.now()}`,
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
              letterSpacing: 0,
            },
          },
          {
            id: `subtitle-1-${Date.now()}`,
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
              letterSpacing: 0,
            },
          },
        ],
        background: {
          type: 'color',
          value: '#f8fafc',
        },
      },
    ]

    // Add content slides if project has items
    if (project.items && project.items.length > 0) {
      project.items.forEach((item, index) => {
        if (item.hero_image) {
          defaultSlides.push({
            id: `slide-${index + 2}-${Date.now()}`,
            title: `Item: ${item.name || `Item ${index + 1}`}`,
            type: 'image',
            elements: [
              {
                id: `image-${index + 1}-${Date.now()}`,
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
                  letterSpacing: 0,
                },
              },
            ],
            background: {
              type: 'color',
              value: '#ffffff',
            },
          })
        }
      })
    }

    return defaultSlides
  }

  const handleElementSelect = (elementId: string) => {
    setSelectedElement(elementId)
  }

  const handleElementMove = useCallback(
    (elementId: string, newX: number, newY: number) => {
      console.log('handleElementMove called:', {
        elementId,
        newX,
        newY,
        currentSlideIndex,
      })
      setSlides((prevSlides) => {
        const newSlides = [...prevSlides]
        const currentSlide = newSlides[currentSlideIndex]
        if (currentSlide) {
          newSlides[currentSlideIndex] = {
            ...currentSlide,
            elements: currentSlide.elements.map((el) =>
              el.id === elementId ? { ...el, x: newX, y: newY } : el
            ),
          }

          const element = newSlides[currentSlideIndex].elements.find(
            (el) => el.id === elementId
          )
          if (element) {
            console.log('Element position updated:', {
              id: element.id,
              x: element.x,
              y: element.y,
              slideId: currentSlide.id,
            })
          }
        }

        return newSlides
      })
    },
    [currentSlideIndex]
  )

  const handleElementResize = useCallback(
    (elementId: string, newWidth: number, newHeight: number) => {
      console.log('handleElementResize called:', {
        elementId,
        newWidth,
        newHeight,
        currentSlideIndex,
      })
      setSlides((prevSlides) => {
        const newSlides = [...prevSlides]
        const currentSlide = newSlides[currentSlideIndex]
        if (currentSlide) {
          newSlides[currentSlideIndex] = {
            ...currentSlide,
            elements: currentSlide.elements.map((el) =>
              el.id === elementId
                ? { ...el, width: newWidth, height: newHeight }
                : el
            ),
          }

          const element = newSlides[currentSlideIndex].elements.find(
            (el) => el.id === elementId
          )
          if (element) {
            console.log('Element resized:', {
              id: element.id,
              width: element.width,
              height: element.height,
              slideId: currentSlide.id,
            })
          }
        }

        return newSlides
      })
    },
    [currentSlideIndex]
  )

  const addNewSlide = () => {
    setShowTemplateSelector(true)
  }

  const handleTemplateSelect = (template: SlideTemplate) => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: template.name,
      type: template.type,
      elements: template.defaultElements.map((el, index) => ({
        ...el,
        id: `${template.id}-element-${index}-${Date.now()}`,
      })),
      background: {
        type: 'color',
        value: '#ffffff',
      },
    }
    setSlides((prev) => [...prev, newSlide])
    setCurrentSlideIndex(slides.length)
  }

  const deleteSlide = (slideIndex: number) => {
    setSlideToDelete(slideIndex)
    setShowDeleteDialog(true)
  }

  const confirmDeleteSlide = () => {
    if (slideToDelete !== null && slides.length > 1) {
      const newSlides = slides.filter((_, index) => index !== slideToDelete)
      setSlides(newSlides)
      setCurrentSlideIndex(Math.min(currentSlideIndex, newSlides.length - 1))
    }
    setShowDeleteDialog(false)
    setSlideToDelete(null)
  }

  const duplicateSlide = (slideIndex: number) => {
    const slideToDuplicate = slides[slideIndex]
    const duplicatedSlide: Slide = {
      ...slideToDuplicate,
      id: `slide-${Date.now()}`,
      title: `${slideToDuplicate.title} (Copy)`,
      elements: slideToDuplicate.elements.map((el) => ({
        ...el,
        id: `${el.id}-${Date.now()}`,
      })),
    }
    setSlides((prev) => [...prev, duplicatedSlide])
    console.log('Duplicated slide:', {
      originalIndex: slideIndex,
      newSlide: duplicatedSlide,
    })
  }

  const reorderSlides = (fromIndex: number, toIndex: number) => {
    setSlides((prev) => {
      const newSlides = [...prev]
      const [movedSlide] = newSlides.splice(fromIndex, 1)
      newSlides.splice(toIndex, 0, movedSlide)

      // Update current slide index if needed
      if (currentSlideIndex === fromIndex) {
        setCurrentSlideIndex(toIndex)
      } else if (
        currentSlideIndex > fromIndex &&
        currentSlideIndex <= toIndex
      ) {
        setCurrentSlideIndex(currentSlideIndex - 1)
      } else if (
        currentSlideIndex < fromIndex &&
        currentSlideIndex >= toIndex
      ) {
        setCurrentSlideIndex(currentSlideIndex + 1)
      }

      return newSlides
    })
  }

  const addTextElement = () => {
    const newElement: SlideElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 20,
      y: 30,
      width: 300,
      height: 100,
      content: 'New Text Element',
      style: {
        fontSize: 24,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        color: '#333333',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 0,
        textAlign: 'left',
        lineHeight: 1.2,
        letterSpacing: 0,
      },
    }

    setSlides((prev) => {
      const newSlides = [...prev]
      const currentSlide = newSlides[currentSlideIndex]
      if (currentSlide) {
        newSlides[currentSlideIndex] = {
          ...currentSlide,
          elements: [...currentSlide.elements, newElement],
        }
        console.log('Added text element to slide:', {
          slideId: currentSlide.id,
          slideTitle: currentSlide.title,
          elementId: newElement.id,
          totalElements: newSlides[currentSlideIndex].elements.length,
        })
      }
      return newSlides
    })

    setSelectedElement(newElement.id)
  }

  const addImageElement = () => {
    const newElement: SlideElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      x: 30,
      y: 40,
      width: 200,
      height: 150,
      content: 'https://via.placeholder.com/200x150?text=Image',
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
        letterSpacing: 0,
      },
    }

    setSlides((prev) => {
      const newSlides = [...prev]
      const currentSlide = newSlides[currentSlideIndex]
      if (currentSlide) {
        newSlides[currentSlideIndex] = {
          ...currentSlide,
          elements: [...currentSlide.elements, newElement],
        }
        console.log('Added image element to slide:', {
          slideId: currentSlide.id,
          slideTitle: currentSlide.title,
          elementId: newElement.id,
          totalElements: newSlides[currentSlideIndex].elements.length,
        })
      }
      return newSlides
    })

    setSelectedElement(newElement.id)
  }

  const addShapeElement = () => {
    const newElement: SlideElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      content: 'Rectangle',
      style: {
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        color: '#000000',
        backgroundColor: '#e2e8f0',
        borderColor: '#cbd5e1',
        borderWidth: 1,
        borderRadius: 0,
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: 0,
      },
    }

    setSlides((prev) => {
      const newSlides = [...prev]
      const currentSlide = newSlides[currentSlideIndex]
      if (currentSlide) {
        newSlides[currentSlideIndex] = {
          ...currentSlide,
          elements: [...currentSlide.elements, newElement],
        }
        console.log('Added shape element to slide:', {
          slideId: currentSlide.id,
          slideTitle: currentSlide.title,
          elementId: newElement.id,
          totalElements: newSlides[currentSlideIndex].elements.length,
        })
      }
      return newSlides
    })

    setSelectedElement(newElement.id)
  }

  const deleteElement = (elementId: string) => {
    console.log(
      'Deleting element:',
      elementId,
      'from slide:',
      currentSlideIndex
    )
    setSlides((prev) => {
      const newSlides = [...prev]
      const currentSlide = newSlides[currentSlideIndex]
      if (currentSlide) {
        newSlides[currentSlideIndex] = {
          ...currentSlide,
          elements: currentSlide.elements.filter((el) => el.id !== elementId),
        }
        console.log(
          'Element deleted. Remaining elements:',
          newSlides[currentSlideIndex].elements.length,
          'on slide:',
          currentSlide.title
        )
      }
      return newSlides
    })
    setSelectedElement(null)
  }

  const clearSlideElements = () => {
    console.log('Clearing all elements from slide:', currentSlideIndex)
    setSlides((prev) => {
      const newSlides = [...prev]
      const currentSlide = newSlides[currentSlideIndex]
      if (currentSlide) {
        newSlides[currentSlideIndex] = {
          ...currentSlide,
          elements: [],
        }
        console.log(
          'Slide cleared. Elements remaining:',
          newSlides[currentSlideIndex].elements.length,
          'on slide:',
          currentSlide.title
        )
      }
      return newSlides
    })
    setSelectedElement(null)
  }

  const logAllSlides = () => {
    console.log('=== ALL SLIDES STATE ===')
    slides.forEach((slide, index) => {
      console.log(`Slide ${index}: ${slide.title}`, {
        id: slide.id,
        elements: slide.elements.map((el) => ({
          id: el.id,
          type: el.type,
          content: el.content,
        })),
      })
    })
    console.log('=== END SLIDES STATE ===')
  }

  const resetToDefaultSlides = () => {
    console.log('Resetting to default slides')
    const defaultSlides = createDefaultSlides(project)
    setSlides(defaultSlides)
    setCurrentSlideIndex(0)
    setSelectedElement(null)
    console.log('Reset complete:', defaultSlides)
  }

  const validateSlideIsolation = () => {
    const slideElements = slides.flatMap((slide) => slide.elements)
    const uniqueElements = new Map<string, SlideElement>()

    slideElements.forEach((element) => {
      if (uniqueElements.has(element.id)) {
        console.warn(
          `Duplicate element found: ${element.id} on slide ${slides.findIndex((s) => s.elements.includes(element))}`
        )
      } else {
        uniqueElements.set(element.id, element)
      }
    })
    console.log('Validation complete. No duplicate elements found.')
  }

  const cleanupDuplicateElements = () => {
    const slideElements = slides.flatMap((slide) => slide.elements)
    const uniqueElements = new Map<string, SlideElement>()

    slideElements.forEach((element) => {
      if (uniqueElements.has(element.id)) {
        console.warn(
          `Removing duplicate element: ${element.id} from slide ${slides.findIndex((s) => s.elements.includes(element))}`
        )
        setSlides((prev) => {
          const newSlides = [...prev]
          const slideIndex = newSlides.findIndex((s) =>
            s.elements.includes(element)
          )
          if (slideIndex !== -1) {
            newSlides[slideIndex] = {
              ...newSlides[slideIndex],
              elements: newSlides[slideIndex].elements.filter(
                (el) => el.id !== element.id
              ),
            }
          }
          return newSlides
        })
      } else {
        uniqueElements.set(element.id, element)
      }
    })
    console.log('Cleanup complete. All unique elements remaining.')
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
        <SlideList
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={setCurrentSlideIndex}
          onSlideDelete={deleteSlide}
          onSlideDuplicate={duplicateSlide}
          onSlideReorder={reorderSlides}
          onAddSlide={addNewSlide}
        />
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => addTextElement()}
              >
                <Type className="h-4 w-4 mr-2" />
                Add Text
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addImageElement()}
              >
                <Image className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addShapeElement()}
              >
                <Square className="h-4 w-4 mr-2" />
                Add Shape
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Debug Info */}
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
            <div className="flex items-center justify-between">
              <div>
                <strong>Debug:</strong> Current Slide: {currentSlide.title} |
                Elements: {currentSlide.elements.length} | Slide Index:{' '}
                {currentSlideIndex}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearSlideElements}
                  className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                >
                  Clear Slide
                </button>
                <button
                  onClick={logAllSlides}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                >
                  Log State
                </button>
                <button
                  onClick={validateSlideIsolation}
                  className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200"
                >
                  Validate
                </button>
                <button
                  onClick={cleanupDuplicateElements}
                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200"
                >
                  Cleanup
                </button>
                <button
                  onClick={resetToDefaultSlides}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>

          <div
            ref={canvasRef}
            className="relative mx-auto bg-white border border-gray-300 rounded-lg shadow-lg"
            style={{
              width: '900px',
              height: '675px',
              background:
                currentSlide.background.type === 'color'
                  ? currentSlide.background.value
                  : `url(${currentSlide.background.value})`,
            }}
          >
            {currentSlide.elements.map((element) => {
              console.log(
                `Rendering element ${element.id} on slide ${currentSlide.id} (${currentSlide.title}):`,
                element
              )
              return (
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
                        letterSpacing: `${element.style.letterSpacing}px`,
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
                        borderRadius: `${element.style.borderRadius}px`,
                      }}
                    />
                  )}
                  {element.type === 'shape' && (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        backgroundColor: element.style.backgroundColor,
                        border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
                        borderRadius: `${element.style.borderRadius}px`,
                        color: element.style.color,
                      }}
                    >
                      {element.content}
                    </div>
                  )}
                </DraggableElement>
              )
            })}
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
                {
                  currentSlide.elements.find((el) => el.id === selectedElement)
                    ?.type
                }
              </p>
            </div>

            {/* Text Editor for Text Elements */}
            {currentSlide.elements.find((el) => el.id === selectedElement)
              ?.type === 'text' && (
              <TextEditor
                element={
                  currentSlide.elements.find((el) => el.id === selectedElement)!
                }
                onUpdate={(updates) => {
                  setSlides((prevSlides) => {
                    const updatedSlides = [...prevSlides]
                    const slide = updatedSlides[currentSlideIndex]
                    if (slide) {
                      const element = slide.elements.find(
                        (el) => el.id === selectedElement
                      )
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
                  value={
                    currentSlide.elements.find(
                      (el) => el.id === selectedElement
                    )?.x || 0
                  }
                  onChange={(e) => {
                    const element = currentSlide.elements.find(
                      (el) => el.id === selectedElement
                    )
                    if (element) {
                      handleElementMove(
                        selectedElement,
                        parseInt(e.target.value),
                        element.y
                      )
                    }
                  }}
                />
                <Input
                  type="number"
                  placeholder="Y %"
                  value={
                    currentSlide.elements.find(
                      (el) => el.id === selectedElement
                    )?.y || 0
                  }
                  onChange={(e) => {
                    const element = currentSlide.elements.find(
                      (el) => el.id === selectedElement
                    )
                    if (element) {
                      handleElementMove(
                        selectedElement,
                        element.x,
                        parseInt(e.target.value)
                      )
                    }
                  }}
                />
              </div>
            </div>

            {/* Delete Element Button */}
            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteElement(selectedElement)}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Element
              </Button>
            </div>
            <div>
              <Label className="text-sm font-medium">Size</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Width"
                  value={
                    currentSlide.elements.find(
                      (el) => el.id === selectedElement
                    )?.width || 0
                  }
                  onChange={(e) => {
                    const element = currentSlide.elements.find(
                      (el) => el.id === selectedElement
                    )
                    if (element) {
                      handleElementResize(
                        selectedElement,
                        parseInt(e.target.value),
                        element.height
                      )
                    }
                  }}
                />
                <Input
                  type="number"
                  placeholder="Height"
                  value={
                    currentSlide.elements.find(
                      (el) => el.id === selectedElement
                    )?.height || 0
                  }
                  onChange={(e) => {
                    const element = currentSlide.elements.find(
                      (el) => el.id === selectedElement
                    )
                    if (element) {
                      handleElementResize(
                        selectedElement,
                        element.width,
                        parseInt(e.target.value)
                      )
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Select an element to edit its properties
          </p>
        )}
      </div>

      {/* Template Selector Modal */}
      <SlideTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteSlideDialog
        isOpen={showDeleteDialog}
        slideTitle={
          slideToDelete !== null
            ? slides[slideToDelete]?.title || 'Untitled'
            : ''
        }
        onConfirm={confirmDeleteSlide}
        onCancel={() => {
          setShowDeleteDialog(false)
          setSlideToDelete(null)
        }}
      />
    </div>
  )
}
