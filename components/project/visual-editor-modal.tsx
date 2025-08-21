import React from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { X, Save, Download } from 'lucide-react'
import { SlideEditor, Slide } from '../presentation/slide-editor'
import { Project } from '../../types'

interface VisualEditorModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  onSave?: (slides: Slide[]) => void
  onExport?: (slides: Slide[]) => void
}

export function VisualEditorModal({
  isOpen,
  onClose,
  project,
  onSave,
  onExport
}: VisualEditorModalProps) {
  const [slides, setSlides] = React.useState<Slide[]>([])
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)

  // Auto-save key for localStorage
  const autoSaveKey = `visual-editor-${project.id}`

  // Load saved slides on mount
  React.useEffect(() => {
    if (isOpen) {
      const savedSlides = localStorage.getItem(autoSaveKey)
      if (savedSlides) {
        try {
          const parsedData = JSON.parse(savedSlides)
          // Handle both old format (direct array) and new format (object with slides property)
          if (Array.isArray(parsedData)) {
            setSlides(parsedData)
            setLastSaved(new Date())
          } else if (parsedData.slides && Array.isArray(parsedData.slides)) {
            setSlides(parsedData.slides)
            setLastSaved(new Date(parsedData.lastSaved || Date.now()))
          }
          console.log('Loaded saved slides:', parsedData)
        } catch (error) {
          console.warn('Failed to load saved slides:', error)
        }
      } else {
        console.log('No saved slides found, creating default slides')
      }
    }
  }, [isOpen, autoSaveKey])

  // Auto-save slides whenever they change
  React.useEffect(() => {
    // Always save, even if slides array is empty (to clear old data)
    const slidesWithTimestamp = {
      slides: slides,
      lastSaved: new Date().toISOString()
    }
    localStorage.setItem(autoSaveKey, JSON.stringify(slidesWithTimestamp))
    setLastSaved(new Date())
    console.log('Auto-saved slides:', slidesWithTimestamp)
  }, [slides, autoSaveKey])

  const generateHTMLFromSlides = (slides: Slide[], project: Project): string => {
    const slideHTML = slides.map((slide, index) => `
      <div class="slide" style="page-break-after: always;">
        <div class="slide-content">
          <h2 class="slide-title">${slide.title}</h2>
          ${slide.elements.map(element => {
            if (element.type === 'text') {
              return `<div class="text-element" style="
                position: absolute;
                left: ${element.x}%;
                top: ${element.y}%;
                width: ${element.width}px;
                height: ${element.height}px;
                font-size: ${element.style.fontSize}px;
                font-weight: ${element.style.fontWeight};
                font-style: ${element.style.fontStyle};
                text-decoration: ${element.style.textDecoration};
                color: ${element.style.color};
                background-color: ${element.style.backgroundColor};
                border: ${element.style.borderWidth}px solid ${element.style.borderColor};
                border-radius: ${element.style.borderRadius}px;
                text-align: ${element.style.textAlign};
                line-height: ${element.style.lineHeight};
                letter-spacing: ${element.style.letterSpacing}px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 8px;
              ">${element.content}</div>`
            } else if (element.type === 'image') {
              return `<img src="${element.content}" alt="Slide element" style="
                position: absolute;
                left: ${element.x}%;
                top: ${element.y}%;
                width: ${element.width}px;
                height: ${element.height}px;
                border: ${element.style.borderWidth}px solid ${element.style.borderColor};
                border-radius: ${element.style.borderRadius}px;
                object-fit: cover;
              " />`
            } else if (element.type === 'shape') {
              return `<div style="
                position: absolute;
                left: ${element.x}%;
                top: ${element.y}%;
                width: ${element.width}px;
                height: ${element.height}px;
                background-color: ${element.style.backgroundColor};
                border: ${element.style.borderWidth}px solid ${element.style.borderColor};
                border-radius: ${element.style.borderRadius}px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${element.style.color};
                font-size: ${element.style.fontSize}px;
              ">${element.content}</div>`
            }
            return ''
          }).join('')}
        </div>
      </div>
    `).join('')

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${project.title} - Custom Presentation</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
          }
          .slide {
            background: white;
            margin: 20px auto;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            position: relative;
            min-height: 600px;
            max-width: 800px;
          }
          .slide-title {
            color: #2E5BBA;
            margin-bottom: 30px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
          }
          .slide-content {
            position: relative;
            height: 500px;
          }
          .text-element {
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          @media print {
            .slide {
              page-break-after: always;
              margin: 0;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        ${slideHTML}
        <div style="text-align: center; margin-top: 40px; color: #666; font-size: 14px;">
          Generated by Core Home Render Portal - Custom Presentation
        </div>
      </body>
      </html>
    `
  }

  const downloadHTML = (htmlContent: string, filename: string) => {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full h-full max-w-[95vw] max-h-[95vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Visual Editor - {project.title}</h2>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Create and customize your presentation</span>
              {lastSaved && (
                <span className="text-xs text-green-600">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onSave && (
              <Button 
                variant="outline" 
                onClick={() => onSave(slides)}
                className="border-green-300 text-green-600 hover:bg-green-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            )}
            
            {onExport && (
              <Button 
                onClick={() => {
                  const htmlContent = generateHTMLFromSlides(slides, project)
                  downloadHTML(htmlContent, `${project.title}_custom_presentation.html`)
                  onExport(slides)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export HTML
              </Button>
            )}
            
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Slide Editor */}
        <div className="flex-1 overflow-hidden">
          <SlideEditor
            project={project}
            onSave={(updatedSlides) => {
              setSlides(updatedSlides)
              if (onSave) onSave(updatedSlides)
            }}
            onClose={onClose}
            initialSlides={slides}
          />
        </div>
      </div>
    </div>
  )
}
