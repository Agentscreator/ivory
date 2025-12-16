import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contentFlags, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { reporterId, contentType, contentId, contentOwnerId, reason, description } = await request.json();

    if (!reporterId || !contentType || !contentId || !contentOwnerId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create content flag
    const [flag] = await db.insert(contentFlags).values({
      reporterId,
      contentType,
      contentId,
      contentOwnerId,
      reason,
      description: description || null,
      status: 'pending',
    }).returning();

    // Create notification for admin/moderators (you can customize this)
    await db.insert(notifications).values({
      userId: 1, // Admin user ID - adjust as needed
      type: 'content_flagged',
      title: 'Content Flagged',
      message: `User reported ${contentType} #${contentId} for ${reason}`,
      relatedId: flag.id,
      isRead: false,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Content has been flagged for review',
      flagId: flag.id 
    });
  } catch (error) {
    console.error('Error flagging content:', error);
    return NextResponse.json(
      { error: 'Failed to flag content' },
      { status: 500 }
    );
  }
}

// Get flags for a specific user (for admin/moderator view)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    let flags;
    
    if (status) {
      flags = await db.select()
        .from(contentFlags)
        .where(eq(contentFlags.status, status as any));
    } else {
      flags = await db.select().from(contentFlags);
    }

    return NextResponse.json({ flags });
  } catch (error) {
    console.error('Error fetching flags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flags' },
      { status: 500 }
    );
  }
}
