# Apple App Store Resubmission Checklist

## Pre-Submission Testing

### ✅ Test 1: Browse Without Account (Guideline 5.1.1)
- [ ] Open app on iOS device (fresh install, no account)
- [ ] Verify landing page appears immediately (no forced login)
- [ ] Tap "Explore" in navigation
- [ ] Verify design gallery opens without login prompt
- [ ] Filter designs by different styles
- [ ] Verify all browsing works without account
- [ ] Tap "Create Custom Design" or "Get Started"
- [ ] Verify sign-up prompt appears only now

### ✅ Test 2: Safari View Controller (Guideline 4.0)
- [ ] Navigate to authentication page
- [ ] Tap "Continue with Google"
- [ ] Verify Safari View Controller opens (NOT external Safari)
- [ ] Verify URL bar is visible at top
- [ ] Verify "Done" button is in top-left corner
- [ ] Verify you can see "accounts.google.com" in URL
- [ ] Tap "Done" to return to app
- [ ] Tap "Continue with Apple"
- [ ] Verify Safari View Controller opens (NOT external Safari)
- [ ] Verify URL bar shows "appleid.apple.com"
- [ ] Verify "Done" button is present

### ✅ Test 3: Account Deletion (Guideline 5.1.1(v))
- [ ] Sign in to the app
- [ ] Navigate to Settings
- [ ] Tap "Account Settings"
- [ ] Tap "Delete Account"
- [ ] Verify confirmation dialog appears
- [ ] Verify warning about data loss is clear
- [ ] Confirm deletion
- [ ] Verify account is deleted and you're logged out

### ✅ Test 4: Public Routes
- [ ] Access `/` (landing page) - should work without login
- [ ] Access `/explore` - should work without login
- [ ] Access `/privacy-policy` - should work without login
- [ ] Access `/terms` - should work without login
- [ ] Try to access `/home` without login - should redirect to landing
- [ ] Try to access `/capture` without login - should redirect to landing
- [ ] Try to access `/settings` without login - should redirect to landing

### ✅ Test 5: Protected Routes
- [ ] Sign in to the app
- [ ] Access `/home` - should work
- [ ] Access `/capture` - should work
- [ ] Access `/settings` - should work
- [ ] Access `/billing` - should work
- [ ] Sign out
- [ ] Verify you're redirected to landing page

---

## Code Review

### ✅ Files Modified
- [x] `middleware.ts` - Public routes configured
- [x] `app/page.tsx` - Landing page accessible without login
- [x] `app/explore/page.tsx` - Browse designs without login
- [x] `app/auth/page.tsx` - Safari View Controller implemented

### ✅ Files Created
- [x] `APPLE_REVIEW_GUIDELINE_FIXES.md` - Technical details
- [x] `APPLE_REVIEW_TESTING_INSTRUCTIONS.md` - Testing guide
- [x] `APPLE_REVIEW_RESPONSE_GUIDELINES.md` - Response to Apple
- [x] `APPLE_REVIEW_COMPLIANCE_SUMMARY.md` - Quick reference
- [x] `RESUBMISSION_CHECKLIST.md` - This checklist

### ✅ No Errors
- [x] Run `yarn build` - should complete without errors
- [x] Check for TypeScript errors - should be none
- [x] Check for console errors in browser - should be minimal

---

## App Store Connect Submission

### ✅ Before Submitting
- [ ] All tests above passed
- [ ] App builds successfully
- [ ] No critical errors in logs
- [ ] Screenshots are up to date
- [ ] App description is accurate

### ✅ Response to Apple
Use this template in App Store Connect:

```
Dear App Review Team,

Thank you for your feedback regarding Guidelines 4.0 and 5.1.1. We have addressed both concerns:

**Guideline 4.0 - Design (Safari View Controller):**
We have implemented Safari View Controller for all OAuth authentication flows using the Capacitor Browser API with presentationStyle: 'popover'. This displays authentication in an embedded browser within the app, allowing users to:
- View and verify authentication URLs
- Inspect SSL certificates
- Complete authentication without leaving the app
- Use the "Done" button to cancel and return

Implementation: app/auth/page.tsx lines 207-210 (Google), 223-226 (Apple)

**Guideline 5.1.1 - Legal (Account-Free Access):**
We have restructured the app to allow users to freely browse non-account-based content without registration:

Freely Accessible (No Account Required):
- Landing page with marketing content, features, and pricing
- Explore gallery to browse and filter nail designs
- Shared designs from other users
- Privacy policy and terms of service

Account Required (Personalized Features Only):
- Creating custom AI-generated designs from user photos
- Saving designs to personal collection
- Booking appointments with nail technicians
- Managing profile and preferences
- Accessing subscription features

Implementation: middleware.ts (public routes), app/page.tsx (landing), app/explore/page.tsx (gallery)

**Guideline 5.1.1(v) - Account Deletion:**
Account deletion is available at Settings > Account Settings > Delete Account with clear confirmation and immediate deletion.

**Testing:**
1. Open app without account - landing page appears, no forced login
2. Tap "Explore" - design gallery opens without login
3. Browse and filter designs - all works without account
4. Tap "Create Custom Design" - sign-up prompted (account-based feature)
5. Tap OAuth buttons - Safari View Controller opens (not external Safari)

We have created detailed testing instructions and are confident these changes fully address all concerns. Please let us know if you need any clarification.

Best regards,
[Your Name]
```

### ✅ Attach Documentation (Optional)
If App Store Connect allows attachments or notes:
- [ ] Reference `APPLE_REVIEW_TESTING_INSTRUCTIONS.md`
- [ ] Reference `APPLE_REVIEW_COMPLIANCE_SUMMARY.md`

---

## Post-Submission

### ✅ Monitor Status
- [ ] Check App Store Connect daily for updates
- [ ] Respond promptly to any additional questions
- [ ] Be prepared to provide additional clarification if needed

### ✅ If Approved
- [ ] Celebrate! 🎉
- [ ] Monitor user feedback
- [ ] Address any issues that arise

### ✅ If Additional Issues
- [ ] Review feedback carefully
- [ ] Address concerns promptly
- [ ] Test thoroughly before resubmitting
- [ ] Update documentation as needed

---

## Key Points to Remember

### Guideline 4.0 - Design
✅ Safari View Controller is implemented
✅ Users stay within the app
✅ URLs and certificates are verifiable

### Guideline 5.1.1 - Legal
✅ Landing page is public
✅ Explore gallery is public
✅ Account required only for personalized features
✅ Clear user flow: browse → evaluate → sign up

### Guideline 5.1.1(v) - Account Deletion
✅ Deletion feature is accessible
✅ Clear confirmation process
✅ Immediate deletion

---

## Final Checks

- [ ] All tests passed
- [ ] Code builds successfully
- [ ] Documentation is complete
- [ ] Response is prepared
- [ ] Ready to submit

---

## Submission Date

**Date**: _______________
**Build Number**: _______________
**Version**: _______________

---

## Notes

Use this space for any additional notes or observations:

_______________________________________________
_______________________________________________
_______________________________________________

---

**Status**: Ready for resubmission ✅

Good luck with your submission!
