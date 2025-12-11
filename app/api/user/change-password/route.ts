import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/db"
import { users, sessions } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
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

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Password change not available for social login accounts" },
        { status: 400 }
      )
    }

    // Note: In production, use bcrypt for password hashing
    // For now, using plain text comparison to match existing auth implementation
    if (user.passwordHash !== currentPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      )
    }

    // Update password
    await db
      .update(users)
      .set({ 
        passwordHash: newPassword, // In production, hash this with bcrypt
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id))

    return NextResponse.json({ 
      success: true, 
      message: "Password updated successfully" 
    })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}
