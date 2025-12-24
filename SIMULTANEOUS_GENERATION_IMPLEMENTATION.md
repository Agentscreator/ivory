# Simultaneous Design Generation - Implementation Summary

## Problem
When users navigate to a new tab while generating a design, the generation stops because the component unmounts and the API request is cancelled.

## Solution
Implemented a background job system that allows multiple designs to generate simultaneously without blocking navigation.

## What Was Changed

### 1. Database Schema (`db/schema.ts`)
- Added `generationJobs` table to track background generation requests
- Stores all generation parameters and results
- Tracks status: pending → processing → completed/failed

### 2. New API Endpoints

#### `/api/generate-nail-design-job` (POST)
- Creates a generation job
- Returns job ID immediately
- Non-blocking

#### `/api/generation-job/[jobId]` (GET)
- Checks job status
- Returns results when complete

#### `/api/process-generation-jobs` (POST)
- Background worker that processes pending jobs
- Handles actual OpenAI API calls
- Deducts credits and uploads results

### 3. Client Hook (`hooks/use-generation-job.ts`)
- Polls job status every 3 seconds
- Auto-stops when complete
- Provides real-time updates

### 4. Migration Script
- `db/migrations/add_generation_jobs.sql`
- Already applied to database ✅

## Next Steps to Complete Implementation

### Update `app/capture/page.tsx`

1. **Add job ID to tab state:**
```typescript
type DesignTab = {
  // ... existing fields
  generationJobId?: string | null
}
```

2. **Replace direct generation with job creation:**
```typescript
// In generateAIPreview function
const response = await fetch('/api/generate-nail-design-job', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    prompt, 
    originalImage: capturedImage,
    selectedDesignImages,
    drawingImageUrl,
    influenceWeights: weights,
    designSettings
  }),
})

const { jobId } = await response.json()

// Store job ID in tab
setDesignTabs(tabs => tabs.map(tab => 
  tab.id === activeTabId 
    ? { ...tab, generationJobId: jobId, isGenerating: true }
    : tab
))
```

3. **Add polling for results:**
```typescript
import { useGenerationJob } from '@/hooks/use-generation-job'

// In component
const { job } = useGenerationJob(activeTab?.generationJobId || null)

// Watch for completion
useEffect(() => {
  if (!job || !activeTab?.generationJobId) return
  
  if (job.status === 'completed' && job.resultImages) {
    setFinalPreviews(job.resultImages)
    setIsGenerating(false)
    setGenerationProgress(100)
    
    // Auto-save
    autoSaveDesigns(job.resultImages)
    
    // Clear job ID
    setDesignTabs(tabs => tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, generationJobId: null }
        : tab
    ))
  } else if (job.status === 'failed') {
    toast.error('Generation failed', { 
      description: job.errorMessage 
    })
    setIsGenerating(false)
    setGenerationProgress(0)
  } else if (job.status === 'processing') {
    // Keep showing progress
    setGenerationProgress(prev => Math.min(prev + 1, 95))
  }
}, [job, activeTab?.generationJobId])
```

### Setup Background Worker

#### For Development:
Create a simple script to process jobs:

```bash
# scripts/process-jobs.sh
#!/bin/bash
while true; do
  curl -X POST http://localhost:3000/api/process-generation-jobs \
    -H "Authorization: Bearer dev-secret" \
    -H "Content-Type: application/json"
  sleep 5
done
```

Run it: `chmod +x scripts/process-jobs.sh && ./scripts/process-jobs.sh`

#### For Production (Vercel):
Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/process-generation-jobs",
    "schedule": "* * * * *"
  }]
}
```

### Environment Variables

Add to `.env.local`:
```bash
CRON_SECRET=your-random-secret-key
```

## How It Works

1. User clicks "Visualize" → Creates job in database
2. Returns job ID immediately → UI shows "generating"
3. User can switch tabs → Generation continues
4. Background worker picks up job → Calls OpenAI API
5. Results saved to database → Client polls and gets results
6. UI updates with generated images → Auto-saves to collection

## Benefits

✅ Navigate between tabs while generating
✅ Generate multiple designs simultaneously  
✅ Jobs survive page refreshes
✅ Better error handling and retry capability
✅ Credits only deducted when generation starts
✅ Progress tracking per tab

## Testing

1. Start a design generation in Tab 1
2. Immediately create Tab 2 and start another generation
3. Switch between tabs - both should show progress
4. Both should complete independently
5. Each tab should show its own results

## Files Created/Modified

### Created:
- `db/migrations/add_generation_jobs.sql`
- `app/api/generate-nail-design-job/route.ts`
- `app/api/generation-job/[jobId]/route.ts`
- `app/api/process-generation-jobs/route.ts`
- `hooks/use-generation-job.ts`
- `BACKGROUND_GENERATION_GUIDE.md`
- `SIMULTANEOUS_GENERATION_IMPLEMENTATION.md`

### Modified:
- `db/schema.ts` (added generationJobs table)

### To Modify:
- `app/capture/page.tsx` (integrate job-based generation)
- `vercel.json` (add cron job for production)
- `.env.local` (add CRON_SECRET)
