// File Upload Types for Image Annotation System
export interface FileUpload {
  id: string
  file: File
  name: string
  size: number
  type: string
  preview?: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export interface UploadValidation {
  isValid: boolean
  errors: string[]
  maxSize: number // in bytes
  allowedTypes: string[]
}

export interface UploadConfig {
  maxFileSize: number // 50MB in bytes
  allowedTypes: string[]
  maxFiles: number
  autoUpload: boolean
}

export interface UploadResult {
  success: boolean
  fileId?: string
  url?: string
  error?: string
}

// Default configuration
export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  maxFiles: 10,
  autoUpload: true
}
