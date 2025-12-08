import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, authProvider = 'email' } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Create new user (userType will be set later)
    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash: password, // In production, hash this with bcrypt
        authProvider,
        userType: 'client', // Default to client, can be changed
      })
      .returning();

    // Create session
    await createSession(newUser[0].id);

    return NextResponse.json({
      id: newUser[0].id,
      username: newUser[0].username,
      email: newUser[0].email,
      userType: newUser[0].userType,
      avatar: newUser[0].avatar,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
