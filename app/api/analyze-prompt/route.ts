import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Use GPT to analyze the prompt and extract design parameters
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a nail art design expert. Analyze user prompts and extract: nail_length (short/medium/long/extra-long), nail_shape (oval/square/round/almond/stiletto/coffin), base_color (hex code), finish (glossy/matte/satin/metallic/chrome), texture (smooth/glitter/shimmer/textured/holographic), pattern_type, style_vibe, accent_color (hex code). Return ONLY valid JSON with these exact keys.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    })

    const content = analysisResponse.choices[0]?.message?.content || '{}'
    const inferredSettings = JSON.parse(content)

    // Generate 3 design variations based on the prompt using DALL-E 3
    // These are just nail design references, not applied to the hand yet
    const designPrompts = [
      `Close-up photo of ${inferredSettings.nail_length || 'medium'} ${inferredSettings.nail_shape || 'oval'} shaped nails with ${prompt}. Base color: ${inferredSettings.base_color || 'pink'}. ${inferredSettings.finish || 'glossy'} finish with ${inferredSettings.texture || 'smooth'} texture. Professional nail art photography, high quality, studio lighting, white background.`,
      `Professional nail art design: ${prompt}. ${inferredSettings.nail_length || 'medium'} length, ${inferredSettings.nail_shape || 'oval'} shape. ${inferredSettings.finish || 'glossy'} ${inferredSettings.base_color || 'pink'} base with ${inferredSettings.texture || 'smooth'} texture. Clean, elegant style. Studio photography.`,
      `Detailed nail design showing ${prompt}. ${inferredSettings.nail_shape || 'oval'} ${inferredSettings.nail_length || 'medium'} nails, ${inferredSettings.base_color || 'pink'} color, ${inferredSettings.finish || 'glossy'} finish. ${inferredSettings.style_vibe || 'elegant'} aesthetic. Professional salon quality, high resolution.`
    ]

    const designs: string[] = []
    
    for (const designPrompt of designPrompts) {
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: designPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      })

      const imageUrl = imageResponse.data?.[0]?.url
      if (imageUrl) {
        designs.push(imageUrl)
      }
    }

    return NextResponse.json({ 
      designs,
      inferredSettings: {
        nailLength: inferredSettings.nail_length,
        nailShape: inferredSettings.nail_shape,
        baseColor: inferredSettings.base_color,
        finish: inferredSettings.finish,
        texture: inferredSettings.texture,
        patternType: inferredSettings.pattern_type,
        styleVibe: inferredSettings.style_vibe,
        accentColor: inferredSettings.accent_color
      }
    })
  } catch (error: any) {
    console.error('Prompt analysis error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze prompt' },
      { status: 500 }
    )
  }
}
