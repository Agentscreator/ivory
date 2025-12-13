"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, LogOut, Settings, Home, Plus, User, Camera, Upload, Loader2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [userType, setUserType] = useState<"client" | "tech">("client")
  const [userId, setUserId] = useState<number | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [savingUsername, setSavingUsername] = useState(false)
  const profileImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const user = localStorage.getItem("ivoryUser")
      if (user) {
        const userData = JSON.parse(user)
        
        // If username is missing, fetch fresh data from session
        if (!userData.username) {
          try {
            const sessionRes = await fetch('/api/auth/session')
            if (sessionRes.ok) {
              const sessionData = await sessionRes.json()
              if (sessionData.user) {
                localStorage.setItem("ivoryUser", JSON.stringify(sessionData.user))
                setUsername(sessionData.user.username || sessionData.user.email?.split('@')[0] || 'User')
                setUserType(sessionData.user.userType || 'client')
                setUserId(sessionData.user.id)
                setProfileImage(sessionData.user.avatar || null)
                
                // Load portfolio images for tech users
                if (sessionData.user.userType === 'tech') {
                  try {
                    const response = await fetch(`/api/portfolio-images?userId=${sessionData.user.id}`)
                    if (response.ok) {
                      const data = await response.json()
                      setPortfolioImages(data.images?.map((img: any) => img.imageUrl) || [])
                    }
                  } catch (error) {
                    console.error('Error loading portfolio:', error)
                  }
                }
                return
              }
            }
          } catch (error) {
            console.error('Error fetching session:', error)
          }
        }
        
        setUsername(userData.username || userData.email?.split('@')[0] || 'User')
        setUserType(userData.userType || 'client')
        setUserId(userData.id)
        setProfileImage(userData.avatar || null)

        // Load portfolio images for tech users
        if (userData.userType === 'tech') {
          try {
            const response = await fetch(`/api/portfolio-images?userId=${userData.id}`)
            if (response.ok) {
              const data = await response.json()
              setPortfolioImages(data.images?.map((img: any) => img.imageUrl) || [])
            }
          } catch (error) {
            console.error('Error loading portfolio:', error)
          }
        }
      }
    }

    loadProfile()
  }, [])

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    setUploadingProfile(true)
    try {
      // Upload to storage
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) throw new Error('Upload failed')

      const { url } = await uploadRes.json()

      // Update user profile
      const updateRes = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          avatar: url,
        }),
      })

      if (updateRes.ok) {
        setProfileImage(url)
        
        // Update localStorage
        const userStr = localStorage.getItem("ivoryUser")
        if (userStr) {
          const userData = JSON.parse(userStr)
          userData.avatar = url
          localStorage.setItem("ivoryUser", JSON.stringify(userData))
        }

        toast({
          title: "Profile image updated",
          description: "Your profile picture has been changed successfully",
        })
      }
    } catch (error) {
      console.error('Error uploading profile image:', error)
      toast({
        title: "Upload failed",
        description: "Failed to update profile image",
        variant: "destructive",
      })
    } finally {
      setUploadingProfile(false)
    }
  }

  const handleLogout = async () => {
    try {
      // Call logout API to clear session cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      // Clear localStorage
      localStorage.removeItem("ivoryUser")
      
      // Redirect to home
      router.push("/")
    } catch (error) {
      console.error('Logout failed:', error)
      // Still clear localStorage and redirect even if API call fails
      localStorage.removeItem("ivoryUser")
      router.push("/")
    }
  }

  const startNewDesign = () => {
    router.push("/capture")
  }

  const handleUsernameEdit = () => {
    setNewUsername(username || "")
    setUsernameError("")
    setIsEditingUsername(true)
  }

  const handleUsernameSave = async () => {
    if (!newUsername.trim()) {
      setUsernameError("Username cannot be empty")
      return
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
    if (!usernameRegex.test(newUsername)) {
      setUsernameError("Username must be 3-30 characters (letters, numbers, _, -)")
      return
    }

    setSavingUsername(true)
    setUsernameError("")

    try {
      const response = await fetch('/api/user/update-username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      })

      const data = await response.json()

      if (!response.ok) {
        setUsernameError(data.error || 'Failed to update username')
        return
      }

      // Update local state and localStorage
      setUsername(data.username)
      localStorage.setItem("ivoryUser", JSON.stringify(data))
      setIsEditingUsername(false)

      toast({
        title: "Username updated",
        description: "Your username has been changed successfully",
      })
    } catch (error) {
      console.error('Error updating username:', error)
      setUsernameError('Failed to update username')
    } finally {
      setSavingUsername(false)
    }
  }

  const handleUsernameCancel = () => {
    setIsEditingUsername(false)
    setNewUsername("")
    setUsernameError("")
  }

  // Check if username looks like an auto-generated one or email
  const needsUsername = !username || username.includes('@') || username.includes('_176') || username.includes('google_') || username.includes('apple_')

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
        <Card className="p-6 sm:p-8 text-center mb-4 sm:mb-6 bg-white rounded-3xl shadow-lg">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 group">
            {profileImage ? (
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={profileImage}
                  alt={username || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-white">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
            
            {/* Upload Button Overlay */}
            <button
              onClick={() => profileImageInputRef.current?.click()}
              disabled={uploadingProfile}
              className="absolute inset-0 bg-black/0 hover:bg-black/40 active:bg-black/40 rounded-full transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 active:scale-95"
              aria-label="Change profile picture"
            >
              {uploadingProfile ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </button>
            
            {/* Mobile hint badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-terracotta to-rose rounded-full flex items-center justify-center shadow-lg sm:hidden">
              <Camera className="w-4 h-4 text-white" />
            </div>
            
            <input
              ref={profileImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
          </div>
          
          {isEditingUsername ? (
            <div className="space-y-3 w-full max-w-xs mx-auto">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2 border border-border rounded-lg text-center font-serif text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              {usernameError && (
                <p className="text-xs text-destructive">{usernameError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUsernameCancel}
                  disabled={savingUsername}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUsernameSave}
                  disabled={savingUsername}
                  className="flex-1"
                >
                  {savingUsername ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                  {needsUsername ? 'Add Username' : username}
                </h2>
                <button
                  onClick={handleUsernameEdit}
                  className="text-primary hover:text-primary/80 transition-colors"
                  aria-label="Edit username"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
              </div>
              {needsUsername && (
                <p className="text-xs text-muted-foreground mb-2">Click the edit icon to set your username</p>
              )}
              <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                {userType === "tech" ? "Nail Tech" : "User"}
              </p>
            </>
          )}
        </Card>

        {/* Portfolio Gallery for Tech Users */}
        {userType === "tech" && (
          <Card className="p-4 sm:p-6 mb-4 sm:mb-6 bg-white rounded-3xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Portfolio</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/tech/profile-setup")}
                className="h-9 sm:h-10 active:scale-95 transition-transform"
              >
                <Upload className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </div>

            {portfolioImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {portfolioImages.slice(0, 9).map((url, index) => (
                  <div
                    key={url}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      // Could open lightbox here
                      window.open(url, '_blank')
                    }}
                  >
                    <Image
                      src={url}
                      alt={`Portfolio ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, 25vw"
                    />
                  </div>
                ))}
                
                {portfolioImages.length > 9 && (
                  <div
                    className="relative aspect-square rounded-lg overflow-hidden bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                    onClick={() => router.push("/tech/profile-setup")}
                  >
                    <span className="text-white text-xl sm:text-2xl font-bold">
                      +{portfolioImages.length - 9}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">No portfolio images yet</p>
                <Button
                  size="sm"
                  onClick={() => router.push("/tech/profile-setup")}
                  className="active:scale-95 transition-transform"
                >
                  Add Photos
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Menu Options */}
        <div className="space-y-3 sm:space-y-3 mb-4 sm:mb-6">
          {userType === "tech" && (
            <Button
              variant="outline"
              className="w-full justify-start h-16 sm:h-18 text-left bg-white active:scale-95 transition-transform rounded-2xl shadow-sm"
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
            className="w-full justify-start h-16 sm:h-18 text-left bg-white active:scale-95 transition-transform rounded-2xl shadow-sm"
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
          className="w-full h-12 sm:h-14 text-base text-destructive hover:text-destructive bg-transparent active:scale-95 transition-transform rounded-2xl"
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
              onClick={() => router.push(userType === "tech" ? "/tech/dashboard" : "/home")}
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
