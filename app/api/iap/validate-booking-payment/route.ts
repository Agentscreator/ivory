import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, notifications, techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Validate Apple IAP receipt for booking payment
 */
export async function POST(request: NextRequest) {
  try {
    const { receipt, productId, transactionId, bookingId } = await request.json();

    if (!receipt || !productId || !transactionId || !bookingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get booking details
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        service: true,
        techProfile: {
          with: {
            user: true,
          },
        },
        look: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify user owns this booking
    if (booking.clientId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    // Validate receipt with Apple
    const isValid = await validateAppleReceipt(receipt, productId);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid receipt' },
        { status: 400 }
      );
    }

    // Update booking payment status
    await db
      .update(bookings)
      .set({
        paymentStatus: 'paid',
        stripePaymentIntentId: `iap_${transactionId}`, // Store IAP transaction ID
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // Create notification for tech
    const techProfile = booking.techProfile as any;
    await db.insert(notifications).values({
      userId: techProfile.userId,
      type: 'booking_paid',
      title: 'Booking Payment Received',
      message: `Payment received for ${(booking.service as any).name}. You can now confirm the appointment.`,
      relatedId: bookingId,
    });

    // Auto-generate design breakdown if design is attached
    if (booking.lookId) {
      try {
        const breakdownResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/generate-breakdown`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bookingId }),
        });

        if (breakdownResponse.ok) {
          console.log(`Design breakdown generated for booking ${bookingId}`);
          
          // Send additional notification about breakdown
          await db.insert(notifications).values({
            userId: techProfile.userId,
            type: 'design_breakdown_ready',
            title: 'Design Breakdown Ready',
            message: `AI-generated technical breakdown is ready for your upcoming appointment.`,
            relatedId: bookingId,
          });
        }
      } catch (error) {
        console.error('Failed to generate design breakdown:', error);
        // Don't fail if breakdown generation fails
      }
    }

    return NextResponse.json({
      success: true,
      bookingId,
      paymentStatus: 'paid',
    });
  } catch (error) {
    console.error('IAP booking payment validation error:', error);
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
        'password': process.env.APPLE_IAP_SHARED_SECRET,
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
