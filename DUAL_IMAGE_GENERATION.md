# Dual Image Generation Update

## Overview
Updated the image generation system to produce **2 images per credit** instead of 1, providing better value to users.

## Changes Made

### Backend (`app/api/generate-nail-design/route.ts`)
- Changed OpenAI API parameter from `n: 1` to `n: 2`
- Updated response handling to process multiple images
- Parallel upload of all generated images to R2 storage
- Response now includes:
  - `imageUrls`: Array of all generated image URLs
  - `imageUrl`: First image URL (for backward compatibility)

### Frontend (`app/editor/page.tsx`)
- Added `dalleImages` state to store multiple generated images
- Updated grid layout to show 3 columns when multiple images are generated
- Each generated image is clickable and can be selected as the primary design
- Visual indicator (ring) shows which image is currently selected
- Success toast shows count of generated images

### Frontend (`app/capture/page.tsx`)
- Added `finalPreviews` state to store multiple generated images
- Updated grid layout to dynamically adjust (2 or 3 columns)
- Each preview image is clickable and opens in new tab
- Selected image highlighted with ring indicator
- Success toast shows count of generated images

## User Experience

### Before
- 1 credit = 1 image
- Single preview shown

### After
- 1 credit = 2 images
- Multiple previews shown in grid
- Users can select their favorite from the variations
- Better value proposition

## Technical Details

**API Response Format:**
```json
{
  "imageUrls": ["url1", "url2"],
  "imageUrl": "url1",
  "creditsRemaining": 7
}
```

**Grid Layout:**
- 2 columns: Original + Preview (when no images generated)
- 3 columns: Original + Design 1 + Design 2 (when 2 images generated)

**Backward Compatibility:**
- `imageUrl` field maintained for any legacy code
- Falls back gracefully if `imageUrls` is not present

## Cost Impact

**Per Generation:**
- OpenAI API: 2x cost (generating 2 images instead of 1)
- R2 Storage: 2x uploads
- User Credits: Still 1 credit (better value for users)

**Business Impact:**
- Increased API costs per generation
- Improved user satisfaction (2 variations to choose from)
- Better conversion potential (users more likely to find a design they love)
