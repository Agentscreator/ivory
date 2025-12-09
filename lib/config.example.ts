// Runtime configuration - workaround for Next.js 16 Turbopack env loading bug
// Copy this file to lib/config.ts and fill in your actual values

export const config = {
  // Cloudflare R2 Storage
  R2_ENDPOINT: process.env.R2_ENDPOINT || '',
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || '',
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || '',
  
  // Vercel Blob
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || '',
  
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
} as const;
