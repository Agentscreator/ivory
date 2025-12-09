# AI Model Quick Reference

## 🎯 When to Use Each Model

### gpt-image-1-mini
**Use for**: Applying designs to user's hand (preview generation)
- ✅ Design tab - every settings change
- ✅ AI Designs tab - after user selects a concept
- ✅ Upload tab - after user uploads a design
- **API Route**: `/api/generate-nail-design`

### gpt-image-1
**Use for**: Generating design concept images
- ✅ AI Designs tab - creating 3 standalone concepts
- **API Route**: `/api/analyze-prompt`

### gpt-4o-mini
**Use for**: Text analysis and JSON extraction
- ✅ AI Designs tab - parsing user prompts
- **API Route**: `/api/analyze-prompt`

---

## 📋 Implementation Checklist

### ✅ Design Tab
- [x] Uses `gpt-image-1-mini` for preview generation
- [x] Passes original hand image + design settings
- [x] Optionally includes reference design image
- [x] Uploads result to R2

### ✅ AI Designs Tab
- [x] Step 1: `gpt-4o-mini` analyzes prompt → JSON
- [x] Step 2: `gpt-image-1` generates 3 concepts
- [x] Step 3: User selects concept
- [x] Step 4: `gpt-image-1-mini` applies to hand
- [x] All images uploaded to R2

### ✅ Upload Tab
- [x] Upload design to R2 (no AI)
- [x] `gpt-image-1-mini` applies to hand
- [x] Result uploaded to R2

---

## 🔧 API Routes

### `/api/generate-nail-design`
**Model**: `gpt-image-1-mini`  
**Purpose**: Apply design to user's hand

**Request**:
```json
{
  "prompt": "Design specifications...",
  "originalImage": "https://...",
  "selectedDesignImage": "https://..." // optional
}
```

**Response**:
```json
{
  "imageUrl": "https://r2.dev/generated/..."
}
```

### `/api/analyze-prompt`
**Models**: `gpt-4o-mini` + `gpt-image-1`  
**Purpose**: Analyze prompt and generate concepts

**Request**:
```json
{
  "prompt": "minimalist floral with pink tones"
}
```

**Response**:
```json
{
  "designs": [
    "https://r2.dev/generated/...",
    "https://r2.dev/generated/...",
    "https://r2.dev/generated/..."
  ],
  "inferredSettings": {
    "nailLength": "medium",
    "nailShape": "oval",
    "baseColor": "#FF6B9D",
    ...
  }
}
```

### `/api/analyze-design-image`
**Models**: None  
**Purpose**: Upload custom design to storage

**Request**: FormData with file

**Response**:
```json
{
  "imageUrl": "https://r2.dev/designs/...",
  "success": true
}
```

---

## 💡 Key Points

1. **gpt-image-1-mini is the workhorse** - used for all preview generation
2. **gpt-image-1 is for concepts** - only used in AI Designs tab
3. **All images are uploaded to R2** - no data URLs in responses
4. **Reference images are optional** - can be from AI Designs or Upload tab
5. **Cost-optimized** - frequent operations use cheap models

---

## 🐛 Debugging

### Check which model is being used:
```bash
# Look for these log messages:
"🤖 Generating nail design preview with gpt-image-1-mini..."
"🎨 Generating design concept 1/3 with gpt-image-1..."
```

### Verify API calls:
```typescript
// In browser console:
// Design tab should call:
fetch('/api/generate-nail-design', ...)

// AI Designs tab should call:
fetch('/api/analyze-prompt', ...)  // First
fetch('/api/generate-nail-design', ...)  // After selection

// Upload tab should call:
fetch('/api/analyze-design-image', ...)  // First
fetch('/api/generate-nail-design', ...)  // After upload
```

### Common issues:
- **Preview not updating**: Check if `generateAIPreview()` is being called
- **Wrong model used**: Check API route logs
- **Images not persisting**: Verify R2 upload is working
- **Slow generation**: Make sure using mini for previews, not full model
