import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { portfolioImages, techProfiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

// GET - Fetch portfolio images for a tech
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const techProfileId = searchParams.get('techProfileId')
    const userId = searchParams.get('userId')

    if (!techProfileId && !userId) {
      return NextResponse.json(
        { error: 'techProfileId or userId is required' },
        { status: 400 }
      )
    }

    let images

    if (techProfileId) {
      images = await db
        .select()
        .from(portfolioImages)
        .where(eq(portfolioImages.techProfileId, parseInt(techProfileId)))
        .orderBy(portfolioImages.orderIndex)
    } else if (userId) {
      // Get tech profile first
      const [profile] = await db
        .select()
        .from(techProfiles)
        .where(eq(techProfiles.userId, parseInt(userId)))
        .limit(1)

      if (!profile) {
        return NextResponse.json({ images: [] })
      }

      images = await db
        .select()
        .from(portfolioImages)
        .where(eq(portfolioImages.techProfileId, profile.id))
        .orderBy(portfolioImages.orderIndex)
    }

    return NextResponse.json({ images })
  } catch (error: any) {
    console.error('Error fetching portfolio images:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch portfolio images' },
      { status: 500 }
    )
  }
}

// POST - Add a new portfolio image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { techProfileId, userId, imageUrl, caption } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    let profileId = techProfileId

    // If userId provided, get or create tech profile
    if (!profileId && userId) {
      let [profile] = await db
        .select()
        .from(techProfiles)
        .where(eq(techProfiles.userId, parseInt(userId)))
        .limit(1)

      // If profile doesn't exist, create it automatically
      if (!profile) {
        console.log(`Creating tech profile for user ${userId} during portfolio image upload`)
        const [newProfile] = await db
          .insert(techProfiles)
          .values({
            userId: parseInt(userId),
            businessName: null,
            bio: null,
            location: null,
            rating: 0,
            reviewCount: 0,
          })
          .returning()
        
        profile = newProfile
      }

      profileId = profile.id
    }

    if (!profileId) {
      return NextResponse.json(
        { error: 'techProfileId or userId is required' },
        { status: 400 }
      )
    }

    // Get current max order index
    const existingImages = await db
      .select()
      .from(portfolioImages)
      .where(eq(portfolioImages.techProfileId, profileId))

    const maxOrder = existingImages.length > 0
      ? Math.max(...existingImages.map(img => img.orderIndex || 0))
      : 0

    const [newImage] = await db
      .insert(portfolioImages)
      .values({
        techProfileId: profileId,
        imageUrl,
        caption: caption || null,
        orderIndex: maxOrder + 1,
      })
      .returning()

    return NextResponse.json({ image: newImage })
  } catch (error: any) {
    console.error('Error adding portfolio image:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to add portfolio image' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a portfolio image
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageId = searchParams.get('id')

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    await db
      .delete(portfolioImages)
      .where(eq(portfolioImages.id, parseInt(imageId)))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting portfolio image:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete portfolio image' },
      { status: 500 }
    )
  }
}
