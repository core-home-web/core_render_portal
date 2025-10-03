'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supaClient'
import { Upload, X, Image as ImageIcon, Copy, Check } from 'lucide-react'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  onError?: (error: string) => void
  accept?: string
  maxSize?: number // in MB
  label?: string
  placeholder?: string
}

export function FileUpload({
  value,
  onChange,
  onError,
  accept = 'image/*',
  maxSize = 20,
  label = 'Upload File',
  placeholder = 'Click to upload or drag and drop',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onError?.(`File size must be less than ${maxSize}MB`)
      return
    }

    setUploading(true)
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `uploads/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(filePath, file)

      if (error) {
        throw error
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('project-files').getPublicUrl(filePath)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      onChange(publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      onError?.(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {preview ? (
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md border"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* URL Display */}
          {value && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Uploaded URL:</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(value)}
                  className="h-6 px-2"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                {value}
              </div>
              <p className="text-xs text-muted-foreground">
                ✅ Image uploaded successfully! You can copy the URL above.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileSelect(file)
              }
            }}
            className="hidden"
          />

          <div className="space-y-2">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">{placeholder}</p>
              <p className="text-xs text-gray-500 mt-1">
                Max size: {maxSize}MB
              </p>
            </div>
            {uploading && (
              <div className="text-sm text-blue-600">Uploading...</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
