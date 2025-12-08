"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, LogOut, Settings } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [userType, setUserType] = useState<"client" | "tech">("client")

  useEffect(() => {
    const user = localStorage.getItem("ivoryUser")
    const type = localStorage.getItem("ivoryUserType")
    if (user) {
      setUsername(JSON.parse(user).username)
    }
    if (type) {
      setUserType(type as "client" | "tech")
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("ivoryUser")
    localStorage.removeItem("ivoryUserType")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-xl font-bold text-charcoal">Profile</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="p-8 text-center mb-6 bg-white">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{username.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-1">{username}</h2>
          <p className="text-sm text-muted-foreground capitalize">{userType === "tech" ? "Nail Tech" : "User"}</p>
        </Card>

        {/* Menu Options */}
        <div className="space-y-2 mb-6">
          {userType === "tech" && (
            <Button
              variant="outline"
              className="w-full justify-start h-14 text-left bg-white"
              onClick={() => router.push("/tech/profile-setup")}
            >
              <Settings className="w-5 h-5 mr-3" />
              <div className="flex-1">
                <div className="font-semibold">Tech Profile Setup</div>
                <div className="text-xs text-muted-foreground">Services, prices, and gallery</div>
              </div>
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full justify-start h-14 text-left bg-white"
            onClick={() => router.push("/settings")}
          >
            <Settings className="w-5 h-5 mr-3" />
            <div>
              <div className="font-semibold">Settings</div>
              <div className="text-xs text-muted-foreground">Preferences and notifications</div>
            </div>
          </Button>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </main>
    </div>
  )
}
