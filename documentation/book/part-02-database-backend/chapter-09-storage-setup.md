# Chapter 9: Storage Setup

This chapter covers configuring Supabase Storage for file uploads, including bucket creation, access policies, and upload handling.

---

## Supabase Storage Overview

Supabase Storage provides S3-compatible file storage with:

- **Buckets**: Containers for files (like folders)
- **Policies**: Access control for upload/download
- **CDN**: Automatic caching and delivery
- **Transformations**: Image resizing on the fly (paid feature)

---

## Required Buckets

The Core Render Portal uses these storage buckets:

| Bucket | Purpose | Access |
|--------|---------|--------|
| `project-images` | Hero images, reference files | Authenticated users |
| `profile-images` | User profile pictures | Public read |
| `board-assets` | Whiteboard embedded images | Authenticated users |

---

## Creating Buckets

### Via Supabase Dashboard

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Enter bucket name
4. Set public/private
5. Click **Create bucket**

### Via SQL

```sql
-- Create buckets programmatically
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('project-images', 'project-images', false),
  ('profile-images', 'profile-images', true),
  ('board-assets', 'board-assets', false)
ON CONFLICT (id) DO NOTHING;
```

---

## Storage Policies

### Project Images Bucket

```sql
-- Allow authenticated users to upload to project-images
CREATE POLICY "Authenticated users can upload project images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-images'
);

-- Allow authenticated users to view project images
CREATE POLICY "Authenticated users can view project images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-images'
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Users can delete their own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Profile Images Bucket (Public)

```sql
-- Anyone can view profile images
CREATE POLICY "Anyone can view profile images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Authenticated users can upload profile images
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own profile images
CREATE POLICY "Users can update own profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own profile images
CREATE POLICY "Users can delete own profile images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Board Assets Bucket

```sql
-- Project owners and collaborators can upload board assets
CREATE POLICY "Project members can upload board assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'board-assets'
);

-- Project members can view board assets
CREATE POLICY "Project members can view board assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'board-assets');
```

---

## Complete Storage Setup SQL

```sql
-- ============================================================================
-- STORAGE SETUP
-- ============================================================================

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'project-images', 
    'project-images', 
    false,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  ),
  (
    'profile-images', 
    'profile-images', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'board-assets', 
    'board-assets', 
    false,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- PROJECT IMAGES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can upload project images" ON storage.objects;
CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Authenticated users can view project images" ON storage.objects;
CREATE POLICY "Authenticated users can view project images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Authenticated users can update project images" ON storage.objects;
CREATE POLICY "Authenticated users can update project images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Authenticated users can delete project images" ON storage.objects;
CREATE POLICY "Authenticated users can delete project images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-images');

-- ============================================================================
-- PROFILE IMAGES POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;
CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-images');

-- ============================================================================
-- BOARD ASSETS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can manage board assets" ON storage.objects;
CREATE POLICY "Authenticated users can manage board assets"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'board-assets')
WITH CHECK (bucket_id = 'board-assets');
```

---

## Uploading Files from Client

### Basic Upload

```typescript
// File: hooks/useSupabaseFileUpload.ts

import { supabase } from '@/lib/supaClient'

export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<string | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    return null
  }
}
```

### Upload with Progress

```typescript
export async function uploadFileWithProgress(
  file: File,
  bucket: string,
  path: string,
  onProgress: (progress: number) => void
): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${path}/${fileName}`

  // Supabase doesn't provide native progress tracking
  // Use XMLHttpRequest for progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100)
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', async () => {
      if (xhr.status === 200) {
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)
        resolve(publicUrl)
      } else {
        reject(new Error('Upload failed'))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Upload error')))

    // Get upload URL and auth token
    const uploadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`
    
    xhr.open('POST', uploadUrl)
    xhr.setRequestHeader('Authorization', `Bearer ${supabase.auth.session()?.access_token}`)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.send(file)
  })
}
```

### Multiple File Upload

```typescript
export async function uploadMultipleFiles(
  files: File[],
  bucket: string,
  path: string
): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFile(file, bucket, path))
  const results = await Promise.all(uploadPromises)
  return results.filter((url): url is string => url !== null)
}
```

---

## File Upload Component

```typescript
// File: components/ui/file-upload.tsx

'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supaClient'
import { useAuth } from '@/lib/auth-context'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  bucket?: string
  accept?: string
  maxSize?: number // in bytes
}

export function FileUpload({
  value,
  onChange,
  bucket = 'project-images',
  accept = 'image/*',
  maxSize = 50 * 1024 * 1024 // 50MB
}: FileUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize) {
      setError(`File too large. Max size: ${maxSize / 1024 / 1024}MB`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      onChange(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [bucket, maxSize, onChange, user?.id])

  const handleRemove = useCallback(() => {
    onChange('')
  }, [onChange])

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">Click to upload</span>
            </>
          )}
          <input
            type="file"
            accept={accept}
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
```

---

## Deleting Files

```typescript
export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}
```

---

## Getting Public URLs

```typescript
// For public buckets
const { data: { publicUrl } } = supabase.storage
  .from('profile-images')
  .getPublicUrl('path/to/file.jpg')

// For private buckets (signed URL)
const { data: { signedUrl }, error } = await supabase.storage
  .from('project-images')
  .createSignedUrl('path/to/file.jpg', 3600) // 1 hour expiry
```

---

## Next.js Image Configuration

Update `next.config.js` to allow Supabase images:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
```

---

## Chapter Summary

Storage setup includes:

1. **Three buckets**: project-images, profile-images, board-assets
2. **RLS policies** for each bucket controlling access
3. **Client-side upload utilities** for handling file uploads
4. **File upload component** for UI integration
5. **Next.js configuration** for image optimization

Key points:
- Use `project-images` for hero images and reference files
- Use `profile-images` (public) for user avatars
- Use `board-assets` for whiteboard embedded images
- Always validate file size and type before upload

---

*Next: [Chapter 10: Database Migrations](./chapter-10-migrations.md) - Complete setup scripts*
