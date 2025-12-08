"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Home, Sparkles, User } from "lucide-react"
import Image from "next/image"

type NailLook = {
  id: string
  imageUrl: string
  title: string
  createdAt: string
}

export default function HomePage() {
  const router = useRouter()
  const [looks, setLooks] = useState<NailLook[]>([])

  useEffect(() => {
    // Load saved looks from localStorage
    const savedLooks = localStorage.getItem("ivoryLooks")
    if (savedLooks) {
      setLooks(JSON.parse(savedLooks))
    } else {
      // Mock initial looks
      setLooks([
        {
          id: "1",
          imageUrl: "/elegant-french-manicure-nails.jpg",
          title: "French Classic",
          createdAt: "2024-01-15",
        },
        {
          id: "2",
          imageUrl: "/pink-ombre-nail-design.jpg",
          title: "Pink Ombre",
          createdAt: "2024-01-10",
        },
        {
          id: "3",
          imageUrl: "/glitter-accent-nails.jpg",
          title: "Glitter Party",
          createdAt: "2024-01-05",
        },
      ])
    }
  }, [])

  const startNewDesign = () => {
    router.push("/capture")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <h1 className="font-serif text-2xl font-bold text-charcoal">Ivory</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 py-8 pb-24">
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-charcoal mb-2">Your Looks</h2>
          <p className="text-muted-foreground">Your personal nail design collection</p>
        </div>

        {/* Gallery Grid */}
        {looks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {looks.map((look) => (
              <Card
                key={look.id}
                className="overflow-hidden cursor-pointer hover:shadow-xl transition-all border-0 bg-white"
                onClick={() => router.push(`/look/${look.id}`)}
              >
                <div className="aspect-square relative">
                  <Image src={look.imageUrl || "/placeholder.svg"} alt={look.title} fill className="object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-charcoal mb-1">{look.title}</h3>
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
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">No designs yet</h3>
            <p className="text-muted-foreground mb-6">Start creating your first nail design</p>
          </div>
        )}

        {/* Create Button - Large */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="h-14 px-8 text-lg shadow-xl hover:shadow-2xl transition-all"
            onClick={startNewDesign}
          >
            <Plus className="w-6 h-6 mr-2" />
            Start New Design
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-around h-20">
            <button
              onClick={() => router.push("/home")}
              className="flex flex-col items-center justify-center gap-1 text-primary"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={startNewDesign}
              className="flex flex-col items-center justify-center -mt-6 bg-gradient-to-br from-terracotta to-rose text-white rounded-full w-16 h-16 shadow-xl"
            >
              <Plus className="w-8 h-8" />
            </button>

            <button
              onClick={() => router.push("/profile")}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}
