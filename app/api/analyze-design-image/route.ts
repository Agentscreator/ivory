import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, generateFilename } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    console.log('=== UPLOADING DESIGN IMAGE ===')
    console.log('File name:', file.name)
    console.log('File size:', file.size, 'bytes')
    console.log('File type:', file.type)

    // Upload to R2 storage
    const filename = generateFilename(file.name, 'design')
    const { url } = await uploadFile(file, filename, {
      folder: 'designs',
      contentType: file.type,
    })

    console.log('✅ Upload successful')
    console.log('Image URL:', url)
    console.log('==============================')

    // Return the uploaded image URL - no analysis needed
    // This will be used as selectedDesignImage input to gpt-image-1-mini
    return NextResponse.json({ 
      imageUrl: url,
      success: true
    })
  } catch (error: any) {
    console.error('❌ Image upload error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to upload design image' },
      { status: 500 }
    )
  }
}
