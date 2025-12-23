# In-App Purchase Cross-Platform Verification

## Overview
This document verifies that In-App Purchases (IAP) work correctly across all device types: iPhone, iPad, Mac, and Apple Watch.

---

## Current Implementation Status

### ✅ Subscriptions (IAP Enabled)
**File:** `components/subscription-plans.tsx`

**Platform Detection:**
```typescript
const isNative = Capacitor.isNativePlatform();

// Routes to appropriate payment method
if (isNative) {
  return handleSubscribeIAP(planId); // Apple IAP
} else {
  return handleSubscribeStripe(planId); // Stripe Checkout
}
```

**Supported Devices:**
- ✅ iPhone (native app) - Uses Apple IAP
- ✅ iPad (native app) - Uses Apple IAP
- ✅ iPhone (Safari web) - Uses Stripe
- ✅ iPad (Safari web) - Uses Stripe
- ✅ Mac (Safari/Chrome web) - Uses Stripe

**IAP Products:**
- `com.yourcompany.ivory.business2` - Pro Monthly ($20/month for clients)
- `com.yourcompany.ivory.pro` - Business Monthly ($60/month for techs)

---

### ⚠️ Credit Packages (IAP Partially Implemented)
**File:** `components/buy-credits-dialog.tsx`

**Current Status:**
- ✅ Works on web (Stripe Checkout)
- ❌ **NOT IMPLEMENTED** for native iOS app (no IAP support)

**Issue:**
The buy-credits-dialog only uses Stripe and doesn't detect platform or route to IAP for native apps.

**Impact:**
- Users on native iOS app cannot purchase credit packages
- Only subscriptions work via IAP
- Credit packages only work on web

---

## Platform-Specific Behavior

### Native iOS App (iPhone/iPad)

#### Subscriptions ✅
1. User taps "Subscribe to Pro"
2. `Capacitor.isNativePlatform()` returns `true`
3. Routes to `handleSubscribeIAP()`
4. Calls `iapManager.purchase(productId)`
5. iOS payment sheet appears
6. User completes purchase
7. Receipt validated with `/api/iap/validate-receipt`
8. Credits added to account

#### Credit Packages ❌
1. User taps credit package
2. Opens `BuyCreditsDialog`
3. **PROBLEM:** Always uses Stripe, even on native
4. Redirects to Stripe Checkout (opens in browser)
5. **BAD UX:** User leaves app, payment in browser
6. **VIOLATES APPLE POLICY:** Should use IAP

### Web (Safari/Chrome on any device)

#### Subscriptions ✅
1. User clicks "Subscribe to Pro"
2. `Capacitor.isNativePlatform()` returns `false`
3. Routes to `handleSubscribeStripe()`
4. Redirects to Stripe Checkout
5. User completes payment
6. Redirects back to app
7. Subscription activated

#### Credit Packages ✅
1. User clicks credit package
2. Opens `BuyCreditsDialog`
3. Uses Stripe Checkout
4. User completes payment
5. Credits added to account

---

## Required Fixes

### Fix #1: Add IAP Support to Credit Packages

**File to Modify:** `components/buy-credits-dialog.tsx`

**Changes Needed:**
1. Import Capacitor and iapManager
2. Detect platform with `Capacitor.isNativePlatform()`
3. Add IAP product IDs for credit packages
4. Route to IAP for native, Stripe for web
5. Handle IAP purchase flow
6. Validate receipts with server

**IAP Product IDs Needed:**
```typescript
// Already defined in lib/iap.ts
CREDITS_5: 'com.yourcompany.ivory.credits.5',
CREDITS_10: 'com.yourcompany.ivory.credits.10',
CREDITS_25: 'com.yourcompany.ivory.credits.25',
CREDITS_50: 'com.yourcompany.ivory.credits.50',
CREDITS_100: 'com.yourcompany.ivory.credits.100',
```

### Fix #2: Update Buy Credits Dialog

**Current Code:**
```typescript
const handlePurchase = async (packageId: string) => {
  // Always uses Stripe
  const response = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ packageId }),
  });
  // ...
}
```

**Fixed Code:**
```typescript
const isNative = Capacitor.isNativePlatform();

const handlePurchase = async (packageId: string) => {
  if (isNative) {
    return handlePurchaseIAP(packageId); // Use Apple IAP
  }
  return handlePurchaseStripe(packageId); // Use Stripe
}

const handlePurchaseIAP = async (packageId: string) => {
  // Map packageId to IAP product ID
  const productId = IAP_PRODUCT_IDS[`CREDITS_${credits}`];
  await iapManager.purchase(productId);
  // Handle via IAP listeners
}

const handlePurchaseStripe = async (packageId: string) => {
  // Existing Stripe logic
}
```

---

## Testing Checklist

### iPhone (Native App)

#### Subscriptions
- [ ] Open billing page
- [ ] Tap "Subscribe to Pro"
- [ ] iOS payment sheet appears
- [ ] Complete purchase
- [ ] Subscription activated
- [ ] Credits added

#### Credit Packages
- [ ] Open billing page
- [ ] Navigate to "Buy Credits" tab
- [ ] Tap credit package
- [ ] iOS payment sheet appears (NOT browser)
- [ ] Complete purchase
- [ ] Credits added immediately

### iPad (Native App)

#### Subscriptions
- [ ] Test in portrait mode
- [ ] Test in landscape mode
- [ ] iOS payment sheet appears
- [ ] Purchase completes successfully

#### Credit Packages
- [ ] Test in portrait mode
- [ ] Test in landscape mode
- [ ] iOS payment sheet appears (NOT browser)
- [ ] Purchase completes successfully

### iPhone/iPad (Safari Web)

#### Subscriptions
- [ ] Click "Subscribe to Pro"
- [ ] Redirects to Stripe Checkout
- [ ] Complete payment
- [ ] Redirects back to app
- [ ] Subscription activated

#### Credit Packages
- [ ] Click credit package
- [ ] Redirects to Stripe Checkout
- [ ] Complete payment
- [ ] Redirects back to app
- [ ] Credits added

### Mac (Safari/Chrome Web)

#### Subscriptions
- [ ] Click "Subscribe to Pro"
- [ ] Redirects to Stripe Checkout
- [ ] Complete payment
- [ ] Subscription activated

#### Credit Packages
- [ ] Click credit package
- [ ] Redirects to Stripe Checkout
- [ ] Complete payment
- [ ] Credits added

---

## Apple Watch Considerations

### Current Status
Apple Watch app exists but payment functionality is limited.

### Recommendations
1. **Display Only:** Show subscription status and credit balance
2. **No Purchases:** Don't allow purchases on Watch
3. **Redirect to iPhone:** Prompt user to use iPhone for purchases

**Reason:** Apple Watch screen is too small for payment flows, and Apple recommends handling purchases on iPhone/iPad.

---

## App Store Connect Configuration

### Required IAP Products

#### Subscriptions (Already Configured)
1. **Pro Monthly** - `com.yourcompany.ivory.business2`
   - Type: Auto-Renewable Subscription
   - Price: $19.99/month
   - For: Client users

2. **Business Monthly** - `com.yourcompany.ivory.pro`
   - Type: Auto-Renewable Subscription
   - Price: $59.99/month
   - For: Tech users

#### Credit Packages (Need to Configure)
1. **5 Credits** - `com.yourcompany.ivory.credits.5`
   - Type: Consumable
   - Price: $4.99

2. **10 Credits** - `com.yourcompany.ivory.credits.10`
   - Type: Consumable
   - Price: $8.99

3. **25 Credits** - `com.yourcompany.ivory.credits.25`
   - Type: Consumable
   - Price: $19.99

4. **50 Credits** - `com.yourcompany.ivory.credits.50`
   - Type: Consumable
   - Price: $34.99

5. **100 Credits** - `com.yourcompany.ivory.credits.100`
   - Type: Consumable
   - Price: $59.99

---

## Implementation Priority

### High Priority ⚠️
1. **Add IAP to Credit Packages**
   - Required for Apple App Store compliance
   - Native iOS users cannot buy credits currently
   - Violates Apple's IAP policy

### Medium Priority
2. **Test on All Devices**
   - Verify IAP works on iPhone
   - Verify IAP works on iPad
   - Verify Stripe works on web

### Low Priority
3. **Apple Watch Display**
   - Show subscription status
   - Show credit balance
   - Redirect to iPhone for purchases

---

## Code Changes Required

### 1. Update `components/buy-credits-dialog.tsx`

Add platform detection and IAP support:

```typescript
import { Capacitor } from '@capacitor/core';
import { iapManager, IAP_PRODUCT_IDS, PRODUCT_CREDITS } from '@/lib/iap';

export function BuyCreditsDialog({ children }: BuyCreditsDialogProps) {
  const isNative = Capacitor.isNativePlatform();
  
  useEffect(() => {
    if (isNative) {
      setupIAPListeners();
    }
  }, [isNative]);
  
  const handlePurchase = async (packageId: string) => {
    if (isNative) {
      return handlePurchaseIAP(packageId);
    }
    return handlePurchaseStripe(packageId);
  };
  
  // ... rest of implementation
}
```

### 2. Update `/api/iap/validate-receipt`

Ensure it handles both subscriptions and consumable credit packages:

```typescript
// Check if it's a subscription or consumable
if (PRODUCT_TIERS[productId]) {
  // Handle subscription
} else if (PRODUCT_CREDITS[productId]) {
  // Handle credit package
  const credits = PRODUCT_CREDITS[productId];
  // Add credits to user account
}
```

---

## Summary

### Current Status
- ✅ Subscriptions work on all platforms
- ✅ Credit packages work on web
- ❌ Credit packages DON'T work on native iOS

### Action Required
1. Add IAP support to `buy-credits-dialog.tsx`
2. Configure credit package products in App Store Connect
3. Test on iPhone and iPad
4. Verify Stripe still works on web

### Timeline
- **Critical:** Must be fixed before App Store submission
- **Reason:** Apple requires IAP for digital goods in native apps
- **Impact:** Without this, app will be rejected

---

## Resources

- `lib/iap.ts` - IAP manager and product IDs
- `components/subscription-plans.tsx` - Working IAP example
- `app/api/iap/validate-receipt/route.ts` - Receipt validation
- `APPLE_IAP_IMPLEMENTATION.md` - IAP setup guide
- `APPLE_IAP_QUICK_START.md` - Quick reference

---

## Contact

If you need help implementing IAP for credit packages, refer to the working implementation in `subscription-plans.tsx` as a template.
