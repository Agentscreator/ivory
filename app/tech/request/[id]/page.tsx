"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, MessageCircle, DollarSign, ArrowLeft, Clock, User, Calendar } from "lucide-react"
import Image from "next/image"
import { BottomNav } from "@/components/bottom-nav"

type DesignRequest = {
  id: string
  clientName: string
  designImage: string
  message: string
  status: "pending" | "approved" | "modified"
  date: string
  lookId?: number
}

export default function TechRequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [request, setRequest] = useState<DesignRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        
        // Load design request
        const requestsRes = await fetch(`/api/design-requests?techId=${user.id}`)
        if (requestsRes.ok) {
          const data = await requestsRes.json()
          const foundRequest = data.find((req: any) => req.id.toString() === params.id)
          
          if (foundRequest) {
            let designImage = "/placeholder.svg"
            
            if (foundRequest.lookId) {
              try {
                const lookRes = await fetch(`/api/looks/${foundRequest.lookId}`)
                if (lookRes.ok) {
                  const look = await lookRes.json()
                  designImage = look.imageUrl || "/placeholder.svg"
                }
              } catch (error) {
                console.error(`Error fetching look ${foundRequest.lookId}:`, error)
              }
            }
            
            setRequest({
              id: foundRequest.id.toString(),
              clientName: `Client ${foundRequest.clientId}`,
              designImage,
              message: foundRequest.clientMessage || "",
              status: foundRequest.status,
              date: foundRequest.createdAt,
              lookId: foundRequest.lookId,
            })
          }
        }
      } catch (error) {
        console.error('Error loading request:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRequest()
  }, [router, params.id])

  const handleApprove = async () => {
    if (!request) return
    
    try {
      const response = await fetch('/api/design-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: request.id, status: 'approved' }),
      })

      if (response.ok) {
        setRequest({ ...request, status: "approved" })
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleRequestModification = () => {
    router.push(`/tech/review/${request?.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#6B6B6B] font-light tracking-wider uppercase">Loading...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="font-serif text-2xl font-light text-[#1A1A1A] mb-2">Request Not Found</h2>
          <Button onClick={() => router.push('/tech/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-5 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-10 w-10 p-0 hover:bg-[#F8F7F5]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight">
              Design Request
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
        {/* Status Badge */}
        <div className="mb-6 flex justify-center">
          {request.status === "pending" && (
            <Badge className="bg-gradient-to-r from-terracotta to-rose text-white border-0 shadow-lg px-4 py-2 text-sm">
              New Request
            </Badge>
          )}
          {request.status === "approved" && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg px-4 py-2 text-sm">
              <Check className="w-4 h-4 mr-1" />
              Approved
            </Badge>
          )}
        </div>

        {/* Design Image - Hero */}
        <Card className="overflow-hidden border-0 shadow-2xl mb-6">
          <div className="relative aspect-square w-full bg-gradient-to-br from-muted/30 to-muted/10">
            <Image
              src={request.designImage || "/placeholder.svg"}
              alt="Client design"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        </Card>

        {/* Client Info */}
        <Card className="border border-[#E8E8E8] mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F8F7F5] border border-[#E8E8E8] flex items-center justify-center">
                  <User className="w-6 h-6 text-[#8B7355]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light mb-1">Client</p>
                  <h3 className="font-serif text-xl font-light text-[#1A1A1A]">
                    {request.clientName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-[#E8E8E8]">
                <Calendar className="w-5 h-5 text-[#8B7355]" strokeWidth={1.5} />
                <div>
                  <p className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light mb-1">Requested</p>
                  <p className="text-sm text-[#1A1A1A]">
                    {new Date(request.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Message */}
        {request.message && (
          <Card className="border border-[#E8E8E8] mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-[#8B7355] mt-1" strokeWidth={1.5} />
                <h3 className="text-xs tracking-wider uppercase text-[#6B6B6B] font-light">
                  Client Message
                </h3>
              </div>
              <p className="text-base text-[#1A1A1A] leading-relaxed font-light pl-8">
                {request.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        {request.status === "pending" && (
          <div className="space-y-3">
            <Button 
              onClick={handleApprove} 
              className="w-full h-14 text-base font-light tracking-wider uppercase bg-gradient-to-r from-terracotta to-rose hover:from-terracotta/90 hover:to-rose/90 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
            >
              <Check className="w-5 h-5 mr-2" strokeWidth={2} />
              Approve Design
            </Button>
            
            <Button 
              onClick={handleRequestModification} 
              variant="outline"
              className="w-full h-14 text-base font-light tracking-wider uppercase border-2 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#F8F7F5] active:scale-[0.98] transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5 mr-2" strokeWidth={1.5} />
              Request Changes
            </Button>
            
            <Button 
              variant="outline"
              className="w-full h-14 text-base font-light tracking-wider uppercase border-2 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#F8F7F5] active:scale-[0.98] transition-all duration-200"
            >
              <DollarSign className="w-5 h-5 mr-2" strokeWidth={1.5} />
              Suggest Add-ons
            </Button>
          </div>
        )}

        {request.status === "approved" && (
          <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white border border-green-200 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" strokeWidth={2} />
              </div>
              <h3 className="font-serif text-xl font-light text-[#1A1A1A] mb-2">
                Design Approved
              </h3>
              <p className="text-sm text-[#6B6B6B] font-light">
                The client has been notified of your approval
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
