# Apple In-App Purchase Implementation Guide

## Overview
This implementation uses Apple's StoreKit for iOS in-app purchases while keeping Stripe for web purchases. This ensures compliance with Apple's App Store guidelines (3.1.1).

## Architecture

### Platform Detection
- **iOS Native App**: Uses StoreKit (Apple IAP)
- **Web/Browser**: Uses Stripe
- **Bookings**: Always use Stripe (physical services are exempt from IAP requirement)

### Components

1. **iOS Plugin** (`ios/App/App/IAPPlugin.swift`)
   - Native Swift plugin using StoreKit
   - Handles product loading, purchases, and receipt validation
   - Observes transaction state changes

2. **TypeScript Bridge** (`lib/iap.ts`)
   - Capacitor plugin wrapper
   - Product ID definitions
   - Purchase flow management

3. **Server Validation** (`app/api/iap/validate-receipt/route.ts`)
   - Validates receipts with Apple servers
   - Grants credits/subscriptions
   - Prevents duplicate transactions

4. **Updated UI Components**
   - Billing page detects platform
   - Shows IAP flow on iOS
   - Shows Stripe flow on web

## Setup Steps

### 1. Configure Products in App Store Connect

Go to App Store Connect → Your App → Features → In-App Purchases

#### Create Subscriptions (Auto-Renewable)
1. **Pro Monthly**
   - Product ID: `com.ivory.pro.monthly`
   - Price: $9.99/month
   - Description: "20 credits per month + ability to buy more"

2. **Business Monthly**
   - Product ID: `com.ivory.business.monthly`
   - Price: $29.99/month
   - Description: "50 credits per month + ability to buy more"

#### Create Credit Packages (Consumable)
1. **5 Credits** - `com.ivory.credits.5` - $4.99
2. **10 Credits** - `com.ivory.credits.10` - $8.99
3. **25 Credits** - `com.ivory.credits.25` - $19.99
4. **50 Credits** - `com.ivory.credits.50` - $34.99
5. **100 Credits** - `com.ivory.credits.100` - $59.99

### 2. Get IAP Shared Secret

1. Go to App Store Connect → Your App → General → App Information
2. Scroll to "App-Specific Shared Secret"
3. Generate if not exists
4. Add to `.env`:
   ```
   APPLE_IAP_SHARED_SECRET=your_shared_secret_here
   ```

### 3. Register Plugin in Xcode

1. Open `ios/App/App.xcodeproj` in Xcode
2. Add `IAPPlugin.swift` to the project
3. Add StoreKit framework:
   - Select project → Target → General
   - Scroll to "Frameworks, Libraries, and Embedded Content"
   - Click + and add `StoreKit.framework`

4. Register plugin in `capacitor.config.ts`:
   ```typescript
   plugins: {
     IAPPlugin: {
       // No configuration needed
     }
   }
   ```

### 4. Update Info.plist

Add to `ios/App/App/Info.plist`:
```xml
<key>SKAdNetworkItems</key>
<array>
  <!-- Add if using ads, otherwise can be empty -->
</array>
```

### 5. Test in Sandbox

1. Create sandbox test user in App Store Connect:
   - Users and Access → Sandbox → Testers
   - Create new tester with unique email

2. On iOS device:
   - Settings → App Store → Sandbox Account
   - Sign in with test account

3. Test purchases:
   - Purchases won't charge real money
   - Can test multiple times
   - Receipts validate against sandbox

### 6. Production Checklist

- [ ] All products created in App Store Connect
- [ ] Products approved by Apple
- [ ] Shared secret added to environment variables
- [ ] Receipt validation endpoint tested
- [ ] Sandbox testing completed
- [ ] Production receipt validation URL configured
- [ ] Error handling tested
- [ ] Restore purchases tested

## Usage Flow

### For Users

1. **Open Billing Page**
   - iOS: Shows "Subscribe with Apple"
   - Web: Shows "Subscribe with Stripe"

2. **Select Plan/Credits**
   - iOS: Triggers StoreKit purchase sheet
   - Web: Redirects to Stripe Checkout

3. **Complete Purchase**
   - iOS: Face ID/Touch ID authentication
   - Web: Card payment

4. **Receive Credits**
   - Receipt validated server-side
   - Credits added to account
   - Transaction recorded

### For Developers

```typescript
import { iapManager } from '@/lib/iap';

// Load products
const products = await iapManager.loadProducts();

// Purchase
await iapManager.purchase('com.ivory.credits.10');

// Listen for completion
iapManager.onPurchaseComplete(async (result) => {
  // Validate with server
  const response = await fetch('/api/iap/validate-receipt', {
    method: 'POST',
    body: JSON.stringify({
      receipt: result.receipt,
      productId: result.productId,
      transactionId: result.transactionId,
    }),
  });
  
  // Finish transaction
  await iapManager.finishTransaction(result.transactionId);
});
```

## Important Notes

### Apple Guidelines Compliance

✅ **Allowed without IAP:**
- Physical goods/services (nail appointments)
- Content consumed outside the app
- B2B services

❌ **Requires IAP:**
- Digital content (AI-generated designs)
- App features/functionality
- Subscriptions for digital content

### Receipt Validation

- Always validate receipts server-side
- Never trust client-side validation
- Handle both production and sandbox environments
- Store transaction IDs to prevent duplicates

### Subscription Management

- Users manage subscriptions in iOS Settings
- App can check subscription status
- Handle subscription renewals automatically
- Support subscription cancellation

### Testing

- Use sandbox environment for testing
- Test all purchase flows
- Test restore purchases
- Test error scenarios
- Test receipt validation

## Troubleshooting

### "Cannot connect to iTunes Store"
- Check internet connection
- Verify sandbox account is signed in
- Try signing out and back in

### "Invalid Product ID"
- Verify product IDs match App Store Connect exactly
- Ensure products are approved
- Check bundle ID matches

### Receipt Validation Fails
- Check shared secret is correct
- Verify using correct environment (sandbox vs production)
- Check receipt data is base64 encoded

### Purchases Not Completing
- Check transaction observer is registered
- Verify finish transaction is called
- Check for pending transactions

## Support

For issues:
1. Check Xcode console for errors
2. Verify App Store Connect configuration
3. Test with sandbox account
4. Review Apple's IAP documentation

## Next Steps

After implementation:
1. Submit app for review
2. Mention IAP in review notes
3. Provide test account if needed
4. Monitor first purchases closely
