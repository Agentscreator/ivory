# Third-Party Services Integration

This document explains how to set up and use the integrated third-party services in Ivory.

## Overview

Ivory integrates with several services to provide full functionality:

- **Storage**: Vercel Blob, Cloudflare R2, or Backblaze B2 for image uploads
- **AI**: OpenAI for generating nail design variations
- **Email**: Resend for sending notifications
- **Database**: Neon PostgreSQL for data persistence

## Storage Services

Choose ONE of the following storage providers:

### Option 1: Vercel Blob (Recommended for Vercel deployments)

**Pros**: Easy setup, automatic CDN, generous free tier
**Cons**: Vercel-specific

**Setup**:
1. Go to [vercel.com/dashboard/stores](https://vercel.com/dashboard/stores)
2. Create a new Blob store
3. Copy the `BLOB_READ_WRITE_TOKEN`
4. Add to `.env.local`:
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your-token
```

**Usage**:
```typescript
import { uploadFile } from '@/lib/storage';

const { url } = await uploadFile(file, 'nail-design.jpg', {
  folder: 'designs',
});
```

### Option 2: Cloudflare R2 (Recommended for production)

**Pros**: S3-compatible, no egress fees, affordable
**Cons**: Requires Cloudflare account

**Setup**:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to R2 → Create bucket
3. Create API token with R2 permissions
4. Add to `.env.local`:
```env
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-public-url.r2.dev
```

**Install dependencies**:
```bash
yarn add @aws-sdk/client-s3
```

### Option 3: Backblaze B2

**Pros**: Very affordable, S3-compatible
**Cons**: Slightly more complex setup

**Setup**:
1. Sign up at [backblaze.com](https://www.backblaze.com/b2/cloud-storage.html)
2. Create a bucket
3. Generate application key
4. Add to `.env.local`:
```env
B2_BUCKET_NAME=your-bucket-name
B2_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
```

**Install dependencies**:
```bash
yarn add @aws-sdk/client-s3
```

---

## AI Generation (OpenAI)

Generate nail design variations from text prompts.

**Setup**:
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to API Keys → Create new secret key
3. Add to `.env.local`:
```env
OPENAI_API_KEY=sk-proj-your-openai-key
```

**Install dependencies**:
```bash
yarn add openai
```

**Usage**:
```typescript
import { generateNailDesign } from '@/lib/ai';

const images = await generateNailDesign({
  prompt: 'minimalist floral nail art with pastel colors',
  count: 3,
  size: '1024x1024',
});
```

**Pricing**: 
- DALL-E 3: ~$0.04 per image (1024x1024)
- Check [OpenAI Pricing](https://openai.com/pricing) for current rates

---

## Email Notifications (Resend)

Send transactional emails to users and nail techs.

**Setup**:
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use resend.dev for testing)
3. Create an API key
4. Add to `.env.local`:
```env
RESEND_API_KEY=re_your-resend-key
FROM_EMAIL=noreply@yourdomain.com
```

**Install dependencies**:
```bash
yarn add resend
```

**Usage**:
```typescript
import { sendEmail, emailTemplates } from '@/lib/email';

await sendEmail({
  to: 'user@example.com',
  ...emailTemplates.welcome('John'),
});
```

**Pricing**: 
- Free: 100 emails/day
- Pro: $20/month for 50,000 emails
- Check [Resend Pricing](https://resend.com/pricing)

---

## Database (Neon PostgreSQL)

Already configured! Your connection string is in `.env.local`.

**Manage Database**:
```bash
# Open visual database browser
yarn db:studio

# Push schema changes
yarn db:push

# Generate migrations
yarn db:generate
```

---

## Optional Services

### Google Analytics

Track user behavior and app usage.

**Setup**:
1. Create property at [analytics.google.com](https://analytics.google.com)
2. Copy Measurement ID
3. Add to `.env.local`:
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Social Authentication

Enable Google and Apple sign-in.

**Google OAuth**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Add to `.env.local`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Apple Sign In**:
1. Go to [Apple Developer](https://developer.apple.com)
2. Create Service ID and enable Sign in with Apple
3. Generate private key
4. Add to `.env.local`:
```env
APPLE_CLIENT_ID=com.ivory.signin
APPLE_CLIENT_SECRET=your-jwt-token
```

---

## Cost Estimation

### Minimal Setup (Free Tier)
- **Database**: Neon Free (0.5GB storage, 100 hours compute)
- **Storage**: Vercel Blob Free (1GB storage, 100GB bandwidth)
- **Email**: Resend Free (100 emails/day)
- **AI**: Pay-as-you-go (~$0.04 per image)

**Total**: ~$0/month + AI usage

### Production Setup (Recommended)
- **Database**: Neon Pro ($19/month)
- **Storage**: Cloudflare R2 ($0.015/GB storage, no egress fees)
- **Email**: Resend Pro ($20/month for 50k emails)
- **AI**: OpenAI usage-based

**Total**: ~$40-60/month + AI usage

---

## Testing Services

### Test Storage Upload
```typescript
// app/api/test/storage/route.ts
import { uploadFile } from '@/lib/storage';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  const result = await uploadFile(file, file.name, {
    folder: 'test',
  });
  
  return Response.json(result);
}
```

### Test AI Generation
```typescript
// app/api/test/ai/route.ts
import { generateNailDesign } from '@/lib/ai';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  
  const images = await generateNailDesign({
    prompt,
    count: 1,
  });
  
  return Response.json(images);
}
```

### Test Email
```typescript
// app/api/test/email/route.ts
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  const { to } = await request.json();
  
  await sendEmail({
    to,
    subject: 'Test Email',
    html: '<p>This is a test email from Ivory</p>',
  });
  
  return Response.json({ success: true });
}
```

---

## Troubleshooting

### Storage Upload Fails
- Check that your token/credentials are correct
- Verify bucket permissions
- Ensure file size is within limits

### AI Generation Fails
- Verify OpenAI API key is valid
- Check account has credits
- Review prompt for policy violations

### Email Not Sending
- Verify domain is verified in Resend
- Check FROM_EMAIL matches verified domain
- Review Resend dashboard for errors

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon project is active
- Ensure IP is allowed (Neon allows all by default)

---

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** in production
4. **Set up proper CORS** for storage buckets
5. **Validate file uploads** (type, size, content)
6. **Rate limit** AI generation endpoints
7. **Sanitize email content** to prevent injection

---

## Need Help?

- Check the [Environment Guide](./ENVIRONMENT.md)
- Review the [Setup Guide](../SETUP.md)
- Open an issue on GitHub
