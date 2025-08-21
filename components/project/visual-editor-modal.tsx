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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full h-full max-w-7xl max-h-[95vh] bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Visual Editor - {project.title}</h2>
            <span className="text-sm text-gray-500">Create and customize your presentation</span>
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
                onClick={() => onExport(slides)}
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
          />
        </div>
      </div>
    </div>
  )
}
