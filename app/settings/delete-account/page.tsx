"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, AlertTriangle } from "lucide-react"

export default function DeleteAccountPage() {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm")
      return
    }

    setIsDeleting(true)
    setError("")

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete account")
      }

      // Clear local storage
      localStorage.removeItem("ivoryUser")
      
      // Redirect to home
      router.push("/")
    } catch (err) {
      setError("Failed to delete account. Please try again.")
      setIsDeleting(false)
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
          <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Delete Account</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <Card className="p-6 bg-white rounded-2xl shadow-sm border-destructive/20">
          <div className="flex items-start gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h2 className="font-serif text-xl font-bold text-destructive mb-2">Warning: This Cannot Be Undone</h2>
              <p className="text-sm text-muted-foreground">
                Deleting your account will permanently remove all your data, including:
              </p>
            </div>
          </div>

          <ul className="text-sm text-muted-foreground space-y-2 mb-6 ml-9 list-disc list-inside">
            <li>Your profile and account information</li>
            <li>All nail designs and images you've created</li>
            <li>AI-generated designs and history</li>
            <li>Design requests and conversations</li>
            <li>Favorites and saved looks</li>
            <li>Reviews and ratings (if you're a nail tech)</li>
          </ul>

          <div className="bg-muted/50 p-4 rounded-xl mb-6">
            <p className="text-sm font-medium mb-3">To confirm deletion, type <span className="font-mono font-bold">DELETE</span> below:</p>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="mb-2"
              disabled={isDeleting}
            />
            {error && (
              <p className="text-xs text-destructive mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={() => router.back()}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 h-12"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText !== "DELETE"}
            >
              {isDeleting ? "Deleting..." : "Delete My Account"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
