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

    // Use GPT-4o with vision to analyze the original image and generate a new image
    // with the design applied based on the prompt
    const messages: any[] = [
      {
        role: 'system',
        content: 'You are an expert nail art designer. Analyze the hand image provided and describe in extreme detail how to apply the requested nail design to this specific hand, preserving the exact hand pose, skin tone, lighting, and background. Be extremely specific about nail placement and design application.'
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Original hand image analysis needed. Design requirements: ${prompt}\n\nProvide a detailed description of how this design would look applied to the hand in the image, maintaining all natural features.`
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

    // If there's a selected design image, include it for reference
    if (selectedDesignImage) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Apply this exact design style to the hand:'
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

    // Get detailed description from GPT-4o
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 1000,
    })

    const detailedDescription = analysisResponse.choices[0]?.message?.content || ''

    // Now use DALL-E 3 with the enhanced description
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `${detailedDescription}\n\n${prompt}\n\nPhotorealistic, high quality, professional nail photography.`,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    })

    const imageUrl = imageResponse.data[0]?.url

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
