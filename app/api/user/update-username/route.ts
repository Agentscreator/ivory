import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Validate username format (alphanumeric, underscores, hyphens, 3-30 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        error: 'Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens' 
      }, { status: 400 });
    }

    // Check if username is already taken by another user
    const existingUser = await db
      .select()
      .from(users)
      .where(and(
        eq(users.username, username),
        ne(users.id, session.id)
      ))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    // Update username
    const updatedUser = await db
      .update(users)
      .set({ 
        username,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.id))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'Failed to update username' }, { status: 500 });
    }

    return NextResponse.json({
      id: updatedUser[0].id,
      username: updatedUser[0].username,
      email: updatedUser[0].email,
      userType: updatedUser[0].userType,
      avatar: updatedUser[0].avatar,
    });
  } catch (error) {
    console.error('Update username error:', error);
    return NextResponse.json({ error: 'Failed to update username' }, { status: 500 });
  }
}
