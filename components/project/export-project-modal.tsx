import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { X, FileText, Image, Users, Settings } from 'lucide-react'

interface ExportProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (options: ExportOptions) => void
  projectTitle: string
}

export interface ExportOptions {
  includeProjectOverview: boolean
  includeAnnotatedImages: boolean
  includePartDetails: boolean
  includePartGroups: boolean
  includeTeamInfo: boolean
  imageQuality: 'high' | 'medium' | 'low'
  slideLayout: 'professional' | 'basic' | 'minimal'
  customTitle?: string
  includeNotes: boolean
}

export function ExportProjectModal({
  isOpen,
  onClose,
  onExport,
  projectTitle
}: ExportProjectModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeProjectOverview: true,
    includeAnnotatedImages: true,
    includePartDetails: true,
    includePartGroups: true,
    includeTeamInfo: true,
    imageQuality: 'high',
    slideLayout: 'professional',
    includeNotes: true
  })

  const [customTitle, setCustomTitle] = useState(projectTitle)

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleExport = () => {
    onExport({
      ...options,
      customTitle: customTitle || projectTitle
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Export to PowerPoint</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Project Title */}
          <div className="mb-6">
            <Label htmlFor="custom-title" className="text-sm font-medium">
              Presentation Title
            </Label>
            <Input
              id="custom-title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Enter presentation title"
              className="mt-2"
            />
          </div>

          {/* Content Options */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900">Content to Include</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="overview"
                  checked={options.includeProjectOverview}
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeProjectOverview', checked)
                  }
                />
                <Label htmlFor="overview" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  Project Overview & Summary
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="images"
                  checked={options.includeAnnotatedImages}
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeAnnotatedImages', checked)
                  }
                />
                <Label htmlFor="images" className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-gray-600" />
                  Annotated Images with Parts
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="parts"
                  checked={options.includePartDetails}
                  onCheckedChange={(checked) => 
                    handleOptionChange('includePartDetails', checked)
                  }
                />
                <Label htmlFor="parts" className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-600" />
                  Part Specifications & Details
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="groups"
                  checked={options.includePartGroups}
                  onCheckedChange={(checked) => 
                    handleOptionChange('includePartGroups', checked)
                  }
                />
                <Label htmlFor="groups" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  Part Grouping & Organization
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="team"
                  checked={options.includeTeamInfo}
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeTeamInfo', checked)
                  }
                />
                <Label htmlFor="team" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  Team Members & Collaborators
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="notes"
                  checked={options.includeNotes}
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeNotes', checked)
                  }
                />
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  Project Notes & Comments
                </Label>
              </div>
            </div>
          </div>

          {/* Export Settings */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900">Export Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image-quality" className="text-sm font-medium">
                  Image Quality
                </Label>
                <Select
                  value={options.imageQuality}
                  onValueChange={(value: 'high' | 'medium' | 'low') => 
                    handleOptionChange('imageQuality', value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Quality</SelectItem>
                    <SelectItem value="medium">Medium Quality</SelectItem>
                    <SelectItem value="low">Low Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="slide-layout" className="text-sm font-medium">
                  Slide Layout
                </Label>
                <Select
                  value={options.slideLayout}
                  onValueChange={(value: 'professional' | 'basic' | 'minimal') => 
                    handleOptionChange('slideLayout', value)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Generate PowerPoint
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
