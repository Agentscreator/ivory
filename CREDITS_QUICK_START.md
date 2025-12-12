# Credits System - Quick Start Guide

## Overview
Users get 8 free credits on signup. They earn 1 credit for every 3 referrals. Each AI design generation costs 1 credit.

## Quick Integration

### 1. Show Credits in Header/Navbar
```tsx
import { CreditsDisplay } from '@/components/credits-display'

<CreditsDisplay />
```

### 2. Replace Generate Buttons
```tsx
import { GenerateWithCreditsButton } from '@/components/generate-with-credits-button'

// Before:
<Button onClick={handleGenerate}>Generate</Button>

// After:
<GenerateWithCreditsButton onClick={handleGenerate}>
  Generate Design
</GenerateWithCreditsButton>
```

### 3. Add Referral Sharing
```tsx
import { ReferralCard } from '@/components/referral-card'

// In profile or settings page:
<ReferralCard />
```

### 4. Link to Credits Page
```tsx
<Link href="/settings/credits">View Credits</Link>
```

### 5. Update Signup Form
```tsx
// Add to signup form:
<input 
  name="referralCode" 
  placeholder="Referral code (optional)"
/>

// In signup handler:
const { referralCode } = formData
await fetch('/api/auth/signup', {
  body: JSON.stringify({ 
    username, 
    email, 
    password,
    referralCode // Pass it here
  })
})
```

## Using the Hook

```tsx
import { useCredits } from '@/hooks/use-credits'

function MyComponent() {
  const { credits, hasCredits, loading, refresh } = useCredits()
  
  // Check if user has enough credits
  if (!hasCredits(1)) {
    return <p>Need more credits!</p>
  }
  
  // Show balance
  return <p>Balance: {credits}</p>
}
```

## API Usage

### Check Balance
```typescript
const response = await fetch('/api/credits/balance')
const { credits } = await response.json()
```

### Get Transaction History
```typescript
const response = await fetch('/api/credits/history')
const { transactions } = await response.json()
```

### Get Referral Stats
```typescript
const response = await fetch('/api/referrals/stats')
const { referralCode, totalReferrals, creditsEarned } = await response.json()
```

## Programmatic Credit Management

```typescript
import { deductCredits, addCredits } from '@/lib/credits'

// Deduct credits
const result = await deductCredits(
  userId,
  1,
  'design_generation',
  'Generated nail design'
)

if (!result.success) {
  console.error(result.error) // "Insufficient credits"
}

// Add credits (admin/promotional)
await addCredits(
  userId,
  5,
  'promotional',
  'Holiday bonus credits'
)
```

## Referral Link Format

Share this link with users:
```
https://yourdomain.com/signup?ref=USER_REFERRAL_CODE
```

The system automatically:
1. Validates the referral code
2. Links the new user to the referrer
3. Awards credit after 3 successful referrals

## Testing Checklist

- [ ] Credits display shows in UI
- [ ] Generate button checks credits before allowing generation
- [ ] Insufficient credits shows error message
- [ ] Referral card displays correctly
- [ ] Referral link can be copied/shared
- [ ] New signups get 8 credits
- [ ] Referrer gets 1 credit after 3 referrals
- [ ] Transaction history shows all activities
- [ ] Credits page at `/settings/credits` works

## Common Issues

**"Insufficient credits" error**
- User needs more credits
- Direct them to `/settings/credits` to see referral program

**Referral not working**
- Check referral code is valid
- Ensure new user is actually signing up (not existing user)
- Verify database has referral record

**Credits not deducting**
- Check authentication is working
- Verify `getSession()` returns user
- Check database transaction logs

## Files Reference

- **Components**: `components/credits-display.tsx`, `components/referral-card.tsx`, `components/generate-with-credits-button.tsx`
- **Hook**: `hooks/use-credits.ts`
- **Utils**: `lib/credits.ts`
- **APIs**: `app/api/credits/*`, `app/api/referrals/*`
- **Page**: `app/settings/credits/page.tsx`
- **Docs**: `docs/CREDITS_SYSTEM.md`, `CREDITS_IMPLEMENTATION.md`
