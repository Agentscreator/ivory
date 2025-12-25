import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: 'Only nail techs can check wallet status' }, { status: 403 });
    }

    // Get tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, session.userId),
    });

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    // If no Stripe account, return not setup status
    if (!techProfile.stripeConnectAccountId) {
      return NextResponse.json({
        status: 'not_setup',
        payoutsEnabled: false,
        chargesEnabled: false,
      });
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(techProfile.stripeConnectAccountId);

    // Update local status
    const status = account.charges_enabled && account.payouts_enabled ? 'active' : 'pending';
    
    await db
      .update(techProfiles)
      .set({
        stripeAccountStatus: status,
        payoutsEnabled: account.payouts_enabled || false,
        chargesEnabled: account.charges_enabled || false,
        updatedAt: new Date(),
      })
      .where(eq(techProfiles.id, techProfile.id));

    return NextResponse.json({
      status,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      requirementsCurrentlyDue: account.requirements?.currently_due || [],
    });
  } catch (error) {
    console.error('Error fetching Stripe Connect status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet status' },
      { status: 500 }
    );
  }
}
