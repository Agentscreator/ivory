import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db'
import { generationJobs, looks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

// Get user's pending and completed generation jobs
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all jobs for this user that are not failed
    const jobs = await db.query.generationJobs.findMany({
      where: and(
        eq(generationJobs.userId, session.id)
      ),
      orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
      limit: 20,
    })

    // Separate into pending/processing and completed (not yet auto-saved)
    const activeJobs = jobs.filter(job => 
      job.status === 'pending' || job.status === 'processing'
    )
    
    const completedJobs = jobs.filter(job => 
      job.status === 'completed' && 
      job.resultImages && 
      (job.resultImages as string[]).length > 0 &&
      !job.autoSaved // Only return jobs that haven't been auto-saved yet
    )

    return NextResponse.json({
      activeJobs: activeJobs.map(job => ({
        jobId: job.id,
        status: job.status,
        createdAt: job.createdAt,
      })),
      completedJobs: completedJobs.map(job => ({
        jobId: job.id,
        status: job.status,
        resultImages: job.resultImages,
        originalImage: job.originalImage,
        designSettings: job.designSettings,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      })),
    })
  } catch (error: any) {
    console.error('❌ Error fetching pending generations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending generations', details: error?.message },
      { status: 500 }
    )
  }
}
