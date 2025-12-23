# Apple IAP Quick Start Guide

## Critical: This fixes App Store rejection 3.1.1

Apple rejected the app because it uses Stripe for digital content purchases. This implementation uses Apple's In-App Purchase (IAP) for iOS while keeping Stripe for web.

## What Changed

### ✅ iOS App (Native)
- Uses Apple In-App Purchase (StoreKit)
- Subscriptions managed through iOS Settings
- Credits purchased through Apple
- 30% goes to Apple (standard)

### ✅ Web App (Browser)
- Uses Stripe (unchanged)
- Full payment flexibility
- No Apple commission

### ✅ Bookings (All Platforms)
- Uses Stripe (physical services exempt from IAP)
- Direct payment to nail techs
- No changes needed

## Setup Checklist

### 1. Code Implementation ✅ COMPLETE
- [x] Swift IAP plugin created (`IAPPlugin.swift`)
- [x] TypeScript bridge implemented (`lib/iap.ts`)
- [x] Receipt validation API created
- [x] UI updated for platform detection
- [x] Plugin registered in `capacitor.config.ts`
- [x] TypeScript errors resolved

### 2. App Store Connect Configuration (YOU NEED TO DO)
- [ ] Create subscription products (Pro, Business)
- [ ] Create consumable products (credit packages)
- [ ] Get IAP Shared Secret
- [ ] Add to `.env`: `APPLE_IAP_SHARED_SECRET=your_secret`

### 3. Xcode Setup (YOU NEED TO DO)
- [ ] Add `IAPPlugin.swift` to Xcode project
- [ ] Add StoreKit framework
- [ ] Build and test
- [ ] Resolve "Missing package product 'CapApp-SPM'" error

### 3. Testing
- [ ] Create sandbox test account
- [ ] Test subscription purchase
- [ ] Test credit purchase
- [ ] Test restore purchases
- [ ] Verify receipt validation

### 4. Submission
- [ ] Mention IAP in review notes
- [ ] Provide test account credentials
- [ ] Submit for review

## Product IDs

Configure these exact IDs in App Store Connect:

**Client Subscriptions (Auto-Renewable):**
- `com.yourcompany.ivory.business2` - $20/month (20 credits + buy more)

**Tech Subscriptions (Auto-Renewable):**
- `com.yourcompany.ivory.pro` - $60/month (unlimited bookings)
  - First 5 bookings free, then subscription required

**Credits (Consumable - Clients Only):**
- `com.yourcompany.ivory.credits.5` - $4.99 (5 credits)
- `com.yourcompany.ivory.credits.10` - $8.99 (10 credits)
- `com.yourcompany.ivory.credits.25` - $19.99 (25 credits)
- `com.yourcompany.ivory.credits.50` - $34.99 (50 credits)
- `com.yourcompany.ivory.credits.100` - $59.99 (100 credits)

## Testing Flow

1. **Load Products**
   ```typescript
   const products = await iapManager.loadProducts();
   ```

2. **Purchase**
   ```typescript
   await iapManager.purchase('com.ivory.credits.10');
   ```

3. **Validate** (automatic)
   - Receipt sent to `/api/iap/validate-receipt`
   - Server validates with Apple
   - Credits granted
   - Transaction finished

4. **Restore**
   ```typescript
   await iapManager.restorePurchases();
   ```

## Important Notes

### Apple's 30% Commission
- Apple takes 30% of all IAP transactions
- Year 2+: 15% for subscriptions
- This is standard and required

### Subscription Management
- Users manage in iOS Settings → Apple ID → Subscriptions
- App can check status but can't cancel
- Renewals are automatic

### Receipt Validation
- Always validate server-side
- Never trust client
- Handle sandbox vs production
- Store transaction IDs

### Bookings Exception
- Physical services don't require IAP
- Nail appointments use Stripe
- This is compliant with Apple guidelines

## Troubleshooting

**"Cannot connect to iTunes Store"**
- Sign in to sandbox account in Settings
- Check internet connection

**"Invalid Product ID"**
- Verify IDs match App Store Connect exactly
- Ensure products are approved
- Check bundle ID

**Receipt Validation Fails**
- Verify shared secret is correct
- Check environment (sandbox vs production)
- Ensure receipt is base64 encoded

## Support

See `APPLE_IAP_IMPLEMENTATION.md` for detailed documentation.

For issues, check:
1. Xcode console for errors
2. App Store Connect configuration
3. Sandbox account status
4. Apple's IAP documentation
