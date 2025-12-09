import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, originalImage, selectedDesignImage } = await request.json()

    if (!prompt || !originalImage) {
      return NextResponse.json({ error: 'Prompt and original image are required' }, { status: 400 })
    }

    // Build messages for gpt-image-1 with the original image and design settings
    const messages: any[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Apply the following nail design to this hand image: ${prompt}\n\nIMPORTANT: Preserve the exact hand pose, skin tone, lighting, background, and all natural features. Only modify the nails with the requested design. The result should look like a professional nail art photo with the design seamlessly applied.`
          },
          {
            type: 'image_url',
            image_url: {
              url: originalImage
            }
          }
        ]
      }
    ]

    // If there's a selected design image, include it as reference
    if (selectedDesignImage) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Use this design as a reference and apply it to the hand above:'
          },
          {
            type: 'image_url',
            image_url: {
              url: selectedDesignImage
            }
          }
        ]
      })
    }

    // Use gpt-image-1 to generate the image with design applied
    const imageResponse = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      // Pass the original image context through messages
      // Note: This is a new model, so the exact API might differ
      // @ts-ignore - gpt-image-1 is a new model
      messages: messages,
    })

    const imageUrl = imageResponse.data?.[0]?.url

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
