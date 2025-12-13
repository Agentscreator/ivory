# Multi-Image Generation Update

## Overview
Updated the image generation system to produce **4 images per credit** instead of 1, providing exceptional value to users.

## Changes Made

### Backend (`app/api/generate-nail-design/route.ts`)
- Changed OpenAI API parameter from `n: 1` to `n: 4`
- Updated response handling to process multiple images
- Parallel upload of all generated images to R2 storage
- Response now includes:
  - `imageUrls`: Array of all generated image URLs (4 images)
  - `imageUrl`: First image URL (for backward compatibility)

### Frontend (`app/editor/page.tsx`)
- Added `dalleImages` state to store multiple generated images
- Updated grid layout:
  - Original image shown full-width at top when images are generated
  - 4 generated images displayed in 2x2 grid below
  - Responsive: 1 column on mobile, 2 columns on desktop
- Each generated image is clickable and can be selected as the primary design
- Visual indicator (ring) shows which image is currently selected
- Success toast shows count of generated images

### Frontend (`app/capture/page.tsx`)
- Added `finalPreviews` state to store multiple generated images
- Updated grid layout:
  - Original image shown full-width at top when images are generated
  - 4 generated images displayed in 2x2 grid below
  - Responsive: 1 column on mobile, 2 columns on desktop
- Each preview image is clickable and opens in new tab
- Selected image highlighted with ring indicator
- Success toast shows count of generated images

## User Experience

### Before
- 1 credit = 1 image
- Single preview shown

### After
- 1 credit = 4 images
- Multiple previews shown in 2x2 grid
- Users can select their favorite from 4 variations
- Exceptional value proposition
- More design options to choose from

## Technical Details

**API Response Format:**
```json
{
  "imageUrls": ["url1", "url2", "url3", "url4"],
  "imageUrl": "url1",
  "creditsRemaining": 7
}
```

**Grid Layout:**
- 2 columns side-by-side: Original + Preview placeholder (when no images generated)
- Stacked layout when images generated:
  - Top: Original image (full width)
  - Bottom: 4 generated images in 2x2 grid (responsive: 1 col mobile, 2 cols desktop)

**Backward Compatibility:**
- `imageUrl` field maintained for any legacy code
- Falls back gracefully if `imageUrls` is not present

## Cost Impact

**Per Generation:**
- OpenAI API: 4x cost (generating 4 images instead of 1)
- R2 Storage: 4x uploads
- User Credits: Still 1 credit (exceptional value for users)

**Business Impact:**
- Increased API costs per generation (4x)
- Significantly improved user satisfaction (4 variations to choose from)
- Better conversion potential (users much more likely to find a design they love)
- Reduced need for regeneration (more options upfront)
- Higher perceived value of credits
