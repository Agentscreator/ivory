"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

export default function CapturePage() {
  const router = useRouter()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [isFlipping, setIsFlipping] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showZoomIndicator, setShowZoomIndicator] = useState(false)
  const [handReference, setHandReference] = useState<1 | 2>(1)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastTouchDistanceRef = useRef<number>(0)
  const zoomIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-start camera on mount
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
      if (zoomIndicatorTimeoutRef.current) {
        clearTimeout(zoomIndicatorTimeoutRef.current)
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode } 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  const flipCamera = useCallback(async () => {
    setIsFlipping(true)
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newFacingMode } 
      })
      
      stopCamera()
      streamRef.current = stream
      setFacingMode(newFacingMode)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setTimeout(() => {
            setIsFlipping(false)
          }, 100)
        }
      }
    } catch (error) {
      console.error("Error flipping camera:", error)
      alert("Unable to flip camera.")
      setIsFlipping(false)
    }
  }, [facingMode])

  const capturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      
      if (ctx) {
        // Apply beauty filter
        ctx.filter = 'brightness(1.05) contrast(1.05) saturate(1.1) blur(0.3px)'

        // Flip for front camera
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0)
          ctx.scale(-1, 1)
        }

        ctx.drawImage(videoRef.current, 0, 0)

        try {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const formData = new FormData()
              formData.append('file', blob, 'photo.jpg')
              formData.append('type', 'image')

              const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              })

              if (uploadResponse.ok) {
                const { url } = await uploadResponse.json()
                setCapturedImage(url)
              } else {
                const dataUrl = canvas.toDataURL("image/jpeg")
                setCapturedImage(dataUrl)
              }
            }
          }, 'image/jpeg', 0.9)
        } catch (error) {
          console.error('Photo upload error:', error)
          const dataUrl = canvas.toDataURL("image/jpeg")
          setCapturedImage(dataUrl)
        }

        stopCamera()
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'image')

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          setCapturedImage(url)
        } else {
          const reader = new FileReader()
          reader.onload = (e) => {
            setCapturedImage(e.target?.result as string)
          }
          reader.readAsDataURL(file)
        }
      } catch (error) {
        console.error('File upload error:', error)
        const reader = new FileReader()
        reader.onload = (e) => {
          setCapturedImage(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }

      stopCamera()
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
    startCamera()
  }

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      lastTouchDistanceRef.current = distance
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )

      if (lastTouchDistanceRef.current > 0) {
        const delta = distance - lastTouchDistanceRef.current
        const zoomChange = delta * 0.01
        setZoom(prev => Math.min(Math.max(prev + zoomChange, 1), 5))
        
        setShowZoomIndicator(true)
        if (zoomIndicatorTimeoutRef.current) {
          clearTimeout(zoomIndicatorTimeoutRef.current)
        }
        zoomIndicatorTimeoutRef.current = setTimeout(() => {
          setShowZoomIndicator(false)
        }, 1500)
      }

      lastTouchDistanceRef.current = distance
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    lastTouchDistanceRef.current = 0
  }, [])



  if (capturedImage) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        <div className="relative flex-1">
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 pb-10 pt-6 px-6 z-10">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={retake}
              className="flex-1 h-14 rounded-2xl bg-black/40 backdrop-blur-md hover:bg-black/50 transition-all shadow-lg text-white font-semibold active:scale-95"
            >
              Retake
            </button>
            <button
              onClick={proceedToEditor}
              className="flex-1 h-14 rounded-2xl bg-white hover:bg-gray-100 transition-all shadow-lg text-gray-900 font-semibold active:scale-95"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <div
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transition-opacity duration-200"
          style={{
            transform: `${facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'} scale(${zoom})`,
            filter: 'brightness(1.08) contrast(1.08) saturate(1.15)',
            opacity: isFlipping ? 0 : 1,
            transition: 'transform 0.15s ease-out, opacity 0.2s ease-out',
          }}
        />

        {/* Hand Reference Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[5] overflow-visible">
          <style jsx>{`
            @keyframes blink-outline {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 0.9; }
            }
            .hand-outline {
              animation: blink-outline 2s ease-in-out infinite;
            }
          `}</style>
          <img
            src={`/ref${handReference}.png`}
            alt="Hand reference"
            className="hand-outline w-full h-full object-contain"
            style={{
              transform: 'scale(2.9)',
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)) brightness(1.2)',
            }}
          />
        </div>

        {isFlipping && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 pt-14 px-5 pb-4 flex items-center justify-between z-10">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition-all shadow-lg active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-white font-semibold text-lg">PHOTO</div>
          <div className="w-11"></div>
        </div>

        {/* Zoom Indicator */}
        {showZoomIndicator && zoom > 1 && (
          <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-10 transition-opacity duration-300">
            <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-semibold text-sm">{zoom.toFixed(1)}x</span>
            </div>
          </div>
        )}

        {/* Right Side Controls */}
        <div className="absolute right-5 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-3">
          {/* Flip Camera Button */}
          <button
            onClick={flipCamera}
            disabled={isFlipping}
            className={`w-14 h-14 rounded-2xl backdrop-blur-md flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
              facingMode === "environment"
                ? "bg-white/95 text-gray-900 shadow-xl"
                : "bg-black/40 hover:bg-black/50 text-white shadow-lg"
            } ${isFlipping ? "opacity-50" : ""}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Hand Reference Toggle */}
          <button
            onClick={() => setHandReference(handReference === 1 ? 2 : 1)}
            className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-md hover:bg-black/50 text-white shadow-lg flex flex-col items-center justify-center transition-all duration-200 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-semibold mt-0.5">{handReference}</span>
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 pb-10 pt-6 px-6 z-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-md hover:bg-black/50 transition-all shadow-lg flex items-center justify-center active:scale-95"
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>

            <button
              onClick={capturePhoto}
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
                border: '4px solid rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-inner"></div>
            </button>

            <div className="w-14"></div>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
    </div>
  )
}
