# Splash Screen Setup for iOS

## Quick Setup (Recommended)

Your splash screen configuration is already set up in `capacitor.config.ts`. To use your custom image:

### Step 1: Save Your Image
Save your gradient hand/nail design image to:
```
assets/splash.png
```

The image should be **2732x2732 pixels** (or at least 2048x2048) for best quality across all iOS devices.

**Note:** The `assets` folder should be at the root of your project (same level as `app`, `public`, etc.)

### Step 2: Install Capacitor Assets (one-time)
```bash
yarn add -D @capacitor/assets
```

### Step 3: Generate iOS Assets
Run this command to automatically generate all required iOS splash screen sizes:

```bash
yarn capacitor-assets generate --ios
```

This will create all the necessary splash screen images in the correct sizes for iOS.

### Step 4: Sync with iOS
```bash
yarn cap sync ios
```

### Step 5: Open in Xcode and Test
```bash
yarn cap open ios
```

Then run the app in the simulator or on a device to see your splash screen!

---

## Manual Setup (Alternative)

If you prefer to manually add the splash screen to Xcode:

1. Open your project in Xcode:
   ```bash
   yarn cap open ios
   ```

2. In Xcode, navigate to:
   - `App` → `App` → `Assets.xcassets` → `Splash.imageset`

3. Drag and drop your image (saved as PNG) into the image wells:
   - Use 2732x2732px for @3x
   - Use 1824x1824px for @2x  
   - Use 1366x1366px for @1x

4. The `Contents.json` file should look like this:
   ```json
   {
     "images": [
       {
         "idiom": "universal",
         "filename": "splash-2732x2732.png",
         "scale": "1x"
       },
       {
         "idiom": "universal",
         "filename": "splash-2732x2732-1.png",
         "scale": "2x"
       },
       {
         "idiom": "universal",
         "filename": "splash-2732x2732-2.png",
         "scale": "3x"
       }
     ],
     "info": {
       "version": 1,
       "author": "xcode"
     }
   }
   ```

---

## Current Configuration

Your `capacitor.config.ts` already has splash screen settings:

```typescript
SplashScreen: {
  launchShowDuration: 2000,        // Shows for 2 seconds
  backgroundColor: '#FFF5F0',      // Ivory background color
  showSpinner: false               // No loading spinner
}
```

You can adjust these settings if needed:
- `launchShowDuration`: How long the splash shows (in milliseconds)
- `backgroundColor`: Background color (matches your app's ivory theme)
- `showSpinner`: Whether to show a loading spinner

---

## Image Requirements

For best results, your splash screen image should:
- Be **2732x2732 pixels** (square format)
- Have a **transparent or ivory background** (#FFF5F0)
- Be centered with padding around the edges
- Be saved as **PNG** format
- Have your gradient hand/nail design centered

The system will automatically scale and position it for different device sizes.
