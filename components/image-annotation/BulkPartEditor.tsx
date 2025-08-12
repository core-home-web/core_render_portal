'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker } from '@/components/ui/color-picker'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Users, 
  Copy, 
  Trash2, 
  Save, 
  X,
  CheckSquare,
  Square
} from 'lucide-react'

interface BulkPart {
  id: string
  name: string
  finish: string
  color: string
  texture: string
  groupId?: string
  notes?: string
  isSelected: boolean
}

interface BulkPartEditorProps {
  parts: BulkPart[]
  onUpdateParts: (updates: Partial<BulkPart>, selectedIds: string[]) => void
  onDeleteParts: (partIds: string[]) => void
  onGroupParts: (partIds: string[], groupId: string) => void
  onClose: () => void
  className?: string
}

export function BulkPartEditor({
  parts,
  onUpdateParts,
  onDeleteParts,
  onGroupParts,
  onClose,
  className = ''
}: BulkPartEditorProps) {
  const [bulkUpdates, setBulkUpdates] = useState({
    finish: '',
    color: '',
    texture: '',
    groupId: ''
  })
  const [showGroupInput, setShowGroupInput] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const selectedParts = parts.filter(p => p.isSelected)
  const hasSelection = selectedParts.length > 0

  // Handle bulk updates
  const handleBulkUpdate = useCallback((field: keyof typeof bulkUpdates, value: string) => {
    if (!hasSelection) return
    
    setBulkUpdates(prev => ({ ...prev, [field]: value }))
    
    const selectedIds = selectedParts.map(p => p.id)
    onUpdateParts({ [field]: value }, selectedIds)
  }, [hasSelection, selectedParts, onUpdateParts])

  // Handle part selection
  const handlePartSelection = useCallback((partId: string, isSelected: boolean) => {
    // This would update the parent component's part selection state
    // For now, we'll just log the selection change
    console.log(`Part ${partId} ${isSelected ? 'selected' : 'deselected'}`)
  }, [])

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    if (!hasSelection) return
    
    if (confirm(`Are you sure you want to delete ${selectedParts.length} selected parts?`)) {
      const selectedIds = selectedParts.map(p => p.id)
      onDeleteParts(selectedIds)
    }
  }, [hasSelection, selectedParts, onDeleteParts])

  // Handle bulk grouping
  const handleBulkGroup = useCallback(() => {
    if (!hasSelection || !newGroupName.trim()) return
    
    const selectedIds = selectedParts.map(p => p.id)
    onGroupParts(selectedIds, newGroupName.trim())
    setNewGroupName('')
    setShowGroupInput(false)
  }, [hasSelection, selectedParts, onGroupParts, newGroupName])

  // Select all parts
  const handleSelectAll = useCallback(() => {
    parts.forEach(part => {
      if (!part.isSelected) {
        handlePartSelection(part.id, true)
      }
    })
  }, [parts, handlePartSelection])

  // Deselect all parts
  const handleDeselectAll = useCallback(() => {
    parts.forEach(part => {
      if (part.isSelected) {
        handlePartSelection(part.id, false)
      }
    })
  }, [parts, handlePartSelection])

  if (!hasSelection) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Bulk Part Editor
          </CardTitle>
          <CardDescription>
            Select multiple parts to edit them together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No parts selected</p>
            <p className="text-sm">Select parts from the canvas to edit them in bulk</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Bulk Part Editor
            </CardTitle>
            <CardDescription>
              Editing {selectedParts.length} selected parts
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
      
      <CardContent className="space-y-6">
        {/* Selection Controls */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedParts.length} parts selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <CheckSquare className="w-3 h-3 mr-1" />
                Select All
              </Button>
              <Button
                onClick={handleDeselectAll}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Square className="w-3 h-3 mr-1" />
                Deselect All
              </Button>
            </div>
          </div>
          <Button
            onClick={handleBulkDelete}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>

        {/* Bulk Update Fields */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Apply to All Selected Parts</h4>
          
          {/* Finish */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Finish</Label>
            <Select
              value={bulkUpdates.finish}
              onValueChange={(value) => handleBulkUpdate('finish', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select finish type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Matte">Matte</SelectItem>
                <SelectItem value="Glossy">Glossy</SelectItem>
                <SelectItem value="Satin">Satin</SelectItem>
                <SelectItem value="Textured">Textured</SelectItem>
                <SelectItem value="Industrial">Industrial</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Color</Label>
            <ColorPicker
              value={bulkUpdates.color}
              onChange={(color) => handleBulkUpdate('color', color)}
              label=""
              placeholder=""
            />
          </div>

          {/* Texture */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Texture</Label>
            <Select
              value={bulkUpdates.texture}
              onValueChange={(value) => handleBulkUpdate('texture', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select texture type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Smooth">Smooth</SelectItem>
                <SelectItem value="Rough">Rough</SelectItem>
                <SelectItem value="Patterned">Patterned</SelectItem>
                <SelectItem value="Grip Pattern">Grip Pattern</SelectItem>
                <SelectItem value="Matte">Matte</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grouping */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Group</Label>
            {!showGroupInput ? (
              <Button
                onClick={() => setShowGroupInput(true)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Group Selected Parts
              </Button>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="flex-1"
                />
                <Button
                  onClick={handleBulkGroup}
                  size="sm"
                  disabled={!newGroupName.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Group
                </Button>
                <Button
                  onClick={() => {
                    setShowGroupInput(false)
                    setNewGroupName('')
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Selected Parts List */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Selected Parts</h4>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {selectedParts.map((part) => (
              <div
                key={part.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={part.isSelected}
                    onCheckedChange={(checked) => 
                      handlePartSelection(part.id, checked as boolean)
                    }
                  />
                  <span className="text-sm font-medium">{part.name}</span>
                  {part.groupId && (
                    <Badge variant="secondary" className="text-xs">
                      {part.groupId}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{part.finish}</span>
                  <div 
                    className="w-3 h-3 rounded border"
                    style={{ backgroundColor: part.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
