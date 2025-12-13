# Save and Share Flow - Verification

## Complete User Flow

### 1. Design Creation (Capture Page)
- User captures/uploads hand photo
- Configures design parameters (nail length, shape, color, etc.)
- Clicks "Generate Preview" (costs 1 credit)
- System generates 2 AI nail design images
- Images appear as thumbnails on the right side

### 2. Image Selection & Preview
- User taps any thumbnail to open full-screen modal
- Modal shows:
  - Large preview of the design
  - "Share" button - Opens native share dialog
  - "Select for Save" button - Sets as the image to save
- User can close modal and view other thumbnails

### 3. Saving Design
- User clicks "Save" button in header
- System saves to database with:
  - `userId` - Current user ID
  - `title` - Auto-generated (e.g., "Design 12/13/2024")
  - `imageUrl` - The selected design image
  - `originalImageUrl` - The original hand photo
  - `isPublic` - false by default
- Success toast appears
- Redirects to home page
- Home page refreshes and shows the new design

### 4. Viewing Saved Designs (Home Page)
- All saved designs appear in a grid
- Each card shows:
  - Design thumbnail
  - Title
  - Creation date
- Tap any design to view details

### 5. Design Detail Page
- Shows full-size design image
- Three action buttons:
  1. **Send to Nail Tech** - Opens tech selection page
  2. **Share with Friends** - Opens share page
  3. **Delete Design** - Removes from collection

### 6. Sharing to Nail Techs
- "Send to Nail Tech" button navigates to `/send-to-tech/[id]`
- User can browse nail techs
- Select a tech and send design request
- Tech receives notification

## API Endpoints Used

### Save Flow
- `POST /api/generate-nail-design` - Generates 2 images
- `POST /api/looks` - Saves design to database
- `GET /api/looks?userId={id}` - Fetches user's designs

### View Flow
- `GET /api/looks/[id]` - Gets single design details
- `DELETE /api/looks/[id]` - Deletes a design

## Database Schema
```typescript
looks: {
  id: serial
  userId: integer (references users)
  title: varchar
  imageUrl: text (the generated design)
  originalImageUrl: text (original hand photo)
  aiPrompt: text (optional)
  nailPositions: jsonb (optional)
  isPublic: boolean
  shareToken: varchar (unique)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Current Implementation Status

✅ **Working:**
- Image generation (2 images per credit)
- Thumbnail display with modal preview
- Save functionality with database persistence
- Home page displays saved designs
- Design detail page with actions
- Share to nail techs functionality
- Delete design functionality

✅ **Error Handling:**
- CORS issues resolved (using URL share instead of fetch)
- AbortError silently handled (user cancels share)
- Proper error messages for failed operations

✅ **UX Improvements:**
- Original image stays visible on left
- Generated thumbnails on right with "tap to view" hint
- Full-screen modal for better preview
- Native share dialog integration
- Bottom navigation always accessible

## Testing Checklist

- [ ] Generate design (verify 2 images created)
- [ ] Tap thumbnail to open modal
- [ ] Share from modal (test native share)
- [ ] Select image and save
- [ ] Verify design appears on home page
- [ ] Tap design to view details
- [ ] Test "Send to Nail Tech" button
- [ ] Test "Share with Friends" button
- [ ] Test "Delete Design" button
- [ ] Verify design removed from home page after delete

## Notes

- Each generation costs 1 credit and produces 2 images
- Users can select which of the 2 images to save
- Saved designs persist in database
- Designs can be shared to nail techs for service requests
- All images stored in R2/cloud storage with public URLs
