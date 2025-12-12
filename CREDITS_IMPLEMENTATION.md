# Credits & Referral System Implementation

## Summary

Successfully implemented a complete credits and referral system for the nail design app.

## What Was Implemented

### 1. Database Schema Updates
- Added `credits`, `referralCode`, and `referredBy` fields to `users` table
- Created `referrals` table to track referral relationships
- Created `creditTransactions` table to log all credit activity
- Generated and applied database migrations

### 2. Credit System
- **Initial Credits**: New users get 8 free credits on signup
- **Credit Usage**: 1 credit deducted per AI design generation
- **Transaction Logging**: All credit changes are tracked with descriptions
- **Balance Checking**: Users can view current balance and history

### 3. Referral Program
- **Unique Codes**: Each user gets a unique referral code (10 characters)
- **Reward Structure**: 1 credit for every 3 successful referrals
- **Automatic Tracking**: System tracks referrals and awards credits automatically
- **Share Links**: Users can share referral links via native share or copy

### 4. API Endpoints Created
- `GET /api/credits/balance` - Get current balance
- `GET /api/credits/history` - Get transaction history
- `GET /api/referrals/stats` - Get referral statistics
- Updated `POST /api/auth/signup` - Handle referral codes
- Updated `POST /api/generate-nail-design` - Deduct credits

### 5. React Components & Hooks
- `<ReferralCard />` - Display referral stats and share functionality
- `<CreditsDisplay />` - Show current credit balance
- `<GenerateWithCreditsButton />` - Smart button with credit checking
- `useCredits()` hook - React hook for credit state management
- `/settings/credits` page - Complete credits management interface

### 6. Utility Functions
- `deductCredits()` - Safely deduct credits with validation
- `addCredits()` - Add credits to user accounts
- `getCreditsBalance()` - Query user's current balance

## How It Works

### Signup Flow
1. User signs up (optionally with referral code)
2. System creates account with 8 credits and unique referral code
3. If referred, creates referral record
4. Checks if referrer has 3+ pending referrals
5. Awards credit to referrer if threshold met

### Design Generation Flow
1. User requests design generation
2. System checks authentication
3. Deducts 1 credit (fails if insufficient)
4. Generates design
5. Returns design and new balance

### Referral Link Format
```
https://yourdomain.com/signup?ref=USER_REFERRAL_CODE
```

## Files Created/Modified

### Created
- `lib/credits.ts` - Credit management utilities
- `hooks/use-credits.ts` - React hook for credit state
- `components/referral-card.tsx` - Referral UI component
- `components/credits-display.tsx` - Balance display component
- `components/generate-with-credits-button.tsx` - Smart generation button
- `app/settings/credits/page.tsx` - Credits management page
- `app/api/credits/balance/route.ts` - Balance API
- `app/api/credits/history/route.ts` - History API
- `app/api/referrals/stats/route.ts` - Referral stats API
- `scripts/add-referral-codes.ts` - Migration script for existing users
- `docs/CREDITS_SYSTEM.md` - Complete documentation

### Modified
- `db/schema.ts` - Added credit tables and fields
- `app/api/auth/signup/route.ts` - Added referral handling
- `app/api/generate-nail-design/route.ts` - Added credit deduction
- `package.json` - Added nanoid dependency

## Next Steps

### To Use the System

1. **Database is already migrated** - Changes have been applied

2. **Add Credits Display to UI**
   ```tsx
   import { CreditsDisplay } from '@/components/credits-display'
   
   // In your header/navbar
   <CreditsDisplay />
   ```

3. **Replace Generate Buttons**
   Use the smart button component:
   ```tsx
   import { GenerateWithCreditsButton } from '@/components/generate-with-credits-button'
   
   <GenerateWithCreditsButton
     onClick={handleGenerate}
     loading={isGenerating}
   >
     Generate Design
   </GenerateWithCreditsButton>
   ```

4. **Add Referral Card to Profile/Settings**
   ```tsx
   import { ReferralCard } from '@/components/referral-card'
   
   // In settings or profile page
   <ReferralCard />
   ```

5. **Link to Credits Page**
   Add a link to `/settings/credits` in your navigation

6. **Update Signup Form**
   Add referral code input field:
   ```tsx
   <input name="referralCode" placeholder="Referral code (optional)" />
   ```

7. **For Existing Users**
   Run the migration script to add referral codes:
   ```bash
   npx tsx scripts/add-referral-codes.ts
   ```

### Future Enhancements
- Payment integration to purchase credits
- Promotional campaigns
- Subscription plans with monthly credits
- Credit expiration policies
- Admin panel for credit management

## Testing

### Test Referral Flow
1. Create User A, note their referral code
2. Create User B with User A's referral code
3. Create User C with User A's referral code
4. Create User D with User A's referral code
5. Check User A's credits - should have 9 (8 initial + 1 referral reward)

### Test Credit Deduction
1. Login as a user
2. Generate a nail design
3. Check credits decreased by 1
4. Try generating with 0 credits - should fail

### Test Credit Display
1. Visit `/settings/credits`
2. Verify balance shows correctly
3. Check transaction history
4. Test referral link copy/share

## Documentation

Complete documentation available in `docs/CREDITS_SYSTEM.md` including:
- API endpoint details
- Component usage examples
- Database schema
- Implementation details
- Future enhancement ideas
