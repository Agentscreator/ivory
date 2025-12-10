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
    const { prompt, originalImage, selectedDesignImage } = await request.json()

    console.log('🔍 Received request for nail design generation')

    if (!prompt || !originalImage) {
      return NextResponse.json({ error: 'Prompt and original image are required' }, { status: 400 })
    }

    // Extract nail length and shape from the prompt
    const nailLengthMatch = prompt.match(/Nail length: (\w+(?:-\w+)?)/i)
    const nailShapeMatch = prompt.match(/Nail shape: (\w+)/i)
    const nailLength = nailLengthMatch ? nailLengthMatch[1] : 'medium'
    const nailShape = nailShapeMatch ? nailShapeMatch[1] : 'oval'

    // Build enhanced prompt for nail design editing
    const enhancedPrompt = `Use the exact hand in the uploaded image. Do NOT add any extra hands, fingers, arms, bodies, props, or backgrounds. Do NOT change the pose, angle, lighting, skin tone, or environment unless I explicitly say so.

Your ONLY task is to:
- Detect the fingernails on the hand in the image.
- Apply the design strictly inside the nail boundaries while keeping everything else unchanged.

Nail Design Inputs:

1. Design Image (Optional)
${selectedDesignImage ? `Influence Weight: 100% - Controls how strongly the uploaded design image affects the final style.
IMPORTANT: A reference design image was provided. Follow the image's color/pattern exactly. REPLICATE its exact style, colors, patterns, and fine details with MAXIMUM FIDELITY. Preserve all intricate design elements, textures, and color gradients from the reference. Apply the design with professional precision and clarity, maintaining sharp edges and high-resolution details. The nail art should look exactly like the reference design, just adapted to fit the natural nail shape and curvature.` : 'Influence Weight: 0% - No design image provided, ignore this input.'}

2. Smart Styling Prompt (Optional)
Text: ${prompt}
Influence Weight: 50% - Blend the text with all other inputs.

3. Manual Design Parameters
These are direct selections the user makes in the UI:
- Nail Length: ${nailLength.toUpperCase()}
- Nail Shape: ${nailShape.toUpperCase()}
- Manual Parameter Influence Weight: 100% - Apply them with full priority over other inputs.

Rules:
– Keep my hand exactly as it appears.
– Do not generate a second hand.
– Do not reposition or reshape my fingers.
– Add no jewelry unless specified.
– Apply the design as if professionally painted on my real nails.
– Respect natural nail curvature and realistic lighting reflections.
– No alterations to skin, background, or camera framing.

Deliver only ONE edited version of the same hand.`

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
