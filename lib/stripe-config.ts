// Client-safe Stripe configuration
// This file can be imported in both client and server code

// Subscription plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'pro',
    name: 'Pro',
    price: 2000, // $20/month in cents
    credits: 20,
    interval: 'month' as const,
    features: [
      '20 AI designs per month',
      'Priority support',
      'Advanced design tools',
      'Portfolio showcase',
      'Client booking system',
    ],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 6000, // $60/month in cents
    credits: 60,
    interval: 'month' as const,
    features: [
      '60 AI designs per month',
      'Everything in Pro',
      'Team collaboration tools',
      'Advanced analytics',
      'Priority design queue',
      'Custom branding',
      'API access',
    ],
    popular: false,
  },
] as const;

// One-time credit packages (for additional credits)
export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    name: '10 Credits',
    credits: 10,
    price: 999, // $9.99 in cents
    popular: false,
    savings: undefined,
  },
  {
    id: 'credits_25',
    name: '25 Credits',
    credits: 25,
    price: 1999, // $19.99 in cents
    popular: true,
    savings: '20%',
  },
  {
    id: 'credits_50',
    name: '50 Credits',
    credits: 50,
    price: 3499, // $34.99 in cents
    popular: false,
    savings: '30%',
  },
  {
    id: 'credits_100',
    name: '100 Credits',
    credits: 100,
    price: 5999, // $59.99 in cents
    popular: false,
    savings: '40%',
  },
] as const;

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[number];
export type CreditPackage = typeof CREDIT_PACKAGES[number];

export function getSubscriptionPlan(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
}

export function getCreditPackage(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
}
