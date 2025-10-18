'use client'

import React, { useState, useCallback } from 'react'
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
  MapPin
} from 'lucide-react'
import { FileUpload } from '@/components/ui/file-upload'
import { ScreenColorPicker } from '@/components/ui/screen-color-picker'
import { AnnotationPopupEditor } from '@/components/ui/annotation-popup-editor'
import { ItemDetailPopup } from '@/components/ui/item-detail-popup'

interface ItemEditorProps {
  item: {
    name: string
    hero_image?: string
    needs_packaging?: boolean
    needs_logo?: boolean
    packaging_type?: string
    use_project_logo?: boolean
    custom_logo?: string
    notes?: string
    parts?: Array<{
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
  }
  projectLogo?: string
  onSave: (updatedItem: any) => void
  onCancel: () => void
  onDelete?: () => void
}

export function ItemEditor({ item, projectLogo, onSave, onCancel, onDelete }: ItemEditorProps) {
  const [editedItem, setEditedItem] = useState(item)
  const [showAnnotationEditor, setShowAnnotationEditor] = useState(false)
  const [showItemDetail, setShowItemDetail] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const updateItem = (field: string, value: any) => {
    setEditedItem(prev => ({
      ...prev,
      [field]: value
    }))
  }

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

  const handleAnnotationSave = (annotations: any[]) => {
    const updatedParts = annotations.map(annotation => ({
      name: annotation.name,
      finish: annotation.finish,
      color: annotation.color,
      texture: annotation.texture,
      notes: annotation.notes,
      annotation_data: {
        x: annotation.x,
        y: annotation.y,
        id: annotation.id
      }
    }))
    
    setEditedItem(prev => ({
      ...prev,
      parts: updatedParts
    }))
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
    const partsCount = editedItem.parts?.length || 0
    const hasImage = !!editedItem.hero_image
    const hasPackaging = editedItem.needs_packaging
    const hasLogo = editedItem.needs_logo
    
    return {
      partsCount,
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
                    {/* Show annotation dots */}
                    {editedItem.parts && editedItem.parts.map((part, partIdx) => {
                      if (part.annotation_data) {
                        return (
                          <div
                            key={partIdx}
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
                    })}
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
                          id="use_project_logo"
                          name="logo_source"
                          checked={editedItem.use_project_logo !== false}
                          onChange={() => updateItem('use_project_logo', true)}
                          className="w-4 h-4"
                        />
                        <label htmlFor="use_project_logo" className="text-sm">
                          Use Project Logo
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="use_custom_logo"
                          name="logo_source"
                          checked={editedItem.use_project_logo === false}
                          onChange={() => updateItem('use_project_logo', false)}
                          className="w-4 h-4"
                        />
                        <label htmlFor="use_custom_logo" className="text-sm">
                          Upload Custom Logo
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Project Logo Preview */}
                  {editedItem.use_project_logo !== false && projectLogo && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Project Logo Preview
                      </label>
                      <div className="w-24 h-24 border rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={projectLogo}
                          alt="Project Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Custom Logo Upload */}
                  {editedItem.use_project_logo === false && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Upload Custom Logo
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
                            alt="Custom Logo"
                            className="w-full h-full object-contain"
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

        {/* Right Column - Parts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Parts
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
                  <Button
                    onClick={addPart}
                    size="sm"
                    variant="default"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Part
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editedItem.parts && editedItem.parts.length > 0 ? (
                <div className="space-y-4">
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No parts added yet</p>
                  <p className="text-sm">Add parts to define the components of this item</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Annotation Popup Editor */}
      <AnnotationPopupEditor
        key={`item-editor-annotation-${editedItem.parts?.length || 0}`}
        item={editedItem}
        isOpen={showAnnotationEditor}
        onClose={() => setShowAnnotationEditor(false)}
        onSave={handleAnnotationSave}
      />

      {/* Item Detail Popup */}
      <ItemDetailPopup
        key={`item-editor-detail-${editedItem.parts?.length || 0}`}
        item={editedItem}
        isOpen={showItemDetail}
        onClose={() => setShowItemDetail(false)}
      />
    </div>
  )
}
