"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Pencil } from "lucide-react"
import Image from "next/image"

export default function TechReviewPage() {
  const router = useRouter()
  const params = useParams()
  const [notes, setNotes] = useState("")
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      if (context) {
        context.strokeStyle = "#FF6B9D"
        context.lineWidth = 3
        context.lineCap = "round"
        setCtx(context)
      }
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx) return
    setIsDrawing(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      ctx.beginPath()
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    if (ctx) ctx.closePath()
    setIsDrawing(false)
  }

  const clearNotes = () => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const handleSend = () => {
    // In real app, send feedback to client
    router.push("/tech/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-xl font-bold text-charcoal">Review Design</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="overflow-hidden border-0 bg-white shadow-xl mb-6 relative">
          <div className="aspect-square relative">
            <Image
              src="/elegant-french-manicure-nails.jpg"
              alt="Client design"
              fill
              className="object-cover pointer-events-none"
            />
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="sm" variant="secondary">
              <Pencil className="w-4 h-4 mr-2" />
              Draw Notes
            </Button>
            <Button size="sm" variant="secondary" onClick={clearNotes}>
              Clear
            </Button>
          </div>
        </Card>

        {/* Feedback */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-charcoal mb-2 block">Feedback for Client</label>
          <Textarea
            placeholder="Suggest modifications or approve the design as-is..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        {/* Offer Add-ons */}
        <Card className="p-4 mb-6 bg-muted/30">
          <h3 className="font-semibold text-charcoal mb-3">Offer Add-ons</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Glitter accent (+$10)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Rhinestone charms (+$15)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Gel extension (+$25)</span>
            </label>
          </div>
        </Card>

        <Button size="lg" className="w-full" onClick={handleSend}>
          <Send className="w-5 h-5 mr-2" />
          Send Feedback
        </Button>
      </main>
    </div>
  )
}
