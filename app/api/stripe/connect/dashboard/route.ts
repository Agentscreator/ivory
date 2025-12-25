import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { techProfiles } from '@/db/schema';
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
      return NextResponse.json({ error: 'Only nail techs can access dashboard' }, { status: 403 });
    }

    // Get tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, session.userId),
    });

    if (!techProfile || !techProfile.stripeConnectAccountId) {
      return NextResponse.json({ error: 'Wallet not setup' }, { status: 404 });
    }

    // Create login link for Stripe Express Dashboard
    const loginLink = await stripe.accounts.createLoginLink(
      techProfile.stripeConnectAccountId
    );

    return NextResponse.json({ url: loginLink.url });
  } catch (error) {
    console.error('Error creating Stripe dashboard link:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard link' },
      { status: 500 }
    );
  }
}
