"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit2, Heart, Loader2 } from "lucide-react"
import Image from "next/image"
import Head from "next/head"
import ContentModerationMenu from "@/components/content-moderation-menu"

type Look = {
  id: number
  title: string
  imageUrl: string
  originalImageUrl: string | null
  userId: number
  createdAt: string
  user?: {
    username: string
  }
}

export default function SharedDesignPage() {
  const router = useRouter()
  const params = useParams()
  const [liked, setLiked] = useState(false)
  const [look, setLook] = useState<Look | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    // Get current user ID
    const userStr = localStorage.getItem("ivoryUser")
    if (userStr) {
      const user = JSON.parse(userStr)
      setCurrentUserId(user.id)
    }

    const fetchLook = async () => {
      try {
        const response = await fetch(`/api/looks/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setLook(data)
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
    // Store the design in localStorage for editing
    if (look) {
      localStorage.setItem("currentEditingImage", look.originalImageUrl || look.imageUrl)
      localStorage.setItem("generatedPreview", look.imageUrl)
    }
    router.push("/editor")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading design...</p>
        </div>
      </div>
    )
  }

  if (error || !look) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4">
          <h2 className="text-xl font-bold text-charcoal mb-2">Design Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'This design may have been removed or is no longer available.'}</p>
          <Button onClick={() => router.push('/')}>Go to Home</Button>
        </Card>
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
            <Image 
              src={look.imageUrl} 
              alt={look.title} 
              fill 
              className="object-cover" 
              unoptimized
            />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="font-serif text-2xl font-bold text-charcoal mb-1">{look.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {look.user?.username ? `Shared by @${look.user.username}` : 'Shared design'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(look.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={liked ? "text-red-500" : "text-muted-foreground"}
                  onClick={() => setLiked(!liked)}
                >
                  <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
                </Button>
                {currentUserId ? (
                  look.userId !== currentUserId && (
                    <ContentModerationMenu
                      currentUserId={currentUserId}
                      contentType="look"
                      contentId={look.id}
                      contentOwnerId={look.userId}
                      contentOwnerUsername={look.user?.username || `User ${look.userId}`}
                      showBlockOption={true}
                    />
                  )
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      localStorage.setItem('returnUrl', window.location.pathname)
                      router.push("/auth")
                    }}
                  >
                    Sign in to report
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Button size="lg" className="w-full" onClick={handleEdit}>
            <Edit2 className="w-5 h-5 mr-2" />
            Edit This Design
          </Button>

          {!currentUserId && (
            <Card className="p-4 bg-muted/30">
              <p className="text-sm text-center text-muted-foreground">
                Create your own Ivory account to save and customize this design
              </p>
              <Button 
                variant="outline" 
                className="w-full mt-3 bg-white" 
                onClick={() => {
                  // Store the current URL to return after login
                  localStorage.setItem('returnUrl', window.location.pathname)
                  router.push("/auth")
                }}
              >
                Sign Up Free
              </Button>
            </Card>
          )}
        </div>
      </main>
      </div>
    </>
  )
}
