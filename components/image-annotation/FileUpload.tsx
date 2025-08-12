'use client'

import React from 'react'
import { useFileUpload } from './useFileUpload'
import { FileUpload as FileUploadType, DEFAULT_UPLOAD_CONFIG } from './upload-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, X, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react'

interface FileUploadProps {
  onFilesSelected?: (files: FileUploadType[]) => void
  config?: Partial<typeof DEFAULT_UPLOAD_CONFIG>
  className?: string
}

export function FileUpload({ onFilesSelected, config = {}, className = '' }: FileUploadProps) {
  const mergedConfig = { ...DEFAULT_UPLOAD_CONFIG, ...config }
  const {
    uploads,
    isDragging,
    fileInputRef,
    removeFile,
    clearFiles,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    triggerFileInput
  } = useFileUpload(mergedConfig)

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get status icon
  const getStatusIcon = (upload: FileUploadType) => {
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

  // Get status color
  const getStatusColor = (upload: FileUploadType) => {
    switch (upload.status) {
      case 'pending':
        return 'border-gray-200 bg-gray-50'
      case 'uploading':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

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
              ${isDragging 
                ? 'border-primary-400 bg-primary-50 scale-105' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium mb-2 ${isDragging ? 'text-primary-700' : 'text-gray-700'}`}>
              {isDragging ? 'Drop files here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or <span className="text-primary-600 font-medium cursor-pointer">click to browse</span>
            </p>
            <p className="text-xs text-gray-400">
              Supported: {mergedConfig.allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploads.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Uploaded Files ({uploads.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={clearFiles}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(upload)}`}
                >
                  {/* Preview Thumbnail */}
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

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(upload)}
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {upload.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatFileSize(upload.size)}</span>
                      <span>{upload.type.split('/')[1].toUpperCase()}</span>
                      {upload.status === 'uploading' && (
                        <span className="text-blue-600">{upload.progress}%</span>
                      )}
                    </div>
                    {upload.error && (
                      <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {upload.status === 'uploading' && (
                    <div className="flex-1 max-w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(upload.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
