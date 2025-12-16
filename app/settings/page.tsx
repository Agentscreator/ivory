"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Shield, Bell, Lock, Trash2, HelpCircle, UserX } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("ivoryUser")
    if (user) {
      const userData = JSON.parse(user)
      setUsername(userData.username)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        <div className="space-y-3 sm:space-y-4">
          {/* Privacy & Security Section */}
          <Card className="p-4 bg-white rounded-2xl shadow-sm">
            <h2 className="font-semibold text-base mb-3 text-charcoal">Privacy & Security</h2>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-left active:scale-95 transition-transform"
                onClick={() => router.push("/settings/privacy")}
              >
                <Shield className="w-5 h-5 mr-3 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Privacy & Data</div>
                  <div className="text-xs text-muted-foreground">Manage your data and privacy</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-left active:scale-95 transition-transform"
                onClick={() => router.push("/settings/account")}
              >
                <Lock className="w-5 h-5 mr-3 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Account Security</div>
                  <div className="text-xs text-muted-foreground">Password and authentication</div>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-14 text-left active:scale-95 transition-transform"
                onClick={() => router.push("/settings/blocked-users")}
              >
                <UserX className="w-5 h-5 mr-3 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Blocked Users</div>
                  <div className="text-xs text-muted-foreground">Manage blocked accounts</div>
                </div>
              </Button>
            </div>
          </Card>

          {/* Notifications Section */}
          <Card className="p-4 bg-white rounded-2xl shadow-sm">
            <h2 className="font-semibold text-base mb-3 text-charcoal">Notifications</h2>
            <Button
              variant="ghost"
              className="w-full justify-start h-14 text-left active:scale-95 transition-transform"
              onClick={() => router.push("/settings/notifications")}
            >
              <Bell className="w-5 h-5 mr-3 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Notification Preferences</div>
                <div className="text-xs text-muted-foreground">Manage alerts and updates</div>
              </div>
            </Button>
          </Card>

          {/* Help & Support Section */}
          <Card className="p-4 bg-white rounded-2xl shadow-sm">
            <h2 className="font-semibold text-base mb-3 text-charcoal">Help & Support</h2>
            <Button
              variant="ghost"
              className="w-full justify-start h-14 text-left active:scale-95 transition-transform"
              onClick={() => router.push("/settings/help")}
            >
              <HelpCircle className="w-5 h-5 mr-3 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Get Help</div>
                <div className="text-xs text-muted-foreground">Contact support team</div>
              </div>
            </Button>
          </Card>

          {/* Danger Zone */}
          <Card className="p-4 bg-white rounded-2xl shadow-sm border-destructive/20">
            <h2 className="font-semibold text-base mb-3 text-destructive">Danger Zone</h2>
            <Button
              variant="ghost"
              className="w-full justify-start h-14 text-left text-destructive hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-transform"
              onClick={() => router.push("/settings/delete-account")}
            >
              <Trash2 className="w-5 h-5 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Delete Account</div>
                <div className="text-xs text-destructive/70">Permanently delete your account</div>
              </div>
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}
