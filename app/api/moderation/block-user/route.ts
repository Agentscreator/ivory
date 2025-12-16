import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blockedUsers, contentFlags, notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { blockerId, blockedId, reason } = await request.json();

    if (!blockerId || !blockedId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (blockerId === blockedId) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      );
    }

    // Check if already blocked
    const existing = await db.select()
      .from(blockedUsers)
      .where(
        and(
          eq(blockedUsers.blockerId, blockerId),
          eq(blockedUsers.blockedId, blockedId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'User already blocked' },
        { status: 400 }
      );
    }

    // Block the user
    await db.insert(blockedUsers).values({
      blockerId,
      blockedId,
      reason: reason || null,
    });

    // Auto-flag all content from blocked user as potentially inappropriate
    await db.insert(contentFlags).values({
      reporterId: blockerId,
      contentType: 'user',
      contentId: blockedId,
      contentOwnerId: blockedId,
      reason: 'blocked_user',
      description: `User blocked by ${blockerId}`,
      status: 'pending',
    });

    // Notify admin/moderators
    await db.insert(notifications).values({
      userId: 1, // Admin user ID - adjust as needed
      type: 'user_blocked',
      title: 'User Blocked',
      message: `User ${blockerId} blocked user ${blockedId}`,
      relatedId: blockedId,
      isRead: false,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'User has been blocked and content flagged for review' 
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: 'Failed to block user' },
      { status: 500 }
    );
  }
}

// Unblock a user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockerId = searchParams.get('blockerId');
    const blockedId = searchParams.get('blockedId');

    if (!blockerId || !blockedId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await db.delete(blockedUsers)
      .where(
        and(
          eq(blockedUsers.blockerId, parseInt(blockerId)),
          eq(blockedUsers.blockedId, parseInt(blockedId))
        )
      );

    return NextResponse.json({ 
      success: true, 
      message: 'User has been unblocked' 
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { error: 'Failed to unblock user' },
      { status: 500 }
    );
  }
}

// Get blocked users list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const blocked = await db.select()
      .from(blockedUsers)
      .where(eq(blockedUsers.blockerId, parseInt(userId)));

    return NextResponse.json({ blockedUsers: blocked });
  } catch (error) {
    console.error('Error fetching blocked users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blocked users' },
      { status: 500 }
    );
  }
}
