"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit2, Heart } from "lucide-react"
import Image from "next/image"

export default function SharedDesignPage() {
  const router = useRouter()
  const params = useParams()
  const [liked, setLiked] = useState(false)

  const handleEdit = () => {
    // In a real app, this would fork the design for the current user
    router.push("/editor")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-4">
          <h1 className="font-serif text-xl font-bold text-charcoal">Ivory</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="overflow-hidden border-0 bg-white shadow-xl mb-6">
          <div className="aspect-square relative">
            <Image src="/elegant-french-manicure-nails.jpg" alt="Shared nail design" fill className="object-cover" />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="font-serif text-2xl font-bold text-charcoal mb-1">French Classic</h2>
                <p className="text-sm text-muted-foreground">Shared by @username</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className={liked ? "text-red-500" : "text-muted-foreground"}
                onClick={() => setLiked(!liked)}
              >
                <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Button size="lg" className="w-full" onClick={handleEdit}>
            <Edit2 className="w-5 h-5 mr-2" />
            Edit This Design
          </Button>

          <Card className="p-4 bg-muted/30">
            <p className="text-sm text-center text-muted-foreground">
              Create your own Ivory account to save and customize this design
            </p>
            <Button variant="outline" className="w-full mt-3 bg-white" onClick={() => router.push("/")}>
              Sign Up Free
            </Button>
          </Card>
        </div>
      </main>
    </div>
  )
}
