import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }
  return new OpenAI({ apiKey })
}

export async function POST(request: NextRequest) {
  try {
    const openai = getOpenAIClient()
    const { prompt, originalImage, selectedDesignImage } = await request.json()

    if (!prompt || !originalImage) {
      return NextResponse.json({ error: 'Prompt and original image are required' }, { status: 400 })
    }

    // Fetch the original image and convert to base64
    const imageResponse = await fetch(originalImage)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')

    // Build the instruction text
    let instructionText = `Use the exact hand in the image. Do NOT change pose, skin tone, lighting, or background. Detect the fingernails and apply the following design: ${prompt}. Do not alter anything outside the nail boundaries. The result must look like professional nail art photography with the design seamlessly applied only to the nails.`

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

    // If there's a selected design image, add it as reference
    if (selectedDesignImage) {
      const designResponse = await fetch(selectedDesignImage)
      const designBuffer = await designResponse.arrayBuffer()
      const base64Design = Buffer.from(designBuffer).toString('base64')
      
      inputContent.push({
        type: 'text',
        text: 'Use this design style as a reference:'
      })
      inputContent.push({
        type: 'input_image',
        image_url: `data:image/png;base64,${base64Design}`
      })
    }

    // Use gpt-image-1-mini with Responses API
    try {
      // @ts-ignore - responses API is new and not yet in TypeScript definitions
      const response = await openai.responses.create({
        model: 'gpt-image-1-mini',
        // @ts-ignore
        modalities: ['image'], // REQUIRED for image output
        input: [
          {
            role: 'user',
            content: inputContent
          }
        ]
      })

      // Extract image output (base64)
      // @ts-ignore
      const outputBase64 = response.output?.[0]?.image?.base64

      if (outputBase64) {
        // Convert base64 to data URL
        const imageUrl = `data:image/png;base64,${outputBase64}`
        return NextResponse.json({ imageUrl })
      }
    } catch (gptImageError: any) {
      console.log('gpt-image-1-mini error, falling back to DALL-E 3:', gptImageError.message)
    }

    // Fallback: Use GPT-4o to analyze the image and create a detailed prompt
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: instructionText
            },
            {
              type: 'image_url',
              image_url: {
                url: originalImage
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    })

    const detailedDescription = analysisResponse.choices[0]?.message?.content || ''

    // Generate with DALL-E 3 using the enhanced description
    const dalleResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `${detailedDescription}\n\nApply this design: ${prompt}\n\nPhotorealistic, professional nail art photography, high quality, studio lighting.`,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    })

    const imageUrl = dalleResponse.data?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
    }

    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate nail design' },
      { status: 500 }
    )
  }
}
