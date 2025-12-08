// Storage utilities for handling file uploads
// Supports multiple storage providers: Vercel Blob, Backblaze B2, Cloudflare R2

import { env } from './env';

export type StorageProvider = 'vercel-blob' | 'backblaze-b2' | 'cloudflare-r2' | 'cloudinary';

// Detect which storage provider is configured
export function getStorageProvider(): StorageProvider | null {
  if (env.BLOB_READ_WRITE_TOKEN) return 'vercel-blob';
  if (env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY) return 'cloudflare-r2';
  if (env.B2_KEY_ID && env.B2_APPLICATION_KEY) return 'backblaze-b2';
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY) return 'cloudinary';
  return null;
}

// Upload file to configured storage provider
export async function uploadFile(
  file: File | Blob,
  filename: string,
  options?: {
    folder?: string;
    contentType?: string;
  }
): Promise<{ url: string; key: string }> {
  const provider = getStorageProvider();

  if (!provider) {
    throw new Error('No storage provider configured. Please set up Vercel Blob, R2, B2, or Cloudinary.');
  }

  switch (provider) {
    case 'vercel-blob':
      return uploadToVercelBlob(file, filename, options);
    case 'cloudflare-r2':
      return uploadToR2(file, filename, options);
    case 'backblaze-b2':
      return uploadToB2(file, filename, options);
    case 'cloudinary':
      return uploadToCloudinary(file, filename, options);
    default:
      throw new Error(`Unsupported storage provider: ${provider}`);
  }
}

// Vercel Blob Storage
async function uploadToVercelBlob(
  file: File | Blob,
  filename: string,
  options?: { folder?: string; contentType?: string }
): Promise<{ url: string; key: string }> {
  const { put } = await import('@vercel/blob');
  
  const pathname = options?.folder ? `${options.folder}/${filename}` : filename;
  
  const blob = await put(pathname, file, {
    access: 'public',
    token: env.BLOB_READ_WRITE_TOKEN,
    contentType: options?.contentType,
  });

  return {
    url: blob.url,
    key: blob.pathname,
  };
}

// Cloudflare R2 Storage
async function uploadToR2(
  file: File | Blob,
  filename: string,
  options?: { folder?: string; contentType?: string }
): Promise<{ url: string; key: string }> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const s3Client = new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const key = options?.folder ? `${options.folder}/${filename}` : filename;
  const buffer = await file.arrayBuffer();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME!,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: options?.contentType || file.type,
    })
  );

  const url = `${env.R2_PUBLIC_URL}/${key}`;

  return { url, key };
}

// Backblaze B2 Storage
async function uploadToB2(
  file: File | Blob,
  filename: string,
  options?: { folder?: string; contentType?: string }
): Promise<{ url: string; key: string }> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const s3Client = new S3Client({
    region: 'us-west-004',
    endpoint: env.B2_ENDPOINT,
    credentials: {
      accessKeyId: env.B2_KEY_ID!,
      secretAccessKey: env.B2_APPLICATION_KEY!,
    },
  });

  const key = options?.folder ? `${options.folder}/${filename}` : filename;
  const buffer = await file.arrayBuffer();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.B2_BUCKET_NAME!,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: options?.contentType || file.type,
    })
  );

  const url = `${env.B2_ENDPOINT}/${env.B2_BUCKET_NAME}/${key}`;

  return { url, key };
}

// Cloudinary (legacy support)
async function uploadToCloudinary(
  file: File | Blob,
  filename: string,
  options?: { folder?: string }
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', env.CLOUDINARY_UPLOAD_PRESET || 'default');
  if (options?.folder) {
    formData.append('folder', options.folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload to Cloudinary');
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    key: data.public_id,
  };
}

// Delete file from storage
export async function deleteFile(key: string): Promise<void> {
  const provider = getStorageProvider();

  if (!provider) {
    throw new Error('No storage provider configured');
  }

  switch (provider) {
    case 'vercel-blob':
      const { del } = await import('@vercel/blob');
      await del(key, { token: env.BLOB_READ_WRITE_TOKEN });
      break;
    case 'cloudflare-r2':
    case 'backblaze-b2':
      // Implement S3 delete if needed
      console.warn('Delete not implemented for S3-compatible storage');
      break;
    case 'cloudinary':
      // Implement Cloudinary delete if needed
      console.warn('Delete not implemented for Cloudinary');
      break;
  }
}

// Generate a unique filename
export function generateFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const name = prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
  return `${name}.${extension}`;
}
