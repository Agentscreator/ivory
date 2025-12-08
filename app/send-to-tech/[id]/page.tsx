"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Search } from "lucide-react"
import Image from "next/image"

type NailTech = {
  id: string
  name: string
  avatar: string
  location: string
  rating: number
}

const mockTechs: NailTech[] = [
  { id: "1", name: "Sarah Chen", avatar: "/nail-tech-avatar-1.jpg", location: "Downtown Salon", rating: 4.9 },
  { id: "2", name: "Maria Rodriguez", avatar: "/nail-tech-avatar-2.jpg", location: "Beauty Studio", rating: 4.8 },
  { id: "3", name: "Jessica Park", avatar: "/nail-tech-avatar-3.jpg", location: "Luxury Nails", rating: 5.0 },
]

export default function SendToTechPage() {
  const router = useRouter()
  const params = useParams()
  const [lookImage, setLookImage] = useState<string>("")
  const [searchTech, setSearchTech] = useState("")
  const [selectedTech, setSelectedTech] = useState<NailTech | null>(null)
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const savedLooks = localStorage.getItem("ivoryLooks")
    if (savedLooks) {
      const looks = JSON.parse(savedLooks)
      const look = looks.find((l: { id: string }) => l.id === params.id)
      if (look) setLookImage(look.imageUrl)
    }
  }, [params.id])

  const handleSend = () => {
    if (selectedTech) {
      // In real app, this would send via API
      setSent(true)
      setTimeout(() => router.push("/home"), 2000)
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
        <div className="space-y-3 mb-6">
          {mockTechs
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
        </div>

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
        <Button size="lg" className="w-full" disabled={!selectedTech} onClick={handleSend}>
          <Send className="w-5 h-5 mr-2" />
          Send Design to {selectedTech?.name || "Nail Tech"}
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
