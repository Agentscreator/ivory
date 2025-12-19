"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Copy, Check, Share2, Download, Link2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

type NailLook = {
  id: string
  imageUrl: string
  title: string
  createdAt: string
}

export default function SharePage() {
  const router = useRouter()
  const params = useParams()
  const [look, setLook] = useState<NailLook | null>(null)
  const [copied, setCopied] = useState(false)
  const [shareLink, setShareLink] = useState("")

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

          // Generate share link
          const link = `${window.location.origin}/shared/${params.id}`
          setShareLink(link)
        }
      } catch (error) {
        console.error('Error loading look:', error)
      }
    }

    loadLook()
  }, [params.id])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      toast.error('Failed to copy link')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my nail design!',
          text: `I created this design on Ivory's Choice`,
          url: shareLink,
        })
        toast.success('Shared successfully!')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      }
    } else {
      // Fallback to copy link
      copyLink()
    }
  }

  const downloadImage = async () => {
    try {
      // Use API route to proxy the download and avoid CORS issues
      const response = await fetch(`/api/download-image?url=${encodeURIComponent(look?.imageUrl || '')}`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ivory-design-${params.id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded!')
    } catch (error) {
      console.error('Error downloading:', error)
      toast.error('Failed to download image')
    }
  }

  const shareVia = (platform: string) => {
    const text = `Check out my nail design on Ivory's Choice!`
    const urls = {
      instagram: `https://www.instagram.com/`, // Instagram doesn't support web sharing
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareLink)}`,
      email: `mailto:?subject=${encodeURIComponent('Check out my nail design!')}&body=${encodeURIComponent(text + '\n\n' + shareLink)}`,
    }
    
    if (platform === 'instagram') {
      toast.info('Instagram sharing', {
        description: 'Download the image and share it on Instagram!',
      })
      downloadImage()
    } else {
      window.open(urls[platform as keyof typeof urls], "_blank")
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-8 sm:pb-16">
        {/* Page Title */}
        <div className="mb-8 sm:mb-12 text-center">
          <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-3 sm:mb-4 font-light">Share Your Design</p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-tight">Spread the Inspiration</h1>
        </div>

        {/* Design Preview */}
        <div className="mb-8 sm:mb-12">
          <div className="aspect-square relative overflow-hidden border border-[#E8E8E8] bg-[#F8F7F5] shadow-sm max-w-md mx-auto">
            <Image 
              src={look.imageUrl || "/placeholder.svg"} 
              alt="Your design" 
              fill 
              className="object-cover" 
              priority
              sizes="(max-width: 640px) 100vw, 448px"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12 max-w-md mx-auto">
          <Button 
            onClick={handleNativeShare}
            className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 h-12 sm:h-14 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98] touch-manipulation"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={1.5} />
            Share
          </Button>
          <Button 
            onClick={downloadImage}
            className="bg-transparent border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 h-12 sm:h-14 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98] touch-manipulation"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" strokeWidth={1.5} />
            Download
          </Button>
        </div>

        {/* Share Link */}
        <div className="mb-8 sm:mb-12">
          <label className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-3 sm:mb-4 block font-light flex items-center gap-2">
            <Link2 className="w-4 h-4" strokeWidth={1.5} />
            Share Link
          </label>
          <div className="flex gap-2 sm:gap-3">
            <Input 
              value={shareLink} 
              readOnly 
              className="flex-1 h-12 sm:h-14 border-[#E8E8E8] rounded-none focus:border-[#8B7355] text-sm sm:text-base font-light bg-[#F8F7F5]"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button 
              onClick={copyLink}
              className="flex-shrink-0 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 h-12 sm:h-14 px-4 sm:px-6 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Social Sharing */}
        <div className="mb-8 sm:mb-12">
          <label className="text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] mb-4 sm:mb-6 block font-light">Share Via</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => shareVia("instagram")}
              className="border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-300 p-4 sm:p-5 flex flex-col items-center gap-3 active:scale-95 touch-manipulation group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <span className="text-[10px] sm:text-xs font-light tracking-wide text-[#1A1A1A]">Instagram</span>
            </button>

            <button
              onClick={() => shareVia("whatsapp")}
              className="border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-300 p-4 sm:p-5 flex flex-col items-center gap-3 active:scale-95 touch-manipulation group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span className="text-[10px] sm:text-xs font-light tracking-wide text-[#1A1A1A]">WhatsApp</span>
            </button>

            <button
              onClick={() => shareVia("facebook")}
              className="border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-300 p-4 sm:p-5 flex flex-col items-center gap-3 active:scale-95 touch-manipulation group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1877F2] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="text-[10px] sm:text-xs font-light tracking-wide text-[#1A1A1A]">Facebook</span>
            </button>

            <button
              onClick={() => shareVia("email")}
              className="border border-[#E8E8E8] hover:border-[#8B7355] transition-all duration-300 p-4 sm:p-5 flex flex-col items-center gap-3 active:scale-95 touch-manipulation group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1A1A1A] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <span className="text-[10px] sm:text-xs font-light tracking-wide text-[#1A1A1A]">Email</span>
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-[#F8F7F5] text-center">
          <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light tracking-wide">
            Share your design with friends, family, or your nail tech. They can view it and get inspired for their next appointment.
          </p>
        </div>
      </main>
    </div>
  )
}
