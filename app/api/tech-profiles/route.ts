import { NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const profile = await db
        .select()
        .from(techProfiles)
        .where(eq(techProfiles.userId, parseInt(userId)));
      return NextResponse.json(profile[0] || null);
    }

    // Get all tech profiles with user info
    const profiles = await db
      .select({
        id: techProfiles.id,
        userId: techProfiles.userId,
        businessName: techProfiles.businessName,
        location: techProfiles.location,
        bio: techProfiles.bio,
        rating: techProfiles.rating,
        totalReviews: techProfiles.totalReviews,
        isVerified: techProfiles.isVerified,
        username: users.username,
        avatar: users.avatar,
      })
      .from(techProfiles)
      .leftJoin(users, eq(techProfiles.userId, users.id));

    return NextResponse.json(profiles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tech profiles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, businessName, location, bio, phoneNumber, website, instagramHandle } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if profile already exists
    const existing = await db
      .select()
      .from(techProfiles)
      .where(eq(techProfiles.userId, parseInt(userId)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing profile
      const updated = await db
        .update(techProfiles)
        .set({
          businessName,
          location,
          bio,
          phoneNumber,
          website,
          instagramHandle,
          updatedAt: new Date(),
        })
        .where(eq(techProfiles.userId, parseInt(userId)))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    }

    // Create new profile
    const newProfile = await db
      .insert(techProfiles)
      .values({
        userId: parseInt(userId),
        businessName,
        location,
        bio,
        phoneNumber,
        website,
        instagramHandle,
      })
      .returning();

    return NextResponse.json(newProfile[0], { status: 201 });
  } catch (error: any) {
    console.error('Tech profile error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create tech profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const updated = await db
      .update(techProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(techProfiles.userId, parseInt(userId)))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tech profile' }, { status: 500 });
  }
}
