import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { config } from '@/lib/config'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    // STEP 3: Generate 3 design variations using gpt-image-1 (NOT MINI)
    // These are standalone nail design concepts, not applied to the hand yet
    // Using gpt-image-1 for higher quality concept generation
    const designPrompts = [
      `Close-up photo of ${inferredSettings.nail_length || 'medium'} ${inferredSettings.nail_shape || 'oval'} shaped nails with ${prompt}. Base color: ${inferredSettings.base_color || 'pink'}. ${inferredSettings.finish || 'glossy'} finish with ${inferredSettings.texture || 'smooth'} texture. Professional nail art photography, high quality, studio lighting, white background.`,
      `Professional nail art design: ${prompt}. ${inferredSettings.nail_length || 'medium'} length, ${inferredSettings.nail_shape || 'oval'} shape. ${inferredSettings.finish || 'glossy'} ${inferredSettings.base_color || 'pink'} base with ${inferredSettings.texture || 'smooth'} texture. Clean, elegant style. Studio photography.`,
      `Detailed nail design showing ${prompt}. ${inferredSettings.nail_shape || 'oval'} ${inferredSettings.nail_length || 'medium'} nails, ${inferredSettings.base_color || 'pink'} color, ${inferredSettings.finish || 'glossy'} finish. ${inferredSettings.style_vibe || 'elegant'} aesthetic. Professional salon quality, high resolution.`
    ]

    const designs: string[] = []
    
    for (let i = 0; i < designPrompts.length; i++) {
      const designPrompt = designPrompts[i]
      try {
        console.log(`🎨 Generating design concept ${i + 1}/3 with gpt-image-1...`)
        
        // Using gpt-image-1 with responses.create() for concept generation
        // @ts-ignore - responses API is new and not yet in TypeScript definitions
        const response = await openai.responses.create({
          model: 'gpt-image-1',
          // @ts-ignore
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
        const base64Image = response.output?.[0]?.image?.base64
        if (base64Image) {
          // Upload to R2 for permanent storage
          const imageBuffer = Buffer.from(base64Image, 'base64')
          const filename = `ai-design-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 8)}.png`
          const permanentUrl = await uploadToR2(imageBuffer, filename)
          
          console.log(`✅ Design concept ${i + 1} uploaded to R2`)
          designs.push(permanentUrl)
        } else {
          console.warn(`⚠️ No image returned for concept ${i + 1}`)
        }
      } catch (error) {
        console.error(`Error generating design variation ${i + 1}:`, error)
        // Continue with other designs even if one fails
      }
    }
    
    console.log(`✅ Generated ${designs.length}/3 design concepts`)

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
