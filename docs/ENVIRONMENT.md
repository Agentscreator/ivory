# Environment Configuration Guide

This guide explains all environment variables used in the Ivory's Choice application.

## Quick Start

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Update the required variables (marked with ⚠️)

3. Restart your development server

## Required Variables

### ⚠️ DATABASE_URL
**Required for:** Database connection

Your Neon PostgreSQL connection string.

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

**How to get it:**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Make sure to use the pooled connection string for better performance

---

## Optional Variables

### App Configuration

#### NEXT_PUBLIC_APP_URL
**Default:** `http://localhost:3000`

The base URL of your application. Used for generating share links and redirects.

```env
NEXT_PUBLIC_APP_URL=https://ivory.app
```

#### NODE_ENV
**Default:** `development`

The environment mode. Automatically set by Next.js.

```env
NODE_ENV=production
```

---

### Authentication

#### JWT_SECRET
**Required for:** JWT token signing (production)

A secret key for signing JWT tokens. Generate a secure random string.

```bash
# Generate a secure secret
openssl rand -base64 32
```

```env
JWT_SECRET=your-generated-secret-here
```

#### NEXTAUTH_SECRET
**Required for:** NextAuth.js (if using)

Secret for NextAuth.js session encryption.

```env
NEXTAUTH_SECRET=your-nextauth-secret
```

#### NEXTAUTH_URL
**Required for:** NextAuth.js (if using)

The canonical URL of your site.

```env
NEXTAUTH_URL=https://ivory.app
```

---

### File Upload (Cloudinary)

For uploading and storing nail design images in the cloud.

#### CLOUDINARY_CLOUD_NAME
Your Cloudinary cloud name.

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
```

#### CLOUDINARY_API_KEY
Your Cloudinary API key.

```env
CLOUDINARY_API_KEY=123456789012345
```

#### CLOUDINARY_API_SECRET
Your Cloudinary API secret.

```env
CLOUDINARY_API_SECRET=your-api-secret
```

#### NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
Upload preset for unsigned uploads (client-side).

```env
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ivory-uploads
```

**Setup Instructions:**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Settings → Upload
3. Create an upload preset
4. Enable "Unsigned" mode
5. Copy the preset name

---

### AI Generation

For generating nail design variations using AI.

#### OPENAI_API_KEY
OpenAI API key for DALL-E or GPT-based generation.

```env
OPENAI_API_KEY=sk-...
```

**How to get it:**
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to API Keys
3. Create a new secret key

#### REPLICATE_API_TOKEN
Replicate API token for Stable Diffusion models.

```env
REPLICATE_API_TOKEN=r8_...
```

**How to get it:**
1. Sign up at [replicate.com](https://replicate.com)
2. Go to Account → API Tokens
3. Create a new token

---

### Email Notifications

For sending email notifications to users and techs.

#### SMTP_HOST
SMTP server hostname.

```env
SMTP_HOST=smtp.gmail.com
```

#### SMTP_PORT
SMTP server port (usually 587 for TLS).

```env
SMTP_PORT=587
```

#### SMTP_USER
SMTP username (usually your email).

```env
SMTP_USER=your-email@gmail.com
```

#### SMTP_PASSWORD
SMTP password or app-specific password.

```env
SMTP_PASSWORD=your-app-password
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use that password here

#### SMTP_FROM
The "from" email address for sent emails.

```env
SMTP_FROM=noreply@ivory.app
```

---

### Analytics

#### NEXT_PUBLIC_GA_ID
Google Analytics measurement ID.

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**How to get it:**
1. Sign up at [analytics.google.com](https://analytics.google.com)
2. Create a new property
3. Copy the Measurement ID

---

### Social Authentication

For OAuth login with Google and Apple.

#### GOOGLE_CLIENT_ID
Google OAuth client ID.

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

#### GOOGLE_CLIENT_SECRET
Google OAuth client secret.

```env
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Setup Instructions:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

#### APPLE_CLIENT_ID
Apple Sign In service ID.

```env
APPLE_CLIENT_ID=com.ivory.signin
```

#### APPLE_CLIENT_SECRET
Apple Sign In client secret (JWT).

```env
APPLE_CLIENT_SECRET=your-jwt-token
```

**Setup Instructions:**
1. Go to [Apple Developer](https://developer.apple.com)
2. Create an App ID
3. Enable Sign in with Apple
4. Create a Service ID
5. Generate a private key

---

## Environment-Specific Configurations

### Development (.env.local)
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=dev-secret-not-for-production
```

### Production (.env.production)
```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://ivory.app
NODE_ENV=production
JWT_SECRET=<secure-random-string>
NEXTAUTH_SECRET=<secure-random-string>
# ... all other production credentials
```

---

## Security Best Practices

1. **Never commit `.env.local` or `.env.production`** to version control
2. **Use different secrets** for development and production
3. **Rotate secrets regularly** in production
4. **Use environment variables** in your deployment platform (Vercel, Railway, etc.)
5. **Generate strong secrets** using `openssl rand -base64 32`
6. **Restrict API keys** to specific domains/IPs when possible

---

## Troubleshooting

### "DATABASE_URL is not set"
- Make sure `.env.local` exists in the root directory
- Check that the variable name is exactly `DATABASE_URL`
- Restart your development server after adding the variable

### "Failed to connect to database"
- Verify your Neon connection string is correct
- Check that your IP is allowed in Neon's settings
- Ensure the database exists

### Environment variables not updating
- Restart your Next.js development server
- Clear `.next` cache: `rm -rf .next`
- Check that you're editing `.env.local` not `.env.example`

---

## Deployment

### Vercel
1. Go to your project settings
2. Navigate to Environment Variables
3. Add all required variables
4. Redeploy your application

### Railway
1. Go to your project
2. Click on Variables
3. Add all required variables
4. Railway will automatically redeploy

### Docker
Create a `.env` file or pass variables via `-e` flags:
```bash
docker run -e DATABASE_URL=postgresql://... ivory-app
```

---

## Need Help?

- Check the [Setup Guide](../SETUP.md)
- Review the [Database Documentation](../db/README.md)
- Open an issue on GitHub
