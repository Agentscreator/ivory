# User Flow Diagram - Apple Review Compliance

## Overview
This document illustrates the user flow showing how users can access public content without an account, and when account creation is required.

---

## User Flow: Browse Without Account

```
┌─────────────────────────────────────────────────────────────┐
│                     APP LAUNCH                              │
│                  (Fresh Install)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  LANDING PAGE                               │
│              ✅ NO LOGIN REQUIRED                           │
│                                                             │
│  • View marketing content                                   │
│  • Read about features                                      │
│  • See pricing information                                  │
│  • Learn about the process                                  │
│                                                             │
│  [Explore] [Sign In] [Get Started]                         │
└─────────────┬───────────────────────┬───────────────────────┘
              │                       │
              │ Tap "Explore"         │ Tap "Get Started"
              │                       │
              ▼                       ▼
┌─────────────────────────────┐   ┌─────────────────────────┐
│     EXPLORE GALLERY         │   │   AUTHENTICATION        │
│   ✅ NO LOGIN REQUIRED      │   │   (Sign Up/Sign In)     │
│                             │   │                         │
│  • Browse nail designs      │   │  • Email/Password       │
│  • Filter by style          │   │  • Google OAuth         │
│  • View descriptions        │   │  • Apple OAuth          │
│  • See sample work          │   │                         │
│                             │   │  ✅ Safari View         │
│  [Create Custom Design]     │   │     Controller          │
└─────────────┬───────────────┘   └───────────┬─────────────┘
              │                               │
              │ Tap "Create"                  │
              │                               │
              ▼                               │
┌─────────────────────────────┐               │
│   SIGN UP PROMPT            │               │
│   (Account Required)        │               │
│                             │               │
│  "Sign up to create         │               │
│   custom designs"           │               │
│                             │               │
│  [Sign Up] [Cancel]         │               │
└─────────────┬───────────────┘               │
              │                               │
              │ Tap "Sign Up"                 │
              │                               │
              └───────────────┬───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              AUTHENTICATED USER                             │
│           (Account-Based Features)                          │
│                                                             │
│  ✅ Create custom AI designs                                │
│  ✅ Save designs to collection                              │
│  ✅ Book appointments                                       │
│  ✅ Manage profile                                          │
│  ✅ Access subscriptions                                    │
│  ✅ Delete account (Settings)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Route Access Matrix

| Route | Public Access | Requires Account | Notes |
|-------|--------------|------------------|-------|
| `/` (Landing) | ✅ Yes | ❌ No | Marketing content, features, pricing |
| `/explore` | ✅ Yes | ❌ No | Browse and filter designs |
| `/shared/[id]` | ✅ Yes | ❌ No | View shared designs |
| `/privacy-policy` | ✅ Yes | ❌ No | Legal document |
| `/terms` | ✅ Yes | ❌ No | Legal document |
| `/auth` | ✅ Yes | ❌ No | Sign up/sign in page |
| `/home` | ❌ No | ✅ Yes | User dashboard |
| `/capture` | ❌ No | ✅ Yes | Create custom designs |
| `/editor` | ❌ No | ✅ Yes | Edit designs |
| `/profile` | ❌ No | ✅ Yes | User profile |
| `/settings` | ❌ No | ✅ Yes | Account settings |
| `/billing` | ❌ No | ✅ Yes | Subscription management |
| `/tech/*` | ❌ No | ✅ Yes | Technician features |

---

## Authentication Flow (Safari View Controller)

```
┌─────────────────────────────────────────────────────────────┐
│              AUTHENTICATION PAGE                            │
│                  /auth                                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ User taps OAuth button
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         SAFARI VIEW CONTROLLER                              │
│         ✅ IN-APP BROWSER                                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Done]  accounts.google.com  🔒                       │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │                                                       │ │
│  │         Google Sign In                                │ │
│  │                                                       │ │
│  │         [Email/Password Fields]                       │ │
│  │                                                       │ │
│  │         [Sign In Button]                              │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  • URL bar visible (verify authenticity)                   │
│  • SSL certificate inspectable (🔒 icon)                   │
│  • "Done" button to cancel                                 │
│  • Stays within app (no external Safari)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Authentication complete
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         RETURN TO APP                                       │
│         (Automatically)                                     │
│                                                             │
│  • User is logged in                                        │
│  • Redirected to dashboard                                  │
│  • Session established                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature Access Decision Tree

```
                    User Opens App
                          │
                          ▼
                  ┌───────────────┐
                  │ Want to       │
                  │ browse?       │
                  └───┬───────┬───┘
                      │       │
                  Yes │       │ No
                      │       │
                      ▼       ▼
              ┌───────────┐  ┌────────────┐
              │ Browse    │  │ Want to    │
              │ freely    │  │ create?    │
              │ ✅ No     │  └─────┬──────┘
              │ account   │        │
              │ needed    │        │ Yes
              └───────────┘        │
                                   ▼
                          ┌────────────────┐
                          │ Sign up        │
                          │ required       │
                          │ ✅ Account     │
                          │ needed         │
                          └────────────────┘
```

---

## Compliance Summary

### ✅ Guideline 4.0 - Design
**Safari View Controller Implementation**
- OAuth flows open in Safari View Controller
- Users can verify URLs and SSL certificates
- "Done" button available to cancel
- No external browser opens
- Seamless in-app experience

### ✅ Guideline 5.1.1 - Legal
**Account-Free Access**
- Landing page accessible without account
- Explore gallery accessible without account
- Shared designs accessible without account
- Legal documents accessible without account
- Account required only for personalized features

### ✅ Guideline 5.1.1(v) - Account Deletion
**Deletion Feature**
- Available at Settings > Delete Account
- Clear confirmation dialog
- Immediate deletion
- Data removal per privacy policy

---

## User Journey Examples

### Example 1: Casual Browser
```
1. Opens app → Sees landing page
2. Taps "Explore" → Views design gallery
3. Filters by "French Manicure" → Sees filtered results
4. Browses designs → Enjoys content
5. Closes app → No account created
✅ Full browsing experience without account
```

### Example 2: Interested User
```
1. Opens app → Sees landing page
2. Taps "Explore" → Views design gallery
3. Likes what they see → Taps "Create Custom Design"
4. Prompted to sign up → Taps "Get Started"
5. Signs up with Google → Safari View Controller opens
6. Completes authentication → Returns to app
7. Creates custom design → Saves to collection
✅ Smooth transition from browsing to account creation
```

### Example 3: Direct Sign-Up
```
1. Opens app → Sees landing page
2. Taps "Get Started" → Goes to auth page
3. Taps "Continue with Apple" → Safari View Controller opens
4. Completes authentication → Returns to app
5. Selects user type → Accesses full features
✅ Quick sign-up for users who know what they want
```

---

## Technical Implementation

### Middleware Configuration
```typescript
// Public routes (no authentication required)
const publicRoutes = [
  '/shared',
  '/explore',
  '/privacy-policy',
  '/terms'
];

// Protected routes (authentication required)
const protectedRoutes = [
  '/home',
  '/capture',
  '/editor',
  '/profile',
  '/settings',
  '/billing',
  '/tech'
];
```

### Safari View Controller
```typescript
// iOS: Opens Safari View Controller
await Browser.open({ 
  url: authUrl.toString(),
  presentationStyle: 'popover' // Safari View Controller on iOS
});
```

---

## Testing Scenarios

### Scenario 1: First-Time User (No Account)
- ✅ Can view landing page
- ✅ Can browse explore gallery
- ✅ Can filter designs
- ✅ Can view shared designs
- ✅ Cannot create custom designs (prompted to sign up)
- ✅ Cannot save designs (prompted to sign up)
- ✅ Cannot book appointments (prompted to sign up)

### Scenario 2: Authenticated User
- ✅ Can view landing page
- ✅ Can browse explore gallery
- ✅ Can create custom designs
- ✅ Can save designs
- ✅ Can book appointments
- ✅ Can manage profile
- ✅ Can delete account

### Scenario 3: OAuth Authentication
- ✅ Taps OAuth button
- ✅ Safari View Controller opens (not external Safari)
- ✅ Can see URL bar
- ✅ Can verify SSL certificate
- ✅ Can tap "Done" to cancel
- ✅ Completes authentication in-app
- ✅ Returns to app automatically

---

## Conclusion

The app now provides:
1. **Free browsing** of non-account-based content
2. **In-app authentication** via Safari View Controller
3. **Clear boundaries** between public and account-based features
4. **Easy account deletion** for users who sign up

This implementation fully complies with Apple App Store Review Guidelines 4.0 and 5.1.1.
