# Credits & Referral System

## Overview

The app now includes a comprehensive credits and referral system to monetize AI design generation and incentivize user growth.

## Features

### 1. Initial Free Credits
- New users receive **8 free credits** upon signup
- Credits are automatically added to their account
- Transaction is logged in the credit history

### 2. Referral Program
- Each user gets a unique referral code upon signup
- Users can share their referral link with friends
- **Reward Structure**: For every 3 new users who sign up using a referral link, the referrer earns 1 credit
- Referrals are tracked and credits are automatically awarded

### 3. Credit Usage
- **1 credit** is deducted for each AI nail design generation
- Users must have sufficient credits to generate designs
- All credit transactions are logged with descriptions

### 4. Credit Management
- Users can view their current balance
- Complete transaction history is available
- Referral stats show:
  - Total referrals made
  - Credits earned from referrals
  - Pending referrals (not yet awarded)
  - Referrals needed until next credit

## Database Schema

### New Tables

#### `referrals`
Tracks referral relationships between users.

```typescript
{
  id: serial
  referrerId: integer (FK to users)
  referredUserId: integer (FK to users)
  creditAwarded: boolean
  createdAt: timestamp
}
```

#### `creditTransactions`
Logs all credit additions and deductions.

```typescript
{
  id: serial
  userId: integer (FK to users)
  amount: integer (positive for add, negative for deduct)
  type: string (signup_bonus, referral_reward, design_generation, etc.)
  description: text
  relatedId: integer (optional reference to related entity)
  balanceAfter: integer
  createdAt: timestamp
}
```

### Updated Tables

#### `users`
Added credit-related fields:

```typescript
{
  // ... existing fields
  credits: integer (default: 8)
  referralCode: varchar(50) unique
  referredBy: integer (FK to users, nullable)
}
```

## API Endpoints

### Credits

#### `GET /api/credits/balance`
Get current user's credit balance.

**Response:**
```json
{
  "credits": 8
}
```

#### `GET /api/credits/history`
Get user's credit transaction history (last 50 transactions).

**Response:**
```json
{
  "transactions": [
    {
      "id": 1,
      "amount": 8,
      "type": "signup_bonus",
      "description": "Welcome bonus - 8 free credits",
      "balanceAfter": 8,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Referrals

#### `GET /api/referrals/stats`
Get user's referral statistics.

**Response:**
```json
{
  "referralCode": "abc123xyz",
  "totalReferrals": 5,
  "creditsEarned": 1,
  "pendingReferrals": 2,
  "referralsUntilNextCredit": 1
}
```

### Authentication

#### `POST /api/auth/signup`
Updated to handle referral codes and award initial credits.

**Request:**
```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123",
  "referralCode": "abc123xyz" // optional
}
```

**Response:**
```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com",
  "userType": "client",
  "avatar": null,
  "credits": 8,
  "referralCode": "xyz789abc"
}
```

## Components

### `<ReferralCard />`
Displays referral statistics and share functionality.

**Features:**
- Shows total referrals, credits earned, and progress
- Displays unique referral link
- Copy to clipboard button
- Native share functionality (mobile)
- Explains referral program rules

**Usage:**
```tsx
import { ReferralCard } from '@/components/referral-card'

<ReferralCard />
```

### `<CreditsDisplay />`
Shows current credit balance with icon.

**Props:**
- `className?: string` - Additional CSS classes
- `showLabel?: boolean` - Show "credits" text (default: true)

**Usage:**
```tsx
import { CreditsDisplay } from '@/components/credits-display'

<CreditsDisplay />
<CreditsDisplay showLabel={false} />
```

### `<GenerateWithCreditsButton />`
Smart button that checks credits before allowing generation.

**Props:**
- `onClick: () => void | Promise<void>` - Function to call when clicked
- `loading?: boolean` - Show loading state
- `disabled?: boolean` - Disable button
- `children?: React.ReactNode` - Button text (default: "Generate Design")
- `className?: string` - Additional CSS classes
- `creditsRequired?: number` - Credits needed (default: 1)

**Features:**
- Automatically checks if user has enough credits
- Shows credit cost in button
- Displays error toast if insufficient credits
- Links to credits page from error toast

**Usage:**
```tsx
import { GenerateWithCreditsButton } from '@/components/generate-with-credits-button'

<GenerateWithCreditsButton
  onClick={handleGenerate}
  loading={isGenerating}
  creditsRequired={1}
>
  Generate Design
</GenerateWithCreditsButton>
```

## Hooks

### `useCredits()`
React hook for managing credit state in components.

**Returns:**
```typescript
{
  credits: number | null        // Current balance
  loading: boolean              // Loading state
  error: string | null          // Error message
  hasCredits: (amount?: number) => boolean  // Check if user has enough
  refresh: () => void           // Refresh balance
}
```

**Usage:**
```tsx
import { useCredits } from '@/hooks/use-credits'

function MyComponent() {
  const { credits, hasCredits, refresh } = useCredits()
  
  if (!hasCredits(1)) {
    return <p>Not enough credits</p>
  }
  
  return <p>You have {credits} credits</p>
}
```

## Utility Functions

### `lib/credits.ts`

#### `deductCredits()`
Deduct credits from a user's account.

```typescript
await deductCredits(
  userId: number,
  amount: number,
  type: string,
  description: string,
  relatedId?: number
)
```

**Returns:**
```typescript
{
  success: boolean
  newBalance?: number
  error?: string
}
```

#### `addCredits()`
Add credits to a user's account.

```typescript
await addCredits(
  userId: number,
  amount: number,
  type: string,
  description: string,
  relatedId?: number
)
```

#### `getCreditsBalance()`
Get a user's current credit balance.

```typescript
const balance = await getCreditsBalance(userId: number)
```

## Pages

### `/settings/credits`
Comprehensive credits and referrals management page.

**Features:**
- Current balance display
- Referral card with sharing
- Complete transaction history
- Formatted dates and amounts
- Color-coded transactions (green for additions, red for deductions)

## Implementation Details

### Signup Flow

1. User signs up with optional referral code
2. System validates referral code if provided
3. New user is created with:
   - 8 initial credits
   - Unique referral code (generated with nanoid)
   - Reference to referrer (if applicable)
4. Signup bonus transaction is logged
5. If referred:
   - Referral record is created
   - System checks if referrer has 3+ unawardedeferrals
   - If yes, awards 1 credit to referrer
   - Marks 3 referrals as awarded
   - Logs referral reward transaction

### Design Generation Flow

1. User requests AI design generation
2. System checks authentication
3. Attempts to deduct 1 credit
4. If insufficient credits, returns error
5. If successful:
   - Generates design
   - Returns design URL and new balance
   - Transaction is logged

### Referral Link Format

```
https://yourdomain.com/signup?ref=abc123xyz
```

The `ref` parameter contains the referrer's unique referral code.

## Future Enhancements

- Purchase credits with payment integration
- Promotional credit campaigns
- Tiered referral rewards
- Credit expiration policies
- Subscription plans with monthly credits
- Bonus credits for specific actions
- Credit gifting between users

## Migration

To apply the database changes:

```bash
yarn db:generate
yarn db:push
```

This will:
- Add `credits`, `referralCode`, and `referredBy` columns to `users` table
- Create `referrals` table
- Create `creditTransactions` table
- Set default credits to 8 for new users

**Note:** Existing users will need credits added manually or through a migration script.
