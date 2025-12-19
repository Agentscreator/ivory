import { NextResponse } from 'next/server';
import { db } from '@/db';
import { looks, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const look = await db
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
        viewCount: looks.viewCount,
        createdAt: looks.createdAt,
        user: {
          username: users.username,
        },
      })
      .from(looks)
      .leftJoin(users, eq(looks.userId, users.id))
      .where(eq(looks.id, parseInt(id)));

    if (look.length === 0) {
      return NextResponse.json({ error: 'Look not found' }, { status: 404 });
    }

    return NextResponse.json(look[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch look' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const deleted = await db
      .delete(looks)
      .where(eq(looks.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Look not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete look' }, { status: 500 });
  }
}
