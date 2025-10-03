import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supaAdmin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from('project-files')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('project-files').getPublicUrl(filePath)

    return NextResponse.json({ 
      url: publicUrl,
      path: filePath 
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
