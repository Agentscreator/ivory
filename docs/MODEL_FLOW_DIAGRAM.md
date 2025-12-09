# AI Model Flow Diagram

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                      (app/editor/page.tsx)                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌───────────┐  ┌──────────┐  ┌────────┐
            │  DESIGN   │  │    AI    │  │ UPLOAD │
            │    TAB    │  │ DESIGNS  │  │  TAB   │
            └───────────┘  └──────────┘  └────────┘
```

---

## 1️⃣ DESIGN TAB FLOW

```
User changes setting (length/shape/color/finish/texture)
    │
    ▼
generateAIPreview(designSettings)
    │
    ▼
POST /api/generate-nail-design
    │
    ├─ Input: originalImage (user's hand)
    ├─ Input: prompt (design settings)
    └─ Input: selectedDesignImage (optional)
    │
    ▼
┌─────────────────────────────────────┐
│      gpt-image-1-mini               │
│  ─────────────────────────────────  │
│  • Receives: hand image + settings  │
│  • Edits: applies design to nails   │
│  • Returns: edited hand image       │
└─────────────────────────────────────┘
    │
    ▼
Upload to R2 Storage
    │
    ▼
Return permanent URL
    │
    ▼
Display preview to user
```

**Model Used**: `gpt-image-1-mini`  
**Why**: Fast, cheap, perfect for real-time updates  
**Frequency**: High (every settings change)

---

## 2️⃣ AI DESIGNS TAB FLOW

```
User enters prompt: "minimalist floral with pink tones"
    │
    ▼
generateAIDesigns()
    │
    ▼
POST /api/analyze-prompt
    │
    ├─ STEP 1: Prompt Analysis ─────────────────┐
    │                                            │
    │   ┌─────────────────────────────────────┐ │
    │   │      gpt-4o-mini                    │ │
    │   │  ─────────────────────────────────  │ │
    │   │  • Receives: user prompt            │ │
    │   │  • Analyzes: extracts parameters    │ │
    │   │  • Returns: JSON with settings      │ │
    │   └─────────────────────────────────────┘ │
    │                                            │
    ├────────────────────────────────────────────┘
    │
    ├─ STEP 2: Concept Generation (3x) ─────────┐
    │                                            │
    │   ┌─────────────────────────────────────┐ │
    │   │      gpt-image-1 (NOT MINI)         │ │
    │   │  ─────────────────────────────────  │ │
    │   │  • Receives: enhanced prompt        │ │
    │   │  • Generates: standalone concept    │ │
    │   │  • Returns: design image            │ │
    │   └─────────────────────────────────────┘ │
    │                                            │
    │   (Repeat 3 times for 3 concepts)          │
    │                                            │
    ├────────────────────────────────────────────┘
    │
    ▼
Upload all 3 concepts to R2
    │
    ▼
Display 3 design concepts in grid
    │
    ▼
User selects one concept
    │
    ▼
handleDesignSelect(designUrl)
    │
    ▼
generateAIPreview(designSettings, designUrl)
    │
    ▼
POST /api/generate-nail-design
    │
    ├─ Input: originalImage (user's hand)
    ├─ Input: prompt (design settings)
    └─ Input: selectedDesignImage (selected concept)
    │
    ▼
┌─────────────────────────────────────┐
│      gpt-image-1-mini               │
│  ─────────────────────────────────  │
│  • Receives: hand + selected design │
│  • Edits: applies design to nails   │
│  • Returns: edited hand image       │
└─────────────────────────────────────┘
    │
    ▼
Upload to R2 Storage
    │
    ▼
Display preview on user's hand
```

**Models Used**:
1. `gpt-4o-mini` - Prompt analysis (cheap, fast)
2. `gpt-image-1` - Concept generation (quality, 3x)
3. `gpt-image-1-mini` - Apply to hand (fast, after selection)

**Frequency**: Low (user-initiated)

---

## 3️⃣ UPLOAD TAB FLOW

```
User uploads custom design image
    │
    ▼
handleFileUpload(file)
    │
    ▼
POST /api/analyze-design-image
    │
    ├─ NO AI MODEL USED HERE
    │
    ▼
Upload to R2 Storage
    │
    ▼
Return permanent URL
    │
    ▼
setSelectedDesignImage(url)
    │
    ▼
generateAIPreview(designSettings, url)
    │
    ▼
POST /api/generate-nail-design
    │
    ├─ Input: originalImage (user's hand)
    ├─ Input: prompt (design settings)
    └─ Input: selectedDesignImage (uploaded design)
    │
    ▼
┌─────────────────────────────────────┐
│      gpt-image-1-mini               │
│  ─────────────────────────────────  │
│  • Receives: hand + uploaded design │
│  • Edits: applies design to nails   │
│  • Returns: edited hand image       │
└─────────────────────────────────────┘
    │
    ▼
Upload to R2 Storage
    │
    ▼
Display preview on user's hand
```

**Models Used**:
- None for upload
- `gpt-image-1-mini` - Apply to hand

**Frequency**: Low (user-initiated)

---

## Model Comparison

```
┌──────────────────┬─────────────────┬─────────────────┬──────────────────┐
│      Model       │   Speed         │   Cost          │   Use Case       │
├──────────────────┼─────────────────┼─────────────────┼──────────────────┤
│ gpt-image-1-mini │ ⚡⚡⚡ Fast      │ 💰 Cheap        │ Preview editing  │
│ gpt-image-1      │ ⚡⚡ Moderate    │ 💰💰 Moderate   │ Concept creation │
│ gpt-4o-mini      │ ⚡⚡⚡ Very Fast │ 💰 Very Cheap   │ Text analysis    │
└──────────────────┴─────────────────┴─────────────────┴──────────────────┘
```

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  • User's hand image (originalImage)                            │
│  • Design settings (length, shape, color, etc.)                 │
│  • Optional: selected design image                              │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES                                 │
│  • /api/generate-nail-design (gpt-image-1-mini)                 │
│  • /api/analyze-prompt (gpt-4o-mini + gpt-image-1)              │
│  • /api/analyze-design-image (no AI)                            │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OPENAI API                                 │
│  • gpt-image-1-mini: Image editing (hand + design → preview)    │
│  • gpt-image-1: Image generation (prompt → concept)             │
│  • gpt-4o-mini: Text analysis (prompt → JSON)                   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      R2 STORAGE                                 │
│  • /generated/* - Preview images (from gpt-image-1-mini)        │
│  • /generated/* - Concept images (from gpt-image-1)             │
│  • /designs/* - Uploaded images (from user)                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND                                   │
│  • Display preview image                                        │
│  • Display concept grid                                         │
│  • Allow user to save design                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cost Optimization Strategy

```
High Frequency Operations (Design Tab)
    ↓
Use gpt-image-1-mini (cheap, fast)
    ↓
Cost per preview: ~$0.01
    ↓
10-20 previews per session: $0.10-0.20

Low Frequency Operations (AI Designs)
    ↓
Use gpt-image-1 (quality, moderate cost)
    ↓
Cost per concept: ~$0.05
    ↓
3 concepts per prompt: $0.15

Text Analysis (AI Designs)
    ↓
Use gpt-4o-mini (very cheap)
    ↓
Cost per analysis: ~$0.001
    ↓
Negligible cost

Total per user session: ~$0.25-0.35
```

---

## Error Handling

```
API Call Fails
    │
    ├─ 401 Unauthorized
    │   └─> "OpenAI API key is invalid or expired"
    │
    ├─ 429 Rate Limited
    │   └─> "Rate limited by OpenAI. Please try again later."
    │
    ├─ 400 Bad Request
    │   └─> "Invalid request to OpenAI: [details]"
    │
    └─ 500 Server Error
        └─> "Failed to generate nail design"
```

All errors are logged and returned to frontend for user feedback.
