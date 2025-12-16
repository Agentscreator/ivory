# Apple Review Testing Instructions

## Overview
This document provides step-by-step testing instructions to verify compliance with Apple App Store Review Guidelines 4.0 and 5.1.1.

---

## Guideline 5.1.1 - Browse Without Account

### Test: Access Non-Account-Based Features
**Objective**: Verify users can browse content without creating an account.

#### Steps:
1. **Launch the app** (fresh install, no existing account)
   - ✅ Should see landing page immediately
   - ✅ No forced login or registration

2. **Browse Landing Page**
   - Scroll through the page
   - View features, process, and pricing information
   - ✅ All content is accessible without login

3. **Navigate to Explore Gallery**
   - Tap "Explore" in the navigation bar
   - ✅ Should open explore page without authentication

4. **Browse Design Gallery**
   - View sample nail designs
   - Filter designs by style (French, Floral, Geometric, etc.)
   - Read design descriptions
   - ✅ All browsing features work without account

5. **View Shared Designs** (if available)
   - Navigate to any shared design link
   - ✅ Can view shared designs without login

#### Expected Behavior:
- ✅ Users can freely browse all non-account-based content
- ✅ No forced registration to view designs
- ✅ Clear CTAs to sign up when ready

---

## Guideline 4.0 - Safari View Controller

### Test: In-App OAuth Authentication
**Objective**: Verify OAuth flows use Safari View Controller (not external browser).

#### Steps:
1. **Navigate to Sign In/Sign Up**
   - From landing page, tap "Begin" or "Sign In"
   - Should see authentication page

2. **Test Google Sign-In**
   - Tap "Continue with Google"
   - ✅ Should open Safari View Controller (in-app browser)
   - ✅ Should see URL bar at top showing "accounts.google.com"
   - ✅ Should see "Done" button in top-left corner
   - ✅ Should NOT open external Safari app
   - ✅ Can verify SSL certificate by tapping lock icon

3. **Test Apple Sign-In**
   - Return to auth page (tap "Done" if needed)
   - Tap "Continue with Apple"
   - ✅ Should open Safari View Controller (in-app browser)
   - ✅ Should see URL bar showing "appleid.apple.com"
   - ✅ Should see "Done" button in top-left corner
   - ✅ Should NOT open external Safari app
   - ✅ Can verify SSL certificate

4. **Complete Authentication**
   - Complete sign-in flow in Safari View Controller
   - ✅ Should return to app automatically after authentication
   - ✅ Should be logged in and redirected to appropriate page

#### Expected Behavior:
- ✅ OAuth flows open in Safari View Controller (embedded browser)
- ✅ Users can see and verify URLs
- ✅ Users can inspect SSL certificates
- ✅ Users stay within the app experience
- ✅ No external browser opens

---

## Account-Based Features (Require Login)

### Test: Protected Features Require Authentication
**Objective**: Verify account-based features properly require login.

#### Steps:
1. **Without Account** - Try to access:
   - Create custom design → Should prompt to sign up
   - Save designs → Requires account
   - Book appointments → Requires account
   - Profile settings → Requires account

2. **With Account** - After signing up:
   - ✅ Can create custom AI-generated designs
   - ✅ Can save designs to personal collection
   - ✅ Can book appointments with technicians
   - ✅ Can manage profile and preferences
   - ✅ Can access subscription features

#### Expected Behavior:
- ✅ Account required only for personalized features
- ✅ Clear messaging when account is needed
- ✅ Easy sign-up process when prompted

---

## Account Deletion (Guideline 5.1.1(v))

### Test: Account Deletion Feature
**Objective**: Verify users can delete their accounts.

#### Steps:
1. **Sign in to the app**
2. **Navigate to Settings**
   - Tap profile/settings icon
   - Scroll to "Account Settings"
3. **Access Delete Account**
   - Tap "Delete Account"
   - ✅ Should see confirmation dialog
   - ✅ Should explain consequences of deletion
4. **Confirm Deletion**
   - Confirm account deletion
   - ✅ Account should be deleted
   - ✅ Should be logged out
   - ✅ Data should be removed per privacy policy

#### Expected Behavior:
- ✅ Account deletion is easily accessible
- ✅ Clear warnings about data loss
- ✅ Immediate account deletion upon confirmation

---

## Summary of Compliance

### ✅ Guideline 4.0 - Design
- OAuth authentication uses Safari View Controller
- Users can verify URLs and SSL certificates
- No external browser opens
- Seamless in-app experience

### ✅ Guideline 5.1.1 - Legal
- Users can browse designs without account
- Landing page accessible to all
- Explore gallery accessible to all
- Account required only for personalized features:
  - Creating custom designs
  - Saving designs
  - Booking appointments
  - Profile management

### ✅ Guideline 5.1.1(v) - Account Deletion
- Account deletion feature implemented
- Accessible from settings
- Clear confirmation process

---

## Test Credentials (For Review Team)

If you need to test account-based features, you can:
1. Create a new account using the sign-up flow
2. Use email/password or OAuth (Google/Apple)
3. Test all features with your test account
4. Delete the account when finished testing

---

## Contact Information

If you have any questions during the review process, please contact:
- **Support**: [Your support email]
- **Developer**: [Your developer contact]

---

## Additional Notes

### Privacy & Terms
- Privacy Policy: Accessible from landing page footer and auth page
- Terms of Service: Accessible from landing page footer and auth page
- Both are viewable without account creation

### User Flow Summary
1. User opens app → Landing page (no login)
2. User explores designs → Explore page (no login)
3. User views shared designs → Shared page (no login)
4. User wants to create custom design → Prompted to sign up
5. User signs up → Access to all personalized features
6. User can delete account anytime → Settings > Delete Account

This flow ensures users can evaluate the app's value before committing to account creation, while maintaining clear boundaries for account-based features.
