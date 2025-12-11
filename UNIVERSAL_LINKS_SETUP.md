# Universal Links & Deep Linking Setup

## What's Been Configured ✅

1. **Custom URL Scheme**: `ivory://` - for direct app links
2. **Universal Links**: Support for `https://ivory-blond.vercel.app` links to open in the app
3. **Apple App Site Association file**: Created at `public/.well-known/apple-app-site-association`

## How It Works

- **Custom URL Scheme** (`ivory://`): Direct links like `ivory://profile` or `ivory://capture`
- **Universal Links**: Web URLs like `https://ivory-blond.vercel.app/profile` will open in the app if installed

## Setup Steps

### 1. Get Your Apple Team ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Click on "Membership" in the sidebar
3. Copy your **Team ID** (10-character string like `ABC123XYZ`)

### 2. Update the Apple App Site Association File

Replace `TEAM_ID` in `public/.well-known/apple-app-site-association` with your actual Team ID:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "YOUR_TEAM_ID.com.ivory.app",
        "paths": ["*"]
      }
    ]
  },
  "webcredentials": {
    "apps": ["YOUR_TEAM_ID.com.ivory.app"]
  }
}
```

### 3. Deploy to Vercel

The file needs to be accessible at:
```
https://ivory-blond.vercel.app/.well-known/apple-app-site-association
```

Deploy your changes:
```bash
git add .
git commit -m "Add Universal Links support"
git push
```

Vercel will automatically deploy. Verify the file is accessible by visiting the URL above.

### 4. Add Associated Domains in Xcode

1. Open Xcode: `npx cap open ios`
2. Select your app target
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability"
5. Add "Associated Domains"
6. Add these domains:
   - `applinks:ivory-blond.vercel.app`
   - `webcredentials:ivory-blond.vercel.app`

### 5. Enable Associated Domains in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Go to "Certificates, Identifiers & Profiles"
3. Select "Identifiers" and find `com.ivory.app`
4. Enable "Associated Domains" capability
5. Save and regenerate your provisioning profiles

### 6. Sync and Rebuild

```bash
npx cap sync ios
npx cap open ios
```

Build and run the app on a real device (Universal Links don't work in simulator).

## Testing

### Test Custom URL Scheme

1. Open Safari on your iPhone
2. Type in the address bar: `ivory://`
3. Should prompt to open the Ivory's Choice app

### Test Universal Links

1. Send yourself an email or message with: `https://ivory-blond.vercel.app/profile`
2. Long-press the link
3. Should show "Open in Ivory" option
4. Tap the link - should open directly in the app

### Verify Apple App Site Association

Visit this URL in a browser:
```
https://ivory-blond.vercel.app/.well-known/apple-app-site-association
```

Should return JSON with your Team ID.

You can also use Apple's validator:
```
https://search.developer.apple.com/appsearch-validation-tool/
```

## Handling Deep Links in Your App

Add this to your Capacitor app initialization (in your main app component):

```typescript
import { App } from '@capacitor/app';

// Handle deep links
App.addListener('appUrlOpen', (data) => {
  console.log('App opened with URL:', data.url);
  
  // Parse the URL and navigate
  const url = new URL(data.url);
  
  if (url.protocol === 'ivory:') {
    // Handle custom scheme: ivory://profile
    const path = url.pathname;
    // Navigate to path
  } else {
    // Handle universal link: https://ivory-blond.vercel.app/profile
    const path = url.pathname;
    // Navigate to path
  }
});
```

## Example Deep Link URLs

### Custom Scheme
- `ivory://` - Open app
- `ivory://home` - Open home
- `ivory://capture` - Open camera
- `ivory://profile` - Open profile
- `ivory://look/123` - Open specific look

### Universal Links
- `https://ivory-blond.vercel.app/` - Open app
- `https://ivory-blond.vercel.app/home` - Open home
- `https://ivory-blond.vercel.app/capture` - Open camera
- `https://ivory-blond.vercel.app/profile` - Open profile
- `https://ivory-blond.vercel.app/look/123` - Open specific look

## Troubleshooting

### Universal Links Not Working

1. **Verify the association file is accessible** - Visit the URL in a browser
2. **Check Team ID is correct** - Must match your Apple Developer account
3. **Test on a real device** - Universal Links don't work in simulator
4. **Clear Safari cache** - Settings > Safari > Clear History and Website Data
5. **Reinstall the app** - Sometimes needed after adding Associated Domains
6. **Check domain is HTTPS** - Universal Links require HTTPS (Vercel provides this)

### Custom Scheme Not Working

1. **Check Info.plist** - Verify `CFBundleURLSchemes` includes `ivory`
2. **Rebuild the app** - After changing Info.plist
3. **Check for conflicts** - Make sure no other app uses the same scheme

## Security Notes

- The apple-app-site-association file is public and safe to commit
- Must be served over HTTPS (Vercel handles this)
- Must be accessible without redirects
- No file extension needed (it's a JSON file without .json extension)

## Additional Resources

- [Apple Universal Links Documentation](https://developer.apple.com/ios/universal-links/)
- [Capacitor Deep Links Guide](https://capacitorjs.com/docs/guides/deep-links)
- [Apple App Site Association Validator](https://search.developer.apple.com/appsearch-validation-tool/)
