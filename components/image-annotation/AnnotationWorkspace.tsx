'use client'

import React, { useCallback } from 'react'
import { ImageCanvas } from './ImageCanvas'
import { FileUpload } from './FileUpload'
import { ImageTabs } from './ImageTabs'
import { useImageManager } from './useImageManager'
import { useFileUpload } from './useFileUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, MapPin, Group, Trash2, RotateCcw } from 'lucide-react'

interface AnnotationWorkspaceProps {
  className?: string
}

export function AnnotationWorkspace({ className = '' }: AnnotationWorkspaceProps) {
  const {
    state: imageState,
    addImages,
    removeImage,
    setActiveImage,
    getActiveImage,
    togglePlacementMode,
    addAnnotationPoint,
    removeAnnotationPoint,
    selectAnnotationPoint,
    clearAnnotations
  } = useImageManager()

  const {
    uploads,
    addFiles,
    removeFile,
    clearFiles
  } = useFileUpload()

  // Handle file uploads and add them to image manager
  const handleFilesAdded = useCallback(async (files: FileList | File[]) => {
    const newUploads = await addFiles(files)
    if (newUploads.length > 0) {
      addImages(newUploads)
    }
  }, [addFiles, addImages])

  // Handle canvas click for annotation points
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageState.placementMode) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    addAnnotationPoint(x, y)
  }, [imageState.placementMode, addAnnotationPoint])

  // Get current active image for canvas
  const activeImage = getActiveImage()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Image Annotation Workspace</CardTitle>
              <CardDescription>
                Upload images, place annotation points, and configure part specifications
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={togglePlacementMode}
                variant={imageState.placementMode ? 'default' : 'outline'}
                size="sm"
                className="flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                {imageState.placementMode ? 'Placement Mode ON' : 'Placement Mode'}
              </Button>
              {activeImage && activeImage.annotations.length > 0 && (
                <Button
                  onClick={() => clearAnnotations()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column - Canvas */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Annotation Canvas</CardTitle>
                {imageState.placementMode && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <MapPin className="w-4 h-4" />
                    Click to place annotation points
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="relative"
                onClick={handleCanvasClick}
              >
                <ImageCanvas 
                  image={activeImage ? {
                    id: activeImage.id,
                    src: activeImage.src,
                    width: activeImage.width,
                    height: activeImage.height,
                    name: activeImage.name,
                    uploadedAt: activeImage.uploadedAt
                  } : undefined}
                  className="w-full h-[600px]"
                />
                
                {/* Annotation Points Overlay */}
                {activeImage && activeImage.annotations.map((point) => (
                  <div
                    key={point.id}
                    className={`
                      absolute w-6 h-6 rounded-full border-2 cursor-pointer
                      transition-all duration-200 hover:scale-110
                      ${imageState.selectedPointId === point.id
                        ? 'bg-blue-500 border-white shadow-lg'
                        : 'bg-red-500 border-white shadow-md'
                      }
                    `}
                    style={{
                      left: point.x - 12,
                      top: point.y - 12
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      selectAnnotationPoint(point.id)
                    }}
                    title={`Point ${point.id.slice(0, 8)}`}
                  >
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                      {activeImage.annotations.indexOf(point) + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Controls & Info */}
        <div className="space-y-6">
          
          {/* Image Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Image Tabs</CardTitle>
              <CardDescription>
                Switch between uploaded images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageTabs
                images={imageState.images}
                activeImageId={imageState.activeImageId}
                onImageSelect={setActiveImage}
                onImageRemove={removeImage}
              />
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Images</CardTitle>
              <CardDescription>
                Drag & drop or click to browse (Max 50MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFilesAdded={handleFilesAdded}
                config={{
                  maxFileSize: 50 * 1024 * 1024,
                  maxFiles: 10,
                  autoUpload: false
                }}
              />
            </CardContent>
          </Card>

          {/* Annotation Info */}
          {activeImage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Annotations</CardTitle>
                <CardDescription>
                  Current image annotation details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Points:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {activeImage.annotations.length}
                    </span>
                  </div>
                  
                  {activeImage.annotations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Annotation Points:</p>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {activeImage.annotations.map((point, index) => (
                          <div
                            key={point.id}
                            className={`
                              flex items-center justify-between p-2 rounded text-sm
                              ${imageState.selectedPointId === point.id
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50 border border-gray-200'
                              }
                            `}
                          >
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              Point {index + 1}
                            </span>
                            <Button
                              onClick={() => removeAnnotationPoint(point.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 p-1 h-6 w-6"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
