import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (user.length === 0) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // In production, verify password hash with bcrypt
    if (user[0].passwordHash !== password) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Create session
    const token = await createSession(user[0].id);

    return NextResponse.json({
      id: user[0].id,
      username: user[0].username,
      email: user[0].email,
      userType: user[0].userType,
      avatar: user[0].avatar,
      token, // Return token for localStorage compatibility
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to log in' }, { status: 500 });
  }
}
