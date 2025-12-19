"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Search, Loader2, UserPlus, Mail } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

type NailTech = {
  id: string
  name: string
  avatar: string
  location: string
  rating: number
}

export default function SendToTechPage() {
  const router = useRouter()
  const params = useParams()
  const [lookImage, setLookImage] = useState<string>("")
  const [techs, setTechs] = useState<NailTech[]>([])
  const [searchTech, setSearchTech] = useState("")
  const [selectedTech, setSelectedTech] = useState<NailTech | null>(null)
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load the look
        const lookResponse = await fetch(`/api/looks/${params.id}`)
        if (lookResponse.ok) {
          const look = await lookResponse.json()
          setLookImage(look.imageUrl)
        } else {
          toast.error('Failed to load design')
        }

        // Load available nail techs
        const techsResponse = await fetch('/api/tech-profiles')
        if (techsResponse.ok) {
          const data = await techsResponse.json()
          console.log('Tech profiles loaded:', data)
          const formattedTechs = data.map((tech: any) => ({
            id: tech.userId.toString(),
            name: tech.username || tech.businessName || 'Nail Tech',
            avatar: tech.avatar || '/placeholder-user.jpg',
            location: tech.location || 'Location not set',
            rating: parseFloat(tech.rating) || 0,
          }))
          setTechs(formattedTechs)
          
          if (formattedTechs.length === 0) {
            toast.info('No nail techs available yet', {
              description: 'Invite your nail tech to join Ivory!',
            })
          }
        } else {
          toast.error('Failed to load nail techs')
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('An error occurred while loading')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  const handleSend = async () => {
    if (!selectedTech) return

    try {
      setSending(true)
      const userStr = localStorage.getItem("ivoryUser")
      if (!userStr) {
        router.push("/")
        return
      }

      const user = JSON.parse(userStr)

      const response = await fetch('/api/design-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lookId: params.id,
          clientId: user.id,
          techId: selectedTech.id,
          clientMessage: message,
        }),
      })

      if (response.ok) {
        toast.success('Design sent successfully! 🎉', {
          description: `${selectedTech.name} will review your design soon`,
        })
        setSent(true)
        setTimeout(() => router.push("/home"), 2000)
      } else {
        const error = await response.json()
        toast.error('Failed to send design request', {
          description: error.error || 'Please try again',
        })
      }
    } catch (error) {
      console.error('Error sending request:', error)
      toast.error('An error occurred', {
        description: 'Please check your connection and try again',
      })
    } finally {
      setSending(false)
    }
  }

  const handleInviteTech = () => {
    const subject = encodeURIComponent("Join me on Ivory's Choice!")
    const body = encodeURIComponent(
      `Hi!\n\nI'd love for you to join Ivory's Choice - it's a platform where I can design my nails and send them directly to you.\n\nSign up here: ${window.location.origin}/auth?signup=true&type=tech\n\nLooking forward to working with you!\n\nBest,\n${JSON.parse(localStorage.getItem("ivoryUser") || "{}").username || "Your Client"}`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 pb-safe">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 border border-[#E8E8E8] flex items-center justify-center bg-[#F8F7F5]">
            <Send className="w-10 h-10 sm:w-12 sm:h-12 text-[#8B7355]" strokeWidth={1} />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A] mb-3 sm:mb-4 tracking-tight">Design Sent</h2>
          <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-relaxed tracking-wide">
            {selectedTech?.name} will review your design and get back to you soon
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-safe">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 pt-safe">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-5">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 sm:gap-3 text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 group active:scale-95 min-h-[44px] -ml-2 pl-2 pr-4"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform duration-500" strokeWidth={1} />
            <span className="text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase font-light">Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-8 sm:pb-16">
        {/* Page Title */}
        <div className="mb-8 sm:mb-12 text-center">
          <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3 sm:mb-4 font-light">Share Your Design</p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-tight">Send to Nail Tech</h1>
        </div>

        {/* Design Preview */}
        <div className="mb-8 sm:mb-12">
          <div className="aspect-square relative overflow-hidden border border-[#E8E8E8] bg-[#F8F7F5] shadow-sm max-w-md mx-auto">
            <Image 
              src={lookImage || "/placeholder.svg"} 
              alt="Your design" 
              fill 
              className="object-cover" 
              priority
              sizes="(max-width: 640px) 100vw, 448px"
            />
          </div>
        </div>

        {/* Search Nail Tech */}
        <div className="mb-6 sm:mb-8">
          <label className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 block font-light">Find Your Nail Tech</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" strokeWidth={1.5} />
            <Input
              placeholder="Search by name..."
              value={searchTech}
              onChange={(e) => setSearchTech(e.target.value)}
              className="pl-12 h-12 sm:h-14 border-[#E8E8E8] rounded-none focus:border-[#8B7355] text-base font-light"
            />
          </div>
        </div>

        {/* Nail Tech List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" strokeWidth={1.5} />
          </div>
        ) : techs.length === 0 ? (
          <div className="text-center py-12 sm:py-16 border border-[#E8E8E8] mb-6 sm:mb-8">
            <UserPlus className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 text-[#8B7355]" strokeWidth={1} />
            <p className="text-base sm:text-lg text-[#6B6B6B] font-light mb-6 sm:mb-8 tracking-wide">
              No nail techs available yet
            </p>
            <Button 
              onClick={handleInviteTech}
              className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 h-12 sm:h-14 px-8 sm:px-10 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98]"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1.5} />
              Invite Nail Tech
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {techs
              .filter((tech) => tech.name.toLowerCase().includes(searchTech.toLowerCase()))
              .map((tech) => (
              <div
                key={tech.id}
                className={`border cursor-pointer transition-all duration-300 p-4 sm:p-5 active:scale-[0.99] ${
                  selectedTech?.id === tech.id
                    ? "border-[#8B7355] bg-[#F8F7F5]"
                    : "border-[#E8E8E8] hover:border-[#8B7355]"
                }`}
                onClick={() => setSelectedTech(tech)}
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-[#F8F7F5] flex-shrink-0 border border-[#E8E8E8]">
                    <Image src={tech.avatar || "/placeholder.svg"} alt={tech.name} width={64} height={64} className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base sm:text-lg text-[#1A1A1A] font-light mb-1 truncate">{tech.name}</h3>
                    <p className="text-xs sm:text-sm text-[#6B6B6B] font-light tracking-wide truncate">{tech.location}</p>
                    {tech.rating > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[#8B7355]">★</span>
                        <span className="text-xs sm:text-sm font-light text-[#1A1A1A]">{tech.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {techs.filter((tech) => tech.name.toLowerCase().includes(searchTech.toLowerCase())).length === 0 && (
              <div className="text-center py-12 sm:py-16 border border-[#E8E8E8]">
                <p className="text-base sm:text-lg text-[#6B6B6B] font-light tracking-wide">
                  No nail techs found matching "{searchTech}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {selectedTech && (
          <div className="mb-6 sm:mb-8">
            <label className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 block font-light">Add a Message (Optional)</label>
            <Textarea
              placeholder="Let your nail tech know any special requests or details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="border-[#E8E8E8] rounded-none focus:border-[#8B7355] text-base font-light resize-none"
            />
          </div>
        )}

        {/* Send Button */}
        <Button 
          className="w-full bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 h-12 sm:h-14 lg:h-16 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed mb-6 sm:mb-8"
          disabled={!selectedTech || sending || loading} 
          onClick={handleSend}
        >
          {sending ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 animate-spin" strokeWidth={1.5} />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1.5} />
              {selectedTech ? `Send to ${selectedTech.name}` : "Select a Nail Tech"}
            </>
          )}
        </Button>

        {/* Invite Section */}
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-[#F8F7F5]">
          <div className="flex items-start gap-4 sm:gap-6 mb-5 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 border border-[#E8E8E8] flex items-center justify-center flex-shrink-0 bg-white">
              <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-[#8B7355]" strokeWidth={1} />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg sm:text-xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                Tech Not on Ivory?
              </h3>
              <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light tracking-wide">
                Send them an invite! When they join, they can see your design and connect with you.
              </p>
            </div>
          </div>
          <Button 
            onClick={handleInviteTech}
            className="w-full sm:w-auto bg-transparent border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 h-12 sm:h-14 px-8 sm:px-10 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98]"
          >
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1.5} />
            Invite Nail Tech
          </Button>
        </div>
      </main>
    </div>
  )
}
