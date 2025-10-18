'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useSupabaseFileUpload, FileUploadResult, UploadConfig, DEFAULT_UPLOAD_CONFIG } from '@/hooks/useSupabaseFileUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Download,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react'

interface EnhancedFileUploadProps {
  onFilesUploaded?: (uploads: FileUploadResult[]) => void
  onFileAdded?: (file: FileUploadResult) => void
  onFileRemoved?: (file: FileUploadResult) => void
  config?: Partial<UploadConfig>
  className?: string
  showPreview?: boolean
  showActions?: boolean
}

export function EnhancedFileUpload({
  onFilesUploaded,
  onFileAdded,
  onFileRemoved,
  config = {},
  className = '',
  showPreview = true,
  showActions = true
}: EnhancedFileUploadProps) {
  const mergedConfig = { ...DEFAULT_UPLOAD_CONFIG, ...config }
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const {
    uploads,
    isUploading,
    uploadFiles,
    deleteFile,
    removeUpload,
    clearUploads,
    getSuccessfulUploads,
    getFailedUploads
  } = useSupabaseFileUpload(mergedConfig)

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const results = await uploadFiles(fileArray)
    
    if (onFilesUploaded) {
      onFilesUploaded(results)
    }
    
    results.forEach(result => {
      if (onFileAdded) {
        onFileAdded(result)
      }
    })
  }, [uploadFiles, onFilesUploaded, onFileAdded])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
      // Reset input value
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [handleFileSelect])

  // Trigger file input click
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Handle file removal
  const handleRemoveFile = useCallback(async (upload: FileUploadResult) => {
    try {
      await deleteFile(upload)
      if (onFileRemoved) {
        onFileRemoved(upload)
      }
    } catch (error) {
      console.error('Failed to remove file:', error)
      // Still remove from UI even if deletion fails
      removeUpload(upload.id)
      if (onFileRemoved) {
        onFileRemoved(upload)
      }
    }
  }, [deleteFile, removeUpload, onFileRemoved])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get status icon
  const getStatusIcon = (upload: FileUploadResult) => {
    switch (upload.status) {
      case 'pending':
        return <ImageIcon className="w-4 h-4 text-gray-400" />
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <ImageIcon className="w-4 h-4 text-gray-400" />
    }
  }

  // Get status badge
  const getStatusBadge = (upload: FileUploadResult) => {
    switch (upload.status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'uploading':
        return <Badge variant="default">Uploading</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const successfulUploads = getSuccessfulUploads()
  const failedUploads = getFailedUploads()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Images
          </CardTitle>
          <CardDescription>
            Drag & drop images here or click to browse. Max file size: {mergedConfig.maxFileSize / (1024 * 1024)}MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={mergedConfig.allowedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Drag & Drop Zone */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${
                isDragging
                  ? 'border-primary-400 bg-primary-50 scale-105'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <Upload
              className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`}
            />
            <p
              className={`text-lg font-medium mb-2 ${isDragging ? 'text-primary-700' : 'text-gray-700'}`}
            >
              {isDragging ? 'Drop files here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or{' '}
              <span className="text-primary-600 font-medium cursor-pointer">
                click to browse
              </span>
            </p>
            <p className="text-xs text-gray-400">
              Supported: {mergedConfig.allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
            </p>
            {isUploading && (
              <div className="mt-4 text-sm text-blue-600">
                Uploading {uploads.filter(u => u.status === 'uploading').length} file(s)...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Summary */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Upload Status ({uploads.length} files)
              </CardTitle>
              {showActions && (
                <div className="flex gap-2">
                  {failedUploads.length > 0 && (
                    <Badge variant="destructive">
                      {failedUploads.length} failed
                    </Badge>
                  )}
                  {successfulUploads.length > 0 && (
                    <Badge variant="default" className="bg-green-500">
                      {successfulUploads.length} successful
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={clearUploads}>
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  {/* Preview Thumbnail */}
                  {showPreview && (
                    <div className="flex-shrink-0">
                      {upload.preview ? (
                        <img
                          src={upload.preview}
                          alt={upload.name}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(upload)}
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {upload.name}
                      </p>
                      {getStatusBadge(upload)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatFileSize(upload.size)}</span>
                      <span>{upload.type.split('/')[1].toUpperCase()}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    {upload.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={upload.progress} className="h-2" />
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {upload.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {upload.error}
                      </p>
                    )}
                    
                    {/* Success URL */}
                    {upload.status === 'success' && upload.url && (
                      <p className="text-xs text-green-600 mt-1 font-mono truncate">
                        {upload.url}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {showActions && (
                    <div className="flex items-center gap-1">
                      {upload.status === 'success' && upload.url && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(upload.url, '_blank')}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(upload.url, '_blank')}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(upload)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

