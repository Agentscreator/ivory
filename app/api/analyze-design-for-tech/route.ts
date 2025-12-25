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
          content: 'You are a professional nail technician educator providing technical implementation guidance to fellow nail technicians. Your expertise includes gel application, chrome techniques, nail art, and professional salon procedures.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Act as a professional nail technician. Based on the provided nail design image, generate a practical execution guide for recreating this exact look. Your response must be approximately 1400 characters split into two clear paragraphs.\n\nFirst Paragraph (700 chars): Identify the nail shape (almond, coffin, square, etc.), base color undertone (warm/cool), chrome type (mirror, holographic, etc.), and finish (glossy/matte). List specific materials: gel polish brands/colors, chrome powder type, base/top coat specifications, and required tools. Describe prep steps with timing: nail prep (5-10 min), base application and cure time, color layer application with number of coats and cure times between each.\n\nSecond Paragraph (700 chars): Detail chrome application technique: correct powder intensity, application pressure and motion, buffing method, and sealing process with cure times. Specify color layering order if applicable. Include critical execution details: common mistakes to avoid (over-buffing, insufficient curing, wrong powder application), troubleshooting tips, and estimated total service time. Provide actionable guidance focused on decisions and execution—not theory.\n\nWrite clearly and concisely for working nail techs who need to recreate this design today.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
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
