# Referral System Fix

## Problem
When users signed up via OAuth (Google or Apple) using a referral link, the referral code was not being tracked, so the referrer didn't receive credit for the referral.

## Root Cause
The OAuth callbacks (`app/api/auth/callback/google/route.ts` and `app/api/auth/callback/apple/route.ts`) were not handling referral codes at all. When users clicked "Sign in with Google" or "Sign in with Apple" from a referral link, the referral code was lost during the OAuth redirect flow.

## Solution
Implemented a cookie-based approach to persist the referral code across the OAuth flow:

### Changes Made

1. **Landing Page (`app/page.tsx`)**
   - When a referral code is detected in the URL (`?ref=CODE`), it's now stored in a cookie
   - The cookie expires after 10 minutes (enough time for OAuth flow)
   - Cookie is set before redirecting to OAuth providers

2. **Google OAuth Callback (`app/api/auth/callback/google/route.ts`)**
   - Added logic to read referral code from cookie
   - When creating a new user, checks if referral code is valid
   - Creates referral record and awards credits to referrer (1 credit per 3 referrals)
   - Clears the referral cookie after processing

3. **Apple OAuth Callback (`app/api/auth/callback/apple/route.ts`)**
   - Same changes as Google OAuth callback
   - Reads referral code from cookie
   - Processes referrals and awards credits
   - Clears the referral cookie after processing

## How It Works

1. User visits referral link: `https://yourapp.com/?ref=ABC123`
2. Referral code is stored in cookie: `pendingReferralCode=ABC123`
3. User clicks "Sign in with Google" or "Sign in with Apple"
4. OAuth flow completes and redirects back to callback
5. Callback reads referral code from cookie
6. New user is created with `referredBy` field set
7. Referral record is created in database
8. If referrer has 3+ unawardedeferrals, they get 1 credit
9. Cookie is cleared

## Testing

To test the fix:

1. Get your referral code from Settings > Credits
2. Share link: `https://yourapp.com/?ref=YOUR_CODE`
3. Have someone sign up using Google or Apple OAuth
4. Check your credits - you should see the referral tracked
5. After 3 referrals, you should receive 1 credit

## Database Schema

The system uses these tables:
- `users.referralCode` - User's unique referral code
- `users.referredBy` - ID of user who referred them
- `referrals` - Tracks each referral relationship
- `creditTransactions` - Logs all credit changes

## Credit Award Logic

- Users get 5 free credits on signup
- Referrers get 1 credit for every 3 successful referrals
- Credits are awarded automatically when the 3rd referral signs up
