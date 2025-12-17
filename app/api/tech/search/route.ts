import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles, users } from '@/db/schema';
import { ilike, or, and } from 'drizzle-orm';

// GET - Search nail techs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';

    let whereCondition;

    // Build search conditions
    if (query && location) {
      // Both query and location
      whereCondition = and(
        or(
          ilike(techProfiles.businessName, `%${query}%`),
          ilike(techProfiles.bio, `%${query}%`)
        ),
        ilike(techProfiles.location, `%${location}%`)
      );
    } else if (query) {
      // Only query
      whereCondition = or(
        ilike(techProfiles.businessName, `%${query}%`),
        ilike(techProfiles.bio, `%${query}%`)
      );
    } else if (location) {
      // Only location
      whereCondition = ilike(techProfiles.location, `%${location}%`);
    }

    const techs = await db.query.techProfiles.findMany({
      where: whereCondition,
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
          limit: 6,
          orderBy: (portfolioImages, { desc }) => [desc(portfolioImages.orderIndex)],
        },
      },
      orderBy: (techProfiles, { desc }) => [desc(techProfiles.rating)],
      limit: 50,
    });

    return NextResponse.json({ techs });
  } catch (error) {
    console.error('Error searching techs:', error);
    return NextResponse.json({ error: 'Failed to search techs' }, { status: 500 });
  }
}
