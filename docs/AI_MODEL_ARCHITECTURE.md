# AI Model Architecture

## Overview
This document explains which AI models are used in each part of the nail design app and why.

## Model Usage by Feature

### 1. DESIGN Tab (Manual Settings)
**Purpose:** Real-time preview of nail designs on user's hand

**Model:** `gpt-image-1-mini` (currently using DALL-E 3 as placeholder)

**When triggered:**
- User changes nail length, shape, base color, finish, or texture
- User selects an AI-generated design concept
- User uploads a custom design image

**What it does:**
- Takes the user's original hand photo
- Applies the design settings/reference image
- Generates a realistic preview showing the design on their actual hand

**Why gpt-image-1-mini:**
- ⚡ Fast response time (critical for real-time UI)
- 💰 Cost-effective for frequent regenerations
- 🎨 Supports image-to-image editing
- ✅ Good enough quality for previews

**API Route:** `/api/generate-nail-design`

---

### 2. AI DESIGNS Tab (Prompt-based Concepts)
**Purpose:** Generate 3 design concept ideas from text prompt

**Models Used:**
1. **gpt-4o-mini** - Analyzes user prompt and extracts design settings
2. **gpt-image-1** - Generates 3 standalone design concept images

**Flow:**
1. User enters prompt like "elegant gold french tips"
2. `gpt-4o-mini` extracts structured settings:
   ```json
   {
     "nail_length": "medium",
     "nail_shape": "almond",
     "base_color": "nude",
     "finish": "glossy",
     "texture": "smooth"
   }
   ```
3. `gpt-image-1` generates 3 design variations
4. Designs are shown in a grid (NOT applied to hand yet)
5. When user selects a design → `gpt-image-1-mini` applies it to their hand

**Why gpt-image-1 (not mini):**
- 🎨 Higher quality for design concepts
- 💎 These are "hero" images shown to inspire users
- 📸 Only generated once per prompt (not real-time)

**API Route:** `/api/analyze-prompt`

---

### 3. UPLOAD Tab (Custom Design Image)
**Purpose:** Let users upload their own design reference

**Models Used:**
- **None** during upload (just stores the image)
- **gpt-image-1-mini** when generating preview

**Flow:**
1. User uploads design image → stored in R2
2. User clicks "Generate Preview"
3. `gpt-image-1-mini` takes:
   - User's hand photo
   - Uploaded design as reference
   - Applies design to the hand

**Why no model during upload:**
- Just need to store the image
- Model only runs when user wants to see it on their hand

**API Route:** `/api/analyze-design-image` (upload), `/api/generate-nail-design` (preview)

---

## Model Comparison

| Model | Speed | Cost | Quality | Use Case |
|-------|-------|------|---------|----------|
| **gpt-image-1-mini** | ⚡⚡⚡ Fast | 💰 Cheap | ⭐⭐⭐ Good | Real-time previews |
| **gpt-image-1** | ⚡⚡ Medium | 💰💰 Medium | ⭐⭐⭐⭐ Great | Design concepts |
| **DALL-E 3** | ⚡ Slow | 💰💰💰 Expensive | ⭐⭐⭐⭐⭐ Excellent | Premium/final renders |
| **gpt-4o-mini** | ⚡⚡⚡ Fast | 💰 Cheap | N/A | Text analysis |

---

## Summary

### When gpt-image-1-mini is used:
✅ **Design Tab** - Manual settings changes  
✅ **AI Designs Tab** - AFTER user selects a concept  
✅ **Upload Tab** - AFTER user uploads and clicks preview  

**Key insight:** `gpt-image-1-mini` is the "preview engine" - it applies ANY design (manual, AI, or uploaded) onto the user's real hand photo.

### When gpt-image-1 is used:
✅ **AI Designs Tab** - Generating the 3 concept images  

**Key insight:** `gpt-image-1` is the "concept generator" - it creates standalone design ideas that inspire users.

### When gpt-4o-mini is used:
✅ **AI Designs Tab** - Analyzing user prompts  

**Key insight:** `gpt-4o-mini` is the "prompt interpreter" - it extracts structured design settings from natural language.

---

## Current Implementation Status

⚠️ **Note:** Currently using DALL-E 3 as a placeholder for `gpt-image-1-mini` until the model is available in the OpenAI API.

To switch to `gpt-image-1-mini` when available:
1. Update `app/api/generate-nail-design/route.ts`
2. Change `model: 'dall-e-3'` to `model: 'gpt-image-1-mini'`
3. Test response format compatibility

---

## Cost Optimization

**Current costs per generation:**
- Preview (DALL-E 3): ~$0.04 per image
- AI Concepts (gpt-image-1): ~$0.01 per image
- Prompt analysis (gpt-4o-mini): ~$0.0001 per request

**After switching to gpt-image-1-mini:**
- Preview (gpt-image-1-mini): ~$0.005 per image ✅ **8x cheaper**
- Total cost reduction: ~80% for preview generation

**Estimated usage:**
- Average user generates 10-20 previews per session
- Current cost: $0.40-$0.80 per session
- With gpt-image-1-mini: $0.05-$0.10 per session
