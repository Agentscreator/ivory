import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }
  return new OpenAI({ apiKey })
}

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    console.log('📥 Fetching image from:', imageUrl)
    
    // If it's a data URL, convert directly
    if (imageUrl.startsWith('data:')) {
      console.log('  - Detected data URL, converting directly')
      const base64Part = imageUrl.split(',')[1]
      if (!base64Part) {
        throw new Error('Invalid data URL format')
      }
      console.log('  - Base64 length:', base64Part.length, 'characters')
      return base64Part
    }
    
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Ivory/1.0)',
      },
    })
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`)
    }
    
    console.log('  - Response status:', imageResponse.status)
    console.log('  - Content-Type:', imageResponse.headers.get('content-type'))
    
    const imageBuffer = await imageResponse.arrayBuffer()
    console.log('  - Image buffer size:', imageBuffer.byteLength, 'bytes')
    
    if (imageBuffer.byteLength === 0) {
      throw new Error('Image buffer is empty')
    }
    
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    console.log('  - Base64 length:', base64Image.length, 'characters')
    
    return base64Image
  } catch (error: any) {
    console.error('Error fetching image:', error)
    throw new Error(`Failed to fetch image: ${error.message}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAIClient()
    const { prompt, originalImage, selectedDesignImage } = await request.json()

    console.log('🔍 DEBUG: Received request for nail design generation')
    console.log('  - Prompt:', prompt?.substring(0, 100) + '...')
    console.log('  - Original Image URL:', originalImage)
    console.log('  - Selected Design Image:', selectedDesignImage)

    if (!prompt || !originalImage) {
      return NextResponse.json({ error: 'Prompt and original image are required' }, { status: 400 })
    }

    // Fetch the original image and convert to base64
    const base64Image = await fetchImageAsBase64(originalImage)

    // Extract nail length and shape from the prompt (it contains the design settings)
    const nailLengthMatch = prompt.match(/Nail length: (\w+(?:-\w+)?)/i)
    const nailShapeMatch = prompt.match(/Nail shape: (\w+)/i)
    const nailLength = nailLengthMatch ? nailLengthMatch[1] : 'medium'
    const nailShape = nailShapeMatch ? nailShapeMatch[1] : 'oval'

    // Build the instruction text using your exact structure
    let instructionText = `Use the exact hand in the uploaded image. Do NOT add any extra hands, fingers, arms, bodies, props, or backgrounds. Do NOT change the pose, angle, lighting, skin tone, or environment unless I explicitly say so.

Your ONLY task is to:
1. Detect the fingernails on the hand in the image.
2. Apply the following nail design strictly inside the nail boundaries while keeping everything else unchanged.

Nail design I want:
${prompt}

Rules:
– Keep my hand exactly as it appears.
– Do not generate a second hand.
– Do not reposition or reshape my fingers.
– Add no jewelry unless specified.
– Keep nail length: ${nailLength}.
– Keep nail shape: ${nailShape}.
– Apply design as if professionally painted on my real nails.
– Respect natural nail curvature and realistic lighting reflections.
– No alterations to skin, background, or camera framing.

Deliver only ONE edited version of the same hand.`

    // Build input content array
    const inputContent: any[] = [
      {
        type: 'text',
        text: instructionText
      },
      {
        type: 'input_image',
        image_url: `data:image/png;base64,${base64Image}`
      }
    ]

    console.log('📝 Built input content with', inputContent.length, 'items')
    console.log('📏 Extracted nail length:', nailLength)
    console.log('📐 Extracted nail shape:', nailShape)

    // If there's a selected design image, add it as reference
    if (selectedDesignImage) {
      try {
        console.log('🎨 Adding selected design image as reference')
        const base64Design = await fetchImageAsBase64(selectedDesignImage)
        
        inputContent.splice(2, 0, {
          type: 'text',
          text: 'Reference design image to replicate:'
        })
        inputContent.splice(3, 0, {
          type: 'input_image',
          image_url: `data:image/png;base64,${base64Design}`
        })
        console.log('  - Total input items now:', inputContent.length)
      } catch (error: any) {
        console.warn('Failed to fetch design image, continuing without it:', error.message)
      }
    }

    // STEP 1 & STEP 5: Use gpt-image-1-mini with Responses API
    // This is the PRIMARY model for applying designs to the user's actual hand
    console.log('🤖 Using gpt-image-1-mini with Responses API...')
    console.log('📝 Input content items:', inputContent.length)
    
    try {
      // @ts-ignore - responses API is new and not yet in TypeScript definitions
      const response = await openai.responses.create({
        model: 'gpt-image-1-mini',
        // @ts-ignore
        modalities: ['image'], // REQUIRED for image output
        // @ts-ignore
        image: {
          size: '1024x1024',
          quality: 'high'
        },
        input: [
          {
            role: 'user',
            content: inputContent
          }
        ]
      })

      console.log('✅ gpt-image-1-mini response received')
      console.log('Response structure:', JSON.stringify(response, null, 2).substring(0, 500))
      
      // Extract image output (base64)
      // @ts-ignore
      const outputBase64 = response.output?.[0]?.image?.base64

      if (!outputBase64) {
        console.error('No image in response. Full response:', JSON.stringify(response, null, 2))
        throw new Error('No image generated by gpt-image-1-mini')
      }

      console.log('🖼️  Got output image, length:', outputBase64.length)
      // Convert base64 to data URL
      const imageUrl = `data:image/png;base64,${outputBase64}`
      return NextResponse.json({ imageUrl })
    } catch (apiError: any) {
      console.error('OpenAI API error:', apiError)
      throw new Error(`OpenAI API failed: ${apiError.message}`)
    }
  } catch (error: any) {
    console.error('❌ Image generation error:', error)
    console.error('Error stack:', error?.stack)
    
    // Provide detailed error messages for debugging
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
