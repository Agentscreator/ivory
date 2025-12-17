import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, notifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PATCH - Update booking status (confirm, cancel, complete)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
    });

    if (!session || new Date(session.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { id } = await params;
    const bookingId = parseInt(id);
    const body = await request.json();
    const { status, techNotes, cancellationReason } = body;

    // Get existing booking
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
      with: {
        techProfile: true,
        client: true,
        service: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Authorization check
    const isTech = booking.techProfile.userId === session.userId;
    const isClient = booking.clientId === session.userId;

    if (!isTech && !isClient) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update booking
    const updateData: any = { updatedAt: new Date() };
    
    if (status) updateData.status = status;
    if (techNotes && isTech) updateData.techNotes = techNotes;
    if (cancellationReason) {
      updateData.cancellationReason = cancellationReason;
      updateData.cancelledBy = session.userId;
      updateData.cancelledAt = new Date();
    }

    const [updatedBooking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, bookingId))
      .returning();

    // Create notification
    let notificationMessage = '';
    let notificationUserId = 0;

    if (status === 'confirmed' && isTech) {
      notificationMessage = `Your booking for ${booking.service.name} has been confirmed!`;
      notificationUserId = booking.clientId;
    } else if (status === 'cancelled') {
      notificationMessage = `Booking for ${booking.service.name} has been cancelled`;
      notificationUserId = isTech ? booking.clientId : booking.techProfile.userId;
    } else if (status === 'completed' && isTech) {
      notificationMessage = `Your appointment for ${booking.service.name} is complete. Please leave a review!`;
      notificationUserId = booking.clientId;
    }

    if (notificationMessage) {
      await db.insert(notifications).values({
        userId: notificationUserId,
        type: `booking_${status}`,
        title: 'Booking Update',
        message: notificationMessage,
        relatedId: bookingId,
      });
    }

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
