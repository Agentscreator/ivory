# Mobile-Optimized Drawing Canvas

## Overview
The drawing canvas has been completely redesigned for mobile-first experience with intuitive touch controls, a collapsible toolbar, scissors tool for cropping, and image upload for stickers/overlays.

## Key Mobile Improvements

### 1. **Collapsible Bottom Toolbar**
- Toolbar expands/collapses with a tap
- Always-visible quick tools (draw, eraser, shapes, crop, undo/redo)
- Expanded view shows colors, sizes, and textures
- Prevents toolbar from blocking canvas

### 2. **Compact UI**
- Smaller, touch-friendly buttons (40px touch targets)
- Rounded corners for modern feel
- Reduced padding and spacing
- Floating zoom controls that don't interfere with drawing

### 3. **Simplified Options**
- Reduced colors from 16 to 12 (most commonly used)
- Reduced brush sizes from 10 to 6 options
- Reduced textures from 5 to 3 (solid, soft, marker)
- Cleaner, less overwhelming interface

### 4. **Better Touch Experience**
- Larger touch targets (minimum 40px)
- Visual feedback on all interactions
- Smooth transitions and animations
- Safe area insets for notched devices
- Touch-none class prevents accidental scrolling

### 5. **Intuitive Tool Selection**
- Horizontal scrollable tool bar
- Active tool clearly highlighted
- Icons-only for space efficiency
- Quick access to most-used tools

### 6. **Crop Tool (Scissors)**
- Tap scissors icon to enter crop mode
- Drag to select area to crop
- Dashed border shows crop area
- Apply or cancel crop
- Crops image and resets canvas

### 7. **Image Upload (Stickers)**
- Tap image+ icon to upload
- Select image from device
- Image added as draggable sticker
- Automatically resized to fit (max 200px)
- Use select tool to move/resize/rotate

## Layout Structure

```
┌─────────────────────────────┐
│  [X]    Draw    [Save]      │ ← Compact header
├─────────────────────────────┤
│                             │
│                             │
│      Canvas Area            │ ← Full screen canvas
│                             │
│         [Zoom +/-]          │ ← Floating controls
│                             │
├─────────────────────────────┤
│      [Expand/Collapse]      │ ← Toolbar toggle
├─────────────────────────────┤
│ [✏️][🧹][▢][○][T][✂️][🖼️] [↶][↷] │ ← Quick tools
├─────────────────────────────┤
│  Colors, Sizes, Textures    │ ← Expanded options
│  (when expanded)            │
└─────────────────────────────┘
```

## Features

### Drawing Tools
- **Draw** - Freehand drawing with brush
- **Eraser** - Remove parts of drawing
- **Rectangle** - Draw rectangles
- **Circle** - Draw circles
- **Text** - Add text annotations
- **Crop** - Crop image with scissors
- **Pan** - Move around zoomed canvas
- **Add Image** - Upload stickers/overlays

### Controls
- **Undo/Redo** - Always accessible
- **Zoom In/Out** - Floating buttons
- **Show/Hide** - Toggle drawing visibility
- **Clear All** - Remove everything (with confirmation)
- **Delete Selected** - Remove individual shapes

### Customization
- **12 Colors** - Essential color palette
- **6 Brush Sizes** - 2px to 24px
- **3 Textures** - Solid, soft, marker

## New Features

### Crop Tool
1. Tap scissors icon
2. Drag to select crop area
3. Dashed border shows selection
4. Tap "Apply" to crop or "Cancel" to abort
5. Image is cropped and canvas resets
6. All drawings are cleared (they won't align with new crop)

### Image Upload (Stickers)
1. Tap image+ icon
2. Select image from device
3. Image appears centered on canvas
4. Automatically resized if too large (max 200px)
5. Switch to select mode automatically
6. Drag to move, use handles to resize/rotate
7. Can add multiple images
8. Delete with "Delete Selected" button

## Mobile-Specific Features

1. **Touch Gestures**
   - Single finger: Draw/interact
   - Pinch: Zoom (via mouse wheel handler)
   - Pan mode: Drag to move canvas

2. **Responsive Design**
   - Adapts to any screen size
   - Portrait and landscape support
   - Safe area insets for notched devices

3. **Performance**
   - Konva.js hardware acceleration
   - Smooth 60fps drawing
   - Efficient layer management

4. **Smart Defaults**
   - Toolbar starts collapsed
   - Draw tool selected by default
   - Black color, 8px brush

## User Flow

### Basic Drawing
1. Canvas loads with draw tool active
2. Tap to start drawing immediately
3. Tap tool icons to switch tools
4. Expand toolbar for colors/sizes

### Cropping
1. Tap scissors icon
2. Drag to select area
3. Review selection
4. Tap "Apply" to crop
5. Continue editing cropped image

### Adding Stickers
1. Tap image+ icon
2. Choose image from device
3. Image appears on canvas
4. Drag to position
5. Resize/rotate with handles
6. Add more images as needed

### Saving
1. Tap Save button in header
2. High-quality export (2x pixel ratio)
3. Zoom/pan removed from export
4. All layers merged into final image

## Accessibility

- Minimum 40px touch targets
- Clear visual feedback
- High contrast colors
- Disabled state indicators
- Confirmation for destructive actions
- File input for image upload

## Performance Tips

- Toolbar collapse reduces DOM elements
- Konva layers optimize rendering
- Hardware acceleration enabled
- Efficient event handling
- Images auto-resized to prevent memory issues
