import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { sessions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { env } from './env';

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function createSession(userId: number) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  // Create JWT token
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(secret);

  // Store session in database
  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    return null;
  }

  try {
    // Verify JWT
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as number;

    // Check if session exists in database and is not expired
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token));

    if (!session || new Date() > session.expiresAt) {
      await deleteSession();
      return null;
    }

    // Get user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      await deleteSession();
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      userType: user.userType,
      avatar: user.avatar,
    };
  } catch (error) {
    console.error('Session verification error:', error);
    await deleteSession();
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (token) {
    // Remove from database
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  // Clear cookie
  cookieStore.delete('session');
}

// Verify a JWT token (for API routes that need direct token verification)
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: number };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
