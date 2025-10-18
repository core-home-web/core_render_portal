import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supaClient'

export interface FileUploadResult {
  id: string
  name: string
  size: number
  type: string
  url: string
  path: string
  bucket: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  preview?: string
}

export interface UploadConfig {
  maxFileSize: number // in bytes
  allowedTypes: string[]
  maxFiles: number
  bucket: string
  folder?: string
  autoUpload?: boolean
}

export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  maxFiles: 10,
  bucket: 'project-files',
  folder: 'uploads',
  autoUpload: true
}

export function useSupabaseFileUpload(config: UploadConfig = DEFAULT_UPLOAD_CONFIG) {
  const [uploads, setUploads] = useState<FileUploadResult[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Validate file
  const validateFile = useCallback((file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Check file size
    if (file.size > config.maxFileSize) {
      const maxSizeMB = config.maxFileSize / (1024 * 1024)
      errors.push(`File size must be less than ${maxSizeMB}MB`)
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported`)
    }

    // Check if we've reached max files
    if (uploads.length >= config.maxFiles) {
      errors.push(`Maximum ${config.maxFiles} files allowed`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [config, uploads.length])

  // Generate preview for image files
  const generatePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'))
        return
      }

      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }, [])

  // Upload file to Supabase Storage
  const uploadFile = useCallback(async (file: File, customPath?: string): Promise<FileUploadResult> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = customPath || `${config.folder || 'uploads'}/${fileName}`

    // Create initial upload record
    const uploadResult: FileUploadResult = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: '',
      path: filePath,
      bucket: config.bucket,
      status: 'uploading',
      progress: 0
    }

    // Generate preview
    try {
      uploadResult.preview = await generatePreview(file)
    } catch (error) {
      console.warn(`Failed to generate preview for ${file.name}:`, error)
    }

    // Add to uploads list
    setUploads(prev => [...prev, uploadResult])

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(config.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(error.message)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(config.bucket)
        .getPublicUrl(filePath)

      // Update upload result
      const successResult: FileUploadResult = {
        ...uploadResult,
        status: 'success',
        progress: 100,
        url: urlData.publicUrl
      }

      setUploads(prev => 
        prev.map(upload => 
          upload.id === uploadResult.id ? successResult : upload
        )
      )

      return successResult

    } catch (error) {
      const errorResult: FileUploadResult = {
        ...uploadResult,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      }

      setUploads(prev => 
        prev.map(upload => 
          upload.id === uploadResult.id ? errorResult : upload
        )
      )

      throw error
    }
  }, [config, generatePreview])

  // Upload multiple files
  const uploadFiles = useCallback(async (files: File[]): Promise<FileUploadResult[]> => {
    setIsUploading(true)
    const results: FileUploadResult[] = []

    try {
      for (const file of files) {
        const validation = validateFile(file)
        
        if (!validation.isValid) {
          console.warn(`File ${file.name} validation failed:`, validation.errors)
          continue
        }

        const result = await uploadFile(file)
        results.push(result)
      }

      return results
    } finally {
      setIsUploading(false)
    }
  }, [validateFile, uploadFile])

  // Delete file from storage
  const deleteFile = useCallback(async (upload: FileUploadResult): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from(config.bucket)
        .remove([upload.path])

      if (error) {
        throw new Error(error.message)
      }

      // Remove from uploads list
      setUploads(prev => prev.filter(u => u.id !== upload.id))
    } catch (error) {
      console.error('Failed to delete file:', error)
      throw error
    }
  }, [config.bucket])

  // Remove upload from list (without deleting from storage)
  const removeUpload = useCallback((id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id))
  }, [])

  // Clear all uploads
  const clearUploads = useCallback(() => {
    setUploads([])
  }, [])

  // Get upload by ID
  const getUpload = useCallback((id: string) => {
    return uploads.find(upload => upload.id === id)
  }, [uploads])

  // Get successful uploads
  const getSuccessfulUploads = useCallback(() => {
    return uploads.filter(upload => upload.status === 'success')
  }, [uploads])

  // Get failed uploads
  const getFailedUploads = useCallback(() => {
    return uploads.filter(upload => upload.status === 'error')
  }, [uploads])

  // Retry failed upload
  const retryUpload = useCallback(async (upload: FileUploadResult): Promise<FileUploadResult> => {
    // This would require storing the original file, which we don't do currently
    // For now, just return the upload as-is
    console.warn('Retry functionality requires storing original files')
    return upload
  }, [])

  return {
    uploads,
    isUploading,
    uploadFile,
    uploadFiles,
    deleteFile,
    removeUpload,
    clearUploads,
    getUpload,
    getSuccessfulUploads,
    getFailedUploads,
    retryUpload,
    validateFile
  }
}

