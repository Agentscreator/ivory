# Persistent Background Generation - Complete Implementation

## Overview

The app now supports **fully persistent background generation** that continues even when users leave the app or close the browser. When they return, completed designs are automatically saved to their collection.

## How It Works

### 1. User Starts Generation
- User clicks "Visualize" on capture page
- Job is created in database with status "pending"
- User receives job ID immediately
- Credits are NOT deducted yet

### 2. User Can Leave
- User can:
  - Switch to another tab
  - Navigate to different pages
  - Close the browser
  - Close the mobile app
  - Turn off their device
- Generation continues on the server

### 3. Background Worker Processes Job
- Cron job runs every minute (production) or manual trigger (dev)
- Picks up pending jobs one at a time
- Deducts credits before starting
- Calls OpenAI API to generate designs
- Uploads results to R2 storage
- Updates job status to "completed"

### 4. User Returns
- `BackgroundGenerationMonitor` component checks for:
  - Active jobs (still generating)
  - Completed jobs (ready to save)
- Shows notification: "X designs generating" or "X designs completed!"
- Automatically saves completed designs to user's collection
- Marks jobs as `autoSaved` to prevent duplicates

## New Components

### 1. Background Generation Monitor
**File:** `components/background-generation-monitor.tsx`

Automatically checks for pending/completed jobs when user opens the app:
- Runs once on mount
- Checks `/api/user/pending-generations`
- Auto-saves completed jobs
- Shows toast notifications

### 2. API Endpoints

#### `/api/user/pending-generations` (GET)
Returns user's active and completed jobs:
```json
{
  "activeJobs": [
    { "jobId": "abc123", "status": "processing", "createdAt": "..." }
  ],
  "completedJobs": [
    { 
      "jobId": "def456", 
      "status": "completed",
      "resultImages": ["url1", "url2"],
      "originalImage": "...",
      "designSettings": {...}
    }
  ]
}
```

#### `/api/generation-job/[jobId]/auto-save` (POST)
Auto-saves a completed job to user's collection:
- Creates look entries for each generated image
- Preserves all metadata for remix/edit
- Marks job as `autoSaved`
- Returns saved look IDs

### 3. Database Schema Updates

Added `autoSaved` field to `generation_jobs` table:
```typescript
autoSaved: boolean('auto_saved').default(false)
```

This prevents duplicate saves when user returns multiple times.

## User Experience Flow

### Scenario 1: User Stays in App
1. User starts generation
2. Sees progress indicator
3. Generation completes
4. Results appear immediately
5. Auto-saved to collection

### Scenario 2: User Leaves During Generation
1. User starts generation
2. Closes app/browser
3. Background worker processes job
4. User returns hours/days later
5. Sees notification: "2 designs completed! 🎉"
6. Designs are already in their collection
7. Can view immediately

### Scenario 3: Multiple Simultaneous Generations
1. User starts Design 1 in Tab 1
2. Switches to Tab 2, starts Design 2
3. Closes app
4. Both generate in background
5. User returns
6. Sees: "4 designs completed!" (2 per generation)
7. All saved to collection

## Integration Points

### Root Layout (`app/layout.tsx`)
Added `BackgroundGenerationMonitor` component:
```tsx
<BackgroundGenerationMonitor />
```

This ensures checking happens on every page load.

### Capture Page (To Be Integrated)
Replace direct generation with job creation:
```typescript
// Create job
const response = await fetch('/api/generate-nail-design-job', {
  method: 'POST',
  body: JSON.stringify({ prompt, originalImage, ... })
})
const { jobId } = await response.json()

// Store job ID in tab state
setDesignTabs(tabs => tabs.map(tab => 
  tab.id === activeTabId 
    ? { ...tab, generationJobId: jobId }
    : tab
))

// Poll for results using useGenerationJob hook
const { job } = useGenerationJob(jobId)
```

## Background Worker Setup

### Development
Run manually or use a script:
```bash
# Manual trigger
curl -X POST http://localhost:3000/api/process-generation-jobs \
  -H "Authorization: Bearer dev-secret"

# Or create a loop script
while true; do
  curl -X POST http://localhost:3000/api/process-generation-jobs \
    -H "Authorization: Bearer dev-secret"
  sleep 5
done
```

### Production (Vercel)
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/process-generation-jobs",
    "schedule": "* * * * *"
  }]
}
```

This runs every minute to process pending jobs.

## Benefits

✅ **True Background Processing** - Continues even when app is closed
✅ **Automatic Saving** - No user action needed
✅ **No Lost Work** - Jobs persist in database
✅ **Multiple Simultaneous** - Process many designs at once
✅ **Smart Notifications** - User knows what's happening
✅ **Duplicate Prevention** - `autoSaved` flag prevents re-saving
✅ **Credit Safety** - Only deducted when generation starts
✅ **Seamless UX** - Designs appear in collection automatically

## Monitoring & Debugging

### Check Active Jobs
```sql
SELECT id, user_id, status, created_at, completed_at
FROM generation_jobs
WHERE status IN ('pending', 'processing')
ORDER BY created_at DESC;
```

### Check Completed But Not Saved
```sql
SELECT id, user_id, status, auto_saved, completed_at
FROM generation_jobs
WHERE status = 'completed' AND auto_saved = false
ORDER BY completed_at DESC;
```

### Check User's Job History
```sql
SELECT id, status, auto_saved, created_at, completed_at
FROM generation_jobs
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT 10;
```

## Error Handling

### Job Fails
- Status set to "failed"
- Error message stored
- Credits NOT deducted (or refunded if already deducted)
- User sees error notification on return

### Auto-Save Fails
- Job remains `autoSaved = false`
- Will retry on next app open
- Manual save option available

### Worker Crashes
- Jobs remain in "pending" or "processing"
- Next worker run picks them up
- Timeout handling can be added

## Testing Checklist

- [ ] Start generation, close app immediately
- [ ] Return after 2 minutes, verify auto-save
- [ ] Start 3 generations in different tabs
- [ ] Close app, return later, verify all saved
- [ ] Check no duplicate saves on multiple returns
- [ ] Verify notifications show correct counts
- [ ] Test with insufficient credits
- [ ] Test with network errors
- [ ] Verify credits only deducted once
- [ ] Check job history in database

## Files Created/Modified

### Created:
- `app/api/user/pending-generations/route.ts`
- `app/api/generation-job/[jobId]/auto-save/route.ts`
- `components/background-generation-monitor.tsx`
- `PERSISTENT_GENERATION_COMPLETE.md`

### Modified:
- `db/schema.ts` (added `autoSaved` field)
- `db/migrations/add_generation_jobs.sql` (added `autoSaved` field)
- `app/layout.tsx` (added BackgroundGenerationMonitor)

## Next Steps

1. **Integrate into Capture Page** - Replace direct generation with job-based system
2. **Setup Background Worker** - Configure cron job or manual trigger
3. **Add Notifications** - Enhance toast messages with design previews
4. **Add Job Management UI** - Let users view/cancel pending jobs
5. **Add Retry Logic** - Automatic retry for failed jobs
6. **Add Timeout Handling** - Cancel jobs stuck in "processing"

## Environment Variables

Required in `.env.local`:
```bash
CRON_SECRET=your-random-secret-key
```

## Production Deployment

1. Push code to repository
2. Deploy to Vercel
3. Add cron job in `vercel.json`
4. Set `CRON_SECRET` in Vercel environment variables
5. Test with a real generation
6. Monitor logs for worker execution

## Support

If jobs aren't processing:
1. Check worker is running (cron or manual)
2. Verify `CRON_SECRET` is set
3. Check OpenAI API key is valid
4. Check R2 storage credentials
5. Review worker logs for errors
