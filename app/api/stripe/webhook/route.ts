import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

// Disable body parsing for webhook
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata
        const userId = parseInt(session.metadata?.userId || '0');
        const credits = parseInt(session.metadata?.credits || '0');
        const packageId = session.metadata?.packageId;

        if (!userId || !credits) {
          console.error('Invalid metadata in session:', session.metadata);
          return NextResponse.json(
            { error: 'Invalid session metadata' },
            { status: 400 }
          );
        }

        // Get current user balance
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!user) {
          console.error('User not found:', userId);
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        const newBalance = user.credits + credits;

        // Update user credits
        await db
          .update(users)
          .set({ 
            credits: newBalance,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        // Log transaction
        await db.insert(creditTransactions).values({
          userId,
          amount: credits,
          type: 'purchase',
          description: `Purchased ${credits} credits (${packageId})`,
          relatedId: null,
          balanceAfter: newBalance,
        });

        console.log(`Successfully added ${credits} credits to user ${userId}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
