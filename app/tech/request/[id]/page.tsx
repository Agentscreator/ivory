"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, MessageCircle, DollarSign, ArrowLeft, User, Calendar, Sparkles, Loader2 } from "lucide-react"
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
  const [implementationGuidance, setImplementationGuidance] = useState<string>("")
  const [loadingGuidance, setLoadingGuidance] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const userStr = localStorage.getItem("ivoryUser")
        if (!userStr) {
          router.push("/")
          return
        }

        const user = JSON.parse(userStr)
        
        const requestsRes = await fetch(`/api/design-requests?techId=${user.id}`)
        if (requestsRes.ok) {
          const data = await requestsRes.json()
          const foundRequest = data.find((req: any) => req.id.toString() === params.id)
          
          if (foundRequest) {
            setRequest({
              id: foundRequest.id.toString(),
              clientName: foundRequest.client?.username || `Client ${foundRequest.clientId}`,
              designImage: foundRequest.look?.imageUrl || "/placeholder.svg",
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

  const generateImplementationGuidance = async () => {
    if (!request?.designImage) return
    
    setLoadingGuidance(true)
    setIsTyping(false)
    setTypingText("")
    setImplementationGuidance("")
    
    try {
      const response = await fetch('/api/analyze-design-for-tech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: request.designImage }),
      })

      if (response.ok) {
        const data = await response.json()
        setImplementationGuidance(data.guidance)
        setLoadingGuidance(false)
        
        // Start typing animation
        setIsTyping(true)
        const text = data.guidance
        let index = 0
        
        const typingInterval = setInterval(() => {
          if (index < text.length) {
            setTypingText(text.substring(0, index + 1))
            index++
          } else {
            setIsTyping(false)
            clearInterval(typingInterval)
          }
        }, 15) // 15ms per character for smooth typing
      } else {
        console.error('Failed to generate guidance')
        setLoadingGuidance(false)
      }
    } catch (error) {
      console.error('Error generating guidance:', error)
      setLoadingGuidance(false)
    }
  }

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

  // Split guidance into two paragraphs for display with safety checks
  const textToSplit = isTyping ? typingText : implementationGuidance
  const guidanceParagraphs = (textToSplit && typeof textToSplit === 'string') 
    ? textToSplit.split('\n\n').filter(p => p && p.trim())
    : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F7F5] via-white to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-sm text-[#6B6B6B] font-light tracking-[0.25em] uppercase">Loading...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F7F5] via-white to-white flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="font-serif text-3xl font-light text-[#1A1A1A] mb-6 tracking-[-0.01em]">Request Not Found</h2>
          <Button 
            onClick={() => router.push('/tech/dashboard')} 
            className="h-12 px-8 bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-700 text-[11px] tracking-[0.25em] uppercase font-light rounded-none hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F7F5] via-white to-white">

      {/* Elegant Header */}
      <header className="bg-white/98 backdrop-blur-md border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 py-6 sm:py-7">
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-12 w-12 p-0 hover:bg-[#F8F7F5] hover:scale-105 active:scale-95 transition-all duration-700 rounded-none"
            >
              <ArrowLeft className="w-5 h-5" strokeWidth={1} />
            </Button>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
              Design Request
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 py-10 sm:py-14 lg:py-16 pb-32">
        {/* Implementation Guidance - Moved to Top */}
        <Card className="border border-[#E8E8E8] mb-8 sm:mb-10 rounded-none bg-gradient-to-br from-[#F8F7F5] to-white">
          <CardContent className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7355] mt-0.5 sm:mt-1 flex-shrink-0" strokeWidth={1} />
              <div className="flex-1 min-w-0">
                <h3 className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[#6B6B6B] font-light mb-1.5 sm:mb-2">
                  Implementation Guide
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] font-light tracking-wide leading-relaxed">
                  Get professional guidance on how to recreate this design
                </p>
              </div>
            </div>

            {!implementationGuidance && !loadingGuidance && (
              <Button
                onClick={generateImplementationGuidance}
                className="w-full h-12 sm:h-14 text-xs sm:text-sm font-light tracking-[0.2em] sm:tracking-[0.25em] uppercase bg-[#8B7355] hover:bg-[#1A1A1A] text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-700 rounded-none"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1} />
                Generate Implementation Guide
              </Button>
            )}

            {loadingGuidance && (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4">
                    <div className="absolute inset-0 border-2 border-[#8B7355]/20 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#6B6B6B] font-light tracking-wide px-4">
                    Analyzing design...
                  </p>
                </div>
              </div>
            )}

            {(implementationGuidance || isTyping) && !loadingGuidance && (
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-4 sm:space-y-5 pl-0 sm:pl-10">
                  {guidanceParagraphs.map((paragraph, index) => (
                    <div key={index} className="relative">
                      <p className="text-sm sm:text-base lg:text-lg text-[#1A1A1A] leading-relaxed sm:leading-loose font-light tracking-wide">
                        {paragraph}
                        {isTyping && index === guidanceParagraphs.length - 1 && (
                          <span className="inline-block w-0.5 h-4 sm:h-5 bg-[#8B7355] ml-0.5 animate-pulse"></span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
                
                {!isTyping && (
                  <div className="pt-4 sm:pt-6 border-t border-[#E8E8E8]">
                    <Button
                      onClick={generateImplementationGuidance}
                      variant="outline"
                      className="w-full sm:w-auto h-10 sm:h-12 text-xs font-light tracking-[0.2em] sm:tracking-[0.25em] uppercase border-2 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white active:scale-[0.98] transition-all duration-700 rounded-none"
                    >
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" strokeWidth={1} />
                      Regenerate Guide
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Design Image - Hero */}
        <Card className="overflow-hidden border border-[#E8E8E8] shadow-2xl shadow-[#8B7355]/5 mb-10 rounded-none">
          <div className="relative aspect-square w-full bg-gradient-to-br from-[#F8F7F5] to-white">
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
        <Card className="border border-[#E8E8E8] mb-8 rounded-none">
          <CardContent className="p-8 sm:p-10">
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-[#F8F7F5] border border-[#E8E8E8] flex items-center justify-center rounded-none">
                  <User className="w-7 h-7 text-[#8B7355]" strokeWidth={1} />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#6B6B6B] font-light mb-2">Client</p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                    {request.clientName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-5 pt-4 border-t border-[#E8E8E8]">
                <Calendar className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#6B6B6B] font-light mb-2">Requested</p>
                  <p className="text-base text-[#1A1A1A] font-light tracking-wide">
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
          <Card className="border border-[#E8E8E8] mb-10 rounded-none">
            <CardContent className="p-8 sm:p-10">
              <div className="flex items-start gap-4 mb-5">
                <MessageCircle className="w-6 h-6 text-[#8B7355] mt-1" strokeWidth={1} />
                <h3 className="text-[10px] tracking-[0.3em] uppercase text-[#6B6B6B] font-light">
                  Client Message
                </h3>
              </div>
              <p className="text-base sm:text-lg text-[#1A1A1A] leading-relaxed font-light pl-10 tracking-wide">
                {request.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Implementation Guidance - Mobile Optimized */}
        <Card className="border border-[#E8E8E8] mb-8 sm:mb-10 rounded-none bg-gradient-to-br from-[#F8F7F5] to-white">
          <CardContent className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-start gap-3 sm:gap-4 mb-5 sm:mb-6">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#8B7355] mt-0.5 sm:mt-1 flex-shrink-0" strokeWidth={1} />
              <div className="flex-1 min-w-0">
                <h3 className="text-[10px] sm:text-[11px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[#6B6B6B] font-light mb-1.5 sm:mb-2">
                  Request Status
                </h3>
                <div className="mt-2">
                  {request.status === "pending" && (
                    <Badge className="bg-[#8B7355] text-white border-0 shadow-lg px-4 py-2 text-xs tracking-[0.2em] uppercase font-light rounded-none">
                      New Request
                    </Badge>
                  )}
                  {request.status === "approved" && (
                    <Badge className="bg-green-500 text-white border-0 shadow-lg px-4 py-2 text-xs tracking-[0.2em] uppercase font-light rounded-none">
                      <Check className="w-3 h-3 mr-2" strokeWidth={1} />
                      Approved
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {request.status === "pending" && (
          <div className="space-y-4">
            <Button 
              onClick={handleApprove} 
              className="w-full h-16 text-base font-light tracking-[0.25em] uppercase bg-[#1A1A1A] hover:bg-[#8B7355] text-white shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-700 rounded-none"
            >
              <Check className="w-5 h-5 mr-3" strokeWidth={1} />
              Approve Design
            </Button>
            
            <Button 
              onClick={handleRequestModification} 
              variant="outline"
              className="w-full h-16 text-base font-light tracking-[0.25em] uppercase border-2 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white active:scale-[0.98] transition-all duration-700 rounded-none"
            >
              <MessageCircle className="w-5 h-5 mr-3" strokeWidth={1} />
              Request Changes
            </Button>
            
            <Button 
              onClick={() => router.push(`/tech/review/${request.id}`)}
              variant="outline"
              className="w-full h-16 text-base font-light tracking-[0.25em] uppercase border-2 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white active:scale-[0.98] transition-all duration-700 rounded-none"
            >
              <DollarSign className="w-5 h-5 mr-3" strokeWidth={1} />
              Suggest Add-ons
            </Button>
          </div>
        )}

        {request.status === "approved" && (
          <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-none">
            <CardContent className="p-10 sm:p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white border border-green-200 flex items-center justify-center rounded-none">
                <Check className="w-10 h-10 text-green-600" strokeWidth={1} />
              </div>
              <h3 className="font-serif text-3xl font-light text-[#1A1A1A] mb-4 tracking-[-0.01em]">
                Design Approved
              </h3>
              <p className="text-base text-[#6B6B6B] font-light tracking-wide">
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
