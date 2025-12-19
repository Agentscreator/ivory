"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
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
    const loadLook = async () => {
      try {
        const response = await fetch(`/api/looks/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setLook({
            id: data.id.toString(),
            imageUrl: data.imageUrl,
            title: data.title,
            createdAt: data.createdAt,
          })
        }
      } catch (error) {
        console.error('Error loading look:', error)
      }
    }

    loadLook()
  }, [params.id])

  const handleShare = () => {
    router.push(`/share/${params.id}`)
  }

  const handleSendToTech = () => {
    router.push(`/send-to-tech/${params.id}`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this design?')) return

    try {
      const response = await fetch(`/api/looks/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push("/home")
      } else {
        alert('Failed to delete design')
      }
    } catch (error) {
      console.error('Error deleting look:', error)
      alert('An error occurred')
    }
  }

  if (!look) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[#6B6B6B] font-light tracking-wide">Loading...</p>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 lg:py-16 pb-8 sm:pb-12">
        {/* Image Container */}
        <div className="mb-8 sm:mb-14 lg:mb-16">
          <div className="aspect-square relative overflow-hidden border border-[#E8E8E8] bg-[#F8F7F5] shadow-sm">
            <Image 
              src={look.imageUrl || "/placeholder.svg"} 
              alt="Your Design" 
              fill 
              className="object-cover" 
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 896px"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto px-2 sm:px-0">
          <Button 
            onClick={handleSendToTech}
            className="w-full bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 ease-out h-12 sm:h-14 lg:h-16 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98] touch-manipulation"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1.5} />
            Send to Nail Tech
          </Button>

          <Button 
            onClick={handleShare}
            className="w-full bg-transparent border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 ease-out h-12 sm:h-14 lg:h-16 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98] touch-manipulation"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1.5} />
            Share with Friends
          </Button>

          <Button 
            onClick={handleDelete}
            className="w-full bg-transparent border border-[#E8E8E8] text-[#6B6B6B] hover:border-red-500 hover:text-red-500 transition-all duration-500 ease-out h-12 sm:h-14 lg:h-16 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98] touch-manipulation"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1.5} />
            Delete Design
          </Button>
        </div>
      </main>
    </div>
  )
}
