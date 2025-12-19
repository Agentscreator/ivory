import { NextResponse } from 'next/server';
import { db } from '@/db';
import { looks, likes } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await request.json();
    const { id } = await params;
    const lookId = parseInt(id);

    if (!userId || !lookId) {
      return NextResponse.json(
        { error: 'userId and lookId are required' },
        { status: 400 }
      );
    }

    // Check if already liked
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, userId), eq(likes.lookId, lookId)))
      .limit(1);

    if (existingLike.length > 0) {
      return NextResponse.json(
        { error: 'Already liked', liked: true },
        { status: 400 }
      );
    }

    // Add like
    await db.insert(likes).values({
      userId,
      lookId,
    });

    // Increment like count
    await db
      .update(looks)
      .set({ likeCount: sql`${looks.likeCount} + 1` })
      .where(eq(looks.id, lookId));

    // Get updated count
    const [updatedLook] = await db
      .select({ likeCount: looks.likeCount })
      .from(looks)
      .where(eq(looks.id, lookId));

    return NextResponse.json({
      success: true,
      liked: true,
      likeCount: updatedLook.likeCount,
    });
  } catch (error) {
    console.error('Error liking design:', error);
    return NextResponse.json(
      { error: 'Failed to like design' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { id } = await params;
    const lookId = parseInt(id);

    if (!userId || !lookId) {
      return NextResponse.json(
        { error: 'userId and lookId are required' },
        { status: 400 }
      );
    }

    // Remove like
    const deleted = await db
      .delete(likes)
      .where(and(eq(likes.userId, parseInt(userId)), eq(likes.lookId, lookId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Like not found', liked: false },
        { status: 404 }
      );
    }

    // Decrement like count (but don't go below 0)
    await db
      .update(looks)
      .set({ likeCount: sql`GREATEST(${looks.likeCount} - 1, 0)` })
      .where(eq(looks.id, lookId));

    // Get updated count
    const [updatedLook] = await db
      .select({ likeCount: looks.likeCount })
      .from(looks)
      .where(eq(looks.id, lookId));

    return NextResponse.json({
      success: true,
      liked: false,
      likeCount: updatedLook.likeCount,
    });
  } catch (error) {
    console.error('Error unliking design:', error);
    return NextResponse.json(
      { error: 'Failed to unlike design' },
      { status: 500 }
    );
  }
}

// Check if user has liked a design
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { id } = await params;
    const lookId = parseInt(id);

    if (!userId) {
      return NextResponse.json({ liked: false, likeCount: 0 });
    }

    // Check if liked
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.userId, parseInt(userId)), eq(likes.lookId, lookId)))
      .limit(1);

    // Get like count
    const [lookData] = await db
      .select({ likeCount: looks.likeCount })
      .from(looks)
      .where(eq(looks.id, lookId));

    return NextResponse.json({
      liked: existingLike.length > 0,
      likeCount: lookData?.likeCount || 0,
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    );
  }
}
