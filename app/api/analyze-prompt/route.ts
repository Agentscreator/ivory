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

    // STEP 2: Use gpt-4o-mini to analyze the prompt and extract design parameters
    // Fast, cheap, excellent at structured reasoning - perfect for JSON extraction
    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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

    // STEP 3: Generate 3 design variations using gpt-image-1
    // These are standalone nail design concepts, not applied to the hand yet
    // Using gpt-image-1 for speed + consistency (can upgrade to dall-e-3 for premium quality)
    const designPrompts = [
      `Close-up photo of ${inferredSettings.nail_length || 'medium'} ${inferredSettings.nail_shape || 'oval'} shaped nails with ${prompt}. Base color: ${inferredSettings.base_color || 'pink'}. ${inferredSettings.finish || 'glossy'} finish with ${inferredSettings.texture || 'smooth'} texture. Professional nail art photography, high quality, studio lighting, white background.`,
      `Professional nail art design: ${prompt}. ${inferredSettings.nail_length || 'medium'} length, ${inferredSettings.nail_shape || 'oval'} shape. ${inferredSettings.finish || 'glossy'} ${inferredSettings.base_color || 'pink'} base with ${inferredSettings.texture || 'smooth'} texture. Clean, elegant style. Studio photography.`,
      `Detailed nail design showing ${prompt}. ${inferredSettings.nail_shape || 'oval'} ${inferredSettings.nail_length || 'medium'} nails, ${inferredSettings.base_color || 'pink'} color, ${inferredSettings.finish || 'glossy'} finish. ${inferredSettings.style_vibe || 'elegant'} aesthetic. Professional salon quality, high resolution.`
    ]

    const designs: string[] = []
    
    for (const designPrompt of designPrompts) {
      try {
        // @ts-ignore - responses API is new and not yet in TypeScript definitions
        const response = await openai.responses.create({
          model: 'gpt-image-1',
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
                {
                  type: 'input_text',
                  text: designPrompt
                }
              ]
            }
          ]
        })

        // @ts-ignore
        const outputBase64 = response.output?.[0]?.image?.base64
        if (outputBase64) {
          const imageUrl = `data:image/png;base64,${outputBase64}`
          designs.push(imageUrl)
        }
      } catch (error) {
        console.error('Error generating design variation:', error)
        // Continue with other designs even if one fails
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
