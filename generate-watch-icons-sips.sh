#!/bin/bash

# Generate Apple Watch Icons using macOS built-in sips tool
# No external dependencies required!

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

echo "✅ Source icon found: $SOURCE_ICON"
echo "📁 Destination: $DEST_DIR"
echo ""

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Function to resize icon
resize_icon() {
    local size=$1
    local output=$2
    sips -z $size $size "$SOURCE_ICON" --out "$DEST_DIR/$output" > /dev/null 2>&1
    echo "  ✓ $output (${size}x${size})"
}

# Generate all required icon sizes
echo "🔄 Generating icons..."

# Notification Center icons
resize_icon 48 "watch-icon-38mm@2x.png"
resize_icon 55 "watch-icon-42mm@2x.png"
resize_icon 58 "watch-icon-40mm@2x.png"
resize_icon 66 "watch-icon-44mm@2x.png"

# Companion Settings icons
resize_icon 58 "watch-icon-38mm-companion@2x.png"
resize_icon 87 "watch-icon-38mm-companion@3x.png"

# App Launcher (Home Screen) icons
resize_icon 80 "watch-icon-38mm-home@2x.png"
resize_icon 88 "watch-icon-40mm-home@2x.png"
resize_icon 92 "watch-icon-41mm-home@2x.png"
resize_icon 100 "watch-icon-44mm-home@2x.png"
resize_icon 102 "watch-icon-45mm-home@2x.png"
resize_icon 108 "watch-icon-49mm-home@2x.png"

# Quick Look icons
resize_icon 172 "watch-icon-38mm-short@2x.png"
resize_icon 196 "watch-icon-42mm-short@2x.png"
resize_icon 216 "watch-icon-44mm-short@2x.png"
resize_icon 234 "watch-icon-45mm-short@2x.png"
resize_icon 258 "watch-icon-49mm-short@2x.png"

# App Store icon (1024x1024)
resize_icon 1024 "watch-icon-store.png"

echo ""
echo "✅ All 18 Watch icons generated successfully!"
echo "📍 Location: $DEST_DIR"
echo ""
echo "Next steps:"
echo "1. Verify icons: ls -la '$DEST_DIR'"
echo "2. Open Xcode: open ios/App/App.xcodeproj"
echo "3. Clean build folder (Cmd+Shift+K)"
echo "4. Archive the app (Product → Archive)"
echo "5. Validate and upload to App Store Connect"
