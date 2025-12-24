import { NextRequest, NextResponse } from 'next/server'
import OpenAI, { toFile } from 'openai'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { config } from '@/lib/config'
import { getSession } from '@/lib/auth'
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

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Deduct 1 credit for design generation
    const creditResult = await deductCredits(
      session.id,
      1,
      'design_generation',
      'AI nail design generation'
    )

    if (!creditResult.success) {
      return NextResponse.json(
        { error: creditResult.error || 'Failed to deduct credits' },
        { status: 400 }
      )
    }

    const openai = getOpenAIClient()
    const { prompt, originalImage, selectedDesignImages, drawingImageUrl, influenceWeights } = await request.json()

    console.log('🔍 Received request for nail design generation')
    console.log('💳 Credits deducted. New balance:', creditResult.newBalance)

    if (!prompt || !originalImage) {
      return NextResponse.json({ error: 'Prompt and original image are required' }, { status: 400 })
    }
    
    // Log what reference images we have
    console.log('📸 Design images count:', selectedDesignImages?.length || 0)
    console.log('✏️ Drawing image:', drawingImageUrl ? 'Yes' : 'No')

    // Extract nail length and shape from the prompt
    const nailLengthMatch = prompt.match(/Nail length: (\w+(?:-\w+)?)/i)
    const nailShapeMatch = prompt.match(/Nail shape: ([\w-]+)/i)
    const nailLength = nailLengthMatch ? nailLengthMatch[1] : 'medium'
    const nailShapeRaw = nailShapeMatch ? nailShapeMatch[1] : 'oval'
    
    // Map nail shape values to more descriptive terms for AI
    const nailShapeDescriptions: Record<string, string> = {
      'oval': 'oval (rounded, classic shape)',
      'square': 'square (straight edges, flat tip)',
      'squoval': 'squoval (square with rounded corners)',
      'rounded': 'rounded (soft, curved edges)',
      'almond': 'almond (tapered with rounded tip)',
      'mountain-peak': 'mountain peak (sharp pointed center)',
      'stiletto': 'stiletto (long, sharp pointed)',
      'ballerina': 'ballerina/coffin (tapered with flat tip)',
      'edge': 'edge (modern angular with sharp corners)',
      'lipstick': 'lipstick shape (diagonal angled tip, asymmetric like a lipstick bullet)',
      'flare': 'flare/duck nails (widened, flared out tip that spreads wider than the base)',
      'arrow-head': 'arrow head (sharp V-shaped pointed tip)'
    }
    
    const nailShape = nailShapeDescriptions[nailShapeRaw] || nailShapeRaw

    // Default influence weights if not provided
    const weights = influenceWeights || {
      designImage: (selectedDesignImages?.length > 0 || drawingImageUrl) ? 100 : 0,
      stylePrompt: 100,
      nailLength: 100,
      nailShape: 100,
      baseColor: 100,
      finish: 100,
      texture: 100
    }

    // Build enhanced prompt for nail design editing
    const baseColorValue = prompt.match(/Base color: (#[0-9A-Fa-f]{6})/)?.[1] || '#FF6B9D'
    const finishValue = prompt.match(/Finish: (\w+)/)?.[1] || 'glossy'
    const textureValue = prompt.match(/Texture: (\w+)/)?.[1] || 'smooth'
    
    // Build design parameters section - only include parameters with non-zero weights
    let designParamsSection = 'DESIGN PARAMETERS:\n'
    designParamsSection += `- Nail Length: ${nailLength} (Weight: ${weights.nailLength}%)\n`
    designParamsSection += `- Nail Shape: ${nailShape} (Weight: ${weights.nailShape}%)\n`
    
    // Only include base color if it has influence
    if (weights.baseColor > 0) {
      designParamsSection += `- Base Color: ${baseColorValue} (Weight: ${weights.baseColor}%)\n`
    }
    
    // Only include finish if it has influence
    if (weights.finish > 0) {
      designParamsSection += `- Finish: ${finishValue} (Weight: ${weights.finish}%)\n`
    }
    
    // Only include texture if it has influence
    if (weights.texture > 0) {
      designParamsSection += `- Texture: ${textureValue} (Weight: ${weights.texture}%)\n`
    }
    
    // Build image inputs description
    let imageInputsSection = ''
    let imageCount = 1 // Start with hand image
    
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

NAIL DIRECTION & ORIENTATION ALIGNMENT (CRITICAL):
- ANALYZE the direction and angle of each fingernail in the original hand image
- Each nail has a specific orientation based on how the finger is positioned (pointing up, down, left, right, or at an angle)
- When applying the design from reference images, ROTATE and ALIGN the design pattern to match EACH individual nail's direction
- If a nail is pointing upward, the design should be oriented upward on that nail
- If a nail is pointing to the side, rotate the design to match that sideways orientation
- If nails are at different angles (e.g., spread fingers), each nail's design should follow its unique direction
- The design pattern should flow naturally with the nail's orientation, not be applied in a fixed direction
- Think of it like applying a sticker - you must rotate the sticker to match the surface direction
- CRITICAL: The same design element should appear correctly oriented on each nail based on that nail's individual angle and direction
- This ensures the design looks natural and professionally applied, not misaligned or sideways

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
- CRITICAL ALIGNMENT: Rotate and orient each design element to match the direction of each individual nail
  * If the reference shows a vertical pattern, apply it vertically RELATIVE TO EACH NAIL'S DIRECTION
  * If a nail points left, rotate the design to point left; if it points up, rotate the design to point up
  * Each nail gets the same design but rotated to match that nail's unique orientation and angle
  * This ensures the design looks professionally applied and naturally aligned with each nail
- Adapt the designs to fit each nail's shape AND orientation while maintaining ALL design details
${drawingImageUrl ? '- COMBINE the reference designs WITH the user\'s drawing guide - use the drawing for placement and the references for style/colors' : ''}
- DO NOT add any base color, background color, or additional elements not in the references
- USE ONLY what you see in the reference design images - nothing more, nothing less
- This is a DIRECT COPY operation with proper orientation alignment, not an interpretation or inspiration` : 
  `- Use the design images as ${weights.designImage}% inspiration, blending with other parameters
- IMPORTANT: Still align design orientation with each nail's direction at ${weights.designImage}% influence`}
` : '- No design images provided'}

${designParamsSection}

NAIL SHAPE CRITICAL INSTRUCTIONS:
- The nail shape "${nailShape}" MUST be clearly visible and accurately formed on each nail
- Shape the entire nail structure to match this specific shape - not just the tip
- For "lipstick shape": Create a diagonal, asymmetric angled tip like a lipstick bullet (one side higher than the other)
- For "flare/duck nails": Make the nail tip noticeably wider and flared out compared to the base, spreading outward
- For "ballerina/coffin": Taper the sides inward then create a flat, straight tip
- For "stiletto": Create long, dramatically pointed nails
- For "almond": Taper to a soft, rounded point
- For "square": Keep edges straight with a flat, perpendicular tip
- For "squoval": Square shape with gently rounded corners
- The nail shape is a CRITICAL parameter - it must be obvious and correct in the final result

QUALITY REQUIREMENTS:
- Professional salon-quality nail art
- Realistic nail polish appearance with proper reflections
- Design follows natural nail curvature AND nail direction/orientation
- Clean, crisp edges at nail boundaries
- Consistent application across all visible nails with proper directional alignment
- Natural lighting and shadows preserved
- CRITICAL: Output image orientation MUST match input image orientation exactly (no rotation)
- CRITICAL: Each nail's design must be rotated to match that specific nail's direction and angle
${drawingImageUrl ? `- FOLLOW THE DRAWING GUIDE: The user's drawing shows exactly where and how to apply the design` : ''}
${weights.designImage === 100 ? `- ACCURACY IS PARAMOUNT: The result must be a faithful reproduction of the reference design(s)
- Every color, pattern, and detail from the reference(s) must be present in the output
- Each design element must be properly oriented to match each nail's individual direction` : ''}

OUTPUT: Return ONE image with the same hand, same number of fingers, same orientation and rotation, with nail art applied ONLY to the fingernail surfaces. Each nail's design must be rotated and aligned to match that nail's specific direction and angle for a natural, professional appearance.${drawingImageUrl ? ' Follow the user\'s drawing as your primary guide for placement and shape.' : ''}${weights.designImage === 100 ? ' The nail design must be an EXACT REPLICA of the reference design(s) provided, with each nail\'s design properly oriented to match that nail\'s direction.' : ''}`

    console.log('🤖 Generating nail design preview with gpt-image-1...')
    console.log('📥 Fetching original hand image:', originalImage)
    
    // Fetch original hand image
    const originalImageResponse = await fetch(originalImage, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ivory/1.0)' },
    })
    
    if (!originalImageResponse.ok) {
      throw new Error(`Failed to fetch original image: ${originalImageResponse.status}`)
    }
    
    const imageBlob = await originalImageResponse.blob()
    const imageFile = await toFile(imageBlob, 'hand.png', { type: imageBlob.type })
    
    console.log('📥 Hand image converted to file object')
    
    // Prepare images array
    const images: any[] = [imageFile]
    
    // If drawing image is provided, add it first (highest priority)
    if (drawingImageUrl) {
      console.log('✏️ Fetching drawing image:', drawingImageUrl)
      
      const drawingResponse = await fetch(drawingImageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ivory/1.0)' },
      })
      
      if (drawingResponse.ok) {
        const drawingBlob = await drawingResponse.blob()
        const drawingFile = await toFile(drawingBlob, 'drawing.png', { type: drawingBlob.type })
        
        console.log('✏️ Drawing image converted to file object')
        images.push(drawingFile)
      } else {
        console.warn('⚠️ Failed to fetch drawing image, continuing without it')
      }
    }
    
    // If reference design images are provided, fetch and add them
    if (selectedDesignImages && selectedDesignImages.length > 0) {
      console.log(`📥 Fetching ${selectedDesignImages.length} reference design image(s)`)
      
      for (let i = 0; i < selectedDesignImages.length; i++) {
        const designImageUrl = selectedDesignImages[i]
        console.log(`📥 Fetching design image ${i + 1}:`, designImageUrl)
        
        try {
          const designImageResponse = await fetch(designImageUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ivory/1.0)' },
          })
          
          if (designImageResponse.ok) {
            const designBlob = await designImageResponse.blob()
            const designFile = await toFile(designBlob, `design-${i + 1}.png`, { type: designBlob.type })
            
            console.log(`📥 Design image ${i + 1} converted to file object`)
            images.push(designFile)
          } else {
            console.warn(`⚠️ Failed to fetch design image ${i + 1}, skipping`)
          }
        } catch (error) {
          console.warn(`⚠️ Error fetching design image ${i + 1}:`, error)
        }
      }
    }
    
    console.log('🎨 Calling OpenAI images.edit() with gpt-image-1...')
    console.log('📊 Number of images:', images.length)
    console.log('📝 Prompt preview:', enhancedPrompt.substring(0, 500) + '...')
    
    // Use the correct images.edit() API for gpt-image-1
    // Note: gpt-image-1 always returns base64, no response_format parameter needed
    // Using 1024x1024 for square format (supported sizes: 1024x1024, 1024x1536, 1536x1024, auto)
    // Generate 2 images per credit
    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: images,
      prompt: enhancedPrompt,
      size: '1024x1024',
      n: 2
    })

    console.log('✅ OpenAI response received')
    
    if (!response.data || response.data.length === 0) {
      console.error('❌ No images in response:', response)
      throw new Error('No images generated by gpt-image-1')
    }

    console.log(`✅ Received ${response.data.length} images`)
    console.log('📤 Uploading to R2...')
    
    // Upload all generated images to R2
    const uploadPromises = response.data.map(async (imageData, index) => {
      const base64Image = imageData.b64_json
      
      if (!base64Image) {
        console.warn(`⚠️ No base64 data for image ${index + 1}`)
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
    
    console.log(`✅ Successfully uploaded ${imageUrls.length} images`)
    
    return NextResponse.json({ 
      imageUrls: imageUrls,
      // Keep backward compatibility with single image
      imageUrl: imageUrls[0],
      creditsRemaining: creditResult.newBalance
    })
  } catch (error: any) {
    console.error('❌ Image generation error:', error)
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
      stack: error?.stack,
    })
    
    let errorMessage = error?.message || 'Failed to generate nail design'
    
    if (error?.status === 401) {
      errorMessage = 'OpenAI API key is invalid or expired'
    } else if (error?.status === 429) {
      errorMessage = 'Rate limited by OpenAI. Please try again later.'
    } else if (error?.status === 400) {
      errorMessage = `Invalid request to OpenAI: ${error.message}`
    } else if (error?.status === 403) {
      errorMessage = 'Organization not verified for gpt-image-1. Please verify at https://platform.openai.com/settings/organization/general'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error?.message,
        status: error?.status,
        code: error?.code,
        type: error?.type,
      },
      { status: 500 }
    )
  }
}
