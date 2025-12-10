import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
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
    const enhancedPrompt = `Use the exact hand in the uploaded image. Do NOT add hands, props, or backgrounds. Do NOT change pose, lighting, skin tone, or framing.

Your ONLY task:
1. Detect all fingernails in the image
2. Apply this nail design inside the existing nails only

Design specifications:
${prompt}

CRITICAL REQUIREMENTS:
- Preserve the original hand, fingers, skin, pose, and background EXACTLY
- Only modify the nail surfaces
- Apply the design with ${nailLength} length and ${nailShape} shape
- Professional salon quality finish
- Realistic nail polish appearance with smooth edges
- Natural lighting and reflections matching the original image
- Keep all other elements of the photo unchanged

${selectedDesignImage ? 'IMPORTANT: A reference design image was provided. Use its style, colors, and patterns as inspiration for the nail art.' : ''}

Apply the design as if professionally painted. Respect natural nail curvature and realistic lighting. Deliver ONE edited version.`

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
    console.log('📥 Hand image blob size:', imageBlob.size, 'type:', imageBlob.type)
    
    // Convert Blob → ArrayBuffer → File
    const arrayBuffer = await imageBlob.arrayBuffer()
    const handImage = new File([arrayBuffer], 'hand.jpg', { type: imageBlob.type })
    console.log('📥 Hand image file created:', handImage.name, handImage.size, handImage.type)
    
    // Prepare content array for the request
    const contentArray: any[] = [
      {
        type: 'input_text',
        text: enhancedPrompt
      },
      {
        type: 'input_image',
        image: handImage
      }
    ]
    
    // If reference design image is provided, fetch and add it
    if (selectedDesignImage) {
      console.log('📥 Fetching reference design image:', selectedDesignImage)
      
      const designImageResponse = await fetch(selectedDesignImage, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ivory/1.0)' },
      })
      
      if (designImageResponse.ok) {
        const designBlob = await designImageResponse.blob()
        const designArrayBuffer = await designBlob.arrayBuffer()
        const designImage = new File([designArrayBuffer], 'reference.jpg', { type: designBlob.type })
        
        console.log('📥 Reference design file created:', designImage.name, designImage.size)
        
        contentArray.push({
          type: 'input_image',
          image: designImage
        })
      } else {
        console.warn('⚠️ Failed to fetch reference design, continuing without it')
      }
    }
    
    console.log('🎨 Calling OpenAI responses.create() with gpt-image-1...')
    console.log('📊 Content items:', contentArray.length, '(text + images)')
    
    // Using gpt-image-1 with responses.create() for image editing
    // This is the correct API for image-to-image editing with gpt-image-1
    // @ts-ignore - responses API is new and not yet in TypeScript definitions
    const response = await openai.responses.create({
      model: 'gpt-image-1',
      // @ts-ignore
      input: [
        {
          role: 'user',
          content: contentArray
        }
      ]
    })

    console.log('✅ OpenAI response received')
    
    // @ts-ignore
    const base64Image = response.output?.[0]?.image?.base64

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
