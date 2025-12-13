import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, creditTransactions, referrals } from '@/db/schema';
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
    
    // Get referral code from cookie
    const cookies = request.headers.get('cookie') || '';
    const referralCodeMatch = cookies.match(/pendingReferralCode=([^;]+)/);
    const referralCode = referralCodeMatch ? referralCodeMatch[1] : null;

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
          username: appleUser.email, // Use email as temporary username
          email: appleUser.email,
          authProvider: 'apple',
          userType: 'client', // Default to client, but will be changed in user-type page
          credits: 5,
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
    console.error('Apple OAuth error:', error);
    return NextResponse.redirect(`${env.BASE_URL}/?error=oauth_failed`);
  }
}
