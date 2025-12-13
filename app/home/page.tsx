"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Home, Sparkles, User, Gift, Share2, X } from "lucide-react"
import Image from "next/image"
import { useCredits } from "@/hooks/use-credits"
import { BottomNav } from "@/components/bottom-nav"

type NailLook = {
  id: string
  imageUrl: string
  title: string
  createdAt: string
}

export default function HomePage() {
  const router = useRouter()
  const { credits } = useCredits()
  const [looks, setLooks] = useState<NailLook[]>([])
  const [showReferralBanner, setShowReferralBanner] = useState(true)

  useEffect(() => {
    // Load user's looks from database
    const loadLooks = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        
        // Redirect tech users to their dashboard
        if (user.userType === 'tech') {
          router.push("/tech/dashboard")
          return
        }

        const response = await fetch(`/api/looks?userId=${user.id}`, {
          cache: 'no-store' // Prevent caching to always get fresh data
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded looks:', data)
          setLooks(data)
        }
      } catch (error) {
        console.error('Error loading looks:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-border/50 sticky top-0 z-10 safe-top shadow-sm">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold bg-gradient-to-r from-terracotta to-rose bg-clip-text text-transparent">
            Ivory
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32">
        {/* Referral Promotion Banner */}
        {showReferralBanner && (
          <div className="mb-6 sm:mb-8 relative">
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden border-0">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
              <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full"></div>
              
              {/* Close button */}
              <button
                onClick={() => setShowReferralBanner(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 sm:p-3.5 flex-shrink-0 shadow-lg">
                    <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-sm" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl sm:text-2xl mb-2 drop-shadow-sm">
                      Earn Free Credits! 🎉
                    </h3>
                    <p className="text-white/95 text-sm sm:text-base leading-relaxed">
                      Refer 3 friends and get <span className="font-bold bg-white/20 px-2 py-0.5 rounded-lg">1 free credit</span> to create more designs
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/settings/credits')}
                  className="w-full sm:w-auto h-11 sm:h-12 bg-white text-blue-600 hover:bg-white/95 font-bold shadow-xl hover:shadow-2xl active:scale-95 transition-all rounded-xl"
                  size="lg"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Get Your Referral Link
                </Button>

                {credits !== null && (
                  <p className="text-white/90 text-sm mt-4 font-medium">
                    You currently have <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-lg">{credits} credit{credits !== 1 ? 's' : ''}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-2">Your Looks</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Your personal nail design collection</p>
        </div>

        {/* Gallery Grid */}
        {looks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {looks.map((look) => (
              <Card
                key={look.id}
                className="group overflow-hidden cursor-pointer active:scale-95 hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl"
                onClick={() => router.push(`/look/${look.id}`)}
              >
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted/20 to-muted/5">
                  <Image 
                    src={look.imageUrl || "/placeholder.svg"} 
                    alt={look.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-charcoal mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {look.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="w-3 h-3" />
                    <span>
                      {new Date(look.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 sm:py-20 px-4 border-0 shadow-xl bg-white/60 backdrop-blur-sm rounded-3xl mb-6">
            <div className="max-w-md mx-auto">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-3">No designs yet</h3>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Start creating your first stunning nail design with AI
              </p>
            </div>
          </Card>
        )}

        {/* Create Button - Large */}
        {looks.length > 0 && (
          <div className="flex justify-center px-4">
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-terracotta to-rose hover:from-terracotta/90 hover:to-rose/90 shadow-xl hover:shadow-2xl active:scale-95 transition-all w-full sm:w-auto rounded-2xl"
              onClick={startNewDesign}
            >
              <Plus className="w-6 h-6 mr-2" />
              Start New Design
            </Button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={startNewDesign} centerActionLabel="Create" />
    </div>
  )
}
