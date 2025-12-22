import { NextResponse } from 'next/server';
import { db } from '@/db';
import { looks, blockedUsers, users } from '@/db/schema';
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
        .select({
          id: looks.id,
          userId: looks.userId,
          title: looks.title,
          imageUrl: looks.imageUrl,
          originalImageUrl: looks.originalImageUrl,
          aiPrompt: looks.aiPrompt,
          nailPositions: looks.nailPositions,
          isPublic: looks.isPublic,
          viewCount: looks.viewCount,
          createdAt: looks.createdAt,
          username: users.username,
        })
        .from(looks)
        .leftJoin(users, eq(looks.userId, users.id))
        .where(eq(looks.userId, parseInt(userId)))
        .orderBy(desc(looks.createdAt));
      
      return NextResponse.json(userLooks);
    }

    // Fetch all looks, excluding blocked users' content
    let allLooks;
    if (blockedUserIds.length > 0) {
      allLooks = await db
        .select({
          id: looks.id,
          userId: looks.userId,
          title: looks.title,
          imageUrl: looks.imageUrl,
          originalImageUrl: looks.originalImageUrl,
          aiPrompt: looks.aiPrompt,
          nailPositions: looks.nailPositions,
          isPublic: looks.isPublic,
          viewCount: looks.viewCount,
          createdAt: looks.createdAt,
          username: users.username,
        })
        .from(looks)
        .leftJoin(users, eq(looks.userId, users.id))
        .where(notInArray(looks.userId, blockedUserIds))
        .orderBy(desc(looks.createdAt));
    } else {
      allLooks = await db
        .select({
          id: looks.id,
          userId: looks.userId,
          title: looks.title,
          imageUrl: looks.imageUrl,
          originalImageUrl: looks.originalImageUrl,
          aiPrompt: looks.aiPrompt,
          nailPositions: looks.nailPositions,
          isPublic: looks.isPublic,
          viewCount: looks.viewCount,
          createdAt: looks.createdAt,
          username: users.username,
        })
        .from(looks)
        .leftJoin(users, eq(looks.userId, users.id))
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
    const { userId, title, imageUrl, originalImageUrl, aiPrompt, nailPositions, designMetadata, isPublic } = body;

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
        designMetadata, // Store all capture page settings for remix/edit
        isPublic: isPublic || false,
      })
      .returning();

    return NextResponse.json(newLook[0], { status: 201 });
  } catch (error) {
    console.error('Error creating look:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create look';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
