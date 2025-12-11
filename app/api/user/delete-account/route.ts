import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/db"
import { 
  users, 
  sessions, 
  looks, 
  designRequests, 
  favorites, 
  reviews, 
  notifications,
  aiGenerations,
  techProfiles,
  services,
  portfolioImages
} from "@/db/schema"
import { eq } from "drizzle-orm"

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user from session
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, sessionToken))
      .limit(1)

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const userId = session.userId

    // Delete all user-related data in order (respecting foreign key constraints)
    
    // 1. Delete notifications
    await db.delete(notifications).where(eq(notifications.userId, userId))

    // 2. Delete favorites
    await db.delete(favorites).where(eq(favorites.userId, userId))

    // 3. Delete AI generations
    await db.delete(aiGenerations).where(eq(aiGenerations.userId, userId))

    // 4. Delete reviews (both given and received)
    await db.delete(reviews).where(eq(reviews.clientId, userId))
    
    // 5. Delete design requests (both sent and received)
    await db.delete(designRequests).where(eq(designRequests.clientId, userId))
    await db.delete(designRequests).where(eq(designRequests.techId, userId))

    // 6. Delete looks
    await db.delete(looks).where(eq(looks.userId, userId))

    // 7. If user is a tech, delete tech-specific data
    const [techProfile] = await db
      .select()
      .from(techProfiles)
      .where(eq(techProfiles.userId, userId))
      .limit(1)

    if (techProfile) {
      // Delete portfolio images
      await db.delete(portfolioImages).where(eq(portfolioImages.techProfileId, techProfile.id))
      
      // Delete services
      await db.delete(services).where(eq(services.techProfileId, techProfile.id))
      
      // Delete reviews for this tech
      await db.delete(reviews).where(eq(reviews.techProfileId, techProfile.id))
      
      // Delete tech profile
      await db.delete(techProfiles).where(eq(techProfiles.id, techProfile.id))
    }

    // 8. Delete all sessions
    await db.delete(sessions).where(eq(sessions.userId, userId))

    // 9. Finally, delete the user account
    await db.delete(users).where(eq(users.id, userId))

    // Clear the session cookie
    cookieStore.delete("session")

    return NextResponse.json({ 
      success: true, 
      message: "Account deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
}
