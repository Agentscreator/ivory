import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, techProfiles, services, users, notifications } from '@/db/schema';
import { eq, and, gte, lte, or } from 'drizzle-orm';

// GET - Fetch bookings (client or tech view)
export async function GET(request: NextRequest) {
  try {
    // Try to get token from Authorization header or cookie
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userType = (session.user as any).userType;

    let userBookings;

    if (userType === 'client') {
      // Client view: their bookings
      userBookings = await db.query.bookings.findMany({
        where: status 
          ? and(eq(bookings.clientId, session.userId), eq(bookings.status, status as any))
          : eq(bookings.clientId, session.userId),
        with: {
          techProfile: {
            with: {
              user: true,
            },
          },
          service: true,
          look: true,
        },
        orderBy: (bookings, { desc }) => [desc(bookings.appointmentDate)],
      });
    } else {
      // Tech view: bookings for their profile
      const techProfile = await db.query.techProfiles.findFirst({
        where: eq(techProfiles.userId, session.userId),
      });

      if (!techProfile) {
        return NextResponse.json({ error: 'Tech profile not found' }, { status: 404 });
      }

      userBookings = await db.query.bookings.findMany({
        where: status
          ? and(eq(bookings.techProfileId, techProfile.id), eq(bookings.status, status as any))
          : eq(bookings.techProfileId, techProfile.id),
        with: {
          client: true,
          service: true,
          look: true,
        },
        orderBy: (bookings, { asc }) => [asc(bookings.appointmentDate)],
      });
    }

    return NextResponse.json({ bookings: userBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    // Try to get token from Authorization header or cookie
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

    const body = await request.json();
    const { techProfileId, serviceId, lookId, appointmentDate, clientNotes } = body;

    // Validate required fields
    if (!techProfileId || !serviceId || !appointmentDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get service details for duration and price
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Check for conflicts
    const appointmentStart = new Date(appointmentDate);
    const appointmentEnd = new Date(appointmentStart.getTime() + (service.duration || 60) * 60000);

    const conflicts = await db.query.bookings.findMany({
      where: and(
        eq(bookings.techProfileId, techProfileId),
        or(
          eq(bookings.status, 'confirmed'),
          eq(bookings.status, 'pending')
        ),
        and(
          lte(bookings.appointmentDate, appointmentEnd),
          gte(bookings.appointmentDate, appointmentStart)
        )
      ),
    });

    if (conflicts.length > 0) {
      return NextResponse.json({ error: 'Time slot not available' }, { status: 409 });
    }

    // Calculate prices
    const servicePrice = parseFloat(service.price || '0');
    const serviceFee = servicePrice * 0.125; // 12.5% service fee
    const totalPrice = servicePrice + serviceFee;

    // Create booking
    const [newBooking] = await db.insert(bookings).values({
      clientId: session.userId,
      techProfileId,
      serviceId,
      lookId: lookId || null,
      appointmentDate: appointmentStart,
      duration: service.duration || 60,
      servicePrice: servicePrice.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
      paymentStatus: 'pending',
      clientNotes: clientNotes || null,
      status: 'pending',
    }).returning();

    // Get tech user ID for notification
    const techProfile = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.id, techProfileId),
    });

    // Create notification for tech
    await db.insert(notifications).values({
      userId: techProfile!.userId,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `You have a new booking request for ${service.name}`,
      relatedId: newBooking.id,
    });

    return NextResponse.json({ booking: newBooking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
