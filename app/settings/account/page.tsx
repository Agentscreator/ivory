"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"

export default function AccountSecurityPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState("")

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage("New passwords don't match")
      return
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters")
      return
    }

    setIsUpdating(true)
    setMessage("")

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        throw new Error("Failed to update password")
      }

      setMessage("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setMessage("Failed to update password. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Account Security</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <Card className="p-6 bg-white rounded-2xl shadow-sm">
          <h2 className="font-semibold text-base mb-4 text-charcoal">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                disabled={isUpdating}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isUpdating}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isUpdating}
              />
            </div>

            {message && (
              <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-destructive"}`}>
                {message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>

        <Card className="p-6 bg-white rounded-2xl shadow-sm mt-4">
          <h2 className="font-semibold text-base mb-3 text-charcoal">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Add an extra layer of security to your account
          </p>
          <Button variant="outline" className="w-full h-12" disabled>
            Enable 2FA (Coming Soon)
          </Button>
        </Card>
      </main>
    </div>
  )
}
