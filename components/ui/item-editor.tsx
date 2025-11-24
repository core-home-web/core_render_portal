'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Palette,
  Package,
  Tag,
  MapPin,
  ChevronDown,
  ChevronUp,
  Copy
} from 'lucide-react'
import { FileUpload } from '@/components/ui/file-upload'
import { ScreenColorPicker } from '@/components/ui/screen-color-picker'
import { AnnotationPopupEditor } from '@/components/ui/annotation-popup-editor'
import { ItemDetailPopup } from '@/components/ui/item-detail-popup'
import { Version, Item, getItemParts, getAllItemParts, hasVersions } from '@/types'

interface ItemEditorProps {
  item: {
    id?: string
    name: string
    hero_image?: string
    needs_packaging?: boolean
    needs_logo?: boolean
    packaging_type?: string
    logo_source?: 'upload' | 'url'
    custom_logo?: string
    notes?: string
    parts?: Array<{
      id?: string
      name: string
      finish: string
      color: string
      texture: string
      notes?: string
      annotation_data?: {
        x: number
        y: number
        id: string
      }
    }>
    versions?: Version[]
  }
  projectLogo?: string
  onSave: (updatedItem: any) => void
  onCancel: () => void
  onDelete?: () => void
}

export function ItemEditor({ item, projectLogo, onSave, onCancel, onDelete }: ItemEditorProps) {
  // Initialize item with versions if it has parts but no versions (backward compatibility)
  const initializeItem = (item: ItemEditorProps['item']) => {
    if (item.versions && item.versions.length > 0) {
      return item
    }
    // If item has parts but no versions, keep it as-is for legacy support
    return item
  }

  const [editedItem, setEditedItem] = useState(initializeItem(item))
  const [showAnnotationEditor, setShowAnnotationEditor] = useState(false)
  const [showItemDetail, setShowItemDetail] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [collapsedVersions, setCollapsedVersions] = useState<Set<number>>(new Set())
  const [editingVersionName, setEditingVersionName] = useState<number | null>(null)

  // Update item when prop changes
  useEffect(() => {
    setEditedItem(initializeItem(item))
  }, [item])

  const updateItem = (field: string, value: any) => {
    setEditedItem(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Version management functions
  const addVersion = () => {
    setEditedItem(prev => {
      const existingVersions = prev.versions || []
      const nextVersionNumber = existingVersions.length > 0 
        ? Math.max(...existingVersions.map(v => v.versionNumber)) + 1
        : 1
      
      const newVersion: Version = {
        id: `version-${Date.now()}`,
        versionNumber: nextVersionNumber,
        parts: [],
        created_at: new Date().toISOString()
      }

      return {
        ...prev,
        versions: [...existingVersions, newVersion],
        // Clear legacy parts if versions exist
        parts: existingVersions.length > 0 ? undefined : prev.parts
      }
    })
  }

  const duplicateVersion = (versionIndex: number) => {
    setEditedItem(prev => {
      const existingVersions = prev.versions || []
      const versionToDuplicate = existingVersions[versionIndex]
      if (!versionToDuplicate) return prev

      const nextVersionNumber = Math.max(...existingVersions.map(v => v.versionNumber)) + 1
      
      // Deep clone parts
      const duplicatedParts = versionToDuplicate.parts.map(part => ({
        ...part,
        id: `part-${Date.now()}-${Math.random()}`
      }))

      const newVersion: Version = {
        id: `version-${Date.now()}`,
        versionNumber: nextVersionNumber,
        versionName: versionToDuplicate.versionName ? `${versionToDuplicate.versionName} (Copy)` : undefined,
        parts: duplicatedParts,
        created_at: new Date().toISOString()
      }

      return {
        ...prev,
        versions: [...existingVersions, newVersion]
      }
    })
  }

  const removeVersion = (versionIndex: number) => {
    setEditedItem(prev => {
      const existingVersions = prev.versions || []
      if (existingVersions.length <= 1) {
        // Don't allow removing the last version
        return prev
      }
      return {
        ...prev,
        versions: existingVersions.filter((_, index) => index !== versionIndex)
      }
    })
  }

  const updateVersion = (versionIndex: number, field: string, value: any) => {
    setEditedItem(prev => {
      const existingVersions = prev.versions || []
      return {
        ...prev,
        versions: existingVersions.map((version, index) =>
          index === versionIndex ? { ...version, [field]: value } : version
        )
      }
    })
  }

  const toggleVersionCollapse = (versionIndex: number) => {
    setCollapsedVersions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(versionIndex)) {
        newSet.delete(versionIndex)
      } else {
        newSet.add(versionIndex)
      }
      return newSet
    })
  }

  // Legacy part functions (for backward compatibility)
  const updatePart = (partIndex: number, field: string, value: any) => {
    setEditedItem(prev => ({
      ...prev,
      parts: prev.parts?.map((part, index) => 
        index === partIndex ? { ...part, [field]: value } : part
      ) || []
    }))
  }

  const addPart = () => {
    const newPart = {
      name: '',
      finish: '',
      color: '#3b82f6',
      texture: '',
      notes: ''
    }
    setEditedItem(prev => ({
      ...prev,
      parts: [...(prev.parts || []), newPart]
    }))
  }

  const removePart = (partIndex: number) => {
    setEditedItem(prev => ({
      ...prev,
      parts: prev.parts?.filter((_, index) => index !== partIndex) || []
    }))
  }

  // Version-aware part functions
  const updatePartInVersion = (versionIndex: number, partIndex: number, field: string, value: any) => {
    setEditedItem(prev => {
      const existingVersions = prev.versions || []
      return {
        ...prev,
        versions: existingVersions.map((version, vIndex) => {
          if (vIndex === versionIndex) {
            return {
              ...version,
              parts: version.parts.map((part, pIndex) =>
                pIndex === partIndex ? { ...part, [field]: value } : part
              )
            }
          }
          return version
        })
      }
    })
  }

  const addPartToVersion = (versionIndex: number) => {
    const newPart = {
      id: `part-${Date.now()}-${Math.random()}`,
      name: '',
      finish: '',
      color: '#3b82f6',
      texture: '',
      notes: ''
    }
    setEditedItem(prev => {
      const existingVersions = prev.versions || []
      return {
        ...prev,
        versions: existingVersions.map((version, index) => {
          if (index === versionIndex) {
            return {
              ...version,
              parts: [...version.parts, newPart]
            }
          }
          return version
        })
      }
    })
  }

  const removePartFromVersion = (versionIndex: number, partIndex: number) => {
    setEditedItem(prev => {
      const existingVersions = prev.versions || []
      return {
        ...prev,
        versions: existingVersions.map((version, vIndex) => {
          if (vIndex === versionIndex) {
            return {
              ...version,
              parts: version.parts.filter((_, pIndex) => pIndex !== partIndex)
            }
          }
          return version
        })
      }
    })
  }

  const handleAnnotationSave = (annotations: any[]) => {
    const updatedParts = annotations.map(annotation => ({
      id: annotation.id || `part-${Date.now()}-${Math.random()}`,
      name: annotation.name,
      finish: annotation.finish,
      color: annotation.color,
      texture: annotation.texture,
      notes: annotation.notes,
      annotation_data: {
        x: annotation.x,
        y: annotation.y,
        id: annotation.id || `annotation-${Date.now()}`
      }
    }))
    
    setEditedItem(prev => {
      // If using versions, update the first version (or create one if none exist)
      if (hasVersions(prev as Item)) {
        const existingVersions = prev.versions || []
        if (existingVersions.length > 0) {
          return {
            ...prev,
            versions: existingVersions.map((version, index) => 
              index === 0 ? { ...version, parts: updatedParts } : version
            )
          }
        } else {
          // Create first version if none exist
          return {
            ...prev,
            versions: [{
              id: `version-${Date.now()}`,
              versionNumber: 1,
              parts: updatedParts,
              created_at: new Date().toISOString()
            }]
          }
        }
      } else {
        // Legacy format
        return {
      ...prev,
      parts: updatedParts
        }
      }
    })
    setShowAnnotationEditor(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editedItem)
    } finally {
      setIsSaving(false)
    }
  }

  const getItemStatus = () => {
    const itemWithVersions = editedItem as Item
    const parts = hasVersions(itemWithVersions) 
      ? getAllItemParts(itemWithVersions)
      : (editedItem.parts || [])
    const partsCount = parts.length
    const versionsCount = editedItem.versions?.length || 0
    const hasImage = !!editedItem.hero_image
    const hasPackaging = editedItem.needs_packaging
    const hasLogo = editedItem.needs_logo
    
    return {
      partsCount,
      versionsCount,
      hasImage,
      hasPackaging,
      hasLogo,
      isComplete: hasImage && partsCount > 0
    }
  }

  const status = getItemStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {editedItem.name || 'Edit Item'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {status.isComplete ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Complete
                </Badge>
              ) : (
                <Badge variant="secondary">
                  In Progress
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {status.partsCount} part{status.partsCount !== 1 ? 's' : ''}
                {status.versionsCount > 0 && ` in ${status.versionsCount} version${status.versionsCount !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onDelete && (
            <Button
              variant="outline"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image & Basic Info */}
        <div className="space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Item Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                value={editedItem.hero_image || ''}
                onChange={(url) => updateItem('hero_image', url)}
                accept="image/*"
                maxSize={20}
                label="Upload Item Image"
                placeholder="Click to upload or drag and drop"
              />
              
              {editedItem.hero_image && (
                <div className="mt-4">
                  <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={editedItem.hero_image}
                      alt={editedItem.name || 'Item'}
                      className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowItemDetail(true)}
                      title="Click to view full image"
                    />
                    {/* Show annotation dots - use first version or legacy parts */}
                    {(() => {
                      const itemWithVersions = editedItem as Item
                      const partsToShow = hasVersions(itemWithVersions)
                        ? (itemWithVersions.versions?.[0]?.parts || [])
                        : (editedItem.parts || [])
                      
                      return partsToShow.map((part, partIdx) => {
                      if (part.annotation_data) {
                        return (
                          <div
                              key={part.id || partIdx}
                            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                            style={{
                              left: `${part.annotation_data.x}%`,
                              top: `${part.annotation_data.y}%`,
                              backgroundColor: part.color || '#3b82f6',
                              transform: 'translate(-50%, -50%)'
                            }}
                            title={`${part.name || `Part ${partIdx + 1}`} - ${part.color || '#3b82f6'}`}
                          >
                            <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                              {partIdx + 1}
                            </div>
                          </div>
                        )
                      }
                      return null
                      })
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Item Name *
                </label>
                <Input
                  value={editedItem.name}
                  onChange={(e) => updateItem('name', e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes
                </label>
                <Textarea
                  value={editedItem.notes || ''}
                  onChange={(e) => updateItem('notes', e.target.value)}
                  placeholder="Add any notes about this item"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Packaging & Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Packaging & Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needs_packaging"
                  checked={editedItem.needs_packaging || false}
                  onCheckedChange={(checked) => updateItem('needs_packaging', checked)}
                />
                <label htmlFor="needs_packaging" className="text-sm font-medium">
                  Needs Packaging
                </label>
              </div>

              {editedItem.needs_packaging && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Packaging Type
                  </label>
                  <Select
                    value={editedItem.packaging_type || ''}
                    onValueChange={(value) => updateItem('packaging_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select packaging type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                      <SelectItem value="envelope">Envelope</SelectItem>
                      <SelectItem value="tube">Tube</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needs_logo"
                  checked={editedItem.needs_logo || false}
                  onCheckedChange={(checked) => updateItem('needs_logo', checked)}
                />
                <label htmlFor="needs_logo" className="text-sm font-medium">
                  Needs Logo
                </label>
              </div>

              {editedItem.needs_logo && (
                <div className="space-y-4">
                  {/* Logo Source Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Logo Source
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="logo_upload"
                          name="logo_source"
                          checked={(editedItem.logo_source || 'upload') === 'upload'}
                          onChange={() => updateItem('logo_source', 'upload')}
                          className="w-4 h-4"
                        />
                        <label htmlFor="logo_upload" className="text-sm">
                          Upload Custom Logo
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="logo_url"
                          name="logo_source"
                          checked={editedItem.logo_source === 'url'}
                          onChange={() => updateItem('logo_source', 'url')}
                          className="w-4 h-4"
                        />
                        <label htmlFor="logo_url" className="text-sm">
                          Enter Logo URL
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Upload Logo Option */}
                  {(editedItem.logo_source || 'upload') === 'upload' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Upload Logo
                      </label>
                      <FileUpload
                        value={editedItem.custom_logo || ''}
                        onChange={(url) => updateItem('custom_logo', url)}
                        accept="image/*"
                        maxSize={20}
                        label="Upload Logo"
                        placeholder="Click to upload logo"
                      />
                      {editedItem.custom_logo && (
                        <div className="mt-2 w-24 h-24 border rounded-lg overflow-hidden bg-gray-50">
                          <img
                            src={editedItem.custom_logo}
                            alt="Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Enter Logo URL Option */}
                  {editedItem.logo_source === 'url' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        value={editedItem.custom_logo || ''}
                        onChange={(e) => updateItem('custom_logo', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                      {editedItem.custom_logo && (
                        <div className="mt-2 w-24 h-24 border rounded-lg overflow-hidden bg-gray-50">
                          <img
                            src={editedItem.custom_logo}
                            alt="Logo"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cpath fill="%23ccc" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Versions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Versions
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAnnotationEditor(true)}
                    size="sm"
                    variant="outline"
                    disabled={!editedItem.hero_image}
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    Annotations
                  </Button>
                  {editedItem.versions && editedItem.versions.length > 0 && (
                    <Button
                      onClick={() => duplicateVersion(editedItem.versions.length - 1)}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicate Version
                    </Button>
                  )}
                  <Button
                    onClick={addVersion}
                    size="sm"
                    variant="default"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Version
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const itemWithVersions = editedItem as Item
                const usesVersions = hasVersions(itemWithVersions)
                
                // Show versions if they exist
                if (usesVersions && editedItem.versions && editedItem.versions.length > 0) {
                  return (
                    <div className="space-y-4">
                      {editedItem.versions.map((version, versionIndex) => {
                        const isCollapsed = collapsedVersions.has(versionIndex)
                        const partsCount = version.parts.length
                        
                        return (
                          <div key={version.id || versionIndex} className="border rounded-lg overflow-hidden">
                            {/* Version Header */}
                            <div className="bg-gray-50 p-4 flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleVersionCollapse(versionIndex)}
                                  className="p-1"
                                >
                                  {isCollapsed ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronUp className="h-4 w-4" />
                                  )}
                                </Button>
                                <div className="flex-1">
                                  {editingVersionName === versionIndex ? (
                                    <Input
                                      value={version.versionName || ''}
                                      onChange={(e) => updateVersion(versionIndex, 'versionName', e.target.value)}
                                      onBlur={() => setEditingVersionName(null)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          setEditingVersionName(null)
                                        }
                                      }}
                                      placeholder={`Version ${version.versionNumber}`}
                                      className="text-sm font-medium"
                                      autoFocus
                                    />
                                  ) : (
                                    <div
                                      className="text-sm font-medium cursor-pointer hover:text-blue-600"
                                      onClick={() => setEditingVersionName(versionIndex)}
                                    >
                                      {version.versionName || `Version ${version.versionNumber}`}
                                    </div>
                                  )}
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {partsCount} part{partsCount !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {editedItem.versions && editedItem.versions.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVersion(versionIndex)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {/* Version Content (Parts) */}
                            {!isCollapsed && (
                              <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-sm font-medium">Parts</h5>
                                  <Button
                                    onClick={() => addPartToVersion(versionIndex)}
                                    size="sm"
                                    variant="outline"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Part
                                  </Button>
                                </div>
                                
                                {version.parts.length > 0 ? (
                                  <div className="space-y-4">
                                    {version.parts.map((part, partIndex) => (
                                      <div key={part.id || partIndex} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-medium flex items-center gap-2 text-sm">
                                            <div
                                              className="w-4 h-4 rounded-full border"
                                              style={{ backgroundColor: part.color || '#000000' }}
                                            />
                                            Part {partIndex + 1}
                                          </h4>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removePartFromVersion(versionIndex, partIndex)}
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="block text-xs font-medium mb-1">Name</label>
                                            <Input
                                              value={part.name}
                                              onChange={(e) => updatePartInVersion(versionIndex, partIndex, 'name', e.target.value)}
                                              placeholder="Part name"
                                              className="text-sm"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium mb-1">Finish</label>
                                            <Input
                                              value={part.finish}
                                              onChange={(e) => updatePartInVersion(versionIndex, partIndex, 'finish', e.target.value)}
                                              placeholder="Finish type"
                                              className="text-sm"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium mb-1">Texture</label>
                                            <Input
                                              value={part.texture}
                                              onChange={(e) => updatePartInVersion(versionIndex, partIndex, 'texture', e.target.value)}
                                              placeholder="Texture"
                                              className="text-sm"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium mb-1">Color</label>
                                            <div className="space-y-2">
                                              <ScreenColorPicker
                                                currentColor={part.color || '#000000'}
                                                onColorSelect={(color) => updatePartInVersion(versionIndex, partIndex, 'color', color)}
                                                className="text-sm"
                                              />
                                              <Input
                                                value={part.color || ''}
                                                onChange={(e) => updatePartInVersion(versionIndex, partIndex, 'color', e.target.value)}
                                                placeholder="Or enter color manually"
                                                className="text-sm"
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-xs font-medium mb-1">Notes</label>
                                          <Textarea
                                            value={part.notes || ''}
                                            onChange={(e) => updatePartInVersion(versionIndex, partIndex, 'notes', e.target.value)}
                                            placeholder="Part notes"
                                            rows={2}
                                            className="text-sm"
                                          />
                                        </div>

                                        {part.annotation_data && (
                                          <div className="text-xs text-muted-foreground bg-white p-2 rounded">
                                            <strong>Annotation:</strong> X: {part.annotation_data.x.toFixed(1)}%, Y: {part.annotation_data.y.toFixed(1)}%
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-muted-foreground bg-gray-50 rounded-lg">
                                    <p className="text-sm">No parts in this version</p>
                                    <p className="text-xs mt-1">Click "Add Part" to get started</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                }
                
                // Legacy format: show parts directly
                if (editedItem.parts && editedItem.parts.length > 0) {
                  return (
                <div className="space-y-4">
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          This item uses the legacy parts format. Create a version to use the new versions system.
                        </p>
                      </div>
                  {editedItem.parts.map((part, partIndex) => (
                    <div key={partIndex} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: part.color || '#000000' }}
                          />
                          Part {partIndex + 1}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePart(partIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">Name</label>
                          <Input
                            value={part.name}
                            onChange={(e) => updatePart(partIndex, 'name', e.target.value)}
                            placeholder="Part name"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Finish</label>
                          <Input
                            value={part.finish}
                            onChange={(e) => updatePart(partIndex, 'finish', e.target.value)}
                            placeholder="Finish type"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Texture</label>
                          <Input
                            value={part.texture}
                            onChange={(e) => updatePart(partIndex, 'texture', e.target.value)}
                            placeholder="Texture"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Color</label>
                          <div className="space-y-2">
                            <ScreenColorPicker
                              currentColor={part.color || '#000000'}
                              onColorSelect={(color) => updatePart(partIndex, 'color', color)}
                              className="text-sm"
                            />
                            <Input
                              value={part.color || ''}
                              onChange={(e) => updatePart(partIndex, 'color', e.target.value)}
                              placeholder="Or enter color manually"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Notes</label>
                        <Textarea
                          value={part.notes || ''}
                          onChange={(e) => updatePart(partIndex, 'notes', e.target.value)}
                          placeholder="Part notes"
                          rows={2}
                          className="text-sm"
                        />
                      </div>

                      {part.annotation_data && (
                        <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                          <strong>Annotation:</strong> X: {part.annotation_data.x.toFixed(1)}%, Y: {part.annotation_data.y.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                  )
                }
                
                // Empty state
                return (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No versions added yet</p>
                    <p className="text-sm">Add a version to define parts for this item</p>
                </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Annotation Popup Editor */}
      <AnnotationPopupEditor
        key={`item-editor-annotation-${(() => {
          const itemWithVersions = editedItem as Item
          return hasVersions(itemWithVersions)
            ? (itemWithVersions.versions?.[0]?.parts.length || 0)
            : (editedItem.parts?.length || 0)
        })()}`}
        item={editedItem}
        isOpen={showAnnotationEditor}
        onClose={() => setShowAnnotationEditor(false)}
        onSave={handleAnnotationSave}
      />

      {/* Item Detail Popup */}
      <ItemDetailPopup
        key={`item-editor-detail-${(() => {
          const itemWithVersions = editedItem as Item
          return hasVersions(itemWithVersions)
            ? (itemWithVersions.versions?.[0]?.parts.length || 0)
            : (editedItem.parts?.length || 0)
        })()}`}
        item={editedItem}
        isOpen={showItemDetail}
        onClose={() => setShowItemDetail(false)}
      />
    </div>
  )
}
