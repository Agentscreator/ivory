"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, DollarSign, MessageCircle, Plus, Sparkles, Clock, CheckCircle2, Coins } from "lucide-react"
import Image from "next/image"
import { BottomNav } from "@/components/bottom-nav"
import { CreditsDisplay } from "@/components/credits-display"
import { BuyCreditsDialog } from "@/components/buy-credits-dialog"

type ClientRequest = {
  id: string
  clientName: string
  designImage: string
  message: string
  status: "pending" | "approved" | "modified"
  date: string
}

type PersonalDesign = {
  id: string
  title: string
  imageUrl: string
  createdAt: string
}

export default function TechDashboardPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<ClientRequest[]>([])
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])
  const [personalDesigns, setPersonalDesigns] = useState<PersonalDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("requests")
  const [subscriptionTier, setSubscriptionTier] = useState('free')
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive')

  useEffect(() => {
    // Check for tab parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['requests', 'approved', 'designs', 'gallery'].includes(tabParam)) {
      setActiveTab(tabParam)
    }

    const loadData = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        
        // Set subscription info
        setSubscriptionTier(user.subscriptionTier || 'free')
        setSubscriptionStatus(user.subscriptionStatus || 'inactive')
        
        // Load design requests
        const requestsRes = await fetch(`/api/design-requests?techId=${user.id}`)
        if (requestsRes.ok) {
          const data = await requestsRes.json()
          
          // Fetch look images for each request
          const formattedRequests = await Promise.all(
            data.map(async (req: any) => {
              let designImage = "/placeholder.svg"
              
              if (req.lookId) {
                try {
                  const lookRes = await fetch(`/api/looks/${req.lookId}`)
                  if (lookRes.ok) {
                    const look = await lookRes.json()
                    designImage = look.imageUrl || "/placeholder.svg"
                  }
                } catch (error) {
                  console.error(`Error fetching look ${req.lookId}:`, error)
                }
              }
              
              return {
                id: req.id.toString(),
                clientName: `Client ${req.clientId}`,
                designImage,
                message: req.clientMessage || "",
                status: req.status,
                date: req.createdAt,
              }
            })
          )
          
          setRequests(formattedRequests)
        }

        // Load portfolio images
        const imagesRes = await fetch(`/api/portfolio-images?userId=${user.id}`)
        if (imagesRes.ok) {
          const data = await imagesRes.json()
          setPortfolioImages(data.images?.map((img: any) => img.imageUrl) || [])
        }

        // Load personal designs (looks)
        const looksRes = await fetch(`/api/looks?userId=${user.id}`)
        if (looksRes.ok) {
          const looksData = await looksRes.json()
          setPersonalDesigns(
            looksData.map((look: any) => ({
              id: look.id.toString(),
              title: look.title,
              imageUrl: look.imageUrl,
              createdAt: look.createdAt,
            }))
          )
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch('/api/design-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'approved' }),
      })

      if (response.ok) {
        setRequests(requests.map((req) => (req.id === id ? { ...req, status: "approved" as const } : req)))
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleRequestModification = (id: string) => {
    router.push(`/tech/review/${id}`)
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24 lg:pl-20">
      {/* Header */}
      <header className="bg-white/98 backdrop-blur-md border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
              Dashboard
            </h1>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#F8F7F5] border border-[#E8E8E8]">
                <Coins className="w-4 h-4 text-[#8B7355]" strokeWidth={1} />
                <CreditsDisplay showLabel={false} className="text-sm font-light" />
              </div>
              {subscriptionTier !== 'free' && subscriptionStatus === 'active' ? (
                <BuyCreditsDialog>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="hidden sm:flex gap-2 h-10 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white transition-all duration-700 text-[10px] tracking-[0.25em] uppercase font-light"
                  >
                    <Coins className="w-4 h-4" strokeWidth={1} />
                    Buy
                  </Button>
                </BuyCreditsDialog>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => router.push('/billing')}
                  className="hidden sm:flex gap-2 h-10 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white transition-all duration-700 text-[10px] tracking-[0.25em] uppercase font-light"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={1} />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-8 sm:py-12 pb-safe">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Quick Actions */}
          <div className="mb-8">
            <Button 
              onClick={() => router.push('/tech/bookings')}
              className="w-full h-14 bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-700 text-[11px] tracking-[0.25em] uppercase font-light hover:scale-[1.01] active:scale-[0.98]"
            >
              <Clock className="w-5 h-5 mr-2" strokeWidth={1} />
              View Bookings & Appointments
            </Button>
          </div>

          <TabsList className="w-full mb-8 sm:mb-10 grid grid-cols-4 h-auto bg-white border border-[#E8E8E8] p-0 rounded-none">
            <TabsTrigger 
              value="requests" 
              className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-4 sm:py-5 transition-all duration-700 font-light"
            >
              <Clock className="w-4 h-4 mr-1 sm:mr-2" strokeWidth={1} />
              <span className="hidden xs:inline">Requests</span>
              <span className="xs:hidden">New</span>
            </TabsTrigger>
            <TabsTrigger 
              value="approved" 
              className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-4 sm:py-5 transition-all duration-700 font-light"
            >
              <CheckCircle2 className="w-4 h-4 mr-1 sm:mr-2" strokeWidth={1} />
              <span className="hidden xs:inline">Approved</span>
              <span className="xs:hidden">Done</span>
            </TabsTrigger>
            <TabsTrigger 
              value="designs" 
              className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-4 sm:py-5 transition-all duration-700 font-light"
            >
              <Sparkles className="w-4 h-4 mr-1 sm:mr-2" strokeWidth={1} />
              <span className="hidden xs:inline">Designs</span>
              <span className="xs:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger 
              value="gallery" 
              className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-4 sm:py-5 transition-all duration-700 font-light"
            >
              <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden xs:inline">Gallery</span>
              <span className="xs:hidden">Work</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-5 sm:space-y-6">
            {requests
              .filter((req) => req.status === "pending")
              .map((request) => (
                <Card 
                  key={request.id} 
                  className="overflow-hidden border border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all duration-700 bg-white cursor-pointer"
                  onClick={() => router.push(`/tech/request/${request.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex gap-0 flex-col sm:flex-row">
                      {/* Design Image */}
                      <div className="w-full sm:w-56 md:w-64 h-64 sm:h-auto relative flex-shrink-0 bg-[#F8F7F5]">
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Client design"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-[#8B7355] text-white border-0 shadow-lg text-[10px] tracking-wider uppercase font-light">
                            New
                          </Badge>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 p-6 sm:p-8">
                        <div className="mb-5">
                          <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                            {request.clientName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-[#6B6B6B] font-light">
                            <Clock className="w-4 h-4" strokeWidth={1} />
                            <span>
                              {new Date(request.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {request.message && (
                          <div className="mb-6 p-5 bg-[#F8F7F5] border border-[#E8E8E8]">
                            <p className="text-sm text-[#6B6B6B] leading-relaxed line-clamp-3 font-light">
                              {request.message}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 flex-wrap">
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprove(request.id)
                            }} 
                            className="h-11 px-6 text-[10px] tracking-[0.25em] uppercase font-light bg-[#1A1A1A] hover:bg-[#8B7355] text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-700"
                          >
                            <Check className="w-4 h-4 mr-2" strokeWidth={1} />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRequestModification(request.id)
                            }} 
                            className="h-11 px-5 text-[10px] tracking-[0.25em] uppercase font-light border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-700"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" strokeWidth={1} />
                            <span className="hidden sm:inline">Request Changes</span>
                            <span className="sm:hidden">Changes</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => e.stopPropagation()}
                            className="h-11 px-5 text-[10px] tracking-[0.25em] uppercase font-light border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-700"
                          >
                            <DollarSign className="w-4 h-4 mr-2" strokeWidth={1} />
                            <span className="hidden sm:inline">Add-ons</span>
                            <span className="sm:hidden">$</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {requests.filter((req) => req.status === "pending").length === 0 && (
              <div className="p-16 sm:p-20 text-center border border-[#E8E8E8] bg-white">
                <div className="max-w-sm mx-auto">
                  <div className="w-20 h-20 mx-auto mb-8 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center">
                    <Clock className="w-9 h-9 text-[#8B7355]" strokeWidth={1} />
                  </div>
                  <h3 className="font-serif text-2xl font-light text-[#1A1A1A] mb-3 tracking-tight">All Caught Up</h3>
                  <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">No pending requests at the moment</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 sm:space-y-5">
            {requests
              .filter((req) => req.status === "approved")
              .map((request) => (
                <Card 
                  key={request.id} 
                  className="overflow-hidden border border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all duration-700 bg-white cursor-pointer"
                  onClick={() => router.push(`/tech/request/${request.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-5 items-center">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 relative overflow-hidden flex-shrink-0 border border-[#E8E8E8]">
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Approved design"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-3 truncate tracking-tight">
                          {request.clientName}
                        </h3>
                        <Badge className="bg-green-500 text-white border-0 text-[10px] tracking-wider uppercase font-light">
                          <CheckCircle2 className="w-3 h-3 mr-1" strokeWidth={1} />
                          Approved
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hidden sm:flex h-10 px-5 hover:bg-[#F8F7F5] hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 text-[10px] tracking-[0.25em] uppercase font-light"
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {requests.filter((req) => req.status === "approved").length === 0 && (
              <div className="p-16 sm:p-20 text-center border border-[#E8E8E8] bg-white">
                <div className="max-w-sm mx-auto">
                  <div className="w-20 h-20 mx-auto mb-8 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center">
                    <CheckCircle2 className="w-9 h-9 text-[#8B7355]" strokeWidth={1} />
                  </div>
                  <h3 className="font-serif text-2xl font-light text-[#1A1A1A] mb-3 tracking-tight">No Approved Designs</h3>
                  <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">Approved requests will appear here</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="designs" className="space-y-6">
            {/* Credits/Subscription Info Card */}
            {subscriptionTier !== 'free' && subscriptionStatus === 'active' ? (
              // Paid users - show credits with buy option
              <Card className="border border-[#E8E8E8] bg-white shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#F8F7F5] border border-[#E8E8E8] flex items-center justify-center">
                        <Coins className="w-7 h-7 text-[#8B7355]" strokeWidth={1} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-light tracking-wide text-[#6B6B6B]">Your Credits</span>
                          <CreditsDisplay showLabel={false} className="text-3xl font-light text-[#1A1A1A]" />
                        </div>
                        <p className="text-xs text-[#6B6B6B] font-light">1 credit per AI design generation</p>
                      </div>
                    </div>
                    <BuyCreditsDialog>
                      <Button 
                        size="sm"
                        className="h-11 px-6 bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-700 text-[10px] tracking-[0.25em] uppercase font-light hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Coins className="w-4 h-4 mr-2" strokeWidth={1} />
                        Buy Credits
                      </Button>
                    </BuyCreditsDialog>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Free users - show upgrade prompt
              <Card className="border border-[#E8E8E8] bg-white shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-[#F8F7F5] border border-[#E8E8E8] flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-7 h-7 text-[#8B7355]" strokeWidth={1} />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                          Upgrade Your Plan
                        </h3>
                        <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">
                          Subscribe to get monthly credits and unlock the ability to purchase additional credits anytime
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => router.push('/billing')}
                      size="sm"
                      className="h-11 px-6 bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-700 whitespace-nowrap text-[10px] tracking-[0.25em] uppercase font-light hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4 mr-2" strokeWidth={1} />
                      View Plans
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {personalDesigns.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                      AI Designs
                    </h2>
                    <p className="text-sm text-[#6B6B6B] font-light">
                      {personalDesigns.length} {personalDesigns.length === 1 ? 'design' : 'designs'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push("/capture")}
                    className="h-11 px-5 bg-[#1A1A1A] hover:bg-[#8B7355] text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 text-[10px] tracking-[0.25em] uppercase font-light"
                  >
                    <Plus className="w-4 h-4 mr-2" strokeWidth={1} />
                    <span className="hidden sm:inline">Create New</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {personalDesigns.map((design) => (
                    <Card 
                      key={design.id} 
                      className="group overflow-hidden cursor-pointer border border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all duration-700 bg-white"
                      onClick={() => router.push(`/shared/${design.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden bg-[#F8F7F5]">
                          <Image
                            src={design.imageUrl}
                            alt={design.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-1000"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
                        <div className="p-5 sm:p-6">
                          <h3 className="font-serif text-lg sm:text-xl font-light text-[#1A1A1A] mb-2 truncate group-hover:text-[#8B7355] transition-colors duration-700 tracking-tight">
                            {design.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-[#6B6B6B] font-light">
                            <Sparkles className="w-3.5 h-3.5" strokeWidth={1} />
                            <span>
                              {new Date(design.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-16 sm:p-24 text-center border border-[#E8E8E8] bg-white">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-8 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center">
                    <Sparkles className="w-11 h-11 text-[#8B7355]" strokeWidth={1} />
                  </div>
                  <h3 className="font-serif text-3xl font-light text-[#1A1A1A] mb-4 tracking-tight">
                    Create Your First Design
                  </h3>
                  <p className="text-sm text-[#6B6B6B] mb-8 leading-relaxed font-light">
                    Use AI to generate stunning nail art designs and showcase your creativity
                  </p>
                  <Button
                    onClick={() => router.push("/capture")}
                    className="h-14 px-10 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 text-[11px] tracking-[0.25em] uppercase font-light hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-5 h-5 mr-2" strokeWidth={1} />
                    Create Design
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            {portfolioImages.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                      Portfolio
                    </h2>
                    <p className="text-sm text-[#6B6B6B] font-light">
                      {portfolioImages.length} {portfolioImages.length === 1 ? 'photo' : 'photos'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/tech/profile-setup")}
                    className="h-11 px-5 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 text-[10px] tracking-[0.25em] uppercase font-light"
                  >
                    <Plus className="w-4 h-4 mr-2" strokeWidth={1} />
                    <span className="hidden sm:inline">Add More</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                  {portfolioImages.map((url, index) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden bg-[#F8F7F5] border border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all duration-700 cursor-pointer"
                    >
                      <Image
                        src={url}
                        alt={`Portfolio image ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-16 sm:p-24 text-center border border-[#E8E8E8] bg-white">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-8 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center">
                    <svg className="w-11 h-11 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-3xl font-light text-[#1A1A1A] mb-4 tracking-tight">
                    Build Your Portfolio
                  </h3>
                  <p className="text-sm text-[#6B6B6B] mb-8 leading-relaxed font-light">
                    Showcase your best nail art work to attract more clients and grow your business
                  </p>
                  <Button
                    onClick={() => router.push("/tech/profile-setup")}
                    className="h-14 px-10 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 text-[11px] tracking-[0.25em] uppercase font-light hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-5 h-5 mr-2" strokeWidth={1} />
                    Add Photos
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push("/capture")} centerActionLabel="Create" />
    </div>
  )
}
