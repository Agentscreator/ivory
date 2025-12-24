import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert nail technician with years of experience in creating complex nail art designs. Analyze nail designs and provide detailed, professional implementation guidance for other nail technicians.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this nail design image and provide a detailed implementation guide for a professional nail technician. Your response should be exactly 1400 characters, split into two paragraphs. Include specific details about:\n\n1. First paragraph (700 characters): Materials needed (gel types, chrome powders, specific colors, tools), base preparation, and the step-by-step application process.\n\n2. Second paragraph (700 characters): Advanced techniques (layering, blending, chrome application methods), finishing touches, curing times, and pro tips for achieving the exact look shown.\n\nBe specific about product types, application techniques, and professional methods. Write in a clear, instructional tone for an experienced nail tech.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    const guidance = response.choices[0]?.message?.content || '';

    return NextResponse.json({ guidance });
  } catch (error: any) {
    console.error('Error analyzing design for tech:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze design' },
      { status: 500 }
    );
  }
}
