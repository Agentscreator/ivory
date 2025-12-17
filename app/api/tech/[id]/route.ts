import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch tech profile details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const techId = parseInt(id);

    const tech = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.id, techId),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        services: {
          where: (services, { eq }) => eq(services.isActive, true),
        },
        portfolioImages: {
          orderBy: (portfolioImages, { desc }) => [desc(portfolioImages.orderIndex)],
        },
        reviews: {
          limit: 10,
          orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
          with: {
            client: {
              columns: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!tech) {
      return NextResponse.json({ error: 'Tech not found' }, { status: 404 });
    }

    return NextResponse.json({ tech });
  } catch (error) {
    console.error('Error fetching tech:', error);
    return NextResponse.json({ error: 'Failed to fetch tech' }, { status: 500 });
  }
}
