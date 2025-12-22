"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Sparkles, Gift, Share2, X, Search, MapPin, Calendar, Clock, Star, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useCredits } from "@/hooks/use-credits"
import { BottomNav } from "@/components/bottom-nav"
import ContentModerationMenu from "@/components/content-moderation-menu"
import { useIsAppleWatch, HideOnWatch, WatchButton, WatchGrid } from "@/components/watch-optimized-layout"
import { BookingReviewDialog } from "@/components/booking-review-dialog"

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
  const [activeTab, setActiveTab] = useState<'designs' | 'search' | 'bookings'>('designs')
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [techs, setTechs] = useState<any[]>([])
  const [myBookings, setMyBookings] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const isWatch = useIsAppleWatch()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Load user's looks and bookings from database
    const loadData = async () => {
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

        // Load looks
        const response = await fetch(`/api/looks?userId=${user.id}&currentUserId=${user.id}`, {
          cache: 'no-store'
        })
        
        if (response.ok) {
          const data = await response.json()
          setLooks(data)
        }

        // Load bookings
        fetchMyBookings(user.id)

        // Check for payment status in URL
        const urlParams = new URLSearchParams(window.location.search)
        const paymentStatus = urlParams.get('payment')
        const bookingId = urlParams.get('booking_id')

        if (paymentStatus === 'success' && bookingId) {
          alert('Payment successful! Your booking request has been sent to the nail tech.')
          window.history.replaceState({}, '', '/home')
        } else if (paymentStatus === 'cancelled') {
          alert('Payment cancelled. Your booking was not completed.')
          window.history.replaceState({}, '', '/home')
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()

    // Reload data when page becomes visible (user navigates back)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  const fetchMyBookings = async (userIdParam?: number) => {
    try {
      const userStr = localStorage.getItem('ivoryUser')
      if (!userStr) return
      
      const user = JSON.parse(userStr)
      const id = userIdParam || user.id
      
      const response = await fetch(`/api/bookings?userId=${id}`)
      
      if (response.status === 401) {
        localStorage.removeItem('ivoryUser')
        router.push('/auth')
        return
      }
      
      const data = await response.json()
      if (response.ok) {
        setMyBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const searchTechs = async () => {
    setSearchLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (location) params.append('location', location)

      const response = await fetch(`/api/tech/search?${params}`)
      const data = await response.json()
      if (response.ok) {
        setTechs(data.techs)
      }
    } catch (error) {
      console.error('Error searching techs:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      case 'completed': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const startNewDesign = () => {
    router.push("/capture")
  }

  return (
    <div className="min-h-screen bg-white lg:pl-20">
      {/* Header */}
      <header className={`bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top backdrop-blur-sm bg-white/95 transition-all duration-300 ${isWatch ? 'watch-compact' : ''}`}>
        <div className={`max-w-screen-xl mx-auto ${isWatch ? 'px-3 py-2' : 'px-5 sm:px-6 py-4 sm:py-5'}`}>
          <h1 className={`font-serif font-light text-[#1A1A1A] tracking-tight transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'} ${isWatch ? 'text-sm' : 'text-xl sm:text-2xl'}`}>
            {isWatch ? "IVORY'S" : "IVORY'S CHOICE"}
          </h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className={`bg-white border-b border-[#E8E8E8] sticky ${isWatch ? 'top-8' : 'top-16 sm:top-18'} z-40`}>
        <div className={`max-w-screen-xl mx-auto ${isWatch ? 'px-3' : 'px-5 sm:px-6'}`}>
          <div className="flex">
            <button
              onClick={() => setActiveTab('designs')}
              className={`flex-1 py-4 sm:py-5 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-500 border-b-2 ${
                activeTab === 'designs'
                  ? 'border-[#1A1A1A] text-[#1A1A1A]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#8B7355]'
              }`}
            >
              My Designs
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-4 sm:py-5 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-500 border-b-2 ${
                activeTab === 'search'
                  ? 'border-[#1A1A1A] text-[#1A1A1A]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#8B7355]'
              }`}
            >
              Find Nail Tech
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 py-4 sm:py-5 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-500 border-b-2 ${
                activeTab === 'bookings'
                  ? 'border-[#1A1A1A] text-[#1A1A1A]'
                  : 'border-transparent text-[#6B6B6B] hover:text-[#8B7355]'
              }`}
            >
              My Bookings {myBookings.length > 0 && `(${myBookings.length})`}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`max-w-screen-xl mx-auto ${isWatch ? 'px-3 py-3 pb-20' : 'px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32'}`}>
        {/* My Designs Tab */}
        {activeTab === 'designs' && (
          <>
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

            {/* Section Headers - Create Design and Your Designs side by side */}
            <div className={`${isWatch ? 'mb-3' : 'mb-6 sm:mb-8'} transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className={`flex ${isWatch ? 'flex-col gap-2' : 'items-end justify-between gap-4'}`}>
                {/* Your Designs */}
                <div className="flex-1">
                  <HideOnWatch>
                    <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Collection</p>
                  </HideOnWatch>
                  <h2 className={`font-serif font-light text-[#1A1A1A] tracking-tight ${isWatch ? 'text-sm text-center' : 'text-2xl sm:text-3xl'}`}>
                    Your Designs
                  </h2>
                </div>

                {/* Create Design Button */}
                {isWatch ? (
                  <WatchButton onClick={startNewDesign} className="rounded-full w-full">
                    <Plus className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Create
                  </WatchButton>
                ) : (
                  <Button
                    className="h-12 sm:h-14 px-8 sm:px-12 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 text-xs tracking-widest uppercase rounded-none font-light active:scale-95 hover:shadow-lg hover:-translate-y-0.5 flex-shrink-0"
                    onClick={startNewDesign}
                  >
                    <Plus className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-90" strokeWidth={1.5} />
                    Create Design
                  </Button>
                )}
              </div>
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
          </>
        )}

        {/* Find Nail Tech Tab */}
        {activeTab === 'search' && (
          <div className="space-y-12 sm:space-y-16 lg:space-y-20">
            {/* Search Hero Section */}
            <div className="text-center space-y-6 sm:space-y-8">
              <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] font-light">
                Discover
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-[#1A1A1A] tracking-[-0.01em] leading-[1.1]">
                Find Your Perfect Match
              </h2>
              <p className="text-base sm:text-lg text-[#6B6B6B] leading-[1.7] font-light max-w-2xl mx-auto tracking-wide">
                Connect with skilled nail technicians who bring your vision to life
              </p>
            </div>

            {/* Elegant Search Box */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#F8F7F5] border border-[#E8E8E8] p-6 sm:p-8 lg:p-10 space-y-5 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B] group-focus-within:text-[#8B7355] transition-colors" />
                    <Input
                      placeholder="Name or specialty..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 border-[#E8E8E8] bg-white focus:border-[#8B7355] rounded-none text-base font-light"
                      onKeyDown={(e) => e.key === 'Enter' && searchTechs()}
                    />
                  </div>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B] group-focus-within:text-[#8B7355] transition-colors" />
                    <Input
                      placeholder="Location..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-12 h-14 border-[#E8E8E8] bg-white focus:border-[#8B7355] rounded-none text-base font-light"
                      onKeyDown={(e) => e.key === 'Enter' && searchTechs()}
                    />
                  </div>
                </div>
                <Button 
                  onClick={searchTechs} 
                  disabled={searchLoading}
                  className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {searchLoading ? 'Searching...' : 'Search Nail Technicians'}
                </Button>
              </div>
            </div>

            {/* Tech Results Grid */}
            {techs.length > 0 && (
              <div>
                <div className="mb-8 sm:mb-12">
                  <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] mb-3 font-light">
                    Results
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                    Available Nail Technicians
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                  {techs.map((tech) => (
                    <div
                      key={tech.id}
                      className="group cursor-pointer border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-700 hover:shadow-2xl hover:shadow-[#8B7355]/5"
                      onClick={() => router.push(`/tech/${tech.id}`)}
                    >
                      {/* Portfolio Image */}
                      {tech.portfolioImages && tech.portfolioImages.length > 0 ? (
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={tech.portfolioImages[0].imageUrl}
                            alt={tech.businessName || tech.user.username}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                          {tech.isVerified && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-white/95 text-[#1A1A1A] border-0 text-[10px] tracking-[0.2em] uppercase font-light">
                                Verified
                              </Badge>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-[4/3] bg-[#F8F7F5] flex items-center justify-center">
                          <Sparkles className="w-12 h-12 text-[#E8E8E8]" strokeWidth={1} />
                        </div>
                      )}

                      {/* Tech Info */}
                      <div className="p-6 sm:p-8 space-y-4 sm:space-y-5">
                        <div>
                          <h4 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                            {tech.businessName || tech.user.username}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-[#6B6B6B] font-light">
                            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                            {tech.location || 'Location not set'}
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-[#8B7355] text-[#8B7355]" strokeWidth={1.5} />
                            <span className="text-base font-light text-[#1A1A1A]">{tech.rating || '0.00'}</span>
                          </div>
                          <span className="text-sm text-[#6B6B6B] font-light">
                            ({tech.totalReviews || 0} reviews)
                          </span>
                        </div>

                        {/* Services */}
                        {tech.services && tech.services.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tech.services.slice(0, 3).map((service: any) => (
                              <Badge
                                key={service.id}
                                variant="outline"
                                className="text-[10px] tracking-[0.15em] uppercase font-light border-[#E8E8E8] text-[#6B6B6B]"
                              >
                                {service.name}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button
                          className="w-full bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white h-12 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700 group-hover:bg-[#1A1A1A] group-hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/book/${tech.id}`);
                          }}
                        >
                          Book Now
                          <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {techs.length === 0 && !searchLoading && (
              <div className="text-center py-16 sm:py-24 lg:py-32">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8 border border-[#E8E8E8] flex items-center justify-center">
                  <Search className="w-10 h-10 sm:w-12 sm:h-12 text-[#E8E8E8]" strokeWidth={1} />
                </div>
                <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                  Search for nail technicians to discover talented artists near you
                </p>
              </div>
            )}
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-12 sm:space-y-16 lg:space-y-20">
            {/* Bookings Hero */}
            <div className="text-center space-y-6 sm:space-y-8">
              <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#8B7355] font-light">
                Your Appointments
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-[#1A1A1A] tracking-[-0.01em] leading-[1.1]">
                Upcoming & Past Bookings
              </h2>
            </div>

            {/* Bookings List */}
            {myBookings.length === 0 ? (
              <div className="text-center py-16 sm:py-24 lg:py-32">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-8 border border-[#E8E8E8] flex items-center justify-center">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-[#E8E8E8]" strokeWidth={1} />
                </div>
                <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] mb-8 tracking-wide">
                  No bookings yet. Find a nail tech to book your first appointment
                </p>
                <Button
                  onClick={() => setActiveTab('search')}
                  className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 px-10 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700"
                >
                  Find Nail Tech
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:gap-8 max-w-4xl mx-auto">
                {myBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-700 hover:shadow-xl hover:shadow-[#8B7355]/5 cursor-pointer"
                    onClick={() => router.push(`/booking/${booking.id}`)}
                  >
                    <div className="p-6 sm:p-8 lg:p-10 space-y-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                            {booking.techProfile?.businessName || booking.techProfile?.user?.username}
                          </h3>
                          <p className="text-sm sm:text-base text-[#6B6B6B] font-light tracking-wide">
                            {booking.service?.name}
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(booking.status)} text-white text-[10px] tracking-[0.2em] uppercase font-light`}>
                          {booking.status}
                        </Badge>
                      </div>

                      {/* Date & Time */}
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base text-[#6B6B6B] font-light">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" strokeWidth={1.5} />
                          {new Date(booking.appointmentDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" strokeWidth={1.5} />
                          {new Date(booking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Design Preview */}
                      {booking.look && (
                        <div className="flex items-center gap-4 p-4 bg-[#F8F7F5] border border-[#E8E8E8]">
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                            <Image
                              src={booking.look.imageUrl}
                              alt={booking.look.title}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-1 font-light">
                              Your Design
                            </p>
                            <p className="text-sm sm:text-base font-light text-[#1A1A1A]">{booking.look.title}</p>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {booking.clientNotes && (
                        <div className="p-4 bg-[#F8F7F5] border border-[#E8E8E8]">
                          <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-2 font-light">
                            Your Notes
                          </p>
                          <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7]">
                            {booking.clientNotes}
                          </p>
                        </div>
                      )}

                      {/* Payment Info */}
                      <div className="flex items-center justify-between pt-6 border-t border-[#E8E8E8]">
                        <div>
                          <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 font-light">
                            Payment Status
                          </p>
                          <Badge className={booking.paymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
                            {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                        {booking.totalPrice && (
                          <div className="text-right">
                            <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-2 font-light">
                              Total
                            </p>
                            <p className="text-2xl sm:text-3xl font-serif font-light text-[#1A1A1A]">
                              ${booking.totalPrice}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {booking.status === 'pending' && booking.paymentStatus !== 'paid' && (
                        <Button
                          className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const response = await fetch('/api/stripe/create-booking-checkout', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ bookingId: booking.id }),
                            });
                            const data = await response.json();
                            if (response.ok) {
                              window.location.href = data.url;
                            }
                          }}
                        >
                          Complete Payment
                        </Button>
                      )}

                      {booking.status === 'completed' && !booking.hasReview && (
                        <BookingReviewDialog
                          bookingId={booking.id}
                          techName={booking.techProfile?.businessName || booking.techProfile?.user?.username || 'this tech'}
                          onReviewSubmitted={() => fetchMyBookings(currentUserId || undefined)}
                        />
                      )}

                      {booking.status === 'completed' && booking.hasReview && (
                        <div className="flex items-center justify-center gap-2 py-4 text-sm text-[#6B6B6B] font-light">
                          <Star className="w-4 h-4 fill-[#8B7355] text-[#8B7355]" strokeWidth={1.5} />
                          <span className="tracking-wide">Review submitted</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={startNewDesign} centerActionLabel="Create" />
    </div>
  )
}
