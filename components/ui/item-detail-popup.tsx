'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Package, Tag, Palette, FileText, MapPin } from 'lucide-react'
import { hasVersions } from '@/types'

interface ItemDetailPopupProps {
  item: {
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
  }
  isOpen: boolean
  onClose: () => void
}

export function ItemDetailPopup({ item, isOpen, onClose }: ItemDetailPopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">
            {item.name || 'Item Details'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="flex flex-col h-full overflow-hidden">
          {/* Image Section */}
          <div className="flex-1 mb-6">
            {item.hero_image ? (
              <div className="relative w-full h-full min-h-[400px] bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={item.hero_image}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
                {/* Show annotation dots on image */}
                {item.parts && item.parts.map((part, partIdx) => {
                  if (part.annotation_data) {
                    return (
                      <div
                        key={partIdx}
                        className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
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
              <div className="w-full h-full min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="h-64 overflow-y-auto">
            <div className="space-y-4">
              {/* Packaging & Logo Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.needs_packaging && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Needs Packaging</p>
                      {item.packaging_type && (
                        <p className="text-xs text-blue-700">Type: {item.packaging_type}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {item.needs_logo && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Tag className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Needs Logo</p>
                      {item.custom_logo && (
                        <p className="text-xs text-green-700">Custom logo uploaded</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Versions or Parts Section */}
              {(() => {
                const itemWithVersions = item as any
                const usesVersions = hasVersions(itemWithVersions)
                
                if (usesVersions && item.versions && item.versions.length > 0) {
                  // Show versions
                  return (
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Versions ({item.versions.length})
                      </h3>
                      <div className="space-y-4">
                        {item.versions.map((version: any, versionIndex: number) => {
                          const partsCount = version.parts.length
                          return (
                            <div key={version.id || versionIndex} className="border rounded-lg p-4 bg-gray-50">
                              <div className="mb-3 pb-2 border-b border-gray-200">
                                <h4 className="font-medium text-gray-900">
                                  {version.versionName || `Version ${version.versionNumber}`}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {partsCount} part{partsCount !== 1 ? 's' : ''}
                                </p>
                              </div>
                              {version.parts.length > 0 ? (
                                <div className="space-y-3">
                                  {version.parts.map((part: any, partIndex: number) => (
                                    <div key={part.id || partIndex} className="border rounded-lg p-3 bg-white">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                          <div
                                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                                            style={{ backgroundColor: part.color || '#3b82f6' }}
                                          />
                                          <div>
                                            <h5 className="font-medium text-sm">
                                              {part.name || `Part ${partIndex + 1}`}
                                            </h5>
                                            {part.annotation_data && (
                                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <MapPin className="h-3 w-3" />
                                                Position: {Math.round(part.annotation_data.x)}%, {Math.round(part.annotation_data.y)}%
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                                        {part.finish && (
                                          <div>
                                            <span className="font-medium text-gray-600">Finish:</span>
                                            <p className="text-gray-900">{part.finish}</p>
                                          </div>
                                        )}
                                        
                                        {part.texture && (
                                          <div>
                                            <span className="font-medium text-gray-600">Texture:</span>
                                            <p className="text-gray-900">{part.texture}</p>
                                          </div>
                                        )}
                                        
                                        {part.color && (
                                          <div>
                                            <span className="font-medium text-gray-600">Color:</span>
                                            <p className="text-gray-900 font-mono">{part.color}</p>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {part.notes && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                          <span className="font-medium text-gray-600 text-xs">Notes:</span>
                                          <p className="text-gray-900 text-xs mt-1">{part.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 text-center py-2">
                                  No parts in this version.
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
                
                // Legacy format: show parts directly
                if (item.parts && item.parts.length > 0) {
                  return (
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Parts ({item.parts.length})
                  </h3>
                  <div className="space-y-3">
                    {item.parts.map((part, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {/* Color indicator */}
                            <div
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: part.color || '#3b82f6' }}
                            />
                            <div>
                              <h4 className="font-medium">
                                {part.name || `Part ${index + 1}`}
                              </h4>
                              {part.annotation_data && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3" />
                                  Position: {Math.round(part.annotation_data.x)}%, {Math.round(part.annotation_data.y)}%
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          {part.finish && (
                            <div>
                              <span className="font-medium text-gray-600">Finish:</span>
                              <p className="text-gray-900">{part.finish}</p>
                            </div>
                          )}
                          
                          {part.texture && (
                            <div>
                              <span className="font-medium text-gray-600">Texture:</span>
                              <p className="text-gray-900">{part.texture}</p>
                            </div>
                          )}
                          
                          {part.color && (
                            <div>
                              <span className="font-medium text-gray-600">Color:</span>
                              <p className="text-gray-900 font-mono">{part.color}</p>
                            </div>
                          )}
                        </div>
                        
                        {part.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="font-medium text-gray-600 text-sm">Notes:</span>
                            <p className="text-gray-900 text-sm mt-1">{part.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                  )
                }
                
                return null
              })()}

              {/* Item Notes */}
              {item.notes && (
                <div>
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Item Notes
                  </h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-gray-900">{item.notes}</p>
                  </div>
                </div>
              )}

              {/* No parts message */}
              {(!item.parts || item.parts.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No parts added to this item</p>
                  <p className="text-xs text-gray-400">Add parts in the editor to see details here</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
