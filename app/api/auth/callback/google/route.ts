import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';
import { env } from '@/lib/env';
import { nanoid } from 'nanoid';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle user denial or errors
  if (error || !code) {
    return NextResponse.redirect(`${env.BASE_URL}/?error=oauth_cancelled`);
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${env.BASE_URL}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(`${env.BASE_URL}/?error=oauth_failed`);
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error('Failed to get user info:', await userInfoResponse.text());
      return NextResponse.redirect(`${env.BASE_URL}/?error=oauth_failed`);
    }

    const googleUser = await userInfoResponse.json();

    // Check if user already exists
    let existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1);

    let user;

    if (existingUser.length > 0) {
      // User exists - log them in
      user = existingUser[0];
      
      // Update auth provider if they originally signed up with email
      if (user.authProvider === 'email') {
        await db
          .update(users)
          .set({ authProvider: 'google' })
          .where(eq(users.id, user.id));
      }
    } else {
      // Create new user without username and userType (they'll set both later)
      const referralCode = nanoid(10);

      const newUser = await db
        .insert(users)
        .values({
          username: googleUser.email, // Use email as temporary username
          email: googleUser.email,
          authProvider: 'google',
          userType: 'client', // Default to client, but will be changed in user-type page
          credits: 5,
          avatar: googleUser.picture,
          referralCode,
        })
        .returning();

      user = newUser[0];

      // Log the signup bonus credit transaction
      await db.insert(creditTransactions).values({
        userId: user.id,
        amount: 5,
        type: 'signup_bonus',
        description: 'Welcome bonus - 5 free credits',
        balanceAfter: 5,
      });

      // Create session
      await createSession(user.id);

      // New users always go to user-type selection
      return NextResponse.redirect(`${env.BASE_URL}/user-type`);
    }

    // Create session for existing users
    await createSession(user.id);

    // Existing users go to their dashboard based on their type
    if (user.userType === 'tech') {
      return NextResponse.redirect(`${env.BASE_URL}/tech/dashboard`);
    } else {
      return NextResponse.redirect(`${env.BASE_URL}/home`);
    }
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(`${env.BASE_URL}/?error=oauth_failed`);
  }
}
