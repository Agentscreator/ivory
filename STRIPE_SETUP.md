# Stripe Payment Integration Setup

## Overview

The app now supports purchasing credits via Stripe with Apple Pay, Cash App, and Credit Card payment methods.

## Features

- **Multiple Payment Methods**: Credit Card, Apple Pay, and Cash App Pay
- **4 Credit Packages**: 10, 25, 50, and 100 credits with volume discounts
- **Secure Checkout**: Powered by Stripe Checkout with 3D Secure support
- **Instant Delivery**: Credits are automatically added after successful payment
- **Transaction History**: All purchases are logged in credit history

## Credit Packages

| Package | Credits | Price | Savings |
|---------|---------|-------|---------|
| Starter | 10 | $4.99 | - |
| Popular | 25 | $9.99 | 20% |
| Value | 50 | $16.99 | 32% |
| Best Value | 100 | $29.99 | 40% |

## Setup Instructions

### 1. Stripe Dashboard Configuration

#### Enable Payment Methods

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Settings** → **Payment methods**
3. Enable the following:
   - ✅ **Cards** (Visa, Mastercard, Amex, etc.)
   - ✅ **Apple Pay**
   - ✅ **Cash App Pay**

#### Configure Webhook

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://ivory-blond.vercel.app/api/stripe/webhook
   ```
4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### 2. Environment Variables

Add the webhook secret to your environment files:

```bash
# .env.local and .env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret_here
```

The other Stripe keys are already configured:
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_PUBLISHABLE_KEY`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 3. Deploy to Vercel

After adding the webhook secret:

```bash
git add .
git commit -m "Add Stripe payment integration"
git push
```

Then add the environment variable in Vercel:
1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add `STRIPE_WEBHOOK_SECRET` with your webhook signing secret
4. Redeploy the application

### 4. Test the Integration

#### Test Mode (Development)

1. Use Stripe test keys for development
2. Test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
3. Use any future expiry date and any CVC

#### Live Mode (Production)

1. Make a small test purchase with real payment
2. Verify credits are added to your account
3. Check transaction appears in credit history
4. Verify webhook is receiving events in Stripe Dashboard

## Implementation Details

### Files Created

1. **`lib/stripe.ts`**
   - Stripe client initialization
   - Credit package definitions
   - Helper functions

2. **`app/api/stripe/create-checkout/route.ts`**
   - Creates Stripe Checkout session
   - Handles user authentication
   - Configures payment methods

3. **`app/api/stripe/webhook/route.ts`**
   - Processes Stripe webhook events
   - Adds credits on successful payment
   - Logs transactions

4. **`components/buy-credits-dialog.tsx`**
   - Credit package selection UI
   - Stripe Checkout integration
   - Payment method icons

### Payment Flow

1. User clicks "Buy Credits" button
2. Selects a credit package
3. Redirected to Stripe Checkout
4. Completes payment with Card/Apple Pay/Cash App
5. Stripe sends webhook to `/api/stripe/webhook`
6. Credits are automatically added to user account
7. User redirected back with success message

### Security Features

- ✅ Webhook signature verification
- ✅ 3D Secure authentication
- ✅ User authentication required
- ✅ Secure token handling
- ✅ Metadata validation

## Usage

### In Your App

The buy credits dialog is already integrated in the credits page:

```tsx
import { BuyCreditsDialog } from '@/components/buy-credits-dialog';

// Default button
<BuyCreditsDialog />

// Custom trigger
<BuyCreditsDialog>
  <Button variant="outline">Purchase Credits</Button>
</BuyCreditsDialog>
```

### Credit Packages Configuration

Edit `lib/stripe.ts` to modify packages:

```typescript
export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    name: '10 Credits',
    credits: 10,
    price: 499, // $4.99 in cents
    popular: false,
  },
  // Add more packages...
];
```

## Monitoring

### Stripe Dashboard

Monitor payments in real-time:
- **Payments**: View all transactions
- **Customers**: See customer payment history
- **Webhooks**: Check webhook delivery status
- **Logs**: Debug webhook events

### Application Logs

Check Vercel logs for:
- Checkout session creation
- Webhook processing
- Credit additions
- Error handling

## Troubleshooting

### Credits Not Added After Payment

1. Check webhook is configured correctly
2. Verify webhook secret matches
3. Check Vercel logs for errors
4. Ensure webhook events are being received

### Payment Method Not Showing

1. Verify payment method is enabled in Stripe Dashboard
2. Check if payment method is available in your country
3. Apple Pay requires HTTPS and proper domain verification

### Webhook Signature Verification Failed

1. Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
2. Check webhook endpoint URL is correct
3. Verify webhook is using the correct API version

## Apple Pay Domain Verification

For Apple Pay to work on your domain:

1. Go to Stripe Dashboard → **Settings** → **Payment methods**
2. Click on **Apple Pay** → **Add domain**
3. Add your domain: `ivory-blond.vercel.app`
4. Download the verification file
5. Place it at: `public/.well-known/apple-developer-merchantid-domain-association`
6. Verify the domain in Stripe Dashboard

## Next Steps

- [ ] Set up webhook secret in environment variables
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Enable desired payment methods
- [ ] Test with Stripe test mode
- [ ] Verify Apple Pay domain
- [ ] Deploy to production
- [ ] Test with real payment
- [ ] Monitor webhook events

## Support

For issues:
- Check [Stripe Documentation](https://stripe.com/docs)
- Review [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- Contact Stripe Support for payment issues
