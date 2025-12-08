// AI utilities for generating nail designs
// Uses OpenAI DALL-E or Replicate Stable Diffusion

import { env } from './env';

export type AIProvider = 'openai' | 'replicate' | null;

// Detect which AI provider is configured
export function getAIProvider(): AIProvider {
  if (env.OPENAI_API_KEY) return 'openai';
  if (env.REPLICATE_API_TOKEN) return 'replicate';
  return null;
}

export interface GenerateImageOptions {
  prompt: string;
  count?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  style?: 'natural' | 'vivid';
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

// Generate nail design images from text prompt
export async function generateNailDesign(
  options: GenerateImageOptions
): Promise<GeneratedImage[]> {
  const provider = getAIProvider();

  if (!provider) {
    throw new Error('No AI provider configured. Please set up OpenAI or Replicate.');
  }

  // Enhance prompt for nail art
  const enhancedPrompt = `Professional nail art design: ${options.prompt}. High quality, detailed, photorealistic nail polish on natural nails.`;

  switch (provider) {
    case 'openai':
      return generateWithOpenAI({ ...options, prompt: enhancedPrompt });
    case 'replicate':
      return generateWithReplicate({ ...options, prompt: enhancedPrompt });
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

// Generate with OpenAI DALL-E
async function generateWithOpenAI(
  options: GenerateImageOptions
): Promise<GeneratedImage[]> {
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: options.prompt,
    n: options.count || 1,
    size: options.size || '1024x1024',
    quality: 'hd',
    style: options.style || 'natural',
  });

  return response.data.map((image) => ({
    url: image.url!,
    prompt: options.prompt,
  }));
}

// Generate with Replicate Stable Diffusion
async function generateWithReplicate(
  options: GenerateImageOptions
): Promise<GeneratedImage[]> {
  const Replicate = (await import('replicate')).default;
  const replicate = new Replicate({ auth: env.REPLICATE_API_TOKEN });

  const output = await replicate.run(
    'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    {
      input: {
        prompt: options.prompt,
        num_outputs: options.count || 1,
        width: 1024,
        height: 1024,
      },
    }
  );

  const urls = Array.isArray(output) ? output : [output];

  return urls.map((url) => ({
    url: url as string,
    prompt: options.prompt,
  }));
}

// Predefined nail art style prompts
export const nailArtStyles = {
  minimalist: 'minimalist, clean lines, simple geometric shapes, neutral colors',
  floral: 'delicate flowers, botanical elements, soft pastels, nature-inspired',
  geometric: 'bold geometric patterns, sharp lines, modern abstract shapes',
  glitter: 'sparkly glitter, shimmer, metallic accents, glamorous',
  french: 'classic french manicure, elegant white tips, natural look',
  ombre: 'gradient color transition, smooth blend, ombre effect',
  marble: 'marble texture, swirls, elegant stone pattern',
  holographic: 'holographic effect, iridescent, rainbow shimmer',
  animal: 'animal print, leopard, zebra, snake skin pattern',
  seasonal: {
    spring: 'spring flowers, pastel colors, cherry blossoms, fresh',
    summer: 'bright tropical colors, beach vibes, sunshine, vibrant',
    fall: 'autumn leaves, warm tones, burgundy, orange, cozy',
    winter: 'snowflakes, icy blue, silver, festive, elegant',
  },
};

// Generate prompt from style and preferences
export function buildNailArtPrompt(
  style: string,
  colors?: string[],
  additionalDetails?: string
): string {
  let prompt = `${style} nail art design`;

  if (colors && colors.length > 0) {
    prompt += ` with ${colors.join(', ')} colors`;
  }

  if (additionalDetails) {
    prompt += `, ${additionalDetails}`;
  }

  return prompt;
}
