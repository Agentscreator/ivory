# Nail Design Pipeline - Model Selection Guide

This document defines the **correct OpenAI model** to use at every step of the nail design workflow, optimized for accuracy, multimodal capability, speed, and cost.

---

## 🔥 Complete Model Map

```
┌─────────────────────────────────────────────────────────────────────┐
│ USER WORKFLOW                    → MODEL CHOICE                     │
├─────────────────────────────────────────────────────────────────────┤
│ 1. User changes nail settings    → gpt-image-1-mini                │
│    (live preview generation)       (image editing preview)          │
│                                                                      │
│ 2. User enters a text prompt     → gpt-4o-mini                     │
│    (extract design settings)       (JSON extraction)                │
│                                                                      │
│ 3. Generate 3 design variations  → gpt-image-1                     │
│    (standalone concept images)     (or dall-e-3 for premium)       │
│                                                                      │
│ 4. User uploads reference design → No AI model                     │
│    (store + pass to preview)       (storage only)                   │
│                                                                      │
│ 5. Apply design to actual hand   → gpt-image-1-mini                │
│    (final transformation)          (image editing)                  │
│                                                                      │
│ 6. Save design                   → No model                         │
│    (persist to database)           (storage only)                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 STEP 1 & 5: Live Nail Overlay Preview

**Model:** `gpt-image-1-mini`  
**Endpoint:** `openai.responses.create`  
**Location:** `/api/generate-nail-design`

### Why this model?
- Takes **text + image** as input, outputs an **image**
- **Cheapest** image generation model
- Perfect for **iterative previews** and repeated updates
- Preserves the user's exact hand (skin tone, pose, lighting, angle)
- Only modifies the nails

### When it runs:
- Every time user changes a design setting (length, shape, color, finish, texture)
- When a design reference image is provided
- When applying selected AI design to the actual hand

### Configuration:
```typescript
const response = await openai.responses.create({
  model: 'gpt-image-1-mini',
  modalities: ['image'],
  image: {
    size: '1024x1024',
    quality: 'high'
  },
  input: [
    {
      role: 'user',
      content: [
        { type: 'text', text: instructionText },
        { type: 'input_image', image_url: `data:image/png;base64,${base64Image}` },
        // Optional: reference design image
      ]
    }
  ]
})
```

---

## ✨ STEP 2: Analyzing Prompt to Extract Design Settings

**Model:** `gpt-4o-mini`  
**Endpoint:** `openai.chat.completions.create`  
**Location:** `/api/analyze-prompt`

### Why this model?
- Fast, cheap, excellent at **structured reasoning**
- Perfect for extracting JSON from natural language
- No image output required
- Extracts: length, shape, color hex codes, finish, texture, aesthetic vibes

### When it runs:
- User enters text prompt in "AI Designs" tab
- Produces structured design settings that feed into UI controls

### Configuration:
```typescript
const analysisResponse = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: 'You are a nail art design expert. Extract design parameters...'
    },
    {
      role: 'user',
      content: prompt
    }
  ],
  response_format: { type: 'json_object' }
})
```

---

## 🎨 STEP 3: Generating 3 AI Design Examples

**Model:** `gpt-image-1` (or `dall-e-3` for premium)  
**Endpoint:** `openai.responses.create`  
**Location:** `/api/analyze-prompt`

### Why this model?
- Produces **standalone nail design art** (not applied to user's hand)
- Used for style exploration and inspiration grid
- `gpt-image-1`: Fast, consistent, good quality
- `dall-e-3`: Premium photorealistic art (more expensive)

### When it runs:
- After analyzing user's text prompt
- Generates 3 design variations for user to choose from

### Model Selection Guide:
| Task | Best Model | Why |
|------|-----------|-----|
| Fast, cheap variations | `gpt-image-1-mini` | Speed + cost |
| High quality standalone designs | `gpt-image-1` | Better beauty/fashion output |
| Premium photorealistic art | `dall-e-3` | Best artistic quality |

### Configuration:
```typescript
const response = await openai.responses.create({
  model: 'gpt-image-1',
  modalities: ['image'],
  image: {
    size: '1024x1024',
    quality: 'standard'
  },
  input: [
    {
      role: 'user',
      content: [
        { type: 'text', text: designPrompt }
      ]
    }
  ]
})
```

---

## 🖼️ STEP 4: User Uploads Reference Design

**Model:** None  
**Location:** `/api/analyze-design-image`

### What happens:
1. Upload file to R2/Blob storage
2. Return public URL
3. Pass URL as additional `input_image` to `gpt-image-1-mini` during preview generation

### Why no AI model?
- No analysis needed
- Just storage and URL generation
- The uploaded image becomes a reference input for Step 1/5

---

## 💾 STEP 6: Saving Final Result

**Model:** None  
**Location:** `/api/looks`

### What happens:
- Save final generated image
- Save original image
- Save design settings
- Save prompt (if used)
- Store in database

---

## 🎯 Key Principles

1. **gpt-image-1-mini is the PRIMARY model** for applying designs to actual hands
2. **gpt-4o-mini handles all text reasoning** (cheap, fast, accurate)
3. **gpt-image-1 generates standalone concepts** (good balance of quality/cost)
4. **No fallbacks needed** - gpt-image-1-mini is reliable
5. **Every settings change triggers automatic preview** - optimized for speed

---

## 💰 Cost Optimization

| Operation | Frequency | Model | Cost Impact |
|-----------|-----------|-------|-------------|
| Settings change | High (every slider move) | gpt-image-1-mini | Low ✅ |
| Prompt analysis | Medium (per text prompt) | gpt-4o-mini | Very Low ✅ |
| Design variations | Low (3 per prompt) | gpt-image-1 | Medium |
| File upload | Low | None | Storage only |

**Total:** Optimized for iterative design workflow with minimal cost per preview.

---

## 🔧 Implementation Status

- ✅ Step 1: `gpt-image-1-mini` for live preview
- ✅ Step 2: `gpt-4o-mini` for prompt analysis
- ✅ Step 3: `gpt-image-1` for design variations
- ✅ Step 4: Storage only (no model)
- ✅ Step 5: `gpt-image-1-mini` for final application
- ✅ Step 6: Database storage (no model)

All routes updated and optimized according to this specification.
