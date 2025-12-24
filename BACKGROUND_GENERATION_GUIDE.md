# Background Generation System

## Overview

The app now supports generating multiple nail designs simultaneously without blocking navigation. When you start a design generation and navigate to a new tab, the generation continues in the background.

## How It Works

### 1. Job-Based Generation

Instead of generating designs synchronously, the app now:
- Creates a "generation job" in the database
- Returns immediately with a job ID
- Processes the job in the background
- Polls for completion status

### 2. Database Schema

A new `generation_jobs` table tracks all generation requests:

```typescript
{
  id: string (primary key)
  userId: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  prompt: string
  originalImage: string
  selectedDesignImages: JSON array
  drawingImageUrl: string
  influenceWeights: JSON object
  designSettings: JSON object
  resultImages: JSON array (generated URLs)
  errorMessage: string
  creditsDeducted: boolean
  createdAt: timestamp
  updatedAt: timestamp
  completedAt: timestamp
}
```

### 3. API Endpoints

#### Create Job: `POST /api/generate-nail-design-job`
- Creates a new generation job
- Returns job ID immediately
- Does NOT deduct credits yet

#### Check Status: `GET /api/generation-job/[jobId]`
- Returns current job status
- Includes result images when completed

#### Process Jobs: `POST /api/process-generation-jobs`
- Background worker endpoint
- Processes one pending job at a time
- Deducts credits before generation
- Updates job status and results

### 4. Client-Side Hook

`useGenerationJob(jobId)` hook provides:
- Automatic polling every 3 seconds
- Job status updates
- Auto-stops when completed/failed
- Manual refetch capability

## Implementation Steps

### Step 1: Run Database Migration

```bash
# Apply the schema changes
npm run db:push
```

### Step 2: Update Capture Page

Replace the direct generation call with job creation:

```typescript
// OLD: Direct generation
const response = await fetch('/api/generate-nail-design', { ... })

// NEW: Job-based generation
const response = await fetch('/api/generate-nail-design-job', { ... })
const { jobId } = await response.json()

// Store jobId in tab state
setDesignTabs(tabs => tabs.map(tab => 
  tab.id === activeTabId 
    ? { ...tab, generationJobId: jobId, isGenerating: true }
    : tab
))
```

### Step 3: Poll for Results

```typescript
import { useGenerationJob } from '@/hooks/use-generation-job'

// In component
const { job } = useGenerationJob(activeTab.generationJobId)

// Update UI when job completes
useEffect(() => {
  if (job?.status === 'completed' && job.resultImages) {
    setFinalPreviews(job.resultImages)
    setIsGenerating(false)
  } else if (job?.status === 'failed') {
    toast.error('Generation failed', { description: job.errorMessage })
    setIsGenerating(false)
  }
}, [job])
```

### Step 4: Setup Background Worker

You have two options:

#### Option A: Vercel Cron Job (Recommended for Production)

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/process-generation-jobs",
    "schedule": "* * * * *"
  }]
}
```

#### Option B: Manual Trigger (Development)

Call the endpoint manually or use a separate worker process:

```bash
curl -X POST http://localhost:3000/api/process-generation-jobs \
  -H "Authorization: Bearer dev-secret"
```

### Step 5: Update Tab State

Add `generationJobId` to the `DesignTab` type:

```typescript
type DesignTab = {
  id: string
  name: string
  finalPreviews: string[]
  designSettings: DesignSettings
  selectedDesignImages: string[]
  drawingImageUrl: string | null
  aiPrompt: string
  originalImage: string | null
  isGenerating: boolean
  generationProgress: number
  generationJobId?: string | null  // NEW
}
```

## Benefits

1. **Non-Blocking**: Navigate between tabs while designs generate
2. **Multiple Simultaneous**: Generate designs in multiple tabs at once
3. **Persistent**: Jobs survive page refreshes
4. **Reliable**: Failed jobs are tracked and can be retried
5. **Credit Safety**: Credits only deducted when generation actually starts

## Environment Variables

Add to `.env`:

```bash
# For background worker authentication
CRON_SECRET=your-secret-key-here
```

## Monitoring

Check job status in the database:

```sql
SELECT id, status, created_at, completed_at 
FROM generation_jobs 
WHERE user_id = ? 
ORDER BY created_at DESC;
```

## Troubleshooting

### Jobs stuck in "pending"
- Ensure the background worker is running
- Check worker logs for errors
- Verify CRON_SECRET is set correctly

### Jobs failing immediately
- Check OpenAI API key is valid
- Verify R2 storage credentials
- Check user has sufficient credits

### Polling not working
- Verify job ID is being stored correctly
- Check browser console for fetch errors
- Ensure API endpoint is accessible
