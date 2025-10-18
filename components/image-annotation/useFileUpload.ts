import { useState, useCallback, useRef } from 'react'
import {
  FileUpload,
  UploadValidation,
  UploadConfig,
  UploadResult,
  DEFAULT_UPLOAD_CONFIG,
} from './upload-types'

export function useFileUpload(config: UploadConfig = DEFAULT_UPLOAD_CONFIG) {
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validate file
  const validateFile = useCallback(
    (file: File): UploadValidation => {
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
        errors,
        maxSize: config.maxFileSize,
        allowedTypes: config.allowedTypes,
      }
    },
    [config, uploads.length]
  )

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

  // Add files
  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const newUploads: FileUpload[] = []

      for (const file of fileArray) {
        const validation = validateFile(file)

        if (!validation.isValid) {
          console.warn(
            `File ${file.name} validation failed:`,
            validation.errors
          )
          continue
        }

        const upload: FileUpload = {
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          progress: 0,
        }

        // Generate preview for images
        try {
          upload.preview = await generatePreview(file)
        } catch (error) {
          console.warn(`Failed to generate preview for ${file.name}:`, error)
        }

        newUploads.push(upload)
      }

      setUploads((prev) => [...prev, ...newUploads])

      // Auto-upload if enabled
      if (config.autoUpload) {
        newUploads.forEach((upload) => handleUpload(upload))
      }

      return newUploads
    },
    [validateFile, generatePreview, config.autoUpload]
  )

  // Handle file upload (placeholder for now - will integrate with Supabase later)
  const handleUpload = useCallback(async (upload: FileUpload) => {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === upload.id ? { ...u, status: 'uploading' as const } : u
      )
    )

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploads((prev) =>
        prev.map((u) => {
          if (u.id === upload.id && u.progress < 90) {
            return { ...u, progress: u.progress + 10 }
          }
          return u
        })
      )
    }, 200)

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval)
      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? { ...u, status: 'success' as const, progress: 100 }
            : u
        )
      )
    }, 2000)
  }, [])

  // Remove file
  const removeFile = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id))
  }, [])

  // Clear all files
  const clearFiles = useCallback(() => {
    setUploads([])
  }, [])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        addFiles(files)
      }
    },
    [addFiles]
  )

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        addFiles(files)
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    },
    [addFiles]
  )

  // Trigger file input click
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return {
    uploads,
    isDragging,
    fileInputRef,
    addFiles,
    removeFile,
    clearFiles,
    handleUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    triggerFileInput,
    validateFile,
  }
}
