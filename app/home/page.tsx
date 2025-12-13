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
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">Ivory</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32">
        {/* Referral Promotion Banner */}
        {showReferralBanner && (
          <div className="mb-6 sm:mb-8 relative">
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              {/* Close button */}
              <button
                onClick={() => setShowReferralBanner(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10">
                <div className="flex items-start gap-3 sm:gap-4 mb-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5 sm:p-3 flex-shrink-0">
                    <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg sm:text-xl mb-1">
                      Earn Free Credits! 🎉
                    </h3>
                    <p className="text-white/90 text-sm sm:text-base">
                      Refer 3 friends and get <span className="font-bold">1 free credit</span> to create more designs
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/settings/credits')}
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-white/90 font-semibold shadow-lg"
                  size="lg"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Get Your Referral Link
                </Button>

                {credits !== null && (
                  <p className="text-white/80 text-xs sm:text-sm mt-3">
                    You currently have <span className="font-bold text-white">{credits} credit{credits !== 1 ? 's' : ''}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-1 sm:mb-2">Your Looks</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Your personal nail design collection</p>
        </div>

        {/* Gallery Grid */}
        {looks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {looks.map((look) => (
              <Card
                key={look.id}
                className="overflow-hidden cursor-pointer active:scale-95 hover:shadow-xl transition-all border-0 bg-white"
                onClick={() => router.push(`/look/${look.id}`)}
              >
                <div className="aspect-square relative">
                  <Image src={look.imageUrl || "/placeholder.svg"} alt={look.title} fill className="object-cover" />
                </div>
                <div className="p-2.5 sm:p-3">
                  <h3 className="font-semibold text-xs sm:text-sm text-charcoal mb-0.5 sm:mb-1 line-clamp-1">{look.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(look.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mb-2">No designs yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">Start creating your first nail design</p>
          </div>
        )}

        {/* Create Button - Large */}
        <div className="flex justify-center px-4">
          <Button
            size="lg"
            className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg shadow-xl hover:shadow-2xl active:scale-95 transition-all w-full sm:w-auto"
            onClick={startNewDesign}
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Start New Design
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={startNewDesign} centerActionLabel="Create" />
    </div>
  )
}
