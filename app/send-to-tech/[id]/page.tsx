"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Search, Loader2 } from "lucide-react"
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

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center">
            <Send className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">Design Sent!</h2>
          <p className="text-muted-foreground">{selectedTech?.name} will review your design and get back to you soon</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-xl font-bold text-charcoal">Send to Nail Tech</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Design Preview */}
        <Card className="overflow-hidden border-0 bg-white shadow-xl mb-6">
          <div className="aspect-video relative">
            <Image src={lookImage || "/placeholder.svg"} alt="Your design" fill className="object-cover" />
          </div>
        </Card>

        {/* Search Nail Tech */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-charcoal mb-2 block">Find Your Nail Tech</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTech}
              onChange={(e) => setSearchTech(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Nail Tech List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : techs.length === 0 ? (
          <Card className="p-8 text-center mb-6">
            <p className="text-muted-foreground mb-4">
              No nail techs available yet. Be the first to invite one!
            </p>
          </Card>
        ) : (
          <div className="space-y-3 mb-6">
            {techs
              .filter((tech) => tech.name.toLowerCase().includes(searchTech.toLowerCase()))
              .map((tech) => (
              <Card
                key={tech.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedTech?.id === tech.id
                    ? "border-primary border-2 bg-primary/5"
                    : "border hover:border-primary/50"
                }`}
                onClick={() => setSelectedTech(tech)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <Image src={tech.avatar || "/placeholder.svg"} alt={tech.name} width={64} height={64} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-charcoal">{tech.name}</h3>
                    <p className="text-sm text-muted-foreground">{tech.location}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-medium">{tech.rating}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {techs.filter((tech) => tech.name.toLowerCase().includes(searchTech.toLowerCase())).length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No nail techs found matching "{searchTech}"
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Message */}
        {selectedTech && (
          <div className="mb-6">
            <label className="text-sm font-semibold text-charcoal mb-2 block">Add a Message (Optional)</label>
            <Textarea
              placeholder="Let your nail tech know any special requests or details..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        )}

        {/* Send Button */}
        <Button 
          size="lg" 
          className="w-full" 
          disabled={!selectedTech || sending || loading} 
          onClick={handleSend}
        >
          {sending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send Design to {selectedTech?.name || "Nail Tech"}
            </>
          )}
        </Button>

        {/* No Tech on Ivory */}
        <Card className="mt-6 p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground mb-2">
            <strong>Tech not on Ivory?</strong>
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            Send them an invite! When they join, they can claim their profile and see your design.
          </p>
          <Button variant="outline" size="sm" className="bg-white">
            Invite Nail Tech
          </Button>
        </Card>
      </main>
    </div>
  )
}
