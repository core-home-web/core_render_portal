import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supaAdmin'

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', {
        url: supabaseUrl ? 'SET' : 'MISSING',
        serviceKey: supabaseServiceKey ? 'SET' : 'MISSING'
      })
      return NextResponse.json({ 
        error: 'Server configuration error' 
      }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'
    const bucket = formData.get('bucket') as string || 'project-files'

    console.log('Upload request:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      folder,
      bucket
    })

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `File type ${file.type} is not supported` 
      }, { status: 400 })
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB` 
      }, { status: 400 })
    }

    // Create a unique filename with timestamp
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileName = `${timestamp}-${randomId}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage using admin client (bypasses RLS)
    console.log(`Attempting to upload to bucket: ${bucket}, path: ${filePath}`)
    
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error details:', {
        error: error,
        bucket: bucket,
        filePath: filePath,
        fileType: file.type,
        fileSize: file.size
      })
      return NextResponse.json({ 
        error: error.message,
        details: error,
        bucket: bucket,
        path: filePath
      }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)

    return NextResponse.json({ 
      url: publicUrl,
      path: filePath,
      bucket: bucket,
      size: file.size,
      type: file.type,
      name: file.name
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Handle DELETE requests for file removal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const bucket = searchParams.get('bucket') || 'project-files'

    if (!path) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 })
    }

    // Delete from Supabase Storage
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
