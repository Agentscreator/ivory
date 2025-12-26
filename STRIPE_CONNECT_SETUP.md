# Stripe Connect Setup Guide

## Issue

When trying to setup the payout wallet, you're seeing this error:

> "You can only create new accounts if you've signed up for Connect"

This means Stripe Connect hasn't been enabled on your Stripe account yet.

## Solution

### Step 1: Enable Stripe Connect

1. **Login to Stripe Dashboard**
   - Go to https://dashboard.stripe.com
   - Login with your Stripe account

2. **Navigate to Connect**
   - Click "Connect" in the left sidebar
   - Or go directly to: https://dashboard.stripe.com/connect/accounts/overview

3. **Get Started with Connect**
   - Click "Get started" button
   - Fill out the platform information form:
     - **Platform name**: Ivory (or your app name)
     - **Platform description**: Nail design marketplace connecting clients with nail techs
     - **Platform website**: https://www.ivoryschoice.com
     - **Support email**: Your support email

4. **Accept Terms**
   - Review and accept Stripe Connect's terms of service
   - Complete any additional verification steps

5. **Wait for Approval**
   - Stripe may review your application (usually instant for most accounts)
   - You'll receive an email when approved

### Step 2: Verify Connect is Enabled

1. Go to https://dashboard.stripe.com/settings/connect
2. You should see "Connect" settings with options for:
   - Branding
   - OAuth settings
   - Webhooks
   - etc.

### Step 3: Test the Wallet Setup

1. Go to your app's tech settings page
2. Click "Setup Wallet" in the Payouts section
3. You should now be redirected to Stripe's onboarding flow
4. Complete the onboarding to activate your test wallet

## What is Stripe Connect?

Stripe Connect allows your platform to:
- Create Stripe accounts for your users (nail techs)
- Process payments on their behalf
- Automatically split payments (platform fee + tech payout)
- Handle payouts to tech bank accounts

## Platform Fee Structure

- **Service Fee**: 12.5% of each booking
- **Tech Receives**: 87.5% of service price
- **Example**: $80 service → $10 platform fee, $70 to tech

## Important Notes

### For Development/Testing

- Use Stripe **Test Mode** for development
- Enable Connect in test mode first
- Test with test bank accounts and cards

### For Production

- Enable Connect in **Live Mode** before launching
- Complete all verification requirements
- Set up proper webhook endpoints

## Troubleshooting

### "Connect not enabled" error persists

1. Make sure you're in the correct Stripe mode (Test vs Live)
2. Check that Connect is enabled in the mode you're using
3. Try logging out and back into Stripe Dashboard
4. Contact Stripe support if issues persist

### Can't find Connect in Dashboard

- Some older Stripe accounts may need to request Connect access
- Contact Stripe support to enable Connect for your account

### Verification Required

- Stripe may require additional business verification
- Provide requested documents promptly
- This is normal for platforms handling payments

## Environment Variables

Make sure these are set correctly:

```env
# Use test keys for development
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Use live keys for production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Webhook secret (get from Stripe Dashboard → Developers → Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Next Steps

Once Stripe Connect is enabled:

1. ✅ Nail techs can setup their payout wallets
2. ✅ Clients can book appointments with IAP
3. ✅ Payments automatically split between platform and tech
4. ✅ Techs receive payouts to their bank accounts

## Support

- **Stripe Documentation**: https://stripe.com/docs/connect
- **Stripe Support**: https://support.stripe.com
- **Your Support**: Contact your development team

## Additional Resources

- [Stripe Connect Overview](https://stripe.com/docs/connect)
- [Express Accounts](https://stripe.com/docs/connect/express-accounts)
- [Testing Connect](https://stripe.com/docs/connect/testing)
- [Connect Webhooks](https://stripe.com/docs/connect/webhooks)
