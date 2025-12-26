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
    console.log('Stripe Connect Onboard - Starting');
    
    // Get user from session
    let token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      token = request.cookies.get('session')?.value;
    }
    
    console.log('Stripe Connect Onboard - Token found:', !!token);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
      with: { user: true },
    });

    console.log('Stripe Connect Onboard - Session found:', !!session);

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // Verify user is a tech
    const user = session.user as any;
    console.log('Stripe Connect Onboard - User type:', user.userType);
    
    if (user.userType !== 'tech') {
      return NextResponse.json({ error: 'Only nail techs can setup wallet' }, { status: 403 });
    }

    // Get tech profile
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.userId, session.userId),
    });

    console.log('Stripe Connect Onboard - Tech profile found:', !!techProfile);

    if (!techProfile) {
      return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
    }

    let accountId = techProfile.stripeConnectAccountId;
    console.log('Stripe Connect Onboard - Existing account ID:', accountId);

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      console.log('Stripe Connect Onboard - Creating new Stripe account');
      
      try {
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
        console.log('Stripe Connect Onboard - Created account:', accountId);

        // Save account ID
        await db
          .update(techProfiles)
          .set({
            stripeConnectAccountId: accountId,
            stripeAccountStatus: 'pending',
            updatedAt: new Date(),
          })
          .where(eq(techProfiles.id, techProfile.id));
          
        console.log('Stripe Connect Onboard - Saved account ID to database');
      } catch (stripeError: any) {
        console.error('Stripe Connect Onboard - Stripe account creation error:', stripeError);
        
        // Check if it's a Connect not enabled error
        if (stripeError.message?.includes('signed up for Connect')) {
          return NextResponse.json({ 
            error: 'Stripe Connect not enabled',
            message: 'The payment system is being configured. Please contact support or try again later.',
            details: 'Stripe Connect needs to be enabled in the Stripe Dashboard'
          }, { status: 503 }); // Service Unavailable
        }
        
        return NextResponse.json({ 
          error: 'Failed to create Stripe account',
          details: stripeError.message 
        }, { status: 500 });
      }
    }

    // Create account link for onboarding
    console.log('Stripe Connect Onboard - Creating account link');
    
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tech/settings?wallet=refresh`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tech/settings?wallet=success`,
        type: 'account_onboarding',
      });

      console.log('Stripe Connect Onboard - Account link created successfully');
      return NextResponse.json({ url: accountLink.url });
    } catch (stripeLinkError: any) {
      console.error('Stripe Connect Onboard - Account link creation error:', stripeLinkError);
      return NextResponse.json({ 
        error: 'Failed to create onboarding link',
        details: stripeLinkError.message 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Stripe Connect Onboard - General error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create onboarding link',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
