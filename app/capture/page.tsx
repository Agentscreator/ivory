"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Camera, Upload } from "lucide-react"
import Image from "next/image"

export default function CapturePage() {
  const router = useRouter()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      setIsCapturing(true)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsCapturing(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg")
        setCapturedImage(imageData)
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream
        stream?.getTracks().forEach((track) => track.stop())
        setIsCapturing(false)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const proceedToEditor = () => {
    if (capturedImage) {
      localStorage.setItem("currentEditingImage", capturedImage)
      router.push("/editor")
    }
  }

  const retake = () => {
    setCapturedImage(null)
    setIsCapturing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-serif text-xl font-bold text-charcoal">Take a Photo</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-center text-muted-foreground">
            Take a photo of your hands or upload an existing image to start designing
          </p>
        </div>

        {/* Camera/Image Preview */}
        <Card className="overflow-hidden border-0 bg-white shadow-xl mb-6">
          <div className="aspect-[3/4] relative bg-muted flex items-center justify-center">
            {capturedImage ? (
              <Image src={capturedImage || "/placeholder.svg"} alt="Captured hand" fill className="object-cover" />
            ) : isCapturing ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                onLoadedMetadata={() => videoRef.current?.play()}
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center">
                  <Camera className="w-12 h-12 text-white" />
                </div>
                <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Ready to capture</h3>
                <p className="text-sm text-muted-foreground">Take a photo of your hands to begin</p>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {capturedImage ? (
            <>
              <Button size="lg" className="w-full" onClick={proceedToEditor}>
                Continue to Editor
              </Button>
              <Button size="lg" variant="outline" className="w-full bg-transparent" onClick={retake}>
                Retake Photo
              </Button>
            </>
          ) : isCapturing ? (
            <Button size="lg" className="w-full" onClick={capturePhoto}>
              <Camera className="w-5 h-5 mr-2" />
              Capture Photo
            </Button>
          ) : (
            <>
              <Button size="lg" className="w-full" onClick={startCamera}>
                <Camera className="w-5 h-5 mr-2" />
                Open Camera
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload from Gallery
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
