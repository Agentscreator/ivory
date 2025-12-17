"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut, Settings, Plus, Camera, Upload, Loader2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { BottomNav } from "@/components/bottom-nav"


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
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="hover:bg-[#F8F7F5] active:scale-95 transition-all rounded-none"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1} />
            </Button>
            <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
              Profile
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe">
        {/* Profile Card */}
        <div className="border border-[#E8E8E8] p-8 sm:p-10 text-center mb-5 sm:mb-6 bg-white">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-5 sm:mb-6 group">
            {profileImage ? (
              <div className="relative w-full h-full overflow-hidden border-2 border-[#E8E8E8]">
                <Image
                  src={profileImage}
                  alt={username || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-[#F8F7F5] flex items-center justify-center border-2 border-[#E8E8E8]">
                <span className="text-4xl sm:text-5xl font-light text-[#1A1A1A]">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
            
            {/* Upload Button Overlay */}
            <button
              onClick={() => profileImageInputRef.current?.click()}
              disabled={uploadingProfile}
              className="absolute inset-0 bg-black/0 hover:bg-black/50 active:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 active:scale-95"
              aria-label="Change profile picture"
            >
              {uploadingProfile ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Camera className="w-7 h-7 text-white drop-shadow-lg" strokeWidth={1} />
                  <span className="text-xs text-white font-light hidden sm:block tracking-wider uppercase">Change</span>
                </div>
              )}
            </button>
            
            {/* Mobile hint badge */}
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#1A1A1A] flex items-center justify-center sm:hidden border-2 border-white">
              <Camera className="w-5 h-5 text-white" strokeWidth={1} />
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
            <div className="space-y-4 w-full max-w-sm mx-auto">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 border border-[#E8E8E8] text-center font-light text-base tracking-wide focus:outline-none focus:border-[#8B7355] transition-all duration-300"
                autoFocus
              />
              {usernameError && (
                <p className="text-xs text-red-600 font-light tracking-wide">{usernameError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleUsernameCancel}
                  disabled={savingUsername}
                  className="flex-1 h-11 border border-[#E8E8E8] text-[#1A1A1A] font-light text-sm tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUsernameSave}
                  disabled={savingUsername}
                  className="flex-1 h-11 bg-[#1A1A1A] text-white font-light text-sm tracking-wider uppercase hover:bg-[#1A1A1A]/90 active:scale-95 transition-all duration-300"
                >
                  {savingUsername ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2.5 mb-2">
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
                  {needsUsername ? 'Add Username' : username}
                </h2>
                <button
                  onClick={handleUsernameEdit}
                  className="p-2 text-[#6B6B6B] hover:text-[#8B7355] hover:bg-[#F8F7F5] transition-all active:scale-95"
                  aria-label="Edit username"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
              </div>
              {needsUsername && (
                <p className="text-xs text-[#6B6B6B] mb-3 px-4 font-light tracking-wider uppercase">Click the edit icon to set your username</p>
              )}
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#E8E8E8] bg-[#F8F7F5]">
                {userType === "tech" && (
                  <svg className="w-4 h-4 text-[#8B7355]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="text-xs tracking-wider uppercase text-[#1A1A1A] font-light">
                  {userType === "tech" ? "Verified Professional" : "Member"}
                </span>
              </div>
              

            </>
          )}
        </div>

        {/* Portfolio Gallery for Tech Users */}
        {userType === "tech" && (
          <div className="border border-[#E8E8E8] p-6 sm:p-8 mb-5 sm:mb-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight mb-1">
                  Portfolio
                </h3>
                <p className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">
                  {portfolioImages.length} {portfolioImages.length === 1 ? 'Photo' : 'Photos'}
                </p>
              </div>
              <button
                onClick={() => router.push("/tech/profile-setup")}
                className="h-10 px-4 border border-[#E8E8E8] text-[#1A1A1A] font-light text-xs tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" strokeWidth={1} />
                <span className="hidden sm:inline">Manage</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </div>

            {portfolioImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {portfolioImages.slice(0, 9).map((url, index) => (
                  <div
                    key={url}
                    className="group relative aspect-square overflow-hidden border border-[#E8E8E8] cursor-pointer hover:border-[#8B7355] transition-all duration-300"
                    onClick={() => {
                      window.open(url, '_blank')
                    }}
                  >
                    <Image
                      src={url}
                      alt={`Portfolio ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  </div>
                ))}
                
                {portfolioImages.length > 9 && (
                  <div
                    className="relative aspect-square overflow-hidden bg-[#F8F7F5] border border-[#E8E8E8] flex items-center justify-center cursor-pointer hover:bg-[#8B7355] hover:border-[#8B7355] transition-all duration-300 group"
                    onClick={() => router.push("/tech/profile-setup")}
                  >
                    <span className="text-[#1A1A1A] group-hover:text-white text-2xl sm:text-3xl font-light transition-colors duration-300">
                      +{portfolioImages.length - 9}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 border border-[#E8E8E8] bg-[#F8F7F5]">
                <div className="w-16 h-16 mx-auto mb-5 border border-[#E8E8E8] bg-white flex items-center justify-center">
                  <Upload className="w-7 h-7 text-[#6B6B6B]" strokeWidth={1} />
                </div>
                <h4 className="font-serif text-lg font-light text-[#1A1A1A] tracking-tight mb-2">
                  No Portfolio Yet
                </h4>
                <p className="text-xs text-[#6B6B6B] mb-6 px-4 font-light tracking-wider uppercase">
                  Showcase your best work
                </p>
                <button
                  onClick={() => router.push("/tech/profile-setup")}
                  className="h-11 px-6 bg-[#1A1A1A] text-white font-light text-xs tracking-wider uppercase hover:bg-[#1A1A1A]/90 active:scale-95 transition-all duration-300 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={1} />
                  Add Photos
                </button>
              </div>
            )}
          </div>
        )}

        {/* Menu Options */}
        <div className="space-y-3 mb-5 sm:mb-6">
          {userType === "tech" && (
            <div
              className="border border-[#E8E8E8] p-5 sm:p-6 bg-white cursor-pointer hover:border-[#8B7355] active:scale-[0.98] transition-all duration-300"
              onClick={() => router.push("/tech/profile-setup")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center flex-shrink-0">
                  <Settings className="w-6 h-6 text-[#1A1A1A]" strokeWidth={1} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif font-light text-base sm:text-lg text-[#1A1A1A] tracking-tight mb-1">
                    Tech Profile Setup
                  </div>
                  <div className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">
                    Services, Prices & Gallery
                  </div>
                </div>
                <svg className="w-5 h-5 text-[#6B6B6B] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}


        </div>

        {/* Logout */}
        <button
          className="w-full h-12 sm:h-14 border border-[#E8E8E8] text-[#1A1A1A] font-light text-sm tracking-wider uppercase hover:bg-[#F8F7F5] hover:border-[#1A1A1A] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" strokeWidth={1} />
          Log Out
        </button>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={startNewDesign} centerActionLabel="Create" />
    </div>
  )
}
