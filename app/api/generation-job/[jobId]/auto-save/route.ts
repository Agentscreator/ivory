import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db'
import { generationJobs, looks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { nanoid } from 'nanoid'

// Auto-save completed generation job to user's collection
export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the job
    const job = await db.query.generationJobs.findFirst({
      where: and(
        eq(generationJobs.id, params.jobId),
        eq(generationJobs.userId, session.id)
      ),
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    if (job.status !== 'completed') {
      return NextResponse.json({ error: 'Job not completed yet' }, { status: 400 })
    }

    // Check if already auto-saved
    if (job.autoSaved) {
      return NextResponse.json({ 
        success: true, 
        message: 'Already saved',
        savedCount: 0 
      })
    }

    if (!job.resultImages || (job.resultImages as string[]).length === 0) {
      return NextResponse.json({ error: 'No images to save' }, { status: 400 })
    }

    const resultImages = job.resultImages as string[]
    const designSettings = job.designSettings as any
    const selectedDesignImages = job.selectedDesignImages as string[] || []
    const drawingImageUrl = job.drawingImageUrl
    const influenceWeights = job.influenceWeights as any

    // Create comprehensive metadata for remix/edit functionality
    const designMetadata = {
      designSettings,
      selectedDesignImages,
      drawingImageUrl,
      aiPrompt: job.prompt || null,
      influenceWeights,
    }

    // Save all generated images as separate looks
    const savedLooks = []
    
    for (let i = 0; i < resultImages.length; i++) {
      const imageUrl = resultImages[i]
      
      const lookId = nanoid()
      const shareToken = nanoid(10)
      
      await db.insert(looks).values({
        id: lookId,
        userId: session.id,
        title: `Design ${new Date().toLocaleDateString()}${resultImages.length > 1 ? ` (${i + 1})` : ''}`,
        imageUrl: imageUrl,
        originalImageUrl: job.originalImage,
        aiPrompt: job.prompt || null,
        designMetadata,
        isPublic: false,
        shareToken,
        viewCount: 0,
        likeCount: 0,
        dislikeCount: 0,
      })

      savedLooks.push({
        id: lookId,
        imageUrl,
        shareToken,
      })
    }

    // Mark job as auto-saved
    await db.update(generationJobs)
      .set({ autoSaved: true })
      .where(eq(generationJobs.id, params.jobId))

    console.log(`✅ Auto-saved ${savedLooks.length} designs from job ${job.id}`)

    return NextResponse.json({
      success: true,
      savedCount: savedLooks.length,
      looks: savedLooks,
    })
  } catch (error: any) {
    console.error('❌ Error auto-saving generation:', error)
    return NextResponse.json(
      { error: 'Failed to auto-save generation', details: error?.message },
      { status: 500 }
    )
  }
}
