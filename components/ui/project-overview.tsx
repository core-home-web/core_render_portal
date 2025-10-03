'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Tag, 
  Palette, 
  Edit3, 
  Trash2, 
  Plus,
  Eye,
  MapPin
} from 'lucide-react'
import { ItemDetailPopup } from '@/components/ui/item-detail-popup'

interface ProjectOverviewProps {
  items: Array<{
    name: string
    hero_image?: string
    needs_packaging?: boolean
    needs_logo?: boolean
    packaging_type?: string
    logo_finish?: string
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
  }>
  onEditItem: (index: number) => void
  onDeleteItem: (index: number) => void
  onAddItem: () => void
}

export function ProjectOverview({ 
  items, 
  onEditItem, 
  onDeleteItem, 
  onAddItem 
}: ProjectOverviewProps) {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [showItemDetail, setShowItemDetail] = useState(false)

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index)
    setShowItemDetail(true)
  }

  const handleEditItem = (index: number) => {
    setSelectedItemIndex(null)
    setShowItemDetail(false)
    onEditItem(index)
  }

  const getItemStatus = (item: any) => {
    const partsCount = item.parts?.length || 0
    const hasImage = !!item.hero_image
    const hasPackaging = item.needs_packaging
    const hasLogo = item.needs_logo
    
    return {
      partsCount,
      hasImage,
      hasPackaging,
      hasLogo,
      isComplete: hasImage && partsCount > 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Overview</h2>
          <p className="text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} in this project
          </p>
        </div>
        <Button onClick={onAddItem} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => {
            const status = getItemStatus(item)
            
            return (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {item.name || `Item ${index + 1}`}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {status.isComplete ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleItemClick(index)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditItem(index)}
                        title="Edit item"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteItem(index)}
                        title="Delete item"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Item Image */}
                  {item.hero_image ? (
                    <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                      <img
                        src={item.hero_image}
                        alt={item.name || `Item ${index + 1}`}
                        className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleItemClick(index)}
                        title="Click to view details"
                      />
                      {/* Show annotation dots */}
                      {item.parts && item.parts.map((part, partIdx) => {
                        if (part.annotation_data) {
                          return (
                            <div
                              key={partIdx}
                              className="absolute w-3 h-3 rounded-full border border-white shadow-sm"
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
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center text-gray-500">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No image</p>
                      </div>
                    </div>
                  )}

                  {/* Item Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Parts:</span>
                      <span className="font-medium">{status.partsCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Packaging:</span>
                      <div className="flex items-center gap-1">
                        {status.hasPackaging ? (
                          <Package className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Package className="h-4 w-4 text-gray-300" />
                        )}
                        {item.packaging_type && (
                          <span className="text-xs text-muted-foreground">
                            {item.packaging_type}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Logo:</span>
                      <div className="flex items-center gap-1">
                        {status.hasLogo ? (
                          <Tag className="h-4 w-4 text-green-600" />
                        ) : (
                          <Tag className="h-4 w-4 text-gray-300" />
                        )}
                        {item.logo_finish && (
                          <span className="text-xs text-muted-foreground">
                            {item.logo_finish}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditItem(index)}
                      className="flex-1"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleItemClick(index)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first item to get started with your project
          </p>
          <Button onClick={onAddItem} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add First Item
          </Button>
        </div>
      )}

      {/* Item Detail Popup */}
      {selectedItemIndex !== null && (
        <ItemDetailPopup
          item={items[selectedItemIndex]}
          isOpen={showItemDetail}
          onClose={() => {
            setShowItemDetail(false)
            setSelectedItemIndex(null)
          }}
        />
      )}
    </div>
  )
}
