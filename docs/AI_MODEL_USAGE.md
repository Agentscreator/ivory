# AI Model Architecture

This document explains how different OpenAI models are used across the nail design app.

## Model Overview

### 🎯 gpt-image-1-mini (Fast Image Editing)
**Purpose**: Real-time preview generation - applying designs to user's actual hand  
**Cost**: Cheap  
**Speed**: Fast  
**Use Case**: Image-to-image editing

### 🎨 gpt-image-1 (Quality Concept Generation)
**Purpose**: Generate standalone design concept images  
**Cost**: Moderate  
**Speed**: Moderate  
**Use Case**: Creative concept generation

### 🧠 gpt-4o-mini (Text Processing)
**Purpose**: Parse user prompts into structured JSON  
**Cost**: Very cheap  
**Speed**: Very fast  
**Use Case**: Text analysis and extraction

---

## Usage by Tab

### 1️⃣ DESIGN Tab (Manual Settings)

**Trigger**: User changes any design setting (length, shape, color, finish, texture)

**Flow**:
```
User changes setting
  ↓
Frontend calls /api/generate-nail-design
  ↓
gpt-image-1-mini receives:
  - Original hand image
  - Text instructions with design settings
  - (Optional) Reference design image
  ↓
gpt-image-1-mini edits the hand image
  ↓
Result uploaded to R2
  ↓
Preview shown to user
```

**Model Used**: `gpt-image-1-mini`

**Why**: Fast, cheap, perfect for iterative UI changes. Supports image-to-image editing.

**API Route**: `/api/generate-nail-design`

**Input**:
- `originalImage`: User's hand photo URL
- `prompt`: Text description of design settings
- `selectedDesignImage`: (Optional) Reference design from AI or Upload tab

**Output**: Edited hand image with nail design applied

---

### 2️⃣ AI DESIGNS Tab (Prompt-Based Ideas)

**Trigger**: User enters text prompt and clicks generate

**Flow**:
```
User enters prompt: "minimalist floral with pink tones"
  ↓
Frontend calls /api/analyze-prompt
  ↓
STEP 1: gpt-4o-mini analyzes prompt
  - Extracts: nail_length, nail_shape, base_color, finish, etc.
  - Returns structured JSON
  ↓
STEP 2: gpt-image-1 generates 3 design concepts
  - Creates standalone nail art images
  - NOT applied to user's hand yet
  - Just inspiration/reference images
  ↓
Results uploaded to R2
  ↓
3 design concepts shown in grid
  ↓
User selects one design
  ↓
Frontend calls /api/generate-nail-design
  ↓
gpt-image-1-mini applies selected design to user's hand
  ↓
Preview shown to user
```

**Models Used**:
1. `gpt-4o-mini` - Prompt analysis and JSON extraction
2. `gpt-image-1` - Generate 3 design concepts (NOT MINI)
3. `gpt-image-1-mini` - Apply selected design to hand (after user selects)

**API Routes**:
- `/api/analyze-prompt` - Uses gpt-4o-mini + gpt-image-1
- `/api/generate-nail-design` - Uses gpt-image-1-mini (after selection)

---

### 3️⃣ UPLOAD Tab (Custom Design Image)

**Trigger**: User uploads their own design image

**Flow**:
```
User uploads design image
  ↓
Frontend calls /api/analyze-design-image
  ↓
Image uploaded to R2 (NO AI MODEL USED)
  ↓
URL returned to frontend
  ↓
Frontend calls /api/generate-nail-design
  ↓
gpt-image-1-mini receives:
  - Original hand image
  - Uploaded design image as reference
  - Text instructions
  ↓
gpt-image-1-mini applies uploaded design to hand
  ↓
Preview shown to user
```

**Models Used**:
- None during upload
- `gpt-image-1-mini` - Apply uploaded design to hand

**API Routes**:
- `/api/analyze-design-image` - No AI, just storage
- `/api/generate-nail-design` - Uses gpt-image-1-mini

---

## Summary Table

| Tab | Purpose | Models Used | What gpt-image-1-mini Does |
|-----|---------|-------------|---------------------------|
| **Design** | Manual settings changes | `gpt-image-1-mini` | Applies updated design settings to real hand |
| **AI Designs** | Generate concept ideas | `gpt-4o-mini` + `gpt-image-1` | Only used AFTER design is selected → applies to hand |
| **Upload** | User uploads design | No model for upload → then `gpt-image-1-mini` | Applies user's uploaded design to real hand |

---

## Key Principles

### ✅ Use gpt-image-1-mini ANYTIME you want to:
- Produce a preview of the user's actual hand with nail art applied
- This includes:
  - Manual settings changes (Design tab)
  - Selecting an AI-generated concept (AI Designs tab)
  - Uploading a custom design (Upload tab)

### ❌ DO NOT use gpt-image-1-mini to:
- Generate design ideas/concepts
- That job is for `gpt-image-1`

---

## Cost Optimization

**Why this architecture is efficient**:

1. **Frequent operations use cheap model**: Design tab changes happen constantly, so we use gpt-image-1-mini
2. **Rare operations use quality model**: AI concept generation happens less often, so we can afford gpt-image-1
3. **Text processing uses cheapest model**: gpt-4o-mini is perfect for JSON extraction
4. **No redundant calls**: Upload tab doesn't use AI until preview generation

**Estimated costs per user session**:
- Design tab: 10-20 preview generations × gpt-image-1-mini = $0.10-0.20
- AI Designs: 1 prompt analysis (gpt-4o-mini) + 3 concepts (gpt-image-1) + 1 preview (gpt-image-1-mini) = $0.15
- Upload: 1 preview (gpt-image-1-mini) = $0.01

---

## Implementation Details

### API Route: `/api/generate-nail-design`

**Model**: `gpt-image-1-mini`

**Input Format**:
```typescript
{
  prompt: string,              // Design specifications
  originalImage: string,       // User's hand photo URL
  selectedDesignImage?: string // Optional reference design
}
```

**OpenAI API Call**:
```typescript
await openai.responses.create({
  model: 'gpt-image-1-mini',
  modalities: ['image'],
  image: {
    size: '1024x1024',
    quality: 'standard'
  },
  input: [
    {
      role: 'user',
      content: [
        {
          type: 'input_image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: originalImageBase64
          }
        },
        // Optional: reference design image
        {
          type: 'input_image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: designImageBase64
          }
        },
        {
          type: 'input_text',
          text: instructionText
        }
      ]
    }
  ]
})
```

### API Route: `/api/analyze-prompt`

**Models**: `gpt-4o-mini` + `gpt-image-1`

**Step 1 - Prompt Analysis**:
```typescript
await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: 'Extract design parameters as JSON...'
    },
    {
      role: 'user',
      content: userPrompt
    }
  ],
  response_format: { type: 'json_object' }
})
```

**Step 2 - Concept Generation**:
```typescript
// Generate 3 times
await openai.responses.create({
  model: 'gpt-image-1', // NOT MINI
  modalities: ['image'],
  image: {
    size: '1024x1024',
    quality: 'standard'
  },
  input: [
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: designPrompt
        }
      ]
    }
  ]
})
```

---

## Testing

To verify the correct models are being used:

1. **Check logs**: Each API route logs which model it's using
2. **Monitor costs**: gpt-image-1-mini should be the most frequent call
3. **Verify behavior**:
   - Design tab changes should be fast (gpt-image-1-mini)
   - AI Designs should generate 3 concepts first (gpt-image-1)
   - Upload should only use AI after upload completes (gpt-image-1-mini)

---

## Future Enhancements

1. **Caching**: Cache gpt-image-1 concept generations for common prompts
2. **Batch processing**: Generate all 3 AI concepts in parallel
3. **Progressive quality**: Start with gpt-image-1-mini preview, upgrade to gpt-image-1 on demand
4. **User preference**: Let premium users choose gpt-image-1 for all previews
