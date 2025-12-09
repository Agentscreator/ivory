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

    // Download the original image to convert to buffer for DALL-E edit
    const imageResponse = await fetch(originalImage)
    const imageBuffer = await imageResponse.arrayBuffer()
    const imageFile = new File([imageBuffer], 'hand.png', { type: 'image/png' })

    // Create a mask (transparent PNG) - for now we'll use the same image
    // In production, you'd want to create an actual mask highlighting the nail areas
    const maskFile = new File([imageBuffer], 'mask.png', { type: 'image/png' })

    // Build the edit prompt with design settings
    let editPrompt = prompt

    if (selectedDesignImage) {
      editPrompt = `${prompt} Apply this exact nail design style to the nails in the image, preserving the hand pose, skin tone, and background perfectly.`
    }

    // Use DALL-E 2 edit endpoint (DALL-E 3 doesn't support edits yet)
    const editResponse = await openai.images.edit({
      model: 'dall-e-2',
      image: imageFile,
      mask: maskFile,
      prompt: editPrompt,
      n: 1,
      size: '1024x1024',
    })

    const imageUrl = editResponse.data?.[0]?.url

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
