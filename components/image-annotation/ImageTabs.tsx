'use client'

import React from 'react'
import { ManagedImage } from './useImageManager'
import { Button } from '@/components/ui/button'
import { X, Image as ImageIcon } from 'lucide-react'

interface ImageTabsProps {
  images: ManagedImage[]
  activeImageId: string | null
  onImageSelect: (imageId: string) => void
  onImageRemove: (imageId: string) => void
  className?: string
}

export function ImageTabs({
  images,
  activeImageId,
  onImageSelect,
  onImageRemove,
  className = '',
}: ImageTabsProps) {
  if (images.length === 0) {
    return (
      <div className={`text-center text-gray-500 py-4 ${className}`}>
        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No images uploaded yet</p>
        <p className="text-xs">Upload images to start annotating</p>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-2">
        {images.map((image) => (
          <div
            key={image.id}
            className={`
              relative group cursor-pointer transition-all duration-200
              ${
                activeImageId === image.id
                  ? 'ring-2 ring-primary-500 ring-offset-2'
                  : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
              }
            `}
          >
            {/* Image Tab */}
            <button
              onClick={() => onImageSelect(image.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200
                ${
                  activeImageId === image.id
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {/* Thumbnail */}
              <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                <img
                  src={image.src}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Name */}
              <span className="text-sm font-medium truncate max-w-24">
                {image.name}
              </span>

              {/* Annotation Count */}
              {image.annotations.length > 0 && (
                <span
                  className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${
                    activeImageId === image.id
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }
                `}
                >
                  {image.annotations.length}
                </span>
              )}
            </button>

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onImageRemove(image.id)
              }}
              className={`
                absolute -top-2 -right-2 w-5 h-5 rounded-full 
                bg-red-500 text-white opacity-0 group-hover:opacity-100
                transition-all duration-200 hover:bg-red-600
                flex items-center justify-center text-xs
              `}
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Image Info */}
      {activeImageId && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Active: {images.find((img) => img.id === activeImageId)?.name}
              </span>
              <span className="text-xs text-gray-500">
                {images.find((img) => img.id === activeImageId)?.annotations
                  .length || 0}{' '}
                annotations
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
