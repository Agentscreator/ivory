# Documentation Index

Welcome to the Ivory Nail Design App documentation!

## 📚 Documentation Files

### Quick Start
- **[MODEL_SUMMARY.md](./MODEL_SUMMARY.md)** - Start here! Quick overview of the AI model architecture
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Fast lookup guide for developers

### Detailed Guides
- **[AI_MODEL_USAGE.md](./AI_MODEL_USAGE.md)** - Complete architecture documentation with code examples
- **[MODEL_FLOW_DIAGRAM.md](./MODEL_FLOW_DIAGRAM.md)** - Visual flow diagrams for each feature

### Other Documentation
- **[SERVICES.md](./SERVICES.md)** - Service layer documentation
- **[ENVIRONMENT.md](./ENVIRONMENT.md)** - Environment variables and configuration
- **[MOBILE_OPTIMIZATION.md](./MOBILE_OPTIMIZATION.md)** - Mobile-specific optimizations

---

## 🎯 AI Model Architecture

The app uses three OpenAI models:

1. **gpt-image-1-mini** - Real-time preview generation (fast, cheap)
2. **gpt-image-1** - Design concept generation (quality)
3. **gpt-4o-mini** - Text analysis (very cheap)

### When Each Model is Used

| Feature | Models | Purpose |
|---------|--------|---------|
| Design Tab | `gpt-image-1-mini` | Apply settings to user's hand |
| AI Designs Tab | `gpt-4o-mini` + `gpt-image-1` + `gpt-image-1-mini` | Analyze prompt → Generate concepts → Apply to hand |
| Upload Tab | `gpt-image-1-mini` | Apply uploaded design to hand |

---

## 🚀 Quick Links

### For Developers
- [Quick Reference](./QUICK_REFERENCE.md) - API routes, debugging tips
- [AI Model Usage](./AI_MODEL_USAGE.md) - Implementation details

### For Understanding the System
- [Model Summary](./MODEL_SUMMARY.md) - High-level overview
- [Flow Diagrams](./MODEL_FLOW_DIAGRAM.md) - Visual representations

### For Configuration
- [Environment Variables](./ENVIRONMENT.md) - Setup guide
- [Services](./SERVICES.md) - Service layer details

---

## 📖 Reading Order

**New to the project?** Read in this order:
1. [MODEL_SUMMARY.md](./MODEL_SUMMARY.md) - Understand the big picture
2. [MODEL_FLOW_DIAGRAM.md](./MODEL_FLOW_DIAGRAM.md) - See how it works visually
3. [AI_MODEL_USAGE.md](./AI_MODEL_USAGE.md) - Deep dive into implementation
4. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Keep this handy while coding

**Need to debug?** Go straight to:
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Debugging section

**Setting up the project?** Start with:
- [ENVIRONMENT.md](./ENVIRONMENT.md) - Configuration guide

---

## 🎨 Architecture Overview

```
User Interface (app/editor/page.tsx)
    ↓
API Routes
├─ /api/generate-nail-design (gpt-image-1-mini)
├─ /api/analyze-prompt (gpt-4o-mini + gpt-image-1)
└─ /api/analyze-design-image (storage only)
    ↓
OpenAI API
├─ gpt-image-1-mini (preview generation)
├─ gpt-image-1 (concept generation)
└─ gpt-4o-mini (text analysis)
    ↓
R2 Storage (Cloudflare)
├─ /generated/* (AI-generated images)
└─ /designs/* (user uploads)
```

---

## 💡 Key Concepts

### Preview Generation
The process of applying a nail design to the user's actual hand photo. Always uses `gpt-image-1-mini` for speed and cost efficiency.

### Concept Generation
Creating standalone design idea images (not applied to hand yet). Uses `gpt-image-1` for higher quality creative output.

### Reference Design
An optional image (from AI concepts or user upload) that guides the preview generation. Helps `gpt-image-1-mini` understand what design to apply.

---

## 🔧 API Routes

### `/api/generate-nail-design`
**Purpose**: Apply design to user's hand  
**Model**: `gpt-image-1-mini`  
**Input**: Original hand image + design settings + optional reference  
**Output**: Preview image URL

### `/api/analyze-prompt`
**Purpose**: Generate design concepts from text  
**Models**: `gpt-4o-mini` (analysis) + `gpt-image-1` (generation)  
**Input**: User prompt  
**Output**: 3 concept image URLs + inferred settings

### `/api/analyze-design-image`
**Purpose**: Upload custom design  
**Models**: None (storage only)  
**Input**: Image file  
**Output**: Uploaded image URL

---

## 📊 Cost Optimization

The architecture is designed to minimize costs:

1. **Frequent operations** (Design tab) use the cheapest model (`gpt-image-1-mini`)
2. **Rare operations** (AI concepts) use higher quality models (`gpt-image-1`)
3. **Text processing** uses the cheapest text model (`gpt-4o-mini`)
4. **No redundant calls** - each model is used only when necessary

**Result**: ~$0.25-0.35 per user session

---

## 🐛 Debugging

Check the logs for these messages:
- `"🤖 Generating nail design preview with gpt-image-1-mini..."`
- `"🎨 Generating design concept 1/3 with gpt-image-1..."`

See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for more debugging tips.

---

## 📝 Contributing

When adding new features:
1. Follow the existing model usage patterns
2. Use `gpt-image-1-mini` for preview generation
3. Use `gpt-image-1` for concept generation
4. Update documentation accordingly

---

## 🎉 Implementation Status

✅ All features implemented  
✅ All models correctly configured  
✅ All images uploaded to R2  
✅ Error handling complete  
✅ Documentation complete  

The system is ready to use!
