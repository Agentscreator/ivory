// Email utilities using Resend
// Fallback to SMTP if Resend is not configured

import { env } from './env';

export type EmailProvider = 'resend' | 'smtp' | null;

// Detect which email provider is configured
export function getEmailProvider(): EmailProvider {
  if (env.RESEND_API_KEY) return 'resend';
  if (env.SMTP_HOST && env.SMTP_USER) return 'smtp';
  return null;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

// Send email using configured provider
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const provider = getEmailProvider();

  if (!provider) {
    console.warn('No email provider configured. Email not sent.');
    return;
  }

  const from = options.from || env.FROM_EMAIL || 'noreply@ivory.app';

  switch (provider) {
    case 'resend':
      await sendWithResend({ ...options, from });
      break;
    case 'smtp':
      await sendWithSMTP({ ...options, from });
      break;
  }
}

// Send email with Resend
async function sendWithResend(options: SendEmailOptions): Promise<void> {
  const { Resend } = await import('resend');
  const resend = new Resend(env.RESEND_API_KEY);

  await resend.emails.send({
    from: options.from!,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    text: options.text,
    reply_to: options.replyTo,
  });
}

// Send email with SMTP (using nodemailer)
async function sendWithSMTP(options: SendEmailOptions): Promise<void> {
  const nodemailer = await import('nodemailer');

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: options.from,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });
}

// Email templates
export const emailTemplates = {
  // Welcome email for new users
  welcome: (username: string) => ({
    subject: 'Welcome to Ivory!',
    html: `
      <h1>Welcome to Ivory, ${username}!</h1>
      <p>We're excited to have you join our community of nail art enthusiasts.</p>
      <p>Get started by creating your first nail design or browsing our gallery.</p>
      <a href="${env.BASE_URL}/home">Go to Ivory</a>
    `,
    text: `Welcome to Ivory, ${username}! We're excited to have you join our community.`,
  }),

  // Design request notification for nail techs
  designRequest: (techName: string, clientName: string, designUrl: string) => ({
    subject: 'New Design Request',
    html: `
      <h1>New Design Request</h1>
      <p>Hi ${techName},</p>
      <p>${clientName} has sent you a new nail design request.</p>
      <a href="${env.BASE_URL}/tech/dashboard">View Request</a>
    `,
    text: `Hi ${techName}, ${clientName} has sent you a new nail design request.`,
  }),

  // Request approved notification for clients
  requestApproved: (clientName: string, techName: string) => ({
    subject: 'Your Design Request Was Approved!',
    html: `
      <h1>Great News!</h1>
      <p>Hi ${clientName},</p>
      <p>${techName} has approved your nail design request.</p>
      <a href="${env.BASE_URL}/home">View Details</a>
    `,
    text: `Hi ${clientName}, ${techName} has approved your nail design request.`,
  }),

  // Password reset email
  passwordReset: (resetLink: string) => ({
    subject: 'Reset Your Password',
    html: `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    text: `Reset your password: ${resetLink}`,
  }),
};
