"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Sparkles, Gift, Share2, X } from "lucide-react"
import Image from "next/image"
import { useCredits } from "@/hooks/use-credits"
import { BottomNav } from "@/components/bottom-nav"
import ContentModerationMenu from "@/components/content-moderation-menu"
import { useIsAppleWatch, HideOnWatch, WatchButton, WatchGrid } from "@/components/watch-optimized-layout"

type NailLook = {
  id: string
  imageUrl: string
  title: string
  createdAt: string
  userId?: number
  username?: string
}

export default function HomePage() {
  const router = useRouter()
  const { credits } = useCredits()
  const [looks, setLooks] = useState<NailLook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showReferralBanner, setShowReferralBanner] = useState(true)
  const [subscriptionTier, setSubscriptionTier] = useState('free')
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const isWatch = useIsAppleWatch()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Load user's looks from database
    const loadLooks = async () => {
      setIsLoading(true)
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        setCurrentUserId(user.id)
        
        // Set subscription info
        setSubscriptionTier(user.subscriptionTier || 'free')
        setSubscriptionStatus(user.subscriptionStatus || 'inactive')
        
        // Redirect tech users to their dashboard
        if (user.userType === 'tech') {
          router.push("/tech/dashboard")
          return
        }

        const response = await fetch(`/api/looks?userId=${user.id}&currentUserId=${user.id}`, {
          cache: 'no-store' // Prevent caching to always get fresh data
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded looks:', data)
          setLooks(data)
        }
      } catch (error) {
        console.error('Error loading looks:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLooks()

    // Reload looks when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadLooks()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  const startNewDesign = () => {
    router.push("/capture")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top backdrop-blur-sm bg-white/95 transition-all duration-300 ${isWatch ? 'watch-compact' : ''}`}>
        <div className={`max-w-screen-xl mx-auto ${isWatch ? 'px-3 py-2' : 'px-5 sm:px-6 py-4 sm:py-5'}`}>
          <h1 className={`font-serif font-light text-[#1A1A1A] tracking-tight transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'} ${isWatch ? 'text-sm' : 'text-xl sm:text-2xl'}`}>
            {isWatch ? "IVORY'S" : "IVORY'S CHOICE"}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className={`max-w-screen-xl mx-auto ${isWatch ? 'px-3 py-3 pb-20' : 'px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32'}`}>
        {/* Credits/Subscription Banner - Hidden on Watch */}
        {showReferralBanner && !isWatch && (
          <div className={`mb-6 sm:mb-8 relative transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="border border-[#E8E8E8] p-6 sm:p-8 relative bg-[#F8F7F5] transition-all duration-300 hover:shadow-sm">
              {/* Close button */}
              <button
                onClick={() => setShowReferralBanner(false)}
                className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#1A1A1A] transition-all duration-300 hover:scale-110 hover:rotate-90"
              >
                <X className="w-5 h-5" strokeWidth={1} />
              </button>

              <div className="max-w-2xl">
                {subscriptionTier !== 'free' && subscriptionStatus === 'active' ? (
                  // Paid users - show referral program
                  <>
                    <div className="flex items-start gap-4 sm:gap-6 mb-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 border border-[#E8E8E8] flex items-center justify-center flex-shrink-0 bg-white transition-all duration-500 hover:border-[#8B7355] hover:scale-105">
                        <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-[#8B7355] transition-transform duration-500 hover:rotate-12" strokeWidth={1} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                          Referral Program
                        </h3>
                        <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light">
                          Refer 3 friends and receive <span className="text-[#1A1A1A] font-normal">1 complimentary credit</span> to create more designs
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push('/settings/credits')}
                      className="h-11 sm:h-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 px-6 sm:px-8 text-xs tracking-widest uppercase rounded-none font-light"
                    >
                      <Share2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Get Referral Link
                    </Button>
                  </>
                ) : (
                  // Free users - show upgrade prompt
                  <>
                    <div className="flex items-start gap-4 sm:gap-6 mb-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 border border-[#E8E8E8] flex items-center justify-center flex-shrink-0 bg-white transition-all duration-500 hover:border-[#8B7355] hover:scale-105">
                        <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#8B7355] transition-transform duration-500 hover:rotate-12" strokeWidth={1} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                          Upgrade Your Plan
                        </h3>
                        <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light">
                          Subscribe to get <span className="text-[#1A1A1A] font-normal">monthly credits</span> and unlock the ability to purchase additional credits anytime
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => router.push('/billing')}
                      className="h-11 sm:h-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 px-6 sm:px-8 text-xs tracking-widest uppercase rounded-none font-light"
                    >
                      <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      View Plans
                    </Button>
                  </>
                )}

                {credits !== null && (
                  <p className="text-xs tracking-wider text-[#6B6B6B] mt-4 font-light uppercase">
                    Current Balance: <span className="text-[#1A1A1A] font-normal">{credits} Credit{credits !== 1 ? 's' : ''}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Credits display for watch */}
        {isWatch && credits !== null && (
          <div className="mb-3 text-center">
            <p className="text-[10px] tracking-wider text-[#6B6B6B] font-light uppercase">
              {credits} Credit{credits !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        <div className={`${isWatch ? 'mb-3' : 'mb-6 sm:mb-8'} transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <HideOnWatch>
            <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Collection</p>
          </HideOnWatch>
          <h2 className={`font-serif font-light text-[#1A1A1A] tracking-tight ${isWatch ? 'text-sm text-center' : 'text-2xl sm:text-3xl'}`}>
            Your Designs
          </h2>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className={`text-center px-4 mb-6 ${isWatch ? 'py-8' : 'py-16 sm:py-20'} animate-in fade-in duration-500`}>
            <div className="max-w-md mx-auto">
              <div className={`mx-auto mb-4 flex items-center justify-center ${
                isWatch ? 'w-10 h-10' : 'w-16 h-16'
              }`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B7355]"></div>
              </div>
              <p className={`text-[#6B6B6B] font-light animate-pulse ${
                isWatch ? 'text-[10px]' : 'text-sm'
              }`}>
                Loading your designs...
              </p>
            </div>
          </div>
        ) : looks.length > 0 ? (
          <WatchGrid className={isWatch ? 'mb-3' : 'mb-6 sm:mb-8'} cols={2}>
            {looks.map((look, index) => (
              <div
                key={look.id}
                className={`group active:scale-95 transition-all duration-300 bg-white overflow-visible animate-in fade-in slide-in-from-bottom-4 ${
                  isWatch ? 'watch-card' : 'border border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-md'
                }`}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <div 
                  className={`aspect-square relative overflow-hidden bg-[#F8F7F5] cursor-pointer ${isWatch ? 'watch-image' : ''}`}
                  onClick={() => router.push(`/look/${look.id}`)}
                >
                  <Image 
                    src={look.imageUrl || "/placeholder.svg"} 
                    alt={look.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                {!isWatch && currentUserId && look.userId && look.userId !== currentUserId && (
                  <div className={isWatch ? 'p-2' : 'p-3 sm:p-4 relative'}>
                    <div className="flex items-end justify-end">
                      <ContentModerationMenu
                        currentUserId={currentUserId}
                        contentType="look"
                        contentId={parseInt(look.id)}
                        contentOwnerId={look.userId}
                        contentOwnerUsername={look.username || `User ${look.userId}`}
                        showBlockOption={true}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </WatchGrid>
        ) : (
          <div className={`text-center px-4 mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ${isWatch ? 'py-8 watch-card' : 'py-16 sm:py-20 border border-[#E8E8E8]'}`}>
            <div className="max-w-md mx-auto">
              <div className={`mx-auto mb-4 flex items-center justify-center transition-all duration-500 hover:scale-110 ${
                isWatch ? 'w-10 h-10' : 'w-16 h-16 border border-[#E8E8E8]'
              }`}>
                <Sparkles className={`text-[#8B7355] animate-pulse ${isWatch ? 'w-5 h-5' : 'w-8 h-8'}`} strokeWidth={1} />
              </div>
              <h3 className={`font-serif font-light text-[#1A1A1A] mb-2 tracking-tight ${
                isWatch ? 'text-sm' : 'text-2xl sm:text-3xl mb-3'
              }`}>
                No Designs Yet
              </h3>
              <p className={`text-[#6B6B6B] leading-relaxed font-light ${
                isWatch ? 'text-[10px]' : 'text-sm sm:text-base'
              }`}>
                {isWatch ? 'Create your first design' : 'Begin your journey by creating your first design'}
              </p>
            </div>
          </div>
        )}

        {/* Create Button - Large */}
        {looks.length > 0 && (
          <div className={`flex justify-center px-4 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {isWatch ? (
              <WatchButton onClick={startNewDesign} className="rounded-full">
                <Plus className="w-4 h-4 mr-1" strokeWidth={1.5} />
                Create
              </WatchButton>
            ) : (
              <Button
                className="h-12 sm:h-14 px-8 sm:px-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 w-full sm:w-auto text-xs tracking-widest uppercase rounded-none font-light active:scale-95 hover:shadow-lg hover:-translate-y-0.5"
                onClick={startNewDesign}
              >
                <Plus className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-90" strokeWidth={1.5} />
                Create Design
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={startNewDesign} centerActionLabel="Create" />
    </div>
  )
}
