'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker } from '@/components/ui/color-picker'
import { X, Save, Group, Ungroup, Palette, FileText, Tag, CheckCircle } from 'lucide-react'

interface PartDetails {
  id: string
  name: string
  finish: string
  color: string
  texture: string
  groupId?: string
  notes?: string
}

interface PartDetailsPanelProps {
  part: PartDetails | null
  isVisible: boolean
  onClose: () => void
  onUpdate: (partId: string, updates: Partial<PartDetails>) => void
  onDelete: (partId: string) => void
  onGroup: (partIds: string[], groupId: string) => void
  onUngroup: (partId: string) => void
  className?: string
}

export function PartDetailsPanel({
  part,
  isVisible,
  onClose,
  onUpdate,
  onDelete,
  onGroup,
  onUngroup,
  className = ''
}: PartDetailsPanelProps) {
  const [localPart, setLocalPart] = useState<PartDetails | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveNotification, setShowSaveNotification] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync local state with prop changes
  useEffect(() => {
    if (part) {
      setLocalPart(part)
      setIsEditing(false)
    }
  }, [part])

  // Cleanup timeout on unmount or part change
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [part])

  // Debounced save function
  const debouncedSave = useCallback((field: keyof PartDetails, value: string) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    // Show saving indicator
    setIsSaving(true)
    
    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate(localPart!.id, { [field]: value })
      setIsSaving(false)
    }, 1000) // Increased to 1 second for better UX
  }, [localPart, onUpdate])

  // Handle form field changes
  const handleFieldChange = (field: keyof PartDetails, value: string) => {
    if (!localPart) return
    
    const updatedPart = { ...localPart, [field]: value }
    setLocalPart(updatedPart)
    
    // Trigger debounced save
    debouncedSave(field, value)
  }

  // Handle save
  const handleSave = () => {
    if (!localPart) return
    onUpdate(localPart.id, localPart)
    setIsEditing(false)
    
    // Show save notification
    setShowSaveNotification(true)
    setTimeout(() => {
      setShowSaveNotification(false)
      // Auto-close panel after successful save
      onClose()
    }, 1500)
  }

  // Handle delete
  const handleDelete = () => {
    if (!localPart) return
    if (confirm('Are you sure you want to delete this part?')) {
      onDelete(localPart.id)
      onClose()
    }
  }

  if (!isVisible || !part) return null

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${className}`}>
      <Card className="h-full rounded-none border-0 shadow-none">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Part Details
                {isSaving && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded animate-pulse">
                    Saving...
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {part.groupId ? `Group: ${part.groupId}` : 'Individual Part'}
              </CardDescription>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 overflow-y-auto">
          {/* Part Name */}
          <div className="space-y-2">
            <Label htmlFor="part-name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Part Name
            </Label>
            <Input
              id="part-name"
              value={localPart?.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Enter part name"
              className="w-full"
            />
          </div>

          {/* Finish */}
          <div className="space-y-2">
            <Label htmlFor="part-finish" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Finish
            </Label>
            <Input
              id="part-finish"
              value={localPart?.finish || ''}
              onChange={(e) => handleFieldChange('finish', e.target.value)}
              placeholder="e.g., Matte, Glossy, Textured"
              className="w-full"
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color
            </Label>
            <ColorPicker
              value={localPart?.color || '#000000'}
              onChange={(color) => handleFieldChange('color', color)}
              label=""
              placeholder=""
            />
          </div>

          {/* Texture */}
          <div className="space-y-2">
            <Label htmlFor="part-texture" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Texture
            </Label>
            <Input
              id="part-texture"
              value={localPart?.texture || ''}
              onChange={(e) => handleFieldChange('texture', e.target.value)}
              placeholder="e.g., Smooth, Rough, Patterned"
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="part-notes" className="text-sm font-medium text-gray-700">
              Notes
            </Label>
            <textarea
              id="part-notes"
              value={localPart?.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Additional notes about this part..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Grouping Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700">Grouping</h4>
            
            {part.groupId ? (
              <Button
                onClick={() => onUngroup(part.id)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Ungroup className="w-4 h-4 mr-2" />
                Remove from Group
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const groupId = prompt('Enter group name:')
                  if (groupId) {
                    onGroup([part.id], groupId)
                  }
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Group className="w-4 h-4 mr-2" />
                Add to Group
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Delete Part
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Save notification */}
      {showSaveNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-right-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Changes saved successfully!</span>
          </div>
        </div>
      )}
    </div>
  )
}
