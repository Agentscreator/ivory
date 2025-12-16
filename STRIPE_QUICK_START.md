# Stripe Payment - Quick Start

## What's New

Users can now purchase credits using:
- 💳 Credit/Debit Cards
- 🍎 Apple Pay
- 💵 Cash App Pay

## Quick Setup (5 minutes)

### 1. Get Webhook Secret

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://ivory-blond.vercel.app/api/stripe/webhook`
4. Events: Select `checkout.session.completed` and `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

### 2. Add to Environment

Add to `.env.local` and `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### 3. Deploy

```bash
git add .
git commit -m "Add Stripe payment integration"
git push
```

Add `STRIPE_WEBHOOK_SECRET` to Vercel environment variables and redeploy.

### 4. Test

1. Go to `/settings/credits`
2. Click "Buy Credits"
3. Select a package
4. Complete test payment
5. Verify credits are added

## Credit Packages

- **10 Credits** - $4.99
- **25 Credits** - $9.99 (Save 20%) ⭐ Most Popular
- **50 Credits** - $16.99 (Save 32%)
- **100 Credits** - $29.99 (Save 40%)

## Files Added

- `lib/stripe.ts` - Stripe configuration
- `app/api/stripe/create-checkout/route.ts` - Create payment session
- `app/api/stripe/webhook/route.ts` - Process payments
- `components/buy-credits-dialog.tsx` - Purchase UI

## How It Works

1. User selects credit package
2. Redirected to Stripe Checkout
3. Completes payment
4. Webhook adds credits automatically
5. User sees success message

## Support

See `STRIPE_SETUP.md` for detailed documentation.
