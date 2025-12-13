"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, DollarSign, MessageCircle, Plus, Sparkles, Clock, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { BottomNav } from "@/components/bottom-nav"

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        
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
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-border/50 sticky top-0 z-10 safe-top shadow-sm">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold bg-gradient-to-r from-terracotta to-rose bg-clip-text text-transparent">
              Ivory
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Tech Dashboard</span>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32">
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="w-full mb-6 sm:mb-8 grid grid-cols-4 h-12 sm:h-14 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm">
            <TabsTrigger 
              value="requests" 
              className="text-xs sm:text-sm font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Requests</span>
              <span className="xs:hidden">New</span>
            </TabsTrigger>
            <TabsTrigger 
              value="approved" 
              className="text-xs sm:text-sm font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Approved</span>
              <span className="xs:hidden">Done</span>
            </TabsTrigger>
            <TabsTrigger 
              value="designs" 
              className="text-xs sm:text-sm font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Designs</span>
              <span className="xs:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger 
              value="gallery" 
              className="text-xs sm:text-sm font-medium rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="hidden xs:inline">Gallery</span>
              <span className="xs:hidden">Work</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4 sm:space-y-5">
            {requests
              .filter((req) => req.status === "pending")
              .map((request) => (
                <Card key={request.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="flex gap-0 flex-col sm:flex-row">
                      {/* Design Image */}
                      <div className="w-full sm:w-48 md:w-56 h-56 sm:h-auto relative flex-shrink-0 bg-gradient-to-br from-muted/30 to-muted/10">
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Client design"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-gradient-to-r from-terracotta to-rose text-white border-0 shadow-lg">
                            New
                          </Badge>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 p-5 sm:p-6">
                        <div className="mb-4">
                          <h3 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mb-1.5">
                            {request.clientName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
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
                          <div className="mb-5 p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/50">
                            <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3">
                              {request.message}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2.5 flex-wrap">
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(request.id)} 
                            className="h-10 sm:h-11 px-5 text-sm font-medium bg-gradient-to-r from-terracotta to-rose hover:from-terracotta/90 hover:to-rose/90 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleRequestModification(request.id)} 
                            className="h-10 sm:h-11 px-4 sm:px-5 text-sm font-medium border-2 hover:bg-muted/50 active:scale-95 transition-all duration-200"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Request Changes</span>
                            <span className="sm:hidden">Changes</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-10 sm:h-11 px-4 sm:px-5 text-sm font-medium border-2 hover:bg-muted/50 active:scale-95 transition-all duration-200"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
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
              <Card className="p-12 sm:p-16 text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center">
                    <Clock className="w-8 h-8 text-muted-foreground/60" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-charcoal mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">No pending requests at the moment</p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-3 sm:space-y-4">
            {requests
              .filter((req) => req.status === "approved")
              .map((request) => (
                <Card 
                  key={request.id} 
                  className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer"
                  onClick={() => router.push(`/tech/request/${request.id}`)}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Approved design"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal mb-2 truncate">
                          {request.clientName}
                        </h3>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hidden sm:flex h-10 px-4 hover:bg-muted/50 active:scale-95 transition-all"
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {requests.filter((req) => req.status === "approved").length === 0 && (
              <Card className="p-12 sm:p-16 text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <div className="max-w-sm mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600/60" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-charcoal mb-2">No Approved Designs</h3>
                  <p className="text-muted-foreground">Approved requests will appear here</p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="designs" className="space-y-5">
            {personalDesigns.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mb-1">
                      AI Designs
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {personalDesigns.length} {personalDesigns.length === 1 ? 'design' : 'designs'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push("/capture")}
                    className="h-10 sm:h-11 px-4 sm:px-5 bg-gradient-to-r from-terracotta to-rose hover:from-terracotta/90 hover:to-rose/90 shadow-md active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Create New</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {personalDesigns.map((design) => (
                    <Card 
                      key={design.id} 
                      className="group overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      onClick={() => router.push(`/shared/${design.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                          <Image
                            src={design.imageUrl}
                            alt={design.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-4 sm:p-5">
                          <h3 className="font-serif text-lg font-bold text-charcoal mb-1.5 truncate group-hover:text-primary transition-colors">
                            {design.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Sparkles className="w-3.5 h-3.5" />
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
              <Card className="p-10 sm:p-16 text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-terracotta/20 to-rose/20 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-terracotta/60" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal mb-3">
                    Create Your First Design
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Use AI to generate stunning nail art designs and showcase your creativity
                  </p>
                  <Button
                    onClick={() => router.push("/capture")}
                    size="lg"
                    className="h-12 px-8 bg-gradient-to-r from-terracotta to-rose hover:from-terracotta/90 hover:to-rose/90 shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Design
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-5">
            {portfolioImages.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal mb-1">
                      Portfolio
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {portfolioImages.length} {portfolioImages.length === 1 ? 'photo' : 'photos'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/tech/profile-setup")}
                    className="h-10 sm:h-11 px-4 sm:px-5 border-2 hover:bg-muted/50 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Add More</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {portfolioImages.map((url, index) => (
                    <div
                      key={url}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <Image
                        src={url}
                        alt={`Portfolio image ${index + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Card className="p-10 sm:p-16 text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center">
                    <svg className="w-10 h-10 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-charcoal mb-3">
                    Build Your Portfolio
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Showcase your best nail art work to attract more clients and grow your business
                  </p>
                  <Button
                    onClick={() => router.push("/tech/profile-setup")}
                    size="lg"
                    className="h-12 px-8 bg-gradient-to-r from-terracotta to-rose hover:from-terracotta/90 hover:to-rose/90 shadow-lg active:scale-95 transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Photos
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push("/capture")} centerActionLabel="Create" />
    </div>
  )
}
