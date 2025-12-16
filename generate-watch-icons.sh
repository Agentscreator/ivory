#!/bin/bash

# Generate Apple Watch Icons from Main App Icon
# This script creates all required Watch app icon sizes from your main app icon

set -e

echo "🎨 Generating Apple Watch Icons..."

# Source icon (your main app icon)
SOURCE_ICON="ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"

# Destination directory
DEST_DIR="ios/App/ivory Watch App/Assets.xcassets/AppIcon.appiconset"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Error: Source icon not found at $SOURCE_ICON"
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed"
    echo "📦 Install it with: brew install imagemagick"
    exit 1
fi

echo "✅ Source icon found: $SOURCE_ICON"
echo "📁 Destination: $DEST_DIR"
echo ""

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Generate all required icon sizes
echo "🔄 Generating icons..."

# Notification Center icons
convert "$SOURCE_ICON" -resize 48x48 "$DEST_DIR/watch-icon-38mm@2x.png"
echo "  ✓ watch-icon-38mm@2x.png (48x48)"

convert "$SOURCE_ICON" -resize 55x55 "$DEST_DIR/watch-icon-42mm@2x.png"
echo "  ✓ watch-icon-42mm@2x.png (55x55)"

convert "$SOURCE_ICON" -resize 58x58 "$DEST_DIR/watch-icon-40mm@2x.png"
echo "  ✓ watch-icon-40mm@2x.png (58x58)"

convert "$SOURCE_ICON" -resize 66x66 "$DEST_DIR/watch-icon-44mm@2x.png"
echo "  ✓ watch-icon-44mm@2x.png (66x66)"

# Companion Settings icons
convert "$SOURCE_ICON" -resize 58x58 "$DEST_DIR/watch-icon-38mm-companion@2x.png"
echo "  ✓ watch-icon-38mm-companion@2x.png (58x58)"

convert "$SOURCE_ICON" -resize 87x87 "$DEST_DIR/watch-icon-38mm-companion@3x.png"
echo "  ✓ watch-icon-38mm-companion@3x.png (87x87)"

# App Launcher (Home Screen) icons
convert "$SOURCE_ICON" -resize 80x80 "$DEST_DIR/watch-icon-38mm-home@2x.png"
echo "  ✓ watch-icon-38mm-home@2x.png (80x80)"

convert "$SOURCE_ICON" -resize 88x88 "$DEST_DIR/watch-icon-40mm-home@2x.png"
echo "  ✓ watch-icon-40mm-home@2x.png (88x88)"

convert "$SOURCE_ICON" -resize 92x92 "$DEST_DIR/watch-icon-41mm-home@2x.png"
echo "  ✓ watch-icon-41mm-home@2x.png (92x92)"

convert "$SOURCE_ICON" -resize 100x100 "$DEST_DIR/watch-icon-44mm-home@2x.png"
echo "  ✓ watch-icon-44mm-home@2x.png (100x100)"

convert "$SOURCE_ICON" -resize 102x102 "$DEST_DIR/watch-icon-45mm-home@2x.png"
echo "  ✓ watch-icon-45mm-home@2x.png (102x102)"

convert "$SOURCE_ICON" -resize 108x108 "$DEST_DIR/watch-icon-49mm-home@2x.png"
echo "  ✓ watch-icon-49mm-home@2x.png (108x108)"

# Quick Look icons
convert "$SOURCE_ICON" -resize 172x172 "$DEST_DIR/watch-icon-38mm-short@2x.png"
echo "  ✓ watch-icon-38mm-short@2x.png (172x172)"

convert "$SOURCE_ICON" -resize 196x196 "$DEST_DIR/watch-icon-42mm-short@2x.png"
echo "  ✓ watch-icon-42mm-short@2x.png (196x196)"

convert "$SOURCE_ICON" -resize 216x216 "$DEST_DIR/watch-icon-44mm-short@2x.png"
echo "  ✓ watch-icon-44mm-short@2x.png (216x216)"

convert "$SOURCE_ICON" -resize 234x234 "$DEST_DIR/watch-icon-45mm-short@2x.png"
echo "  ✓ watch-icon-45mm-short@2x.png (234x234)"

convert "$SOURCE_ICON" -resize 258x258 "$DEST_DIR/watch-icon-49mm-short@2x.png"
echo "  ✓ watch-icon-49mm-short@2x.png (258x258)"

# App Store icon (1024x1024)
convert "$SOURCE_ICON" -resize 1024x1024 "$DEST_DIR/watch-icon-store.png"
echo "  ✓ watch-icon-store.png (1024x1024)"

echo ""
echo "✅ All Watch icons generated successfully!"
echo "📍 Location: $DEST_DIR"
echo ""
echo "Next steps:"
echo "1. Open Xcode: open ios/App/App.xcodeproj"
echo "2. Clean build folder (Cmd+Shift+K)"
echo "3. Archive the app (Product → Archive)"
echo "4. Validate and upload to App Store Connect"
