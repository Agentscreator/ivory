import { NextResponse } from 'next/server';
import { db } from '@/db';
import { designRequests } from '@/db/schema';
import { eq, or, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const techId = searchParams.get('techId');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    if (techId) {
      const requests = await db.query.designRequests.findMany({
        where: eq(designRequests.techId, parseInt(techId)),
        with: {
          client: {
            columns: {
              id: true,
              username: true,
              email: true,
            }
          },
          look: true,
        },
        orderBy: desc(designRequests.createdAt),
      });
      return NextResponse.json(requests);
    }

    if (clientId) {
      const requests = await db.query.designRequests.findMany({
        where: eq(designRequests.clientId, parseInt(clientId)),
        with: {
          tech: {
            columns: {
              id: true,
              username: true,
              email: true,
            }
          },
          look: true,
        },
        orderBy: desc(designRequests.createdAt),
      });
      return NextResponse.json(requests);
    }

    const allRequests = await db.query.designRequests.findMany({
      with: {
        client: {
          columns: {
            id: true,
            username: true,
            email: true,
          }
        },
        tech: {
          columns: {
            id: true,
            username: true,
            email: true,
          }
        },
        look: true,
      },
      orderBy: desc(designRequests.createdAt),
    });
    return NextResponse.json(allRequests);
  } catch (error) {
    console.error('Error fetching design requests:', error);
    return NextResponse.json({ error: 'Failed to fetch design requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lookId, clientId, techId, clientMessage } = body;

    if (!lookId || !clientId || !techId) {
      return NextResponse.json(
        { error: 'lookId, clientId, and techId are required' },
        { status: 400 }
      );
    }

    const newRequest = await db
      .insert(designRequests)
      .values({
        lookId: parseInt(lookId),
        clientId: parseInt(clientId),
        techId: parseInt(techId),
        clientMessage,
        status: 'pending',
      })
      .returning();

    return NextResponse.json(newRequest[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create design request' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, techResponse, estimatedPrice, appointmentDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Request id is required' }, { status: 400 });
    }

    const updated = await db
      .update(designRequests)
      .set({
        status,
        techResponse,
        estimatedPrice,
        appointmentDate,
        updatedAt: new Date(),
      })
      .where(eq(designRequests.id, parseInt(id)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update design request' }, { status: 500 });
  }
}
