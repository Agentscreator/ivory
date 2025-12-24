import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db'
import { generationJobs } from '@/db/schema'
import { nanoid } from 'nanoid'

// Create a new generation job (doesn't start generation yet)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      prompt, 
      originalImage, 
      selectedDesignImages, 
      drawingImageUrl, 
      influenceWeights,
      designSettings 
    } = await request.json()

    if (!prompt || !originalImage) {
      return NextResponse.json({ error: 'Prompt and original image are required' }, { status: 400 })
    }

    // Create job record
    const jobId = nanoid()
    await db.insert(generationJobs).values({
      id: jobId,
      userId: session.id,
      status: 'pending',
      prompt,
      originalImage,
      selectedDesignImages: selectedDesignImages || null,
      drawingImageUrl: drawingImageUrl || null,
      influenceWeights: influenceWeights || null,
      designSettings: designSettings || null,
      creditsDeducted: false,
    })

    console.log('✅ Created generation job:', jobId)

    return NextResponse.json({ 
      jobId,
      status: 'pending',
      message: 'Generation job created. Processing will start shortly.'
    })
  } catch (error: any) {
    console.error('❌ Error creating generation job:', error)
    return NextResponse.json(
      { error: 'Failed to create generation job', details: error?.message },
      { status: 500 }
    )
  }
}
