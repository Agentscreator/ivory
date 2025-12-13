import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, creditTransactions, referrals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/auth';
import { env } from '@/lib/env';
import { nanoid } from 'nanoid';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  // Get referral code from cookie
  const cookies = request.headers.get('cookie') || '';
  const referralCodeMatch = cookies.match(/pendingReferralCode=([^;]+)/);
  const referralCode = referralCodeMatch ? referralCodeMatch[1] : null;

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
      const newReferralCode = nanoid(10);

      // Check if referral code is valid
      let referrerId: number | null = null;
      if (referralCode) {
        const referrer = await db
          .select()
          .from(users)
          .where(eq(users.referralCode, referralCode));
        
        if (referrer.length > 0) {
          referrerId = referrer[0].id;
        }
      }

      const newUser = await db
        .insert(users)
        .values({
          username: googleUser.email, // Use email as temporary username
          email: googleUser.email,
          authProvider: 'google',
          userType: 'client', // Default to client, but will be changed in user-type page
          credits: 5,
          avatar: googleUser.picture,
          referralCode: newReferralCode,
          referredBy: referrerId,
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

      // If user was referred, create referral record and award credits
      if (referrerId) {
        await db.insert(referrals).values({
          referrerId: referrerId,
          referredUserId: user.id,
          creditAwarded: false, // Will be awarded after 3 referrals
        });

        // Check if referrer now has 3 or more successful referrals
        const referrerReferrals = await db
          .select()
          .from(referrals)
          .where(eq(referrals.referrerId, referrerId));

        // Award credit for every 3 referrals
        const unawardedReferrals = referrerReferrals.filter(r => !r.creditAwarded);
        if (unawardedReferrals.length >= 3) {
          // Get referrer's current credits
          const referrerData = await db
            .select()
            .from(users)
            .where(eq(users.id, referrerId));

          const currentCredits = referrerData[0].credits;
          const newCredits = currentCredits + 1;

          // Update referrer's credits
          await db
            .update(users)
            .set({ credits: newCredits })
            .where(eq(users.id, referrerId));

          // Mark the first 3 unawardedReferrals as awarded
          for (let i = 0; i < 3; i++) {
            await db
              .update(referrals)
              .set({ creditAwarded: true })
              .where(eq(referrals.id, unawardedReferrals[i].id));
          }

          // Log the referral reward transaction
          await db.insert(creditTransactions).values({
            userId: referrerId,
            amount: 1,
            type: 'referral_reward',
            description: 'Earned 1 credit for referring 3 new users',
            balanceAfter: newCredits,
          });
        }
      }

      // Create session
      await createSession(user.id);

      // Clear the referral code cookie
      const response = NextResponse.redirect(`${env.BASE_URL}/user-type`);
      response.cookies.set('pendingReferralCode', '', { maxAge: 0 });
      return response;
    }

    // Create session for existing users
    await createSession(user.id);
    
    // Clear the referral code cookie
    const response = NextResponse.redirect(
      user.userType === 'tech' 
        ? `${env.BASE_URL}/tech/dashboard` 
        : `${env.BASE_URL}/home`
    );
    response.cookies.set('pendingReferralCode', '', { maxAge: 0 });

    return response;
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(`${env.BASE_URL}/?error=oauth_failed`);
  }
}
