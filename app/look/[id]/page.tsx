"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Share2, Trash2, Send } from "lucide-react"
import Image from "next/image"

type NailLook = {
  id: string
  imageUrl: string
  title: string
  createdAt: string
}

export default function LookDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [look, setLook] = useState<NailLook | null>(null)

  useEffect(() => {
    // Load the specific look
    const savedLooks = localStorage.getItem("ivoryLooks")
    if (savedLooks) {
      const looks = JSON.parse(savedLooks)
      const foundLook = looks.find((l: NailLook) => l.id === params.id)
      setLook(foundLook || null)
    }
  }, [params.id])

  const handleShare = () => {
    router.push(`/share/${params.id}`)
  }

  const handleSendToTech = () => {
    router.push(`/send-to-tech/${params.id}`)
  }

  const handleDelete = () => {
    const savedLooks = localStorage.getItem("ivoryLooks")
    if (savedLooks) {
      const looks = JSON.parse(savedLooks)
      const updatedLooks = looks.filter((l: NailLook) => l.id !== params.id)
      localStorage.setItem("ivoryLooks", JSON.stringify(updatedLooks))
    }
    router.push("/home")
  }

  if (!look) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
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
          <h1 className="font-serif text-xl font-bold text-charcoal">{look.title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="overflow-hidden border-0 bg-white shadow-xl mb-6">
          <div className="aspect-square relative">
            <Image src={look.imageUrl || "/placeholder.svg"} alt={look.title} fill className="object-cover" />
          </div>
        </Card>

        <div className="space-y-3">
          <Button size="lg" className="w-full" onClick={handleSendToTech}>
            <Send className="w-5 h-5 mr-2" />
            Send to Nail Tech
          </Button>

          <Button size="lg" variant="outline" className="w-full bg-transparent" onClick={handleShare}>
            <Share2 className="w-5 h-5 mr-2" />
            Share with Friends
          </Button>

          <Button size="lg" variant="outline" className="w-full bg-transparent text-destructive" onClick={handleDelete}>
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Design
          </Button>
        </div>

        <div className="mt-8 p-4 bg-white/60 backdrop-blur-sm rounded-lg">
          <p className="text-sm text-muted-foreground">
            Created on{" "}
            {new Date(look.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </main>
    </div>
  )
}
