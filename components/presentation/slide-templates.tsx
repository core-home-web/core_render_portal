import React from 'react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Plus, Type, Image, Layout, BarChart3, FileText, Users } from 'lucide-react'

export interface SlideTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  type: 'title' | 'content' | 'image' | 'parts' | 'chart' | 'text' | 'team' | 'custom'
  defaultElements: Array<{
    type: 'text' | 'image' | 'shape'
    x: number
    y: number
    width: number
    height: number
    content: string
    style: any
  }>
}

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  {
    id: 'title',
    name: 'Title Slide',
    description: 'Simple title and subtitle layout',
    icon: <Type className="h-6 w-6" />,
    type: 'title',
    defaultElements: [
      {
        type: 'text',
        x: 50,
        y: 30,
        width: 400,
        height: 80,
        content: 'Presentation Title',
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
        type: 'text',
        x: 50,
        y: 50,
        width: 400,
        height: 40,
        content: 'Subtitle or description',
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
    ]
  },
  {
    id: 'content',
    name: 'Content Slide',
    description: 'Title with bullet points',
    icon: <Layout className="h-6 w-6" />,
    type: 'content',
    defaultElements: [
      {
        type: 'text',
        x: 50,
        y: 20,
        width: 400,
        height: 60,
        content: 'Content Title',
        style: {
          fontSize: 36,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#2E5BBA',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 0
        }
      },
      {
        type: 'text',
        x: 50,
        y: 35,
        width: 400,
        height: 200,
        content: '• First bullet point\n• Second bullet point\n• Third bullet point\n• Fourth bullet point',
        style: {
          fontSize: 20,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#333333',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          textAlign: 'left',
          lineHeight: 1.5,
          letterSpacing: 0
        }
      }
    ]
  },
  {
    id: 'image',
    name: 'Image Slide',
    description: 'Title with large image area',
    icon: <Image className="h-6 w-6" />,
    type: 'image',
    defaultElements: [
      {
        type: 'text',
        x: 50,
        y: 15,
        width: 400,
        height: 50,
        content: 'Image Title',
        style: {
          fontSize: 32,
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
        type: 'text',
        x: 50,
        y: 70,
        width: 300,
        height: 200,
        content: 'Drop image here',
        style: {
          fontSize: 18,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#999999',
          backgroundColor: '#f5f5f5',
          borderColor: '#e0e0e0',
          borderWidth: 2,
          borderRadius: 8,
          textAlign: 'center',
          lineHeight: 1.2,
          letterSpacing: 0
        }
      }
    ]
  },
  {
    id: 'parts',
    name: 'Parts Overview',
    description: 'Grid layout for part specifications',
    icon: <BarChart3 className="h-6 w-6" />,
    type: 'parts',
    defaultElements: [
      {
        type: 'text',
        x: 50,
        y: 15,
        width: 400,
        height: 50,
        content: 'Parts Overview',
        style: {
          fontSize: 32,
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
        type: 'text',
        x: 20,
        y: 35,
        width: 200,
        height: 150,
        content: 'Part 1\nFinish: Matte\nColor: Blue\nTexture: Smooth',
        style: {
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#333333',
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderWidth: 1,
          borderRadius: 8,
          textAlign: 'left',
          lineHeight: 1.4,
          letterSpacing: 0
        }
      },
      {
        type: 'text',
        x: 50,
        y: 35,
        width: 200,
        height: 150,
        content: 'Part 2\nFinish: Gloss\nColor: Red\nTexture: Rough',
        style: {
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#333333',
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderWidth: 1,
          borderRadius: 8,
          textAlign: 'left',
          lineHeight: 1.4,
          letterSpacing: 0
        }
      },
      {
        type: 'text',
        x: 80,
        y: 35,
        width: 200,
        height: 150,
        content: 'Part 3\nFinish: Satin\nColor: Green\nTexture: Medium',
        style: {
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#333333',
          backgroundColor: '#f8f9fa',
          borderColor: '#e9ecef',
          borderWidth: 1,
          borderRadius: 8,
          textAlign: 'left',
          lineHeight: 1.4,
          letterSpacing: 0
        }
      }
    ]
  },
  {
    id: 'text',
    name: 'Text Only',
    description: 'Simple text layout',
    icon: <FileText className="h-6 w-6" />,
    type: 'text',
    defaultElements: [
      {
        type: 'text',
        x: 50,
        y: 30,
        width: 500,
        height: 300,
        content: 'Enter your text content here. This template provides a large text area for longer content, notes, or detailed explanations.',
        style: {
          fontSize: 18,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#333333',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          textAlign: 'left',
          lineHeight: 1.6,
          letterSpacing: 0
        }
      }
    ]
  },
  {
    id: 'team',
    name: 'Team Slide',
    description: 'Team information layout',
    icon: <Users className="h-6 w-6" />,
    type: 'team',
    defaultElements: [
      {
        type: 'text',
        x: 50,
        y: 15,
        width: 400,
        height: 50,
        content: 'Team & Collaboration',
        style: {
          fontSize: 32,
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
        type: 'text',
        x: 50,
        y: 35,
        width: 400,
        height: 200,
        content: 'Project Owner: [Name]\nCreated: [Date]\nLast Updated: [Date]\n\nTeam Members:\n• [Member 1] - Role\n• [Member 2] - Role\n• [Member 3] - Role',
        style: {
          fontSize: 16,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#333333',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          textAlign: 'left',
          lineHeight: 1.5,
          letterSpacing: 0
        }
      }
    ]
  },
  {
    id: 'custom',
    name: 'Blank Slide',
    description: 'Empty canvas for custom content',
    icon: <Plus className="h-6 w-6" />,
    type: 'custom',
    defaultElements: []
  }
]

interface SlideTemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: SlideTemplate) => void
}

export function SlideTemplateSelector({
  isOpen,
  onClose,
  onSelectTemplate
}: SlideTemplateSelectorProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Plus className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Choose Slide Template</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SLIDE_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 border-gray-200 hover:border-blue-300"
                onClick={() => {
                  onSelectTemplate(template)
                  onClose()
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-blue-600">
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
                
                {/* Template Preview */}
                <div className="bg-gray-50 rounded p-3 min-h-[100px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-xs mb-2">Preview</div>
                    <div className="text-2xl font-bold text-gray-300">
                      {template.defaultElements.length > 0 ? 'A' : '□'}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
