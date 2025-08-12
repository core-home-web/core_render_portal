'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Target, Plus, X, Move, Info, Package, Users } from 'lucide-react'
import { ImageData } from './types'
import { FileUpload as FileUploadType } from './upload-types'
import { PartDetailsPanel } from './PartDetailsPanel'
import { PartTemplates } from './PartTemplates'
import { BulkPartEditor } from './BulkPartEditor'

interface PartNode {
  id: string
  x: number        // Relative X position (0-100 as percentage)
  y: number        // Relative Y position (0-100 as percentage)
  name: string
  finish: string
  color: string
  texture: string
  groupId?: string
  notes?: string
}

interface UnifiedImageViewportProps {
  projectImage?: string
  existingParts?: PartNode[] // Add existing parts prop
  existingGroups?: Array<{ id: string; name: string; color?: string }>
  onImageUpdate?: (imageUrl: string) => void
  onPartsUpdate?: (parts: PartNode[]) => void
  onGroupsUpdate?: (groups: Array<{ id: string; name: string; color?: string }>) => void
  className?: string
}

type ViewportState = 'preview' | 'upload' | 'annotation'

export function UnifiedImageViewport({ 
  projectImage, 
  existingParts = [], // Default to empty array
  existingGroups = [],
  onImageUpdate, 
  onPartsUpdate,
  onGroupsUpdate,
  className = '' 
}: UnifiedImageViewportProps) {
  const [currentState, setCurrentState] = useState<ViewportState>('preview')
  const [parts, setParts] = useState<PartNode[]>(existingParts)
  const [groups, setGroups] = useState<Array<{ id: string; name: string; color?: string }>>(existingGroups)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [showPartDetails, setShowPartDetails] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showBulkEditor, setShowBulkEditor] = useState(false)
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>([])
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync parts when existingParts change, but preserve existing positions
  useEffect(() => {
    if (existingParts && existingParts.length > 0) {
      // Only update parts if we don't have any, or if the count changed
      // This prevents overriding user's dragged positions
      if (parts.length === 0 || parts.length !== existingParts.length) {
        setParts(existingParts)
      } else {
        // Merge existing parts with new data, preserving positions
        const mergedParts = existingParts.map(newPart => {
          const existingPart = parts.find(p => p.id === newPart.id)
          return existingPart ? { ...newPart, x: existingPart.x, y: existingPart.y } : newPart
        })
        setParts(mergedParts)
      }
      
      // If we have parts, show annotation state
      if (existingParts.length > 0) {
        setCurrentState('annotation')
      }
    }
  }, [existingParts, parts.length])

  // Convert relative coordinates (0-100) to absolute pixels
  const relativeToAbsolute = useCallback((relX: number, relY: number) => {
    return {
      x: (relX / 100) * containerDimensions.width,
      y: (relY / 100) * containerDimensions.height
    }
  }, [containerDimensions])

  // Convert absolute pixels to relative coordinates (0-100)
  const absoluteToRelative = useCallback((absX: number, absY: number) => {
    if (containerDimensions.width === 0 || containerDimensions.height === 0) {
      return { x: 0, y: 0 }
    }
    return {
      x: (absX / containerDimensions.width) * 100,
      y: (absY / containerDimensions.height) * 100
    }
  }, [containerDimensions])

  // Update container dimensions when it changes
  const updateContainerDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerDimensions({ width: rect.width, height: rect.height })
    }
  }, [])

  // Sync groups when existingGroups change
  useEffect(() => {
    if (existingGroups && existingGroups.length > 0) {
      setGroups(existingGroups)
    }
  }, [existingGroups])

  // Track container dimensions and handle resize
  useEffect(() => {
    updateContainerDimensions()
    
    const resizeObserver = new ResizeObserver(() => {
      updateContainerDimensions()
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [updateContainerDimensions])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImageUpdate) {
      // Simulate upload and get URL
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageUpdate(result)
        setCurrentState('preview')
      }
      reader.readAsDataURL(file)
    }
  }, [onImageUpdate])

  // Add new part from template
  const handleAddPartFromTemplate = useCallback((template: any) => {
    if (!projectImage) return
    
    const newPart: PartNode = {
      id: `part-${Date.now()}`,
      x: 50, // Default position (50% = center)
      y: 50,
      name: template.name,
      finish: template.defaults.finish,
      color: template.defaults.color,
      texture: template.defaults.texture,
      notes: template.defaults.notes || ''
    }
    
    const updatedParts = [...parts, newPart]
    setParts(updatedParts)
    setSelectedPartId(newPart.id)
    setCurrentState('annotation')
    setShowTemplates(false)
    
    if (onPartsUpdate) {
      onPartsUpdate(updatedParts)
    }
  }, [projectImage, parts, onPartsUpdate])

  // Add new part
  const handleAddPart = useCallback(() => {
    if (!projectImage) return
    
    const newPart: PartNode = {
      id: `part-${Date.now()}`,
      x: 50, // Default position (50% = center)
      y: 50,
      name: `Part ${parts.length + 1}`,
      finish: 'Matte',
      color: '#3B82F6',
      texture: 'Smooth',
      notes: ''
    }
    
    const updatedParts = [...parts, newPart]
    setParts(updatedParts)
    setSelectedPartId(newPart.id)
    setCurrentState('annotation')
    
    if (onPartsUpdate) {
      onPartsUpdate(updatedParts)
    }
  }, [projectImage, parts, onPartsUpdate])

  // Handle part selection
  const handlePartClick = useCallback((e: React.MouseEvent | null, partId: string) => {
    if (e) {
      e.stopPropagation()
    }
    setSelectedPartId(partId)
    setShowPartDetails(true)
  }, [])

  // Handle part dragging
  const handlePartMouseDown = useCallback((e: React.MouseEvent, partId: string) => {
    e.stopPropagation()
    setSelectedPartId(partId)
    setIsDragging(true)
    
    const part = parts.find(p => p.id === partId)
    if (part) {
      const rect = e.currentTarget.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }, [parts])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedPartId) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const newAbsX = e.clientX - rect.left - dragOffset.x
    const newAbsY = e.clientY - rect.top - dragOffset.y
    
    // Convert absolute coordinates to relative (0-100)
    const newRelX = Math.max(0, Math.min((newAbsX / rect.width) * 100, 100))
    const newRelY = Math.max(0, Math.min((newAbsY / rect.height) * 100, 100))
    
    const updatedParts = parts.map(part => 
      part.id === selectedPartId 
        ? { ...part, x: newRelX, y: newRelY }
        : part
    )
    
    setParts(updatedParts)
    
    // Update parent component immediately during drag for better responsiveness
    if (onPartsUpdate) {
      console.log('🖱️ Drag update calling onPartsUpdate')
      onPartsUpdate(updatedParts)
    }
  }, [isDragging, selectedPartId, dragOffset, parts, onPartsUpdate])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    if (onPartsUpdate) {
      onPartsUpdate(parts)
    }
  }, [parts, onPartsUpdate])

  // Update part
  const handleUpdatePart = useCallback((partId: string, updates: Partial<PartNode>) => {
    const updatedParts = parts.map(p => 
      p.id === partId ? { ...p, ...updates } : p
    )
    setParts(updatedParts)
    if (onPartsUpdate) {
      onPartsUpdate(updatedParts)
    }
  }, [parts, onPartsUpdate])

  // Group parts
  const handleGroupParts = useCallback((partIds: string[], groupId: string) => {
    console.log('🔗 Grouping parts:', { partIds, groupId, currentParts: parts })
    
    const updatedParts = parts.map(p => 
      partIds.includes(p.id) ? { ...p, groupId } : p
    )
    
    console.log('🔗 Updated parts after grouping:', updatedParts)
    
    setParts(updatedParts)
    if (onPartsUpdate) {
      onPartsUpdate(updatedParts)
    }
  }, [parts, onPartsUpdate])

  // Create new group
  const handleCreateGroup = useCallback((name: string, color?: string) => {
    const newGroup = {
      id: `group-${Date.now()}`,
      name,
      color: color || '#3b82f6',
      created_at: new Date().toISOString()
    }
    
    const updatedGroups = [...groups, newGroup]
    setGroups(updatedGroups)
    
    if (onGroupsUpdate) {
      onGroupsUpdate(updatedGroups)
    }
    
    return newGroup.id
  }, [groups, onGroupsUpdate])

  // Ungroup part
  const handleUngroupPart = useCallback((partId: string) => {
    const updatedParts = parts.map(p => 
      p.id === partId ? { ...p, groupId: undefined } : p
    )
    setParts(updatedParts)
    if (onPartsUpdate) {
      onPartsUpdate(updatedParts)
    }
  }, [parts, onPartsUpdate])

  // Bulk update parts
  const handleBulkUpdateParts = useCallback((updates: Partial<PartNode>, selectedIds: string[]) => {
    const updatedParts = parts.map(p => 
      selectedIds.includes(p.id) ? { ...p, ...updates } : p
    )
    setParts(updatedParts)
    if (onPartsUpdate) {
      onPartsUpdate(updatedParts)
    }
  }, [parts, onPartsUpdate])

  // Bulk delete parts
  const handleBulkDeleteParts = useCallback((partIds: string[]) => {
    const updatedParts = parts.filter(p => !partIds.includes(p.id))
    setParts(updatedParts)
    setSelectedPartIds([])
    setShowBulkEditor(false)
    if (onPartsUpdate) {
      onPartsUpdate(updatedParts)
    }
  }, [parts, onPartsUpdate])

  // Toggle part selection for bulk editing
  const handleTogglePartSelection = useCallback((partId: string) => {
    setSelectedPartIds(prev => 
      prev.includes(partId) 
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    )
  }, [])

  // Remove part
  const handleRemovePart = useCallback((partId: string) => {
    const updatedParts = parts.filter(p => p.id !== partId)
    setParts(updatedParts)
    if (selectedPartId === partId) {
      setSelectedPartId(null)
      setShowPartDetails(false)
    }
    if (onPartsUpdate) {
      onPartsUpdate(updatedParts)
    }
  }, [parts, selectedPartId, onPartsUpdate])

  // Render viewport content based on state
  const renderViewportContent = () => {
    switch (currentState) {
      case 'upload':
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Upload className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Upload Project Image</p>
            <p className="text-sm text-gray-500 mb-4">Drag & drop or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              Choose Image
            </Button>
          </div>
        )

      case 'annotation':
        return (
          <div className="relative h-full">
            {projectImage && (
              <img 
                src={projectImage} 
                alt="Project" 
                className="w-full h-full object-contain"
              />
            )}
            {/* Part nodes */}
            {parts.map((part) => {
              // Convert relative coordinates to absolute pixels for display
              const absPos = relativeToAbsolute(part.x, part.y)
              
              return (
                <div
                  key={part.id}
                  className={`absolute w-6 h-6 rounded-full cursor-pointer border-2 transition-all duration-200 hover:scale-110 group ${
                    selectedPartId === part.id ? 'border-yellow-400 shadow-lg animate-pulse' : 'border-white'
                  } ${part.groupId ? 'ring-2 ring-purple-300' : ''} ${
                    selectedPartIds.includes(part.id) ? 'ring-2 ring-green-400 bg-green-500' : ''
                  }`}
                  style={{ 
                    left: absPos.x - 12, // Center the 12x12 dot
                    top: absPos.y - 12,
                    backgroundColor: selectedPartIds.includes(part.id) ? '#10b981' : (part.color || '#3b82f6')
                  }}
                onMouseDown={(e) => handlePartMouseDown(e, part.id)}
                onClick={(e) => handlePartClick(e, part.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  handleTogglePartSelection(part.id)
                }}
                title={`${part.name} - ${part.finish}${part.groupId ? ` (Group: ${part.groupId})` : ''}${selectedPartIds.includes(part.id) ? ' - Selected for bulk edit' : ''}`}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {part.groupId ? (
                    <span className="text-white text-xs font-bold">G</span>
                  ) : selectedPartIds.includes(part.id) ? (
                    <span className="text-white text-xs font-bold">✓</span>
                  ) : (
                    <Move className="w-3 h-3 text-white" />
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemovePart(part.id)
                  }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-2 h-2" />
                </button>
                {/* Info indicator */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePartClick(e, part.id)
                  }}
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Info className="w-2 h-2" />
                </button>
                
                {/* Enhanced tooltip showing part details */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-lg">
                  <div className="font-semibold">{part.name}</div>
                  <div className="text-gray-300">{part.finish} • {part.texture}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                </div>
              </div>
            )})}
          </div>
        )

      default: // preview
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            {projectImage ? (
              <div className="relative w-full h-full">
                <img 
                  src={projectImage} 
                  alt="Project Preview" 
                  className="w-full h-full object-contain rounded-lg"
                />
                {/* Show part indicators */}
                {parts.map((part) => (
                  <div
                    key={part.id}
                    className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white"
                    style={{ left: part.x, top: part.y }}
                    title={`${part.name} - ${part.finish}`}
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">No Project Image</p>
                <p className="text-sm text-gray-500 mb-4">Upload an image to get started</p>
                <Button onClick={() => setCurrentState('upload')} variant="outline">
                  Upload Image
                </Button>
              </>
            )}
          </div>
        )
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">
              {currentState === 'preview' && 'Project Preview'}
              {currentState === 'upload' && 'Upload Image'}
              {currentState === 'annotation' && 'Part Annotation'}
            </CardTitle>
            <CardDescription>
              {currentState === 'preview' && 'Current project image and visual reference'}
              {currentState === 'upload' && 'Upload a new project image'}
              {currentState === 'annotation' && 'Click and drag parts to position them'}
            </CardDescription>
            
            {/* Status indicators for annotation state */}
            {currentState === 'annotation' && (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-600">{parts.length} part{parts.length !== 1 ? 's' : ''}</span>
                </div>
                {groups.length > 0 && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="text-purple-600">{groups.length} group{groups.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-green-600">Responsive</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {currentState === 'preview' && (
              <>
                <Button 
                  onClick={() => setCurrentState('upload')} 
                  variant="outline" 
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                {projectImage && (
                  <Button 
                    onClick={handleAddPart} 
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Part
                  </Button>
                )}
              </>
            )}
            
            {currentState === 'upload' && (
              <Button 
                onClick={() => setCurrentState('preview')} 
                variant="outline" 
                size="sm"
              >
                Cancel
              </Button>
            )}
            
            {currentState === 'annotation' && (
              <>
                <Button 
                  onClick={() => setShowTemplates(true)} 
                  variant="outline"
                  size="sm"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Templates
                </Button>
                <Button 
                  onClick={handleAddPart} 
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Part
                </Button>
                {selectedPartIds.length > 0 && (
                  <Button 
                    onClick={() => setShowBulkEditor(true)} 
                    variant="outline"
                    size="sm"
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Bulk Edit ({selectedPartIds.length})
                  </Button>
                )}
                <Button 
                  onClick={() => setCurrentState('preview')} 
                  variant="outline" 
                  size="sm"
                >
                  Done
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          ref={containerRef}
          className="w-full h-[500px] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden relative"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {renderViewportContent()}
        </div>
        
        {/* Groups Overview */}
        {groups.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-700 mb-2">
              Groups ({groups.length})
            </h4>
            <div className="space-y-2">
              {groups.map((group) => {
                const groupParts = parts.filter(part => part.groupId === group.id)
                return (
                  <div key={group.id} className="flex items-center justify-between text-sm p-2 rounded bg-white border border-purple-100">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border-2 border-purple-300"
                        style={{ backgroundColor: group.color || '#8b5cf6' }}
                      />
                      <span className="text-purple-700 font-medium">{group.name}</span>
                      <span className="text-xs text-purple-500">
                        {groupParts.length} part{groupParts.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {groupParts.map(part => (
                        <span key={part.id} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {part.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Parts summary */}
        {parts.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2">Parts ({parts.length})</h4>
            <div className="space-y-2">
              {parts.map((part) => {
                const partGroup = groups.find(g => g.id === part.groupId)
                const isSelected = selectedPartId === part.id
                return (
                  <div 
                    key={part.id} 
                    className={`flex items-center justify-between text-sm p-2 rounded transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-100 border border-blue-300 shadow-sm' 
                        : 'hover:bg-gray-100 border border-transparent'
                    }`}
                    onClick={() => handlePartClick(null, part.id)}
                    title={`Click to view details for ${part.name}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                        {part.name}
                      </span>
                      {part.groupId && partGroup ? (
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-3 h-3 rounded border border-purple-300"
                            style={{ backgroundColor: partGroup.color || '#8b5cf6' }}
                          />
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {partGroup.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                          Unassigned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs">{part.finish}</span>
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: part.color }}
                      />
                      <div className="text-xs text-gray-400 mr-1">Click to edit</div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePartClick(null, part.id)
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        <Info className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemovePart(part.id)
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

                       {/* Part Details Panel */}
               <PartDetailsPanel
                 part={parts.find(p => p.id === selectedPartId) || null}
                 isVisible={showPartDetails}
                 existingGroups={groups}
                 onClose={() => {
                   setShowPartDetails(false)
                   setSelectedPartId(null)
                 }}
                 onUpdate={handleUpdatePart}
                 onDelete={handleRemovePart}
                 onGroup={handleGroupParts}
                 onUngroup={handleUngroupPart}
                 onCreateGroup={handleCreateGroup}
               />

        {/* Part Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto">
              <PartTemplates
                onSelectTemplate={handleAddPartFromTemplate}
                className="border-0 shadow-none"
              />
              <div className="p-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowTemplates(false)}
                  variant="outline"
                  className="w-full"
                >
                  Close Templates
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Part Editor */}
        <BulkPartEditor
          parts={parts.map(p => ({
            ...p,
            isSelected: selectedPartIds.includes(p.id)
          }))}
          onUpdateParts={handleBulkUpdateParts}
          onDeleteParts={handleBulkDeleteParts}
          onGroupParts={handleGroupParts}
          onClose={() => setShowBulkEditor(false)}
          className={showBulkEditor ? 'fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50' : 'hidden'}
        />
      </CardContent>
    </Card>
  )
}
