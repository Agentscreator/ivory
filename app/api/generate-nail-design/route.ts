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

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    console.log('📥 Fetching image from:', imageUrl)
    
    if (imageUrl.startsWith('data:')) {
      console.log('  - Detected data URL, converting directly')
      const base64Part = imageUrl.split(',')[1]
      if (!base64Part) {
        throw new Error('Invalid data URL format')
      }
      return base64Part
    }
    
    const imageResponse = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ivory/1.0)' },
    })
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`)
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    if (imageBuffer.byteLength === 0) {
      throw new Error('Image buffer is empty')
    }
    
    return Buffer.from(imageBuffer).toString('base64')
  } catch (error: any) {
    console.error('Error fetching image:', error)
    throw new Error(`Failed to fetch image: ${error.message}`)
  }
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

    const instructionText = `Edit this image to apply nail art design to the nails only.

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

${selectedDesignImage ? 'Use the provided reference design image as inspiration for the nail art pattern and style.' : ''}`

    console.log('🤖 Generating nail design preview with gpt-image-1-mini...')
    
    // Fetch original image as base64
    const originalImageBase64 = await fetchImageAsBase64(originalImage)
    
    // Prepare input images array
    const inputImages: any[] = [
      {
        type: 'input_image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: originalImageBase64
        }
      }
    ]
    
    // Add selected design image if provided (from AI Designs or Upload tab)
    if (selectedDesignImage) {
      const designImageBase64 = await fetchImageAsBase64(selectedDesignImage)
      inputImages.push({
        type: 'input_image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: designImageBase64
        }
      })
    }
    
    // Using gpt-image-1-mini for fast, real-time preview generation
    // This applies design settings to the user's actual hand image
    // @ts-ignore - responses API is new and not yet in TypeScript definitions
    const response = await openai.responses.create({
      model: 'gpt-image-1-mini',
      // @ts-ignore
      modalities: ['image'],
      // @ts-ignore
      image: {
        size: '1024x1024',
        quality: 'standard'
      },
      input: [
        {
          role: 'user',
          content: [
            ...inputImages,
            {
              type: 'input_text',
              text: instructionText
            }
          ]
        }
      ]
    })

    // @ts-ignore
    const outputBase64 = response.output?.[0]?.image?.base64

    if (!outputBase64) {
      throw new Error('No image generated by gpt-image-1-mini')
    }

    console.log('✅ gpt-image-1-mini response received, uploading to R2...')
    
    // Convert base64 to buffer and upload to R2
    const imageBuffer = Buffer.from(outputBase64, 'base64')
    const filename = `nail-design-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`
    
    const permanentUrl = await uploadToR2(imageBuffer, filename)
    
    console.log('✅ Uploaded to R2:', permanentUrl)
    
    return NextResponse.json({ imageUrl: permanentUrl })
  } catch (error: any) {
    console.error('❌ Image generation error:', error)
    
    let errorMessage = error?.message || 'Failed to generate nail design'
    
    if (error?.status === 401) {
      errorMessage = 'OpenAI API key is invalid or expired'
    } else if (error?.status === 429) {
      errorMessage = 'Rate limited by OpenAI. Please try again later.'
    } else if (error?.status === 400) {
      errorMessage = `Invalid request to OpenAI: ${error.message}`
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error?.message },
      { status: 500 }
    )
  }
}
