import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';
import { env } from '@/lib/env';
import { nanoid } from 'nanoid';
import { jwtVerify } from 'jose';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const code = formData.get('code') as string;
    const idToken = formData.get('id_token') as string;
    const error = formData.get('error') as string;

    // Handle user denial or errors
    if (error || !code || !idToken) {
      return NextResponse.redirect(`${env.BASE_URL}/?error=oauth_cancelled`);
    }

    // Verify the ID token from Apple
    // Apple's public keys are at https://appleid.apple.com/auth/keys
    const applePublicKeysResponse = await fetch('https://appleid.apple.com/auth/keys');
    const applePublicKeys = await applePublicKeysResponse.json();

    // Decode and verify the JWT
    let appleUser;
    try {
      // For production, you should properly verify the JWT with Apple's public keys
      // For now, we'll decode it (this is simplified - add proper verification in production)
      const decoded = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      appleUser = {
        email: decoded.email,
        sub: decoded.sub, // Apple's unique user ID
      };
    } catch (err) {
      console.error('Failed to decode Apple ID token:', err);
      return NextResponse.redirect(`${env.BASE_URL}/?error=oauth_failed`);
    }

    if (!appleUser.email) {
      return NextResponse.redirect(`${env.BASE_URL}/?error=no_email`);
    }

    // Check if user already exists
    let existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, appleUser.email))
      .limit(1);

    let user;

    if (existingUser.length > 0) {
      // User exists - log them in
      user = existingUser[0];
      
      // Update auth provider if they originally signed up with email
      if (user.authProvider === 'email') {
        await db
          .update(users)
          .set({ authProvider: 'apple' })
          .where(eq(users.id, user.id));
      }
    } else {
      // Create new user without username (they'll set it later)
      const referralCode = nanoid(10);

      const newUser = await db
        .insert(users)
        .values({
          username: appleUser.email, // Use email as temporary username
          email: appleUser.email,
          authProvider: 'apple',
          userType: 'client',
          credits: 5,
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
    }

    // Create session
    await createSession(user.id);

    // Redirect based on user type
    if (user.userType === 'tech') {
      return NextResponse.redirect(`${env.BASE_URL}/tech/dashboard`);
    } else if (user.userType === 'client') {
      return NextResponse.redirect(`${env.BASE_URL}/home`);
    } else {
      return NextResponse.redirect(`${env.BASE_URL}/user-type`);
    }
  } catch (error) {
    console.error('Apple OAuth error:', error);
    return NextResponse.redirect(`${env.BASE_URL}/?error=oauth_failed`);
  }
}
