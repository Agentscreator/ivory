import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PRODUCT_CREDITS, PRODUCT_TIERS } from '@/lib/iap';

/**
 * Validate Apple IAP receipt and grant credits/subscription
 */
export async function POST(request: Request) {
  try {
    const { receipt, productId, transactionId } = await request.json();

    if (!receipt || !productId || !transactionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user from session
    const userStr = request.headers.get('cookie')?.match(/ivoryUser=([^;]+)/)?.[1];
    if (!userStr) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userData = JSON.parse(decodeURIComponent(userStr));
    const userId = userData.id;

    // Validate receipt with Apple
    const isValid = await validateAppleReceipt(receipt, productId);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid receipt' },
        { status: 400 }
      );
    }

    // Check if transaction already processed
    const existingTransaction = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.description, `IAP: ${transactionId}`))
      .limit(1);

    if (existingTransaction.length > 0) {
      return NextResponse.json(
        { error: 'Transaction already processed' },
        { status: 400 }
      );
    }

    // Get current user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if it's a credit package or subscription
    const credits = PRODUCT_CREDITS[productId];
    const tier = PRODUCT_TIERS[productId];

    if (credits) {
      // Credit package purchase
      const newBalance = user.credits + credits;

      await db
        .update(users)
        .set({ credits: newBalance })
        .where(eq(users.id, userId));

      await db.insert(creditTransactions).values({
        userId,
        amount: credits,
        type: 'iap_purchase',
        description: `IAP: ${transactionId}`,
        balanceAfter: newBalance,
      });

      return NextResponse.json({
        success: true,
        credits: newBalance,
        added: credits,
      });
    } else if (tier) {
      // Subscription purchase
      await db
        .update(users)
        .set({
          subscriptionTier: tier,
          subscriptionStatus: 'active',
          subscriptionProvider: 'apple',
        })
        .where(eq(users.id, userId));

      // Grant monthly credits based on tier
      const monthlyCredits = tier === 'pro' ? 20 : 50;
      const newBalance = user.credits + monthlyCredits;

      await db
        .update(users)
        .set({ credits: newBalance })
        .where(eq(users.id, userId));

      await db.insert(creditTransactions).values({
        userId,
        amount: monthlyCredits,
        type: 'subscription_renewal',
        description: `IAP Subscription: ${tier}`,
        balanceAfter: newBalance,
      });

      return NextResponse.json({
        success: true,
        tier,
        credits: newBalance,
        added: monthlyCredits,
      });
    }

    return NextResponse.json(
      { error: 'Unknown product' },
      { status: 400 }
    );
  } catch (error) {
    console.error('IAP validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}

async function validateAppleReceipt(receipt: string, productId: string): Promise<boolean> {
  try {
    // Use production URL for live app, sandbox for testing
    const url = process.env.NODE_ENV === 'production'
      ? 'https://buy.itunes.apple.com/verifyReceipt'
      : 'https://sandbox.itunes.apple.com/verifyReceipt';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'receipt-data': receipt,
        'password': process.env.APPLE_IAP_SHARED_SECRET, // Get from App Store Connect
        'exclude-old-transactions': true,
      }),
    });

    const data = await response.json();

    // Status 0 means valid receipt
    if (data.status === 0) {
      // Verify the product ID matches
      const latestReceipt = data.latest_receipt_info?.[0] || data.receipt?.in_app?.[0];
      return latestReceipt?.product_id === productId;
    }

    // Status 21007 means sandbox receipt sent to production - retry with sandbox
    if (data.status === 21007) {
      const sandboxResponse = await fetch('https://sandbox.itunes.apple.com/verifyReceipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'receipt-data': receipt,
          'password': process.env.APPLE_IAP_SHARED_SECRET,
          'exclude-old-transactions': true,
        }),
      });

      const sandboxData = await sandboxResponse.json();
      if (sandboxData.status === 0) {
        const latestReceipt = sandboxData.latest_receipt_info?.[0] || sandboxData.receipt?.in_app?.[0];
        return latestReceipt?.product_id === productId;
      }
    }

    console.error('Apple receipt validation failed:', data);
    return false;
  } catch (error) {
    console.error('Error validating Apple receipt:', error);
    return false;
  }
}
