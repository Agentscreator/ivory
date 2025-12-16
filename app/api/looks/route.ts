import { NextResponse } from 'next/server';
import { db } from '@/db';
import { looks, blockedUsers } from '@/db/schema';
import { eq, desc, notInArray } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const currentUserId = searchParams.get('currentUserId'); // User viewing the feed

    // Get list of blocked user IDs if currentUserId is provided
    let blockedUserIds: number[] = [];
    if (currentUserId) {
      const blocked = await db
        .select({ blockedId: blockedUsers.blockedId })
        .from(blockedUsers)
        .where(eq(blockedUsers.blockerId, parseInt(currentUserId)));
      blockedUserIds = blocked.map(b => b.blockedId);
    }

    if (userId) {
      const userLooks = await db
        .select()
        .from(looks)
        .where(eq(looks.userId, parseInt(userId)))
        .orderBy(desc(looks.createdAt));
      
      return NextResponse.json(userLooks);
    }

    // Fetch all looks, excluding blocked users' content
    let allLooks;
    if (blockedUserIds.length > 0) {
      allLooks = await db
        .select()
        .from(looks)
        .where(notInArray(looks.userId, blockedUserIds))
        .orderBy(desc(looks.createdAt));
    } else {
      allLooks = await db
        .select()
        .from(looks)
        .orderBy(desc(looks.createdAt));
    }
    
    return NextResponse.json(allLooks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch looks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, imageUrl, originalImageUrl, aiPrompt, nailPositions, isPublic } = body;

    if (!userId || !title || !imageUrl) {
      return NextResponse.json(
        { error: 'userId, title, and imageUrl are required' },
        { status: 400 }
      );
    }

    const newLook = await db
      .insert(looks)
      .values({
        userId: parseInt(userId),
        title,
        imageUrl,
        originalImageUrl,
        aiPrompt,
        nailPositions,
        isPublic: isPublic || false,
      })
      .returning();

    return NextResponse.json(newLook[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create look' }, { status: 500 });
  }
}
