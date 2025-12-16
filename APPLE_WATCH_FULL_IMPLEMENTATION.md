# Apple Watch Full Implementation Guide

## Overview

The Apple Watch app is now a full-featured companion to the main iOS app, providing access to all core functionality directly from your wrist.

## Features

### 1. Home/Explore Tab
- Browse recent nail designs
- View featured designs from the gallery
- Quick action buttons:
  - **Capture Design** - Opens camera on iPhone
  - **Browse Gallery** - Opens explore page on iPhone

### 2. My Designs Tab
- View all your saved nail designs
- Quick access to create new designs
- Syncs with iPhone app in real-time

### 3. Profile Tab
- View your username and email
- Check credit balance
- Quick actions:
  - **Buy Credits** - Opens billing page on iPhone
  - **Settings** - Opens settings on iPhone
  - **Sign In** - Opens auth page (if not signed in)

## Architecture

### Communication Flow

```
Apple Watch App
      ↓
WatchConnectivity Framework
      ↓
iPhone App (Capacitor)
      ↓
Web App (Next.js)
      ↓
API Routes
```

### Components

#### Watch App (Swift)
- **ContentView.swift** - Main tabbed interface
- **HomeView** - Browse and explore designs
- **DesignsView** - Saved designs
- **ProfileView** - User profile and settings
- **WatchConnectivityManager** - Handles communication with iPhone

#### iPhone Bridge (Swift)
- **WatchConnectivityBridge.swift** - Receives messages from Watch
- **WatchConnectivityPlugin.swift** - Capacitor plugin for web integration

#### Web App (TypeScript)
- **lib/watch-bridge.ts** - Exposes data to Watch
- **components/watch-bridge-initializer.tsx** - Initializes bridge

## Data Synchronization

### From Watch to iPhone

The Watch app sends action messages to the iPhone:

```swift
connectivity.sendMessage(["action": "getRecentDesigns"]) { response in
    // Handle response
}
```

Available actions:
- `getRecentDesigns` - Fetch recent designs
- `getSavedDesigns` - Fetch user's saved designs
- `getProfile` - Fetch user profile and credits
- `openCapture` - Open camera page on iPhone
- `openExplore` - Open explore page on iPhone
- `openBilling` - Open billing page on iPhone
- `openSettings` - Open settings page on iPhone
- `openAuth` - Open auth page on iPhone

### From iPhone to Watch

The iPhone app can push updates to the Watch:

```typescript
import { sendToWatch } from '@/lib/watch-bridge';

// Notify Watch of design update
await sendToWatch({
  type: 'designUpdated',
  designId: 'design-123'
});
```

## Setup Instructions

### 1. Xcode Configuration

The Watch app target is already configured in your Xcode project:
- Target: `ivory Watch App`
- Bundle ID: `com.ivory.app.watchkitapp`
- Deployment Target: watchOS 9.0+

### 2. Build and Run

```bash
# Open Xcode
yarn cap:open:ios

# In Xcode:
# 1. Select "ivory Watch App" scheme
# 2. Select your Apple Watch as destination
# 3. Click Run (Cmd+R)
```

### 3. Testing

#### Test on Simulator
1. Open Xcode
2. Select iPhone simulator + Watch simulator pair
3. Run the iPhone app first
4. Then run the Watch app
5. Both should communicate via WatchConnectivity

#### Test on Device
1. Pair your Apple Watch with your iPhone
2. Install iPhone app on device
3. Install Watch app (automatically installs with iPhone app)
4. Open Watch app
5. Verify data syncs from iPhone

## User Experience

### First Launch

1. User opens Watch app
2. Watch app requests data from iPhone
3. If iPhone app is not running, Watch shows loading state
4. Once iPhone responds, Watch displays data

### Navigation

- **Swipe left/right** - Switch between tabs
- **Tap design** - View design details (future feature)
- **Tap button** - Perform action on iPhone
- **Digital Crown** - Scroll through content

### Offline Behavior

- Watch app requires iPhone to be nearby and reachable
- If iPhone is not reachable, Watch shows cached data
- Actions that require iPhone will show "iPhone not reachable" message

## Customization

### Brand Colors

The Watch app uses Ivory's Choice brand colors:
- Primary: `#1A1A1A` (Dark)
- Accent: `#8B7355` (Taupe)
- Background: System background
- Text: System text colors

### Typography

- Headers: System Serif font
- Body: System font
- Captions: System font (small)

## Advanced Features (Future)

### Complications
Add Watch face complications to show:
- Credit balance
- Latest design
- Quick actions

### Notifications
Push notifications for:
- Design generation complete
- Appointment reminders
- Credit purchases

### Standalone Mode
Allow Watch app to work independently:
- Cache designs locally
- Offline viewing
- Background sync

## Troubleshooting

### Watch App Not Communicating

**Problem:** Watch app shows "Loading..." indefinitely

**Solutions:**
1. Ensure iPhone app is running
2. Check that both devices are on same network
3. Restart both iPhone and Watch apps
4. Check WatchConnectivity is enabled in Xcode

### Data Not Syncing

**Problem:** Watch shows old data

**Solutions:**
1. Pull to refresh on Watch (if implemented)
2. Force quit and reopen Watch app
3. Check iPhone app is logged in
4. Verify API endpoints are working

### Build Errors

**Problem:** Xcode build fails for Watch target

**Solutions:**
1. Clean build folder (Cmd+Shift+K)
2. Delete derived data
3. Verify Watch deployment target is set correctly
4. Check all Swift files are included in Watch target

## API Integration

### Exposed Functions

The web app exposes these functions for the Watch:

```typescript
// Get recent designs
window.getRecentDesigns(): Promise<Design[]>

// Get saved designs
window.getSavedDesigns(): Promise<Design[]>

// Get user profile
window.getUserProfile(): Promise<{
  user: User | null;
  credits: number;
}>
```

### Adding New Functions

To add a new function for the Watch:

1. **Add to watch-bridge.ts:**
```typescript
window.myNewFunction = async () => {
  // Implementation
  return data;
};
```

2. **Add action handler in WatchConnectivityBridge.swift:**
```swift
case "myNewAction":
    executeJS("window.myNewFunction()") { result in
        replyHandler(["data": result])
    }
```

3. **Call from Watch app:**
```swift
connectivity.sendMessage(["action": "myNewAction"]) { response in
    // Handle response
}
```

## Performance Optimization

### Reduce Data Transfer
- Send only essential data to Watch
- Use pagination for large lists
- Cache data on Watch when possible

### Battery Optimization
- Minimize background activity
- Use efficient data structures
- Avoid frequent polling

### Network Efficiency
- Batch requests when possible
- Use compression for large data
- Implement smart caching

## Testing Checklist

- [ ] Watch app launches successfully
- [ ] Home tab shows recent designs
- [ ] Designs tab shows saved designs
- [ ] Profile tab shows user info and credits
- [ ] "Capture Design" button opens iPhone camera
- [ ] "Browse Gallery" button opens iPhone explore page
- [ ] "Buy Credits" button opens iPhone billing
- [ ] "Settings" button opens iPhone settings
- [ ] Data syncs in real-time
- [ ] Watch app handles iPhone not reachable gracefully
- [ ] UI is responsive and smooth
- [ ] Text is readable on Watch screen
- [ ] Colors match brand guidelines

## Deployment

### App Store Submission

The Watch app is included with your iPhone app submission:

1. Archive iPhone app in Xcode
2. Watch app is automatically included
3. Submit to App Store Connect
4. Both apps reviewed together
5. Both apps released together

### Requirements

- watchOS 9.0 or later
- Paired with iPhone running iOS 15.0 or later
- iPhone app must be installed

## Support

### Documentation
- Apple WatchConnectivity: https://developer.apple.com/documentation/watchconnectivity
- SwiftUI for watchOS: https://developer.apple.com/documentation/swiftui

### Common Issues
- See TROUBLESHOOTING.md for general issues
- Check Apple Developer Forums for Watch-specific issues

---

**Status:** ✅ Full-featured Watch app implemented
**Version:** 1.0
**Last Updated:** December 2024
