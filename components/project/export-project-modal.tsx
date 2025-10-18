import React, { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import {
  X,
  FileText,
  Image,
  Users,
  Settings,
  Palette,
  Edit3,
} from 'lucide-react'

interface ExportProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (options: ExportOptions) => void
  onOpenVisualEditor: () => void
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
  theme: string
  visualEditorOptions?: VisualEditorExportOptions
}

export interface VisualEditorExportOptions {
  title: string
  imageFit: 'contain' | 'cover' | 'fill' | 'stretch'
  showAnnotations: boolean
  showPartDetails: boolean
  showNavigation: boolean
  theme: 'light' | 'dark' | 'auto'
  slideTransition: 'fade' | 'slide' | 'none'
  autoPlay: boolean
  autoPlayInterval: number
}

export function ExportProjectModal({
  isOpen,
  onClose,
  onExport,
  onOpenVisualEditor,
  projectTitle,
}: ExportProjectModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeProjectOverview: true,
    includeAnnotatedImages: true,
    includePartDetails: true,
    includePartGroups: true,
    includeTeamInfo: true,
    imageQuality: 'high',
    slideLayout: 'professional',
    includeNotes: true,
    theme: 'Core Home Professional',
  })

  const [customTitle, setCustomTitle] = useState(projectTitle)
  const [exportMode, setExportMode] = useState<'standard' | 'visual-editor'>('standard')
  const [visualEditorOptions, setVisualEditorOptions] = useState<VisualEditorExportOptions>({
    title: projectTitle,
    imageFit: 'contain',
    showAnnotations: true,
    showPartDetails: true,
    showNavigation: true,
    theme: 'light',
    slideTransition: 'fade',
    autoPlay: false,
    autoPlayInterval: 5,
  })

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const handleVisualEditorOptionChange = (key: keyof VisualEditorExportOptions, value: any) => {
    setVisualEditorOptions((prev) => ({ ...prev, [key]: value }))
  }

  const handleExport = () => {
    if (exportMode === 'visual-editor') {
      // Export with visual editor options
      onExport({
        ...options,
        customTitle: customTitle || projectTitle,
        visualEditorOptions,
      })
    } else {
      // Standard export
      onExport({
        ...options,
        customTitle: customTitle || projectTitle,
      })
    }
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
              <h2 className="text-xl font-semibold">Export to HTML</h2>
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

          {/* Export Mode Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-3 block">Export Mode</Label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  exportMode === 'standard'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setExportMode('standard')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Standard Export</span>
                </div>
                <p className="text-sm text-gray-600">
                  Traditional presentation with overview slides and detailed information
                </p>
              </div>
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  exportMode === 'visual-editor'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setExportMode('visual-editor')}
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Visual Editor</span>
                </div>
                <p className="text-sm text-gray-600">
                  Interactive slideshow that mimics the visual editor interface
                </p>
              </div>
            </div>
          </div>

          {/* Content Options */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Content to Include
            </h3>

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
            <h3 className="text-lg font-medium text-gray-900">
              Export Settings
            </h3>

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
                  onValueChange={(
                    value: 'professional' | 'basic' | 'minimal'
                  ) => handleOptionChange('slideLayout', value)}
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

            <div>
              <Label
                htmlFor="theme"
                className="text-sm font-medium flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Presentation Theme
              </Label>
              <Select
                value={options.theme}
                onValueChange={(value: string) =>
                  handleOptionChange('theme', value)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core Home Professional">
                    Core Home Professional
                  </SelectItem>
                  <SelectItem value="Luxury Design">Luxury Design</SelectItem>
                  <SelectItem value="Modern Minimal">Modern Minimal</SelectItem>
                  <SelectItem value="Warm & Inviting">
                    Warm & Inviting
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visual Editor Options */}
          {exportMode === 'visual-editor' && (
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Visual Editor Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image-fit" className="text-sm font-medium">
                    Image Fit
                  </Label>
                  <Select
                    value={visualEditorOptions.imageFit}
                    onValueChange={(value: 'contain' | 'cover' | 'fill' | 'stretch') =>
                      handleVisualEditorOptionChange('imageFit', value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contain">Contain (Fit)</SelectItem>
                      <SelectItem value="cover">Cover (Fill)</SelectItem>
                      <SelectItem value="fill">Fill</SelectItem>
                      <SelectItem value="stretch">Stretch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme" className="text-sm font-medium">
                    Theme
                  </Label>
                  <Select
                    value={visualEditorOptions.theme}
                    onValueChange={(value: 'light' | 'dark' | 'auto') =>
                      handleVisualEditorOptionChange('theme', value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transition" className="text-sm font-medium">
                    Slide Transition
                  </Label>
                  <Select
                    value={visualEditorOptions.slideTransition}
                    onValueChange={(value: 'fade' | 'slide' | 'none') =>
                      handleVisualEditorOptionChange('slideTransition', value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="autoplay-interval" className="text-sm font-medium">
                    Auto-play Interval (seconds)
                  </Label>
                  <Input
                    id="autoplay-interval"
                    type="number"
                    min="1"
                    max="60"
                    value={visualEditorOptions.autoPlayInterval}
                    onChange={(e) =>
                      handleVisualEditorOptionChange('autoPlayInterval', parseInt(e.target.value))
                    }
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="show-annotations"
                    checked={visualEditorOptions.showAnnotations}
                    onCheckedChange={(checked) =>
                      handleVisualEditorOptionChange('showAnnotations', checked)
                    }
                  />
                  <Label htmlFor="show-annotations" className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Show Annotation Overlays
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="show-part-details"
                    checked={visualEditorOptions.showPartDetails}
                    onCheckedChange={(checked) =>
                      handleVisualEditorOptionChange('showPartDetails', checked)
                    }
                  />
                  <Label htmlFor="show-part-details" className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    Show Part Details Panel
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="show-navigation"
                    checked={visualEditorOptions.showNavigation}
                    onCheckedChange={(checked) =>
                      handleVisualEditorOptionChange('showNavigation', checked)
                    }
                  />
                  <Label htmlFor="show-navigation" className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    Show Navigation Controls
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="autoplay"
                    checked={visualEditorOptions.autoPlay}
                    onCheckedChange={(checked) =>
                      handleVisualEditorOptionChange('autoPlay', checked)
                    }
                  />
                  <Label htmlFor="autoplay" className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Enable Auto-play
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={onOpenVisualEditor}
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Visual Editor
            </Button>
            <Button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate HTML
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
