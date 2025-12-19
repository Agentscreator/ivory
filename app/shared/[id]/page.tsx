"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit2, Heart, Loader2, Sparkles, Download, Share2 } from "lucide-react"
import Image from "next/image"
import Head from "next/head"
import ContentModerationMenu from "@/components/content-moderation-menu"
import { toast } from "sonner"

type Look = {
  id: number
  title: string
  imageUrl: string
  originalImageUrl: string | null
  userId: number
  createdAt: string
  designMetadata?: any
  user?: {
    username: string
  }
}

export default function SharedDesignPage() {
  const router = useRouter()
  const params = useParams()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [look, setLook] = useState<Look | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    // Get current user ID
    const userStr = localStorage.getItem("ivoryUser")
    let userId: number | null = null
    if (userStr) {
      const user = JSON.parse(userStr)
      userId = user.id
      setCurrentUserId(user.id)
    }

    const fetchLook = async () => {
      try {
        const response = await fetch(`/api/looks/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setLook(data)
          
          // Check if user has liked this design
          if (userId) {
            const likeResponse = await fetch(`/api/looks/${params.id}/like?userId=${userId}`)
            if (likeResponse.ok) {
              const likeData = await likeResponse.json()
              setLiked(likeData.liked)
              setLikeCount(likeData.likeCount)
            }
          } else {
            // Just get the like count for non-logged-in users
            const likeResponse = await fetch(`/api/looks/${params.id}/like`)
            if (likeResponse.ok) {
              const likeData = await likeResponse.json()
              setLikeCount(likeData.likeCount)
            }
          }
        } else {
          setError('Design not found')
        }
      } catch (err) {
        console.error('Error fetching look:', err)
        setError('Failed to load design')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchLook()
    }
  }, [params.id])

  const handleEdit = () => {
    // Check if user is logged in
    const userStr = localStorage.getItem("ivoryUser")
    if (!userStr) {
      localStorage.setItem('returnUrl', window.location.pathname)
      toast.info('Sign in to edit this design')
      router.push("/auth")
      return
    }

    // Store the design in localStorage for editing with all metadata
    if (look) {
      localStorage.setItem("currentEditingImage", look.originalImageUrl || look.imageUrl)
      localStorage.setItem("generatedPreview", look.imageUrl)
      
      // Store all design metadata if available
      if (look.designMetadata) {
        localStorage.setItem("loadedDesignMetadata", JSON.stringify(look.designMetadata))
      }
      
      toast.success('Loading design for editing!')
    }
    router.push("/capture")
  }

  const handleRemix = () => {
    // Check if user is logged in
    const userStr = localStorage.getItem("ivoryUser")
    if (!userStr) {
      localStorage.setItem('returnUrl', window.location.pathname)
      toast.info('Sign in to remix this design')
      router.push("/auth")
      return
    }

    // Store the design for remixing - load it into the capture page with all settings
    if (look) {
      // Store both the original and generated images so they can remix it
      localStorage.setItem("currentEditingImage", look.originalImageUrl || look.imageUrl)
      localStorage.setItem("generatedPreview", look.imageUrl)
      localStorage.setItem("isRemix", "true") // Flag to indicate this is a remix
      
      // Store all design metadata if available
      if (look.designMetadata) {
        localStorage.setItem("loadedDesignMetadata", JSON.stringify(look.designMetadata))
      }
      
      toast.success('Loading design for remix!')
    }
    router.push("/capture")
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(look?.imageUrl || '')
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: look?.title || 'Check out this nail design!',
        text: `Check out this design on Ivory's Choice`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleLike = async () => {
    if (!currentUserId) {
      localStorage.setItem('returnUrl', window.location.pathname)
      toast.info('Sign in to like this design')
      router.push("/auth")
      return
    }

    try {
      if (liked) {
        // Unlike
        const response = await fetch(`/api/looks/${params.id}/like?userId=${currentUserId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          const data = await response.json()
          setLiked(false)
          setLikeCount(data.likeCount)
        }
      } else {
        // Like
        const response = await fetch(`/api/looks/${params.id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId }),
        })
        if (response.ok) {
          const data = await response.json()
          setLiked(true)
          setLikeCount(data.likeCount)
          toast.success('Liked!')
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#8B7355]" strokeWidth={1.5} />
          <p className="text-[#6B6B6B] font-light tracking-wide">Loading design...</p>
        </div>
      </div>
    )
  }

  if (error || !look) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md border border-[#E8E8E8] p-8 sm:p-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-3 sm:mb-4 tracking-tight">Design Not Found</h2>
          <p className="text-base sm:text-lg text-[#6B6B6B] font-light mb-6 sm:mb-8 leading-relaxed tracking-wide">
            {error || 'This design may have been removed or is no longer available.'}
          </p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 h-12 sm:h-14 px-8 text-[11px] tracking-[0.25em] uppercase rounded-none font-light"
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        {/* Deep linking meta tags for mobile app */}
        <meta name="apple-itunes-app" content={`app-id=YOUR_APP_ID, app-argument=ivoryschoice://shared/${params.id}`} />
        <meta name="al:ios:url" content={`ivoryschoice://shared/${params.id}`} />
        <meta name="al:ios:app_store_id" content="YOUR_APP_ID" />
        <meta name="al:ios:app_name" content="Ivory's Choice" />
        <meta name="al:android:url" content={`ivoryschoice://shared/${params.id}`} />
        <meta name="al:android:package" content="com.ivoryschoice.app" />
        <meta name="al:android:app_name" content="Ivory's Choice" />
      </Head>
      <div className="min-h-screen bg-white pb-safe">
        {/* Header */}
        <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 pt-safe">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
            <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">IVORY'S CHOICE</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-[#6B6B6B] hover:text-[#8B7355] transition-colors duration-300 active:scale-95"
              >
                <Share2 className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-[#6B6B6B] hover:text-[#8B7355] transition-colors duration-300 active:scale-95"
              >
                <Download className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-8 sm:pb-16">
          {/* Design Preview */}
          <div className="mb-6 sm:mb-8">
            <div className="aspect-square relative overflow-hidden border border-[#E8E8E8] bg-[#F8F7F5] shadow-sm max-w-md mx-auto">
              <Image 
                src={look.imageUrl} 
                alt={look.title} 
                fill 
                className="object-cover" 
                priority
                sizes="(max-width: 640px) 100vw, 448px"
              />
            </div>
          </div>

          {/* Design Info */}
          <div className="mb-8 sm:mb-10 text-center max-w-md mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 transition-all duration-300 active:scale-95 ${
                  liked ? "text-red-500" : "text-[#6B6B6B] hover:text-red-500"
                }`}
              >
                <Heart className={`w-6 h-6 sm:w-7 sm:h-7 ${liked ? "fill-current" : ""}`} strokeWidth={1.5} />
                {likeCount > 0 && (
                  <span className="text-sm sm:text-base font-light">{likeCount}</span>
                )}
              </button>
              {currentUserId && look.userId !== currentUserId && (
                <ContentModerationMenu
                  currentUserId={currentUserId}
                  contentType="look"
                  contentId={look.id}
                  contentOwnerId={look.userId}
                  contentOwnerUsername={look.user?.username || `User ${look.userId}`}
                  showBlockOption={true}
                />
              )}
            </div>
            <p className="text-sm sm:text-base text-[#6B6B6B] font-light tracking-wide mb-1">
              {look.user?.username ? `Shared by @${look.user.username}` : 'Shared design'}
            </p>
            <p className="text-xs sm:text-sm text-[#6B6B6B]/70 font-light tracking-wide">
              {new Date(look.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 sm:space-y-4 max-w-md mx-auto mb-8 sm:mb-10">
            <Button 
              onClick={handleRemix}
              className="w-full bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 h-12 sm:h-14 lg:h-16 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98] touch-manipulation"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1.5} />
              Remix This Design
            </Button>

            <Button 
              onClick={handleEdit}
              className="w-full bg-transparent border-2 border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 h-12 sm:h-14 lg:h-16 text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98] touch-manipulation"
            >
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" strokeWidth={1.5} />
              Edit This Design
            </Button>
          </div>

          {/* Sign Up CTA */}
          {!currentUserId && (
            <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-[#F8F7F5] text-center max-w-md mx-auto">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 sm:mb-5 border border-[#E8E8E8] flex items-center justify-center bg-white">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#8B7355]" strokeWidth={1} />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-light text-[#1A1A1A] mb-2 sm:mb-3 tracking-tight">
                Create Your Own Designs
              </h3>
              <p className="text-sm sm:text-base text-[#6B6B6B] leading-relaxed font-light tracking-wide mb-5 sm:mb-6">
                Sign up free to save, customize, and create your own nail designs
              </p>
              <Button 
                onClick={() => {
                  localStorage.setItem('returnUrl', window.location.pathname)
                  router.push("/auth?signup=true")
                }}
                className="w-full bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-500 h-12 sm:h-14 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase rounded-none font-light active:scale-[0.98]"
              >
                Sign Up Free
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
