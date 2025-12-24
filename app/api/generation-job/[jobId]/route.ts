import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db'
import { generationJobs } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

// Get job status
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const job = await db.query.generationJobs.findFirst({
      where: and(
        eq(generationJobs.id, params.jobId),
        eq(generationJobs.userId, session.id)
      ),
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      resultImages: job.resultImages,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    })
  } catch (error: any) {
    console.error('❌ Error fetching job status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job status', details: error?.message },
      { status: 500 }
    )
  }
}
