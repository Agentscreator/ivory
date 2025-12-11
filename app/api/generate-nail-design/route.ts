import { NextRequest, NextResponse } from 'next/server'
import OpenAI, { toFile } from 'openai'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { config } from '@/lib/config'

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
    const openai = getOpenAIClient()
    const { prompt, originalImage, selectedDesignImage, influenceWeights } = await request.json()

    console.log('🔍 Received request for nail design generation')

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
    const enhancedPrompt = `CRITICAL INSTRUCTIONS - READ CAREFULLY:

You are editing a photo of a hand to apply nail art designs. Your ONLY task is to modify the fingernails while preserving everything else EXACTLY as it appears.

STRICT RULES:
1. Use the EXACT hand shown in the image - same number of fingers, same pose, same angle
2. DO NOT add, remove, or duplicate any fingers
3. DO NOT change the hand position, pose, or angle
4. DO NOT alter skin tone, lighting, background, or any other element
5. DO NOT add extra hands, arms, bodies, or props
6. ONLY modify the fingernail surfaces

NAIL DESIGN APPLICATION:
${selectedDesignImage ? `
DESIGN IMAGE PROVIDED (Influence: ${weights.designImage}%):
${weights.designImage === 0 ? '- IGNORE the design image completely.' : 
  weights.designImage === 100 ? `- Apply the design from the reference image DIRECTLY ONTO THE FINGERNAILS
- The design should appear AS IF PAINTED ON THE NAIL SURFACE
- Match the colors, patterns, and style from the reference image EXACTLY
- Adapt the design to fit each nail's shape and curvature naturally
- Maintain professional nail art quality with crisp edges and clear details
- The design belongs ON THE NAILS, not on the background or skin` : 
  `- Use the design image as ${weights.designImage}% inspiration, blending with other parameters`}
` : '- No design image provided'}

DESIGN PARAMETERS:
- Nail Length: ${nailLength} (Weight: ${weights.nailLength}%)
- Nail Shape: ${nailShape} (Weight: ${weights.nailShape}%)
- Base Color: ${prompt.match(/Base color: (#[0-9A-Fa-f]{6})/)?.[1] || 'Not specified'} (Weight: ${weights.baseColor}%)
- Finish: ${prompt.match(/Finish: (\w+)/)?.[1] || 'glossy'} (Weight: ${weights.finish}%)
- Texture: ${prompt.match(/Texture: (\w+)/)?.[1] || 'smooth'} (Weight: ${weights.texture}%)

QUALITY REQUIREMENTS:
- Professional salon-quality nail art
- Realistic nail polish appearance with proper reflections
- Design follows natural nail curvature
- Clean, crisp edges at nail boundaries
- Consistent application across all visible nails
- Natural lighting and shadows preserved

OUTPUT: Return ONE image with the same hand, same number of fingers, with nail art applied ONLY to the fingernail surfaces.`

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
    
    // Use the correct images.edit() API for gpt-image-1
    // Note: gpt-image-1 always returns base64, no response_format parameter needed
    // Using 1536x1024 for higher quality (supported sizes: 1024x1024, 1024x1536, 1536x1024, auto)
    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: images,
      prompt: enhancedPrompt,
      size: '1536x1024',
      n: 1
    })

    console.log('✅ OpenAI response received')
    
    const base64Image = response.data?.[0]?.b64_json

    if (!base64Image) {
      console.error('❌ No image in response:', response)
      throw new Error('No image generated by gpt-image-1')
    }

    console.log('✅ Base64 image received, length:', base64Image.length)
    console.log('📤 Uploading to R2...')
    
    // Convert base64 to buffer and upload to R2
    const imageBuffer = Buffer.from(base64Image, 'base64')
    const filename = `nail-design-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`
    
    const permanentUrl = await uploadToR2(imageBuffer, filename)
    
    console.log('✅ Uploaded to R2:', permanentUrl)
    
    return NextResponse.json({ imageUrl: permanentUrl })
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
