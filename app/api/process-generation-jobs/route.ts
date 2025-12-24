import { NextRequest, NextResponse } from 'next/server'
import OpenAI, { toFile } from 'openai'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { config } from '@/lib/config'
import { db } from '@/db'
import { generationJobs, users } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { deductCredits } from '@/lib/credits'

function getOpenAIClient() {
  const apiKey = config.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }
  return new OpenAI({ apiKey })
}

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: config.R2_ENDPOINT,
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
    },
  })
}

async function uploadToR2(buffer: Buffer, filename: string): Promise<string> {
  const r2Client = getR2Client()
  const key = `generated/${filename}`
  
  await r2Client.send(
    new PutObjectCommand({
      Bucket: config.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    })
  )
  
  return `${config.R2_PUBLIC_URL}/${key}`
}

// Process pending generation jobs
export async function POST(request: NextRequest) {
  try {
    // Simple auth check - could be a cron job secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get one pending job
    const pendingJobs = await db.query.generationJobs.findMany({
      where: eq(generationJobs.status, 'pending'),
      limit: 1,
      orderBy: (jobs, { asc }) => [asc(jobs.createdAt)],
    })

    if (pendingJobs.length === 0) {
      return NextResponse.json({ message: 'No pending jobs', processed: 0 })
    }

    const job = pendingJobs[0]
    console.log('🔄 Processing generation job:', job.id)

    // Update status to processing
    await db.update(generationJobs)
      .set({ status: 'processing', updatedAt: new Date() })
      .where(eq(generationJobs.id, job.id))

    try {
      // Deduct credits if not already deducted
      if (!job.creditsDeducted) {
        const creditResult = await deductCredits(
          job.userId,
          1,
          'design_generation',
          'AI nail design generation'
        )

        if (!creditResult.success) {
          throw new Error(creditResult.error || 'Failed to deduct credits')
        }

        await db.update(generationJobs)
          .set({ creditsDeducted: true })
          .where(eq(generationJobs.id, job.id))
      }

      const openai = getOpenAIClient()
      
      // Build enhanced prompt (same logic as original route)
      const selectedDesignImages = job.selectedDesignImages as string[] || []
      const drawingImageUrl = job.drawingImageUrl
      const influenceWeights = job.influenceWeights as any || {}
      
      const nailLengthMatch = job.prompt.match(/Nail length: (\w+(?:-\w+)?)/i)
      const nailShapeMatch = job.prompt.match(/Nail shape: (\w+)/i)
      const nailLength = nailLengthMatch ? nailLengthMatch[1] : 'medium'
      const nailShape = nailShapeMatch ? nailShapeMatch[1] : 'oval'

      const weights = influenceWeights || {
        designImage: (selectedDesignImages?.length > 0 || drawingImageUrl) ? 100 : 0,
        stylePrompt: 100,
        nailLength: 100,
        nailShape: 100,
        baseColor: 100,
        finish: 100,
        texture: 100
      }

      const baseColorValue = job.prompt.match(/Base color: (#[0-9A-Fa-f]{6})/)?.[1] || '#FF6B9D'
      const finishValue = job.prompt.match(/Finish: (\w+)/)?.[1] || 'glossy'
      const textureValue = job.prompt.match(/Texture: (\w+)/)?.[1] || 'smooth'
      
      let designParamsSection = 'DESIGN PARAMETERS:\n'
      designParamsSection += `- Nail Length: ${nailLength} (Weight: ${weights.nailLength}%)\n`
      designParamsSection += `- Nail Shape: ${nailShape} (Weight: ${weights.nailShape}%)\n`
      
      if (weights.baseColor > 0) {
        designParamsSection += `- Base Color: ${baseColorValue} (Weight: ${weights.baseColor}%)\n`
      }
      
      if (weights.finish > 0) {
        designParamsSection += `- Finish: ${finishValue} (Weight: ${weights.finish}%)\n`
      }
      
      if (weights.texture > 0) {
        designParamsSection += `- Texture: ${textureValue} (Weight: ${weights.texture}%)\n`
      }
      
      let imageInputsSection = ''
      let imageCount = 1
      
      if (drawingImageUrl) {
        imageCount++
        imageInputsSection += `- Image 1: The hand photo to edit (preserve everything except nails)\n`
        imageInputsSection += `- Image 2: User's drawing/outline showing EXACTLY where and how to apply the design (CRITICAL GUIDE)\n`
      } else {
        imageInputsSection += `- Image 1: The hand photo to edit (preserve everything except nails)\n`
      }
      
      if (selectedDesignImages && selectedDesignImages.length > 0) {
        selectedDesignImages.forEach((_: string, idx: number) => {
          imageInputsSection += `- Image ${imageCount + idx + 1}: Reference design ${idx + 1} to replicate onto the nails\n`
        })
      }
      
      const enhancedPrompt = `CRITICAL INSTRUCTIONS - READ CAREFULLY:

You are editing a photo of a hand to apply nail art designs. Your ONLY task is to modify the fingernails while preserving everything else EXACTLY as it appears.

${imageInputsSection ? `IMAGE INPUTS:
${imageInputsSection}
` : ''}STRICT RULES:
1. Use the EXACT hand shown in the image - same number of fingers, same pose, same angle
2. MAINTAIN THE EXACT ORIENTATION AND ROTATION of the original hand image - DO NOT rotate the image by any degree
3. The output image MUST have the same orientation as the input image (if hand is horizontal, keep it horizontal; if vertical, keep it vertical)
4. DO NOT add, remove, or duplicate any fingers
5. DO NOT change the hand position, pose, or angle
6. DO NOT alter skin tone, lighting, background, or any other element
7. DO NOT add extra hands, arms, bodies, or props
8. ONLY modify the fingernail surfaces

${drawingImageUrl ? `
DRAWING/OUTLINE GUIDE (HIGHEST PRIORITY):
- The user has drawn directly on the hand image to show EXACTLY where and how to apply the design
- This drawing is your PRIMARY GUIDE - it shows the exact placement, shape, and outline of the design
- Follow the drawn lines and shapes PRECISELY - they indicate the user's exact intent
- The drawing acts as a stencil or template for where the design should appear
- Respect the boundaries and shapes indicated by the drawing
- If the drawing shows specific patterns or outlines, replicate them exactly in the final design
- The drawing has MAXIMUM INFLUENCE - it overrides other parameters where there's conflict
` : ''}
NAIL DESIGN APPLICATION:
${selectedDesignImages && selectedDesignImages.length > 0 ? `
DESIGN IMAGES PROVIDED (${selectedDesignImages.length} reference${selectedDesignImages.length > 1 ? 's' : ''}, Influence: ${weights.designImage}%):
${weights.designImage === 0 ? '- IGNORE the design images completely.' : 
  weights.designImage === 100 ? `- CRITICAL: You MUST replicate the designs from the reference images with MAXIMUM ACCURACY
- Copy EVERY detail from the reference designs: exact colors, patterns, shapes, lines, and decorative elements
- The reference designs show the EXACT nail art that must appear on the fingernails
- If multiple reference images are provided, blend their elements harmoniously or apply different designs to different nails
- DO NOT interpret, simplify, or modify the designs - COPY THEM PRECISELY
- Match color values EXACTLY as they appear in the references
- Replicate all patterns, gradients, textures, and details with PERFECT FIDELITY
- If the references show specific nail art elements (flowers, lines, dots, etc.), reproduce them IDENTICALLY
- The design should look like a professional nail technician perfectly recreated the reference designs
- Adapt the designs to fit each nail's shape while maintaining ALL design details
${drawingImageUrl ? '- COMBINE the reference designs WITH the user\'s drawing guide - use the drawing for placement and the references for style/colors' : ''}
- DO NOT add any base color, background color, or additional elements not in the references
- USE ONLY what you see in the reference design images - nothing more, nothing less
- This is a DIRECT COPY operation, not an interpretation or inspiration` : 
  `- Use the design images as ${weights.designImage}% inspiration, blending with other parameters`}
` : '- No design images provided'}

${designParamsSection}
QUALITY REQUIREMENTS:
- Professional salon-quality nail art
- Realistic nail polish appearance with proper reflections
- Design follows natural nail curvature
- Clean, crisp edges at nail boundaries
- Consistent application across all visible nails
- Natural lighting and shadows preserved
- CRITICAL: Output image orientation MUST match input image orientation exactly (no rotation)
${drawingImageUrl ? `- FOLLOW THE DRAWING GUIDE: The user's drawing shows exactly where and how to apply the design` : ''}
${weights.designImage === 100 ? `- ACCURACY IS PARAMOUNT: The result must be a faithful reproduction of the reference design(s)
- Every color, pattern, and detail from the reference(s) must be present in the output` : ''}

OUTPUT: Return ONE image with the same hand, same number of fingers, same orientation and rotation, with nail art applied ONLY to the fingernail surfaces.${drawingImageUrl ? ' Follow the user\'s drawing as your primary guide for placement and shape.' : ''}${weights.designImage === 100 ? ' The nail design must be an EXACT REPLICA of the reference design(s) provided.' : ''}`

      // Fetch original hand image
      const originalImageResponse = await fetch(job.originalImage, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ivory/1.0)' },
      })
      
      if (!originalImageResponse.ok) {
        throw new Error(`Failed to fetch original image: ${originalImageResponse.status}`)
      }
      
      const imageBlob = await originalImageResponse.blob()
      const imageFile = await toFile(imageBlob, 'hand.png', { type: imageBlob.type })
      
      const images: any[] = [imageFile]
      
      // Add drawing image if provided
      if (drawingImageUrl) {
        const drawingResponse = await fetch(drawingImageUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ivory/1.0)' },
        })
        
        if (drawingResponse.ok) {
          const drawingBlob = await drawingResponse.blob()
          const drawingFile = await toFile(drawingBlob, 'drawing.png', { type: drawingBlob.type })
          images.push(drawingFile)
        }
      }
      
      // Add reference design images
      if (selectedDesignImages && selectedDesignImages.length > 0) {
        for (let i = 0; i < selectedDesignImages.length; i++) {
          const designImageUrl = selectedDesignImages[i]
          
          try {
            const designImageResponse = await fetch(designImageUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ivory/1.0)' },
            })
            
            if (designImageResponse.ok) {
              const designBlob = await designImageResponse.blob()
              const designFile = await toFile(designBlob, `design-${i + 1}.png`, { type: designBlob.type })
              images.push(designFile)
            }
          } catch (error) {
            console.warn(`⚠️ Error fetching design image ${i + 1}:`, error)
          }
        }
      }
      
      console.log('🎨 Calling OpenAI images.edit() with gpt-image-1...')
      
      const response = await openai.images.edit({
        model: 'gpt-image-1',
        image: images,
        prompt: enhancedPrompt,
        size: '1024x1024',
        n: 2
      })

      if (!response.data || response.data.length === 0) {
        throw new Error('No images generated by gpt-image-1')
      }

      console.log(`✅ Received ${response.data.length} images`)
      
      // Upload all generated images to R2
      const uploadPromises = response.data.map(async (imageData, index) => {
        const base64Image = imageData.b64_json
        
        if (!base64Image) {
          return null
        }
        
        const imageBuffer = Buffer.from(base64Image, 'base64')
        const filename = `nail-design-${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${index + 1}.png`
        
        const url = await uploadToR2(imageBuffer, filename)
        console.log(`✅ Uploaded image ${index + 1} to R2:`, url)
        
        return url
      })
      
      const imageUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[]
      
      if (imageUrls.length === 0) {
        throw new Error('Failed to upload any images to R2')
      }
      
      // Update job with results
      await db.update(generationJobs)
        .set({ 
          status: 'completed',
          resultImages: imageUrls,
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(generationJobs.id, job.id))

      console.log(`✅ Job ${job.id} completed successfully with ${imageUrls.length} images`)

      return NextResponse.json({ 
        message: 'Job processed successfully',
        jobId: job.id,
        imageCount: imageUrls.length,
        processed: 1
      })

    } catch (error: any) {
      console.error(`❌ Error processing job ${job.id}:`, error)
      
      // Update job with error
      await db.update(generationJobs)
        .set({ 
          status: 'failed',
          errorMessage: error?.message || 'Unknown error',
          updatedAt: new Date()
        })
        .where(eq(generationJobs.id, job.id))

      return NextResponse.json(
        { 
          error: 'Job processing failed',
          jobId: job.id,
          details: error?.message,
          processed: 0
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('❌ Error in job processor:', error)
    return NextResponse.json(
      { error: 'Failed to process jobs', details: error?.message },
      { status: 500 }
    )
  }
}
