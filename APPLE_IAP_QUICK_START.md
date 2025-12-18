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

### 1. App Store Connect Configuration
- [ ] Create subscription products (Pro, Business)
- [ ] Create consumable products (credit packages)
- [ ] Get IAP Shared Secret
- [ ] Add to `.env`: `APPLE_IAP_SHARED_SECRET=your_secret`

### 2. Xcode Setup
- [ ] Add `IAPPlugin.swift` to project
- [ ] Add StoreKit framework
- [ ] Register plugin in `capacitor.config.ts`
- [ ] Build and test

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

**Subscriptions (Auto-Renewable):**
- `com.ivory.pro.monthly` - $9.99/month (20 credits)
- `com.ivory.business.monthly` - $29.99/month (50 credits)

**Credits (Consumable):**
- `com.ivory.credits.5` - $4.99 (5 credits)
- `com.ivory.credits.10` - $8.99 (10 credits)
- `com.ivory.credits.25` - $19.99 (25 credits)
- `com.ivory.credits.50` - $34.99 (50 credits)
- `com.ivory.credits.100` - $59.99 (100 credits)

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
