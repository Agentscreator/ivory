"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share2, Trash2, Send } from "lucide-react"
import Image from "next/image"
import { BottomNav } from "@/components/bottom-nav"

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
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadLook = async () => {
      setIsLoading(true)
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
      } finally {
        setIsLoading(false)
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

  return (
    <div className="min-h-screen bg-white pb-safe">
      {/* Header */}
      <header className={`bg-white border-b border-[#E8E8E8] sticky top-0 z-10 pt-safe backdrop-blur-sm bg-white/95 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 lg:py-16 pb-28 sm:pb-32">
        {/* Image Container */}
        <div className={`mb-8 sm:mb-14 lg:mb-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="aspect-square relative overflow-hidden border border-[#E8E8E8] bg-[#F8F7F5] shadow-sm">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355]"></div>
                  </div>
                  <p className="text-[#6B6B6B] font-light text-sm animate-pulse">Loading your design...</p>
                </div>
              </div>
            ) : look ? (
              <Image 
                src={look.imageUrl || "/placeholder.svg"} 
                alt="Your Design" 
                fill 
                className="object-cover animate-in fade-in duration-700" 
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 896px"
              />
            ) : null}
          </div>
        </div>

        {/* Action Buttons - Always visible */}
        <div className={`space-y-3 sm:space-y-4 max-w-2xl mx-auto px-2 sm:px-0 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Button 
            onClick={handleSendToTech}
            disabled={isLoading}
            className="w-full bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 ease-out h-12 sm:h-14 lg:h-16 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1.5} />
            Send to Nail Tech
          </Button>

          <Button 
            onClick={handleShare}
            disabled={isLoading}
            className="w-full bg-transparent border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 ease-out h-12 sm:h-14 lg:h-16 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1.5} />
            Share with Friends
          </Button>

          <Button 
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full bg-transparent border border-[#E8E8E8] text-[#6B6B6B] hover:border-red-500 hover:text-red-500 transition-all duration-500 ease-out h-12 sm:h-14 lg:h-16 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:-translate-y-0.5"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1.5} />
            Delete Design
          </Button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
