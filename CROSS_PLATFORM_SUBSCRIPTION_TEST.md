# Cross-Platform Subscription Testing Guide

## Overview
This guide ensures the "Subscribe to Pro" functionality works correctly across all platforms: iPhone, iPad, Mac (web), and native iOS app.

## Platforms to Test

### 1. iPhone (Native iOS App)
**Device:** iPhone 12 or newer
**OS:** iOS 15.0+

#### Test Steps:
1. **Open Native App**
   - Launch the Ivory app from home screen
   - Sign in with test account

2. **Navigate to Billing**
   - Tap Settings (bottom nav)
   - Tap "Billing & Credits"

3. **Test Tab Navigation**
   - Tap "Subscriptions" tab → Should show subscription plans
   - Verify tab switches immediately (no delay)
   - Tap "History" tab → Should show transaction history
   - Verify smooth tab transitions

4. **Test Subscribe Button**
   - Scroll to Pro plan card
   - Tap "Subscribe to Pro" button
   - Should trigger Apple IAP flow
   - Complete or cancel purchase
   - Verify loading states work correctly

5. **Test Touch Responsiveness**
   - All taps should register immediately
   - No double-tap required
   - Active states should show visual feedback
   - Buttons should feel responsive

#### Expected Behavior:
- ✅ Tabs switch instantly on tap
- ✅ Subscribe button triggers IAP immediately
- ✅ iOS payment sheet appears
- ✅ Loading spinner shows during processing
- ✅ Success/error messages display correctly
- ✅ "iOS In-App Purchase" notice is visible

---

### 2. iPad (Native iOS App)
**Device:** iPad Air (5th generation) or newer
**OS:** iPadOS 15.0+

#### Test Steps:
1. **Open Native App**
   - Launch the Ivory app
   - Sign in with test account

2. **Test in Portrait Mode**
   - Navigate to Settings → Billing & Credits
   - Tap each tab (Subscriptions, History)
   - Verify tabs respond to touch
   - Tap "Subscribe to Pro" button
   - Verify button responds immediately

3. **Test in Landscape Mode**
   - Rotate iPad to landscape
   - Repeat tab navigation tests
   - Tap "Subscribe to Pro" button
   - Verify all interactions work

4. **Test with Apple Pencil (if available)**
   - Use Apple Pencil to tap tabs
   - Use Apple Pencil to tap subscribe button
   - Verify pencil taps register correctly

5. **Test Multi-Touch**
   - Ensure no accidental multi-touch issues
   - Single tap should be sufficient

#### Expected Behavior:
- ✅ Tabs respond to touch in both orientations
- ✅ Subscribe button works with finger and Apple Pencil
- ✅ Layout adapts properly to landscape/portrait
- ✅ No scroll-based navigation issues
- ✅ Touch targets are large enough (44px minimum)
- ✅ IAP flow works correctly

---

### 3. iPhone (Web Browser - Safari)
**Device:** iPhone 12 or newer
**Browser:** Safari

#### Test Steps:
1. **Open Web App**
   - Open Safari
   - Navigate to your production URL
   - Sign in with test account

2. **Navigate to Billing**
   - Tap menu → Settings
   - Tap "Billing & Credits"

3. **Test Tab Navigation**
   - Tap "Subscriptions" tab
   - Tap "History" tab
   - Verify smooth transitions

4. **Test Subscribe Button**
   - Tap "Subscribe to Pro" button
   - Should redirect to Stripe Checkout
   - Complete or cancel payment
   - Verify redirect back to app

5. **Test Add to Home Screen**
   - Add app to home screen
   - Open from home screen
   - Repeat billing tests

#### Expected Behavior:
- ✅ Tabs work in mobile Safari
- ✅ Subscribe button redirects to Stripe
- ✅ No iOS IAP notice (web version)
- ✅ Stripe checkout loads correctly
- ✅ Return URL works after payment

---

### 4. iPad (Web Browser - Safari)
**Device:** iPad Air (5th generation) or newer
**Browser:** Safari

#### Test Steps:
1. **Open Web App**
   - Open Safari on iPad
   - Navigate to production URL
   - Sign in with test account

2. **Test in Desktop Mode**
   - Safari may default to desktop view
   - Navigate to Billing page
   - Test tab navigation
   - Test subscribe button

3. **Test in Mobile Mode**
   - Request mobile site (if needed)
   - Repeat all tests
   - Verify responsive design

4. **Test Split View**
   - Open app in split view with another app
   - Verify layout adapts
   - Test all interactions

#### Expected Behavior:
- ✅ Tabs work in both desktop and mobile Safari views
- ✅ Subscribe button works correctly
- ✅ Layout is responsive
- ✅ Stripe checkout works
- ✅ No IAP notice (web version)

---

### 5. Mac (Web Browser - Safari/Chrome)
**Device:** MacBook or iMac
**Browser:** Safari and Chrome

#### Test Steps:
1. **Open Web App (Safari)**
   - Open Safari
   - Navigate to production URL
   - Sign in with test account

2. **Navigate to Billing**
   - Click Settings
   - Click "Billing & Credits"

3. **Test Tab Navigation**
   - Click "Subscriptions" tab
   - Click "History" tab
   - Verify instant switching

4. **Test Subscribe Button**
   - Click "Subscribe to Pro" button
   - Should redirect to Stripe Checkout
   - Complete or cancel payment
   - Verify redirect back

5. **Test Hover States**
   - Hover over tabs → Should show hover effect
   - Hover over buttons → Should show hover effect
   - Verify cursor changes to pointer

6. **Repeat in Chrome**
   - Test all steps in Chrome browser
   - Verify consistent behavior

#### Expected Behavior:
- ✅ Tabs work with mouse clicks
- ✅ Hover states display correctly
- ✅ Subscribe button redirects to Stripe
- ✅ Desktop layout is optimal
- ✅ No IAP notice (web version)
- ✅ Works in both Safari and Chrome

---

## Platform-Specific Features

### Native iOS App (iPhone/iPad)
- **Payment Method:** Apple In-App Purchase (IAP)
- **Notice:** "iOS In-App Purchase" banner visible
- **Subscription Management:** Links to iOS Settings
- **Product IDs:** 
  - Pro: `com.yourcompany.ivory.business2`
  - Business: `com.yourcompany.ivory.pro`

### Web (All Browsers)
- **Payment Method:** Stripe Checkout
- **Notice:** No IAP notice
- **Subscription Management:** Stripe Customer Portal
- **Redirect Flow:** App → Stripe → App

---

## Common Issues & Solutions

### Issue: Tabs Don't Respond on iPad
**Solution:** 
- Ensure `touch-manipulation` CSS is applied
- Verify Radix UI Tabs are used (not scroll-based)
- Check for JavaScript errors in console

### Issue: Subscribe Button Doesn't Work
**Solution:**
- Check network requests in dev tools
- Verify API endpoints are accessible
- Check for CORS issues
- Verify Stripe/IAP configuration

### Issue: IAP Not Triggering on Native App
**Solution:**
- Verify `Capacitor.isNativePlatform()` returns true
- Check IAP plugin is installed
- Verify product IDs match App Store Connect
- Check IAP plugin logs

### Issue: Stripe Checkout Not Loading
**Solution:**
- Verify Stripe publishable key is set
- Check network connectivity
- Verify API endpoint returns checkout URL
- Check browser console for errors

---

## Testing Checklist

### All Platforms
- [ ] Tabs switch immediately on interaction
- [ ] Subscribe button responds to clicks/taps
- [ ] Loading states display correctly
- [ ] Success/error messages show
- [ ] Layout is responsive
- [ ] No console errors

### Native iOS App Only
- [ ] IAP flow triggers correctly
- [ ] iOS payment sheet appears
- [ ] "iOS In-App Purchase" notice visible
- [ ] Subscription management link works
- [ ] Receipt validation succeeds

### Web Only
- [ ] Stripe checkout loads
- [ ] Redirect to Stripe works
- [ ] Return URL works after payment
- [ ] No IAP notice shown
- [ ] Works in Safari and Chrome

---

## Performance Metrics

### Tab Switch Speed
- **Target:** < 100ms
- **Acceptable:** < 200ms
- **Poor:** > 300ms

### Button Response Time
- **Target:** Immediate visual feedback
- **Acceptable:** < 50ms
- **Poor:** > 100ms

### Page Load Time
- **Target:** < 2 seconds
- **Acceptable:** < 3 seconds
- **Poor:** > 5 seconds

---

## Accessibility Testing

### Keyboard Navigation (Mac/Desktop)
- [ ] Tab key navigates through tabs
- [ ] Enter/Space activates tabs
- [ ] Focus indicators are visible
- [ ] Subscribe button is keyboard accessible

### Screen Reader (iOS VoiceOver)
- [ ] Tabs are announced correctly
- [ ] Subscribe button is announced
- [ ] Loading states are announced
- [ ] Success/error messages are announced

### Touch Targets (Mobile/Tablet)
- [ ] All buttons are at least 44x44px
- [ ] Tabs are at least 48px tall
- [ ] Adequate spacing between elements
- [ ] No accidental taps

---

## Reporting Issues

When reporting issues, include:
1. **Platform:** iPhone/iPad/Mac
2. **Environment:** Native app or Web (browser name)
3. **OS Version:** iOS/iPadOS/macOS version
4. **Steps to Reproduce:** Detailed steps
5. **Expected Behavior:** What should happen
6. **Actual Behavior:** What actually happened
7. **Screenshots/Video:** Visual evidence
8. **Console Logs:** Any error messages

---

## Sign-Off

### Tested By: _______________
### Date: _______________

### Platform Results:
- [ ] iPhone Native App - PASS / FAIL
- [ ] iPad Native App - PASS / FAIL
- [ ] iPhone Safari - PASS / FAIL
- [ ] iPad Safari - PASS / FAIL
- [ ] Mac Safari - PASS / FAIL
- [ ] Mac Chrome - PASS / FAIL

### Notes:
_______________________________________
_______________________________________
_______________________________________
