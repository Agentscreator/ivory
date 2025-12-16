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
        
        if (session.mode === 'subscription') {
          // Handle subscription creation
          const userId = parseInt(session.metadata?.userId || '0');
          const planId = session.metadata?.planId;
          const subscriptionId = session.subscription as string;

          if (!userId || !planId) {
            console.error('Invalid subscription metadata:', session.metadata);
            break;
          }

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = (subscription as any).current_period_end;
          
          await db
            .update(users)
            .set({
              subscriptionTier: planId,
              subscriptionStatus: 'active',
              stripeSubscriptionId: subscriptionId,
              subscriptionCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          console.log(`Subscription activated for user ${userId}: ${planId}`);
        } else {
          // Handle one-time credit purchase
          const userId = parseInt(session.metadata?.userId || '0');
          const credits = parseInt(session.metadata?.credits || '0');
          const packageId = session.metadata?.packageId;

          if (!userId || !credits) {
            console.error('Invalid metadata in session:', session.metadata);
            break;
          }

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

          if (!user) {
            console.error('User not found:', userId);
            break;
          }

          const newBalance = user.credits + credits;

          await db
            .update(users)
            .set({ 
              credits: newBalance,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));

          await db.insert(creditTransactions).values({
            userId,
            amount: credits,
            type: 'purchase',
            description: `Purchased ${credits} credits (${packageId})`,
            relatedId: null,
            balanceAfter: newBalance,
          });

          console.log(`Successfully added ${credits} credits to user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer ID
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (!user) {
          console.error('User not found for customer:', customerId);
          break;
        }

        const status = subscription.status === 'active' ? 'active' : 
                      subscription.status === 'canceled' ? 'canceled' : 
                      subscription.status === 'past_due' ? 'past_due' : 'inactive';

        const periodEnd = (subscription as any).current_period_end;
        
        await db
          .update(users)
          .set({
            subscriptionStatus: status,
            subscriptionCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));

        console.log(`Subscription ${status} for user ${user.id}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : null;

        if (!subscriptionId) break;

        // Find user by customer ID
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.stripeCustomerId, customerId))
          .limit(1);

        if (!user) {
          console.error('User not found for customer:', customerId);
          break;
        }

        // Get subscription to determine credits
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const planId = user.subscriptionTier;
        
        // Add monthly credits based on plan
        const creditsToAdd = planId === 'pro' ? 20 : planId === 'business' ? 60 : 0;
        
        if (creditsToAdd > 0) {
          const newBalance = user.credits + creditsToAdd;
          
          await db
            .update(users)
            .set({ 
              credits: newBalance,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user.id));

          await db.insert(creditTransactions).values({
            userId: user.id,
            amount: creditsToAdd,
            type: 'subscription',
            description: `Monthly ${planId} subscription credits`,
            relatedId: null,
            balanceAfter: newBalance,
          });

          console.log(`Added ${creditsToAdd} subscription credits to user ${user.id}`);
        }
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
