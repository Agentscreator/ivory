import { NextResponse } from 'next/server';
import { db } from '@/db';
import { looks, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lookId = parseInt(params.id);

    if (isNaN(lookId)) {
      return NextResponse.json({ error: 'Invalid look ID' }, { status: 400 });
    }

    const result = await db
      .select({
        id: looks.id,
        userId: looks.userId,
        title: looks.title,
        imageUrl: looks.imageUrl,
        originalImageUrl: looks.originalImageUrl,
        aiPrompt: looks.aiPrompt,
        nailPositions: looks.nailPositions,
        designMetadata: looks.designMetadata,
        isPublic: looks.isPublic,
        shareToken: looks.shareToken,
        allowCollaborativeEdit: looks.allowCollaborativeEdit,
        viewCount: looks.viewCount,
        likeCount: looks.likeCount,
        dislikeCount: looks.dislikeCount,
        createdAt: looks.createdAt,
        updatedAt: looks.updatedAt,
        username: users.username,
      })
      .from(looks)
      .leftJoin(users, eq(looks.userId, users.id))
      .where(eq(looks.id, lookId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Look not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error fetching look:', error);
    return NextResponse.json({ error: 'Failed to fetch look' }, { status: 500 });
  }
}
