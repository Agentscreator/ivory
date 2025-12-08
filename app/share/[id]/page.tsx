"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Copy, Check, Edit2 } from "lucide-react"
import Image from "next/image"

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
    // Load the specific look
    const savedLooks = localStorage.getItem("ivoryLooks")
    if (savedLooks) {
      const looks = JSON.parse(savedLooks)
      const foundLook = looks.find((l: NailLook) => l.id === params.id)
      setLook(foundLook || null)

      // Generate share link
      if (foundLook) {
        const link = `${window.location.origin}/shared/${params.id}`
        setShareLink(link)
      }
    }
  }, [params.id])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const shareVia = (platform: string) => {
    const text = `Check out my nail design on Ivory!`
    const urls = {
      instagram: `https://www.instagram.com/`, // In real app would use Instagram sharing
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
    }
    window.open(urls[platform as keyof typeof urls], "_blank")
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
          <h1 className="font-serif text-xl font-bold text-charcoal">Share Design</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="overflow-hidden border-0 bg-white shadow-xl mb-6">
          <div className="aspect-square relative">
            <Image src={look.imageUrl || "/placeholder.svg"} alt={look.title} fill className="object-cover" />
          </div>
          <div className="p-4">
            <h2 className="font-serif text-2xl font-bold text-charcoal mb-1">{look.title}</h2>
            <p className="text-sm text-muted-foreground">Share this design with your friends</p>
          </div>
        </Card>

        {/* Share Link */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-charcoal mb-2 block">Share Link</label>
          <div className="flex gap-2">
            <Input value={shareLink} readOnly className="flex-1" />
            <Button onClick={copyLink} className="flex-shrink-0">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Social Sharing */}
        <div className="mb-8">
          <label className="text-sm font-semibold text-charcoal mb-3 block">Share via</label>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 bg-transparent"
              onClick={() => shareVia("instagram")}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Instagram</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 bg-transparent"
              onClick={() => shareVia("twitter")}
            >
              <div className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Twitter</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 bg-transparent"
              onClick={() => shareVia("facebook")}
            >
              <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="text-xs font-medium">Facebook</span>
            </Button>
          </div>
        </div>

        {/* Collaborative Editing */}
        <Card className="p-6 bg-gradient-to-br from-terracotta/10 to-rose/10 border-terracotta/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center flex-shrink-0">
              <Edit2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg font-bold text-charcoal mb-2">Collaborative Editing</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Anyone with this link can view and edit your design. Perfect for getting feedback from friends!
              </p>
              <Button size="sm" variant="outline" className="bg-white">
                Enable Editing
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
