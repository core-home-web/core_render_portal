'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supaClient'
import { useAuth } from '@/lib/auth-context'

interface BulkFileUploadProps {
  onImagesUploaded: (urls: string[]) => void
  maxFiles?: number
  maxSize?: number // in MB
}

export function BulkFileUpload({
  onImagesUploaded,
  maxFiles = 10,
  maxSize = 20,
}: BulkFileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleFilesSelected = async (files: FileList) => {
    const fileArray = Array.from(files)
    
    // Validate number of files
    if (fileArray.length > maxFiles) {
      setErrors([`Maximum ${maxFiles} files allowed`])
      return
    }

    // Validate file types and sizes
    const validFiles: File[] = []
    const newErrors: string[] = []

    fileArray.forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        newErrors.push(`File ${index + 1}: Please select an image file`)
        return
      }

      if (file.size > maxSize * 1024 * 1024) {
        newErrors.push(`File ${index + 1}: File size must be less than ${maxSize}MB`)
        return
      }

      validFiles.push(file)
    })

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors([])
    setUploading(true)
    setUploadProgress(new Array(validFiles.length).fill(0))

    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        try {
          // Upload via API endpoint (bypasses RLS)
          const formData = new FormData()
          formData.append('file', file)
          formData.append('folder', 'bulk-uploads')

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Upload failed')
          }

          const data = await response.json()

          // Update progress
          setUploadProgress(prev => {
            const newProgress = [...prev]
            newProgress[index] = 100
            return newProgress
          })

          return data.url
        } catch (error) {
          console.error(`Upload error for file ${index + 1}:`, error)
          throw new Error(`Failed to upload ${file.name}`)
        }
      })

      const urls = await Promise.all(uploadPromises)
      onImagesUploaded(urls)
    } catch (error) {
      console.error('Bulk upload error:', error)
      setErrors(['Upload failed. Please try again.'])
    } finally {
      setUploading(false)
      setUploadProgress([])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFilesSelected(files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFilesSelected(files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const isUploading = uploading && uploadProgress.length > 0
  const totalProgress = uploadProgress.length > 0 
    ? uploadProgress.reduce((sum, progress) => sum + progress, 0) / uploadProgress.length 
    : 0

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${uploading 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <div className="text-blue-700 font-medium">
              Uploading {uploadProgress.length} images...
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">
              {Math.round(totalProgress)}% complete
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-600 text-lg">📁</div>
            <div className="text-gray-700 font-medium">
              Drop images here or click to browse
            </div>
            <div className="text-sm text-gray-500">
              Up to {maxFiles} images, {maxSize}MB each
            </div>
          </div>
        )}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-red-700 text-sm font-medium mb-2">Upload Errors:</div>
          <ul className="text-red-600 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      {!uploading && (
        <Button 
          onClick={openFileDialog}
          variant="outline"
          className="w-full"
        >
          Select Images
        </Button>
      )}
    </div>
  )
}
