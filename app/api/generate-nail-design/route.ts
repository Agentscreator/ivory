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
    const { prompt, originalImage, selectedDesignImage, influenceWeights } = await request.json()

    console.log('🔍 Received request for nail design generation')
    console.log('💳 Credits deducted. New balance:', creditResult.newBalance)

    if (!prompt || !originalImage) {
      return NextResponse.json({ error: 'Prompt and original image are required' }, { status: 400 })
    }

    // Extract nail length and shape from the prompt
    const nailLengthMatch = prompt.match(/Nail length: (\w+(?:-\w+)?)/i)
    const nailShapeMatch = prompt.match(/Nail shape: (\w+)/i)
    const nailLength = nailLengthMatch ? nailLengthMatch[1] : 'medium'
    const nailShape = nailShapeMatch ? nailShapeMatch[1] : 'oval'

    // Default influence weights if not provided
    const weights = influenceWeights || {
      designImage: selectedDesignImage ? 100 : 0,
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
    
    const enhancedPrompt = `CRITICAL INSTRUCTIONS - READ CAREFULLY:

You are editing a photo of a hand to apply nail art designs. Your ONLY task is to modify the fingernails while preserving everything else EXACTLY as it appears.

${selectedDesignImage ? `IMAGE INPUTS:
- Image 1: The hand photo to edit (preserve everything except nails)
- Image 2: The reference nail design to replicate EXACTLY onto the nails in Image 1

` : ''}STRICT RULES:
1. Use the EXACT hand shown in the image - same number of fingers, same pose, same angle
2. MAINTAIN THE EXACT ORIENTATION AND ROTATION of the original hand image - DO NOT rotate the image by any degree
3. The output image MUST have the same orientation as the input image (if hand is horizontal, keep it horizontal; if vertical, keep it vertical)
4. DO NOT add, remove, or duplicate any fingers
5. DO NOT change the hand position, pose, or angle
6. DO NOT alter skin tone, lighting, background, or any other element
7. DO NOT add extra hands, arms, bodies, or props
8. ONLY modify the fingernail surfaces

NAIL DESIGN APPLICATION:
${selectedDesignImage ? `
DESIGN IMAGE PROVIDED (Influence: ${weights.designImage}%):
${weights.designImage === 0 ? '- IGNORE the design image completely.' : 
  weights.designImage === 100 ? `- CRITICAL: You MUST replicate the design from the reference image with MAXIMUM ACCURACY
- Copy EVERY detail from the reference design: exact colors, patterns, shapes, lines, and decorative elements
- The reference design shows the EXACT nail art that must appear on the fingernails
- DO NOT interpret, simplify, or modify the design - COPY IT PRECISELY
- Match color values EXACTLY as they appear in the reference
- Replicate all patterns, gradients, textures, and details with PERFECT FIDELITY
- If the reference shows specific nail art elements (flowers, lines, dots, etc.), reproduce them IDENTICALLY
- The design should look like a professional nail technician perfectly recreated the reference design
- Adapt the design to fit each nail's shape while maintaining ALL design details
- DO NOT add any base color, background color, or additional elements not in the reference
- USE ONLY what you see in the reference design image - nothing more, nothing less
- This is a DIRECT COPY operation, not an interpretation or inspiration` : 
  `- Use the design image as ${weights.designImage}% inspiration, blending with other parameters`}
` : '- No design image provided'}

${designParamsSection}
QUALITY REQUIREMENTS:
- Professional salon-quality nail art
- Realistic nail polish appearance with proper reflections
- Design follows natural nail curvature
- Clean, crisp edges at nail boundaries
- Consistent application across all visible nails
- Natural lighting and shadows preserved
- CRITICAL: Output image orientation MUST match input image orientation exactly (no rotation)
${weights.designImage === 100 ? `- ACCURACY IS PARAMOUNT: The result must be a faithful reproduction of the reference design
- Every color, pattern, and detail from the reference must be present in the output` : ''}

OUTPUT: Return ONE image with the same hand, same number of fingers, same orientation and rotation, with nail art applied ONLY to the fingernail surfaces.${weights.designImage === 100 ? ' The nail design must be an EXACT REPLICA of the reference design provided.' : ''}`

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
    
    // If reference design image is provided, fetch and add it
    if (selectedDesignImage) {
      console.log('📥 Fetching reference design image:', selectedDesignImage)
      
      const designImageResponse = await fetch(selectedDesignImage, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ivory/1.0)' },
      })
      
      if (designImageResponse.ok) {
        const designBlob = await designImageResponse.blob()
        const designFile = await toFile(designBlob, 'design.png', { type: designBlob.type })
        
        console.log('📥 Reference design converted to file object')
        images.push(designFile)
      } else {
        console.warn('⚠️ Failed to fetch reference design, continuing without it')
      }
    }
    
    console.log('🎨 Calling OpenAI images.edit() with gpt-image-1...')
    console.log('📊 Number of images:', images.length)
    console.log('📝 Prompt preview:', enhancedPrompt.substring(0, 500) + '...')
    
    // Use the correct images.edit() API for gpt-image-1
    // Note: gpt-image-1 always returns base64, no response_format parameter needed
    // Using 1536x1024 for higher quality (supported sizes: 1024x1024, 1024x1536, 1536x1024, auto)
    // Generate 2 images per credit for better value
    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: images,
      prompt: enhancedPrompt,
      size: '1536x1024',
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
