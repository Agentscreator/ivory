import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Credit packages available for purchase
export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    name: '10 Credits',
    credits: 10,
    price: 499, // $4.99 in cents
    popular: false,
    savings: undefined,
  },
  {
    id: 'credits_25',
    name: '25 Credits',
    credits: 25,
    price: 999, // $9.99 in cents
    popular: true,
    savings: '20%',
  },
  {
    id: 'credits_50',
    name: '50 Credits',
    credits: 50,
    price: 1699, // $16.99 in cents
    popular: false,
    savings: '32%',
  },
  {
    id: 'credits_100',
    name: '100 Credits',
    credits: 100,
    price: 2999, // $29.99 in cents
    popular: false,
    savings: '40%',
  },
] as const;

export type CreditPackage = typeof CREDIT_PACKAGES[number];

export function getCreditPackage(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
}
