// Server-only Stripe initialization
// DO NOT import this file in client components!
// Use lib/stripe-config.ts for client-safe exports

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Re-export client-safe utilities
export { CREDIT_PACKAGES, getCreditPackage, type CreditPackage } from './stripe-config';
