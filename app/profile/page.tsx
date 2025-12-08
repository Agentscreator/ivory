"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, LogOut, Settings, Home, Plus, User } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [userType, setUserType] = useState<"client" | "tech">("client")

  useEffect(() => {
    const user = localStorage.getItem("ivoryUser")
    if (user) {
      const userData = JSON.parse(user)
      setUsername(userData.username)
      setUserType(userData.userType || 'client')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("ivoryUser")
    router.push("/")
  }

  const startNewDesign = () => {
    router.push("/capture")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush pb-24">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Profile</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        {/* Profile Card */}
        <Card className="p-6 sm:p-8 text-center mb-4 sm:mb-6 bg-white">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold text-white">{username.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mb-1">{username}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground capitalize">{userType === "tech" ? "Nail Tech" : "User"}</p>
        </Card>

        {/* Menu Options */}
        <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-6">
          {userType === "tech" && (
            <Button
              variant="outline"
              className="w-full justify-start h-16 sm:h-18 text-left bg-white active:scale-95 transition-transform"
              onClick={() => router.push("/tech/profile-setup")}
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base">Tech Profile Setup</div>
                <div className="text-xs text-muted-foreground">Services, prices, and gallery</div>
              </div>
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full justify-start h-16 sm:h-18 text-left bg-white active:scale-95 transition-transform"
            onClick={() => router.push("/settings")}
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-sm sm:text-base">Settings</div>
              <div className="text-xs text-muted-foreground">Preferences and notifications</div>
            </div>
          </Button>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full h-12 sm:h-14 text-base text-destructive hover:text-destructive bg-transparent active:scale-95 transition-transform"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border safe-bottom z-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-around h-20 sm:h-24">
            <button
              onClick={() => router.push("/home")}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground active:text-foreground transition-colors min-w-[60px] active:scale-95"
            >
              <Home className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-xs sm:text-sm font-medium">Home</span>
            </button>

            <button
              onClick={startNewDesign}
              className="flex flex-col items-center justify-center -mt-8 sm:-mt-10 bg-gradient-to-br from-terracotta to-rose text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 shadow-xl active:scale-95 transition-transform"
            >
              <Plus className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="flex flex-col items-center justify-center gap-1 text-primary min-w-[60px] active:scale-95 transition-transform"
            >
              <User className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-xs sm:text-sm font-medium">Profile</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
