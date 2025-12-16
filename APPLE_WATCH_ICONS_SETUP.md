# Apple Watch App Icons Setup Guide

## Issue

The Watch app validation is failing because:
1. Missing `CFBundleIconName` in Info.plist ✅ FIXED
2. Missing app icon images in the asset catalog

## Required Icon Sizes

The Apple Watch app requires icons in these sizes:

### Notification Center Icons
- 38mm: 48x48 (24@2x)
- 42mm: 55x55 (27.5@2x)
- 40mm: 58x58 (29@2x)
- 44mm: 66x66 (33@2x)

### Companion Settings Icons
- 58x58 (29@2x)
- 87x87 (29@3x)

### App Launcher Icons (Home Screen)
- 38mm: 80x80 (40@2x)
- 40mm: 88x88 (44@2x)
- 41mm: 92x92 (46@2x)
- 44mm: 100x100 (50@2x)
- 45mm: 102x102 (51@2x)
- 49mm: 108x108 (54@2x)

### Quick Look Icons
- 38mm: 172x172 (86@2x)
- 42mm: 196x196 (98@2x)
- 44mm: 216x216 (108@2x)
- 45mm: 234x234 (117@2x)
- 49mm: 258x258 (129@2x)

### App Store Icon
- 1024x1024 (1x)

## Quick Solution: Use Xcode's Icon Generator

### Option 1: Use a Single 1024x1024 Icon (Recommended)

1. **Create a 1024x1024 icon** with your app design
   - Use your brand colors (#1A1A1A and #8B7355)
   - Simple, recognizable design
   - No transparency
   - PNG format

2. **Open Xcode:**
   ```bash
   yarn cap:open:ios
   ```

3. **Navigate to Assets:**
   - Select `ivory Watch App` target
   - Open `Assets.xcassets`
   - Click on `AppIcon`

4. **Drag and drop your 1024x1024 icon** into the "App Store" slot

5. **Generate all sizes:**
   - Right-click on AppIcon
   - Select "Generate All Sizes" (if available)
   - Or use an online tool to generate all sizes

### Option 2: Use an Icon Generator Tool

Use one of these online tools to generate all required sizes:

1. **App Icon Generator** (https://appicon.co/)
   - Upload your 1024x1024 icon
   - Select "watchOS"
   - Download the generated icons
   - Drag all icons into Xcode's AppIcon asset

2. **MakeAppIcon** (https://makeappicon.com/)
   - Upload your icon
   - Select watchOS
   - Download and import

3. **Icon Set Creator** (https://apps.apple.com/app/icon-set-creator/id939343785)
   - Mac app for generating icon sets
   - Supports all Apple platforms

### Option 3: Use ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Install ImageMagick (if not installed)
brew install imagemagick

# Navigate to your icon directory
cd "ios/App/ivory Watch App/Assets.xcassets/AppIcon.appiconset"

# Generate all sizes from a 1024x1024 source icon
# (Replace source-icon.png with your icon file)

# Notification Center
convert source-icon.png -resize 48x48 watch-icon-38mm@2x.png
convert source-icon.png -resize 55x55 watch-icon-42mm@2x.png
convert source-icon.png -resize 58x58 watch-icon-40mm@2x.png
convert source-icon.png -resize 66x66 watch-icon-44mm@2x.png

# Companion Settings
convert source-icon.png -resize 58x58 watch-icon-38mm-companion@2x.png
convert source-icon.png -resize 87x87 watch-icon-38mm-companion@3x.png

# App Launcher
convert source-icon.png -resize 80x80 watch-icon-38mm-home@2x.png
convert source-icon.png -resize 88x88 watch-icon-40mm-home@2x.png
convert source-icon.png -resize 92x92 watch-icon-41mm-home@2x.png
convert source-icon.png -resize 100x100 watch-icon-44mm-home@2x.png
convert source-icon.png -resize 102x102 watch-icon-45mm-home@2x.png
convert source-icon.png -resize 108x108 watch-icon-49mm-home@2x.png

# Quick Look
convert source-icon.png -resize 172x172 watch-icon-38mm-short@2x.png
convert source-icon.png -resize 196x196 watch-icon-42mm-short@2x.png
convert source-icon.png -resize 216x216 watch-icon-44mm-short@2x.png
convert source-icon.png -resize 234x234 watch-icon-45mm-short@2x.png
convert source-icon.png -resize 258x258 watch-icon-49mm-short@2x.png

# App Store
convert source-icon.png -resize 1024x1024 watch-icon-store.png
```

## Design Guidelines

### Brand Colors
- Primary: #1A1A1A (Dark)
- Accent: #8B7355 (Taupe)
- Background: White or transparent

### Design Tips
1. **Keep it simple** - Watch icons are small
2. **High contrast** - Ensure visibility on all backgrounds
3. **No text** - Icons should be recognizable without text
4. **Centered design** - Keep important elements in the center
5. **Test on device** - View on actual Watch to verify

### Suggested Design

For Ivory's Choice, consider:
- A stylized nail icon
- An "I" monogram in elegant serif font
- A minimalist geometric pattern
- Brand color gradient

## Temporary Solution: Use Placeholder Icons

If you need to test immediately, you can use placeholder icons:

1. **Create a simple colored square:**
   - 1024x1024 PNG
   - Solid color (#8B7355)
   - Add white "I" text in center

2. **Use Xcode to generate sizes:**
   - Import the 1024x1024 icon
   - Xcode will warn about missing sizes
   - You can build and test with just the 1024x1024 icon
   - Generate proper sizes before App Store submission

## Verification

After adding icons:

1. **Clean build:**
   ```bash
   # In Xcode
   Product → Clean Build Folder (Cmd+Shift+K)
   ```

2. **Build Watch app:**
   ```bash
   # Select "ivory Watch App" scheme
   # Build (Cmd+B)
   ```

3. **Check for errors:**
   - No validation errors about missing icons
   - Icons appear in Xcode asset catalog
   - Icons display on Watch simulator/device

4. **Archive and validate:**
   ```bash
   # In Xcode
   Product → Archive
   # Then validate the archive
   ```

## Files Updated

✅ `ios/App/ivory-Watch-App-Info.plist` - Added CFBundleIconName
✅ `ios/App/ivory Watch App/Assets.xcassets/AppIcon.appiconset/Contents.json` - Added all icon slots

## Next Steps

1. **Create or obtain a 1024x1024 app icon**
2. **Use one of the methods above to generate all sizes**
3. **Add icons to the AppIcon asset catalog**
4. **Build and verify**
5. **Archive and submit**

## Resources

- [Apple Watch Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/watchos)
- [App Icon Sizes](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Asset Catalog Format Reference](https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/)

---

**Status:** Configuration files updated ✅
**Remaining:** Add actual icon images
**Priority:** Required for App Store submission
