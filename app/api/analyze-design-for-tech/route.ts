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
          content: 'You are a professional nail technician educator with expertise in analyzing nail designs from images and providing technical implementation guidance. You MUST analyze the actual image provided and give specific guidance based on what you see in that image.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'IMPORTANT: You MUST carefully examine and analyze the nail design image provided below. Do NOT give generic guidance. Look at the ACTUAL design in the image and describe what you see.\n\nAnalyze this specific nail design image and provide a practical execution guide for recreating the EXACT look shown. Your response must be approximately 1400 characters split into two clear paragraphs.\n\nFirst Paragraph (700 chars): Based on what you SEE in the image, identify: the exact nail shape (almond, coffin, square, stiletto, etc.), the specific colors used (describe the exact shades - e.g., "rose gold chrome", "deep burgundy", "nude pink"), any patterns or designs (french tips, ombre, geometric, floral, etc.), the finish type (chrome/mirror, holographic, matte, glossy, glitter). List specific materials needed: gel polish colors that match what you see, chrome powder type if applicable, base/top coat specifications, and required tools. Describe prep steps with timing: nail prep (5-10 min), base application and cure time, color layer application with number of coats and cure times.\n\nSecond Paragraph (700 chars): Provide step-by-step execution for the SPECIFIC design you see: If there\'s chrome, detail the application technique (powder intensity, pressure, buffing). If there are patterns, explain how to create them. If there\'s ombre or gradients, describe the blending technique. Include color layering order for the exact design shown. Specify cure times for each step. List common mistakes to avoid for THIS specific design type, troubleshooting tips, and estimated total service time. Be specific about what you see in the image - mention specific design elements like "the gold accent on the ring finger" or "the geometric lines" or "the gradient effect from pink to white".\n\nYou MUST reference specific visual elements you see in the image to prove you analyzed it.',
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
      max_tokens: 800,
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
