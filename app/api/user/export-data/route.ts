import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, looks, portfolioImages, creditTransactions, referrals, bookings, techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse session to get user ID
    let userId: number;
    try {
      const sessionData = JSON.parse(sessionCookie.value);
      userId = sessionData.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Fetch all user data
    const [userData] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch tech profile if user is a tech
    let techProfile = null;
    if (userData.userType === 'tech') {
      const [profile] = await db.select().from(techProfiles).where(eq(techProfiles.userId, userId));
      techProfile = profile;
    }

    // Fetch related data
    const userLooks = await db.select().from(looks).where(eq(looks.userId, userId));
    const userPortfolio = techProfile 
      ? await db.select().from(portfolioImages).where(eq(portfolioImages.techProfileId, techProfile.id))
      : [];
    const userTransactions = await db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId));
    const userReferrals = await db.select().from(referrals).where(eq(referrals.referrerId, userId));
    const userBookingsAsClient = await db.select().from(bookings).where(eq(bookings.clientId, userId));
    const userBookingsAsTech = techProfile
      ? await db.select().from(bookings).where(eq(bookings.techProfileId, techProfile.id))
      : [];

    // Compile all data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        userType: userData.userType,
        credits: userData.credits,
        subscriptionTier: userData.subscriptionTier,
        subscriptionStatus: userData.subscriptionStatus,
        referralCode: userData.referralCode,
        createdAt: userData.createdAt,
      },
      techProfile: techProfile ? {
        businessName: techProfile.businessName,
        location: techProfile.location,
        bio: techProfile.bio,
        rating: techProfile.rating,
        totalReviews: techProfile.totalReviews,
        phoneNumber: techProfile.phoneNumber,
        website: techProfile.website,
        instagramHandle: techProfile.instagramHandle,
        isVerified: techProfile.isVerified,
      } : null,
      looks: userLooks.map(look => ({
        id: look.id,
        title: look.title,
        imageUrl: look.imageUrl,
        originalImageUrl: look.originalImageUrl,
        aiPrompt: look.aiPrompt,
        isPublic: look.isPublic,
        viewCount: look.viewCount,
        createdAt: look.createdAt,
      })),
      portfolio: userPortfolio.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        caption: img.caption,
        createdAt: img.createdAt,
      })),
      creditTransactions: userTransactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        balanceAfter: tx.balanceAfter,
        createdAt: tx.createdAt,
      })),
      referrals: userReferrals.map(ref => ({
        id: ref.id,
        referredUserId: ref.referredUserId,
        creditAwarded: ref.creditAwarded,
        createdAt: ref.createdAt,
      })),
      bookings: {
        asClient: userBookingsAsClient.map(booking => ({
          id: booking.id,
          techProfileId: booking.techProfileId,
          serviceId: booking.serviceId,
          lookId: booking.lookId,
          appointmentDate: booking.appointmentDate,
          duration: booking.duration,
          status: booking.status,
          servicePrice: booking.servicePrice,
          serviceFee: booking.serviceFee,
          totalPrice: booking.totalPrice,
          paymentStatus: booking.paymentStatus,
          clientNotes: booking.clientNotes,
          createdAt: booking.createdAt,
        })),
        asTech: userBookingsAsTech.map(booking => ({
          id: booking.id,
          clientId: booking.clientId,
          serviceId: booking.serviceId,
          lookId: booking.lookId,
          appointmentDate: booking.appointmentDate,
          duration: booking.duration,
          status: booking.status,
          servicePrice: booking.servicePrice,
          serviceFee: booking.serviceFee,
          totalPrice: booking.totalPrice,
          paymentStatus: booking.paymentStatus,
          techNotes: booking.techNotes,
          createdAt: booking.createdAt,
        })),
      },
    };

    // Create JSON file
    const jsonData = JSON.stringify(exportData, null, 2);
    const filename = `ivory-data-export-${userId}-${Date.now()}.json`;

    // Return as downloadable file
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
