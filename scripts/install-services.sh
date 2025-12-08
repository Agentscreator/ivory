#!/bin/bash

# Installation script for optional Ivory services
# Run this to install dependencies for the services you want to use

echo "🎨 Ivory Services Installation"
echo "=============================="
echo ""

# Storage Services
echo "📦 Storage Services"
echo "Choose your storage provider:"
echo "1) Vercel Blob (recommended for Vercel)"
echo "2) Cloudflare R2 / Backblaze B2 (S3-compatible)"
echo "3) Skip storage setup"
read -p "Enter choice (1-3): " storage_choice

case $storage_choice in
  1)
    echo "Installing Vercel Blob..."
    yarn add @vercel/blob
    ;;
  2)
    echo "Installing AWS SDK for S3-compatible storage..."
    yarn add @aws-sdk/client-s3
    ;;
  3)
    echo "Skipping storage setup"
    ;;
esac

echo ""

# AI Services
echo "🤖 AI Generation"
read -p "Install OpenAI for AI nail design generation? (y/n): " ai_choice

if [ "$ai_choice" = "y" ]; then
  echo "Installing OpenAI..."
  yarn add openai
fi

echo ""

# Email Services
echo "📧 Email Services"
read -p "Install Resend for email notifications? (y/n): " email_choice

if [ "$email_choice" = "y" ]; then
  echo "Installing Resend..."
  yarn add resend
fi

echo ""

# Optional: Nodemailer for SMTP
read -p "Install Nodemailer for SMTP email? (y/n): " smtp_choice

if [ "$smtp_choice" = "y" ]; then
  echo "Installing Nodemailer..."
  yarn add nodemailer
  yarn add -D @types/nodemailer
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Configure your services in .env.local"
echo "2. See docs/SERVICES.md for setup instructions"
echo "3. See docs/ENVIRONMENT.md for environment variables"
