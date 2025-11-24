'use client'

import React, { useState } from 'react'
import { 
  Package, 
  Tag, 
  Edit3, 
  Trash2, 
  Plus,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { ItemDetailPopup } from '@/components/ui/item-detail-popup'
import { useTheme } from '@/lib/theme-context'
import { ThemedButton } from '@/components/ui/themed-button'
import { hasVersions } from '@/types'

interface ProjectOverviewProps {
  items: Array<{
    name: string
    hero_image?: string
    needs_packaging?: boolean
    needs_logo?: boolean
    packaging_type?: string
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
  const { colors } = useTheme()
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
          <h2 className="text-2xl font-bold text-white">Project Overview</h2>
          <p className="text-[#595d60]">
            {items.length} item{items.length !== 1 ? 's' : ''} in this project
          </p>
        </div>
        <ThemedButton onClick={onAddItem} variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </ThemedButton>
      </div>

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, index) => {
          const status = getItemStatus(item)
          
          return (
            <div 
              key={index} 
              className="bg-[#1a1e1f] rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-200 overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-medium text-white flex-1 pr-2">
                    {item.name || `Item ${index + 1}`}
                  </h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleItemClick(index)}
                      title="View details"
                      className="p-1.5 rounded-lg hover:bg-[#222a31] transition-colors text-[#595d60] hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteItem(index)}
                      title="Delete item"
                      className="p-1.5 rounded-lg hover:bg-red-900/20 transition-colors text-[#595d60] hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Status Badge */}
                {status.isComplete ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Complete
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-700/50 text-[#595d60] rounded-full text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    In Progress
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-4 space-y-4">
                {/* Item Image */}
                {item.hero_image ? (
                  <div 
                    className="relative aspect-square bg-[#0d1117] rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleItemClick(index)}
                  >
                    <img
                      src={item.hero_image}
                      alt={item.name || `Item ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                    {/* Annotation dots - show from first version or legacy parts */}
                    {(() => {
                      const itemWithVersions = item as any
                      const partsToShow = hasVersions(itemWithVersions)
                        ? (itemWithVersions.versions?.[0]?.parts || [])
                        : (item.parts || [])
                      
                      return partsToShow.map((part: any, partIdx: number) => {
                        if (part.annotation_data) {
                          return (
                            <div
                              key={part.id || partIdx}
                              className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
                              style={{
                                left: `${part.annotation_data.x}%`,
                                top: `${part.annotation_data.y}%`,
                                backgroundColor: part.color || colors.primary,
                                transform: 'translate(-50%, -50%)'
                              }}
                              title={`${part.name || `Part ${partIdx + 1}`}`}
                            >
                              {partIdx + 1}
                            </div>
                          )
                        }
                        return null
                      })
                    })()}
                  </div>
                ) : (
                  <div className="aspect-square bg-[#0d1117] rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                    <div className="text-center text-[#595d60]">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No image</p>
                    </div>
                  </div>
                )}

                {/* Item Stats */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#595d60]">Parts:</span>
                    <span className="text-white font-medium">{status.partsCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#595d60]">Packaging:</span>
                    <div className="flex items-center gap-1.5">
                      {status.hasPackaging ? (
                        <Package className="h-4 w-4" style={{ color: colors.primary }} />
                      ) : (
                        <Package className="h-4 w-4 text-gray-700" />
                      )}
                      {item.packaging_type && (
                        <span className="text-xs text-[#595d60]">
                          {item.packaging_type}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#595d60]">Logo:</span>
                    <div className="flex items-center gap-1.5">
                      {status.hasLogo ? (
                        <>
                          <Tag className="h-4 w-4" style={{ color: colors.primary }} />
                          <span className="text-xs text-[#595d60]">Logo</span>
                        </>
                      ) : (
                        <Tag className="h-4 w-4 text-gray-700" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEditItem(index)}
                    className="flex-1 px-4 py-2.5 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleItemClick(index)}
                    className="px-3 py-2.5 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    ) : (
      <div className="text-center py-20 bg-[#1a1e1f] rounded-2xl border border-gray-800">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
          <Package className="h-12 w-12" style={{ color: colors.primary }} />
        </div>
        <h3 className="text-2xl font-semibold text-white mb-3">No items yet</h3>
        <p className="text-[#595d60] text-lg mb-8 max-w-md mx-auto">
          Add your first item to get started with your project
        </p>
        <ThemedButton onClick={onAddItem} variant="primary" className="inline-flex">
          <Plus className="h-5 w-5 mr-2" />
          Add First Item
        </ThemedButton>
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

