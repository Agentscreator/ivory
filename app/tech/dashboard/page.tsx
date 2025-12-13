"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, DollarSign, MessageCircle, User, Plus, LayoutDashboard, Sparkles } from "lucide-react"
import Image from "next/image"

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
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Tech Dashboard</h1>
          </div>
          <Button variant="outline" onClick={() => router.push("/profile")} className="h-9 sm:h-10 active:scale-95 transition-transform">
            <span className="hidden sm:inline">Profile</span>
            <User className="w-4 h-4 sm:hidden" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32">
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="w-full mb-4 sm:mb-6 grid grid-cols-4 h-11 sm:h-12">
            <TabsTrigger value="requests" className="text-xs sm:text-sm whitespace-nowrap">
              Requests
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-xs sm:text-sm whitespace-nowrap">
              Approved
            </TabsTrigger>
            <TabsTrigger value="designs" className="text-xs sm:text-sm whitespace-nowrap">
              My Designs
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs sm:text-sm whitespace-nowrap">
              Gallery
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {requests
              .filter((req) => req.status === "pending")
              .map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex gap-4 sm:gap-6 flex-col sm:flex-row">
                      {/* Design Image */}
                      <div className="w-full sm:w-40 md:w-48 h-48 sm:h-40 md:h-48 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Client design"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal mb-0.5 sm:mb-1 truncate">{request.clientName}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(request.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge variant="secondary" className="flex-shrink-0 text-xs">New</Badge>
                        </div>

                        {request.message && (
                          <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs sm:text-sm text-foreground line-clamp-2">{request.message}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" onClick={() => handleApprove(request.id)} className="h-9 sm:h-10 text-xs sm:text-sm active:scale-95 transition-transform">
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRequestModification(request.id)} className="h-9 sm:h-10 text-xs sm:text-sm active:scale-95 transition-transform">
                            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            <span className="hidden sm:inline">Request Changes</span>
                            <span className="sm:hidden">Changes</span>
                          </Button>
                          <Button size="sm" variant="outline" className="h-9 sm:h-10 text-xs sm:text-sm active:scale-95 transition-transform">
                            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            <span className="hidden sm:inline">Offer Add-ons</span>
                            <span className="sm:hidden">Add-ons</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {requests.filter((req) => req.status === "pending").length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No pending requests at the moment</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {requests
              .filter((req) => req.status === "approved")
              .map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-6 items-center">
                      <div className="w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={request.designImage || "/placeholder.svg"}
                          alt="Approved design"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-charcoal mb-1">{request.clientName}</h3>
                        <Badge className="bg-green-500">Approved</Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/tech/request/${request.id}`)}
                        className="active:scale-95 transition-transform"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {requests.filter((req) => req.status === "approved").length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No approved designs yet</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="designs" className="space-y-4">
            {personalDesigns.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    {personalDesigns.length} {personalDesigns.length === 1 ? 'design' : 'designs'}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/capture")}
                    className="h-9 sm:h-10 active:scale-95 transition-transform"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {personalDesigns.map((design) => (
                    <Card 
                      key={design.id} 
                      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => router.push(`/shared/${design.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-square">
                          <Image
                            src={design.imageUrl}
                            alt={design.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-serif font-bold text-charcoal mb-1 truncate">
                            {design.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(design.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="p-8 sm:p-12 text-center">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal mb-2">
                  No Designs Yet
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Create your first AI-generated nail design
                </p>
                <Button
                  onClick={() => router.push("/capture")}
                  className="active:scale-95 transition-transform"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Design
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            {portfolioImages.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    {portfolioImages.length} {portfolioImages.length === 1 ? 'photo' : 'photos'}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/tech/profile-setup")}
                    className="h-9 sm:h-10 active:scale-95 transition-transform"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add More
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {portfolioImages.map((url, index) => (
                    <div
                      key={url}
                      className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-muted shadow-sm"
                    >
                      <Image
                        src={url}
                        alt={`Portfolio image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Card className="p-8 sm:p-12 text-center">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal mb-2">
                  Build Your Portfolio
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Upload photos of your best work to attract more clients
                </p>
                <Button
                  onClick={() => router.push("/tech/profile-setup")}
                  className="active:scale-95 transition-transform"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Photos
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border safe-bottom z-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-around h-20 sm:h-24">
            <button
              onClick={() => router.push("/tech/dashboard")}
              className="flex flex-col items-center justify-center gap-1 text-primary min-w-[60px] active:scale-95 transition-transform"
            >
              <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="text-xs sm:text-sm font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => router.push("/capture")}
              className="flex flex-col items-center justify-center -mt-8 sm:-mt-10 bg-gradient-to-br from-terracotta to-rose text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 shadow-xl active:scale-95 transition-transform"
            >
              <Plus className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground active:text-foreground transition-colors min-w-[60px] active:scale-95"
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
