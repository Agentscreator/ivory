import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { techProfiles, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      token = request.cookies.get('session')?.value;
    }
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
      with: { user: true },
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Verify user is a tech
    const user = session.user as any;
    if (user.userType !== 'tech') {
      return NextResponse.json({ error: 'Only nail techs can setup wallet' }, { status: 403 });
    }

    // Get tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, session.userId),
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    let accountId = techProfile.stripeConnectAccountId;

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          userId: session.userId.toString(),
          techProfileId: techProfile.id.toString(),
        },
      });

      accountId = account.id;

      // Save account ID
      await db
        .update(techProfiles)
        .set({
          stripeConnectAccountId: accountId,
          stripeAccountStatus: 'pending',
          updatedAt: new Date(),
        })
        .where(eq(techProfiles.id, techProfile.id));
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tech/settings?wallet=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tech/settings?wallet=success`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating Stripe Connect onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to create onboarding link' },
      { status: 500 }
    );
  }
}
