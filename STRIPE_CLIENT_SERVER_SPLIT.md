# Stripe Client/Server Code Split ✅

## Problem Fixed

**Error:** `STRIPE_SECRET_KEY is not set` appearing in browser console

**Cause:** Client components were importing `lib/stripe.ts`, which contains server-only Stripe initialization code. This caused the secret key check to run in the browser bundle.

## Solution

Split Stripe code into two files:

### 1. `lib/stripe-config.ts` (Client-Safe)
**Can be imported anywhere** - client or server

Contains:
- `CREDIT_PACKAGES` - Package definitions
- `getCreditPackage()` - Helper function
- `CreditPackage` type

**Used by:**
- `components/buy-credits-dialog.tsx`
- `app/billing/page.tsx`
- Any client component that needs package info

### 2. `lib/stripe.ts` (Server-Only)
**Only import in API routes** - never in client components

Contains:
- Stripe client initialization
- `stripe` instance with secret key
- Re-exports from `stripe-config.ts` for convenience

**Used by:**
- `app/api/stripe/create-checkout/route.ts`
- `app/api/stripe/webhook/route.ts`
- Server-side code only

## File Structure

```
lib/
├── stripe-config.ts    ← Client-safe (packages, types)
└── stripe.ts           ← Server-only (Stripe instance)
```

## Import Rules

### ✅ Client Components
```typescript
// Good - client-safe
import { CREDIT_PACKAGES } from '@/lib/stripe-config';
```

### ❌ Client Components
```typescript
// Bad - will cause error
import { CREDIT_PACKAGES } from '@/lib/stripe';
```

### ✅ API Routes (Server)
```typescript
// Good - can use either
import { stripe, getCreditPackage } from '@/lib/stripe';
// or
import { CREDIT_PACKAGES } from '@/lib/stripe-config';
```

## What Changed

### Before (Broken)
```typescript
// lib/stripe.ts - Everything in one file
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set'); // ❌ Runs in browser!
}

export const stripe = new Stripe(...);
export const CREDIT_PACKAGES = [...];
```

```typescript
// components/buy-credits-dialog.tsx
import { CREDIT_PACKAGES } from '@/lib/stripe'; // ❌ Imports server code!
```

### After (Fixed)
```typescript
// lib/stripe-config.ts - Client-safe
export const CREDIT_PACKAGES = [...]; // ✅ No server code
```

```typescript
// lib/stripe.ts - Server-only
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set'); // ✅ Only runs on server
}

export const stripe = new Stripe(...);
export { CREDIT_PACKAGES } from './stripe-config'; // Re-export for convenience
```

```typescript
// components/buy-credits-dialog.tsx
import { CREDIT_PACKAGES } from '@/lib/stripe-config'; // ✅ Client-safe!
```

## Benefits

✅ **No secret key in browser** - Stripe secret stays on server  
✅ **Smaller client bundle** - No Stripe SDK in browser  
✅ **Type safety maintained** - Same types everywhere  
✅ **Convenient imports** - Server code can still import from `stripe.ts`  
✅ **Clear separation** - Easy to see what's client vs server  

## Security

### Before
- ❌ Stripe initialization code in client bundle
- ❌ Secret key check runs in browser
- ❌ Larger attack surface

### After
- ✅ Stripe initialization only on server
- ✅ Secret key never touches browser
- ✅ Minimal client code

## Testing

### Verify Fix Locally
```bash
# Build the app
yarn build

# Check for Stripe in client bundle
# Should NOT see STRIPE_SECRET_KEY error in browser console
yarn start
```

### Verify in Production
1. Deploy to Vercel
2. Open browser console
3. Should NOT see "STRIPE_SECRET_KEY is not set" error
4. Payment flow should work normally

## Common Mistakes to Avoid

### ❌ Don't Do This
```typescript
// Client component
'use client';
import { stripe } from '@/lib/stripe'; // ❌ Server-only!
```

### ✅ Do This Instead
```typescript
// Client component
'use client';
import { CREDIT_PACKAGES } from '@/lib/stripe-config'; // ✅ Client-safe!

// Make API call to server
const response = await fetch('/api/stripe/create-checkout', {
  method: 'POST',
  body: JSON.stringify({ packageId }),
});
```

## Files Modified

- ✅ Created `lib/stripe-config.ts` - Client-safe exports
- ✅ Updated `lib/stripe.ts` - Server-only, re-exports config
- ✅ Updated `app/billing/page.tsx` - Import from config
- ✅ Updated `components/buy-credits-dialog.tsx` - Import from config
- ✅ API routes unchanged - Still work with `lib/stripe.ts`

## Summary

The Stripe code is now properly split:
- **Client components** use `lib/stripe-config.ts`
- **Server routes** use `lib/stripe.ts`
- **Secret keys** never reach the browser
- **Everything works** as before, but securely

No more "STRIPE_SECRET_KEY is not set" errors in the browser! 🎉
