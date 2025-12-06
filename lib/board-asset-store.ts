import { TLAssetStore, TLAsset } from 'tldraw'
import { supabase } from './supaClient'

const BUCKET_NAME = 'board-assets'

/**
 * Generate a unique filename for an asset
 */
function generateAssetFilename(file: File): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = file.name.split('.').pop() || 'bin'
  const sanitizedName = file.name
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9-_]/g, '-') // Sanitize
    .substring(0, 50) // Limit length
  return `${sanitizedName}-${timestamp}-${randomString}.${extension}`
}

/**
 * Get the public URL for an asset in the Supabase storage bucket
 */
function getPublicAssetUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)
  return data.publicUrl
}

export interface BoardAssetStoreOptions {
  /** The project ID to organize assets under */
  projectId: string
  /** Optional callback when upload starts */
  onUploadStart?: (file: File) => void
  /** Optional callback when upload completes */
  onUploadComplete?: (asset: TLAsset, url: string) => void
  /** Optional callback when upload fails */
  onUploadError?: (error: Error) => void
}

/**
 * Create a TLAssetStore implementation for Supabase Storage
 * 
 * This stores assets in the board-assets bucket organized by project:
 * board-assets/{projectId}/{filename}
 * 
 * @param options - Configuration options
 * @returns TLAssetStore implementation
 */
export function createBoardAssetStore(options: BoardAssetStoreOptions): TLAssetStore {
  const { projectId, onUploadStart, onUploadComplete, onUploadError } = options

  return {
    /**
     * Upload an asset to Supabase Storage
     */
    async upload(asset: TLAsset, file: File): Promise<{ src: string }> {
      if (onUploadStart) {
        onUploadStart(file)
      }

      try {
        // Generate the storage path
        const filename = generateAssetFilename(file)
        const storagePath = `${projectId}/${filename}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (error) {
          throw new Error(`Upload failed: ${error.message}`)
        }

        // Get the public URL
        const publicUrl = getPublicAssetUrl(data.path)

        if (onUploadComplete) {
          onUploadComplete(asset, publicUrl)
        }

        return { src: publicUrl }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown upload error')
        if (onUploadError) {
          onUploadError(error)
        }
        throw error
      }
    },

    /**
     * Resolve an asset URL
     * For Supabase, assets are stored with their full public URL,
     * so we can return the src directly
     */
    resolve(asset: TLAsset): string | null {
      // If the asset has a src, return it directly
      if ('src' in asset.props && typeof asset.props.src === 'string') {
        return asset.props.src
      }
      return null
    },
  }
}

/**
 * Delete an asset from Supabase Storage
 * 
 * @param projectId - The project ID
 * @param assetUrl - The full URL of the asset to delete
 */
export async function deleteAsset(projectId: string, assetUrl: string): Promise<boolean> {
  try {
    // Extract the path from the URL
    const url = new URL(assetUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex((p) => p === BUCKET_NAME)
    
    if (bucketIndex === -1) {
      console.warn('Asset URL does not appear to be from board-assets bucket')
      return false
    }

    const storagePath = pathParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath])

    if (error) {
      console.error('Error deleting asset:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error deleting asset:', err)
    return false
  }
}

/**
 * List all assets for a project
 * 
 * @param projectId - The project ID
 */
export async function listProjectAssets(projectId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(projectId, {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error('Error listing assets:', error)
      return []
    }

    return data.map((file) => getPublicAssetUrl(`${projectId}/${file.name}`))
  } catch (err) {
    console.error('Error listing assets:', err)
    return []
  }
}

/**
 * Get total storage used by a project's assets
 * 
 * @param projectId - The project ID
 */
export async function getProjectStorageUsage(projectId: string): Promise<number> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(projectId, {
        limit: 1000,
      })

    if (error) {
      console.error('Error getting storage usage:', error)
      return 0
    }

    return data.reduce((total, file) => total + (file.metadata?.size || 0), 0)
  } catch (err) {
    console.error('Error getting storage usage:', err)
    return 0
  }
}
