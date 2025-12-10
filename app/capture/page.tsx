"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Palette, Sparkles, Upload, Loader2, X } from "lucide-react"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"

type DesignMode = 'design' | 'ai-design' | null

type DesignSettings = {
  nailLength: string
  nailShape: string
  baseColor: string
  finish: string
  texture: string
  patternType: string
  styleVibe: string
  accentColor: string
}

const baseColors = ["#FF6B9D", "#C44569", "#A8E6CF", "#FFD93D", "#6C5CE7", "#E17055", "#FDCB6E", "#74B9FF"]

export default function CapturePage() {
  const router = useRouter()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [isFlipping, setIsFlipping] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showZoomIndicator, setShowZoomIndicator] = useState(false)
  const [handReference, setHandReference] = useState<1 | 2 | 3>(3)
  const [designMode, setDesignMode] = useState<DesignMode>(null)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDesigns, setGeneratedDesigns] = useState<string[]>([])
  const [selectedDesignImage, setSelectedDesignImage] = useState<string | null>(null)
  const [finalPreview, setFinalPreview] = useState<string | null>(null)
  
  const [designSettings, setDesignSettings] = useState<DesignSettings>({
    nailLength: 'medium',
    nailShape: 'oval',
    baseColor: '#FF6B9D',
    finish: 'glossy',
    texture: 'smooth',
    patternType: 'solid',
    styleVibe: 'elegant',
    accentColor: '#FFFFFF'
  })
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const designUploadRef = useRef<HTMLInputElement>(null)
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
      // Stop current stream first
      stopCamera()
      
      // Pause and clear the video element
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.srcObject = null
      }

      // Get new stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newFacingMode } 
      })
      
      streamRef.current = stream
      setFacingMode(newFacingMode)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setTimeout(() => {
          setIsFlipping(false)
        }, 100)
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

  const buildPrompt = (settings: DesignSettings) => {
    return `Ultra-detailed, high-resolution nail art design applied ONLY inside a fingernail area. Nail length: ${settings.nailLength}, Nail shape: ${settings.nailShape}. Base color: ${settings.baseColor}. Finish: ${settings.finish}. Texture: ${settings.texture}. Design style: ${settings.patternType} pattern, ${settings.styleVibe} aesthetic. Accent color: ${settings.accentColor}. Highly realistic nail polish appearance: smooth polish, crisp clean edges, even color distribution, professional salon quality with maximum detail, subtle natural reflections. Design must: stay strictly within the nail surface, follow realistic nail curvature, respect nail boundaries, appear physically painted onto the nail with expert precision. Ultra-high resolution rendering, realistic lighting, natural skin reflection preserved, sharp details, vibrant colors with accurate saturation.`
  }

  const generateAIPreview = async (settings: DesignSettings, selectedImage?: string) => {
    if (!capturedImage) return
    
    setIsGenerating(true)
    try {
      const prompt = buildPrompt(settings)
      
      const response = await fetch('/api/generate-nail-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          originalImage: capturedImage,
          selectedDesignImage: selectedImage || selectedDesignImage
        }),
      })

      if (response.ok) {
        const { imageUrl } = await response.json()
        setFinalPreview(imageUrl)
      }
    } catch (error) {
      console.error('Error generating AI preview:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDesignSettingChange = (key: keyof DesignSettings, value: string) => {
    const newSettings = { ...designSettings, [key]: value }
    setDesignSettings(newSettings)
  }

  // Convert hue (0-360) to hex color
  const hueToHex = (hue: number) => {
    const h = hue / 360
    const s = 0.7
    const l = 0.6
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    const r = Math.round(hue2rgb(p, q, h + 1/3) * 255)
    const g = Math.round(hue2rgb(p, q, h) * 255)
    const b = Math.round(hue2rgb(p, q, h - 1/3) * 255)
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }

  // Convert hex to hue (0-360)
  const hexToHue = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    
    if (delta === 0) return 0
    
    let hue = 0
    if (max === r) {
      hue = ((g - b) / delta) % 6
    } else if (max === g) {
      hue = (b - r) / delta + 2
    } else {
      hue = (r - g) / delta + 4
    }
    
    hue = Math.round(hue * 60)
    if (hue < 0) hue += 360
    
    return hue
  }

  const handleColorChange = (hue: number[]) => {
    const hex = hueToHex(hue[0])
    handleDesignSettingChange('baseColor', hex)
  }

  const toggleDesignMode = (mode: DesignMode) => {
    if (designMode === mode) {
      setDesignMode(null)
    } else {
      setDesignMode(mode)
    }
  }

  const generateAIDesigns = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/analyze-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })

      if (response.ok) {
        const { designs, inferredSettings } = await response.json()
        setGeneratedDesigns(designs)
        
        if (inferredSettings) {
          setDesignSettings(prev => ({ ...prev, ...inferredSettings }))
        }
      }
    } catch (error) {
      console.error("Error generating designs:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDesignSelect = async (designUrl: string) => {
    setSelectedDesignImage(designUrl)
    await generateAIPreview(designSettings, designUrl)
  }

  const handleDesignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsGenerating(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/analyze-design-image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const { imageUrl } = data
        
        setSelectedDesignImage(imageUrl)
        await generateAIPreview(designSettings, imageUrl)
      }
    } catch (error) {
      console.error('Error uploading design:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const applyDesign = async () => {
    if (designMode === 'design') {
      await generateAIPreview(designSettings)
    } else {
      // AI Design mode - preview already generated
      if (finalPreview) {
        proceedToEditor()
      }
    }
  }

  const proceedToEditor = () => {
    if (capturedImage) {
      localStorage.setItem("currentEditingImage", capturedImage)
      if (finalPreview) {
        localStorage.setItem("generatedPreview", finalPreview)
      }
      if (designMode === 'design') {
        localStorage.setItem("designSettings", JSON.stringify(designSettings))
      } else {
        localStorage.setItem("aiPrompt", aiPrompt)
        if (selectedDesignImage) {
          localStorage.setItem("selectedDesignImage", selectedDesignImage)
        }
      }
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
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-ivory via-sand to-blush flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 pt-14 px-5 pb-4 flex items-center justify-between z-10 bg-white/80 backdrop-blur-sm">
          <button
            onClick={retake}
            className="w-11 h-11 rounded-full bg-black/10 flex items-center justify-center text-charcoal hover:bg-black/20 transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-charcoal font-semibold text-lg">Design Your Nails</div>
          <Button onClick={proceedToEditor} size="sm" disabled={!finalPreview && designMode === 'ai-design'}>
            Continue
          </Button>
        </div>

        {/* Image Preview - Side by Side */}
        <div className="flex-1 pt-24 pb-[450px] px-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Original Image */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-border">
                <div className="aspect-[3/4] relative bg-white">
                  <Image src={capturedImage} alt="Original" fill className="object-cover" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs py-2 text-center font-semibold">
                  Original
                </div>
              </div>

              {/* Preview Image */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-border">
                <div className="aspect-[3/4] relative bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  {isGenerating ? (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                      <p className="text-xs text-muted-foreground">Generating...</p>
                    </div>
                  ) : finalPreview ? (
                    <Image src={finalPreview} alt="AI Generated" fill className="object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground">
                        {designMode === 'design' ? 'Configure design below' : 'Generate or upload design'}
                      </p>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs py-2 text-center font-semibold">
                  AI Preview
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Drawer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border rounded-t-3xl shadow-2xl z-20">
          <div className="max-w-2xl mx-auto">
            <div className="h-1 w-12 bg-border rounded-full mx-auto my-3"></div>

            <div className="w-full">
              <div className="w-full flex px-6 bg-transparent border-b h-14 gap-2">
                <button
                  onClick={() => toggleDesignMode('design')}
                  className={`flex-1 flex items-center justify-center gap-2 transition-all border-b-2 ${
                    designMode === 'design' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Palette className="w-5 h-5" />
                  <span className="font-semibold">Design</span>
                </button>
                <button
                  onClick={() => toggleDesignMode('ai-design')}
                  className={`flex-1 flex items-center justify-center gap-2 transition-all border-b-2 ${
                    designMode === 'ai-design' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">AI Design</span>
                </button>
              </div>

              {designMode === 'design' && (
                <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
                  {/* Generate Preview Button */}
                  <Button 
                    onClick={() => generateAIPreview(designSettings)} 
                    className="w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate Preview
                  </Button>

                  {/* Upload Design Image */}
                  <Button 
                    variant="outline" 
                    onClick={() => designUploadRef.current?.click()}
                    className="w-full"
                    disabled={isGenerating}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Design Image
                  </Button>

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-4">Design Parameters</p>

                    {/* Nail Length */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-charcoal mb-2 block">Nail Length</label>
                      <Select value={designSettings.nailLength} onValueChange={(v) => handleDesignSettingChange('nailLength', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                          <SelectItem value="extra-long">Extra Long</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Nail Shape */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-charcoal mb-2 block">Nail Shape</label>
                      <Select value={designSettings.nailShape} onValueChange={(v) => handleDesignSettingChange('nailShape', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oval">Oval</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="round">Round</SelectItem>
                          <SelectItem value="almond">Almond</SelectItem>
                          <SelectItem value="stiletto">Stiletto</SelectItem>
                          <SelectItem value="coffin">Coffin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Base Color Slider */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-charcoal mb-2 block">Base Color</label>
                      <div className="space-y-3">
                        <Slider
                          value={[hexToHue(designSettings.baseColor)]}
                          onValueChange={handleColorChange}
                          max={360}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full border-2 border-border"
                            style={{ backgroundColor: designSettings.baseColor }}
                          />
                          <span className="text-sm text-muted-foreground">{designSettings.baseColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Finish */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-charcoal mb-2 block">Finish</label>
                      <Select value={designSettings.finish} onValueChange={(v) => handleDesignSettingChange('finish', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="glossy">Glossy</SelectItem>
                          <SelectItem value="matte">Matte</SelectItem>
                          <SelectItem value="satin">Satin</SelectItem>
                          <SelectItem value="metallic">Metallic</SelectItem>
                          <SelectItem value="chrome">Chrome</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Texture */}
                    <div className="mb-4">
                      <label className="text-sm font-semibold text-charcoal mb-2 block">Texture</label>
                      <Select value={designSettings.texture} onValueChange={(v) => handleDesignSettingChange('texture', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smooth">Smooth</SelectItem>
                          <SelectItem value="glitter">Glitter</SelectItem>
                          <SelectItem value="shimmer">Shimmer</SelectItem>
                          <SelectItem value="textured">Textured</SelectItem>
                          <SelectItem value="holographic">Holographic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {designMode === 'ai-design' && (
                <div className="p-6 max-h-80 overflow-y-auto space-y-4">
                  {/* Generate Preview Button */}
                  <Button 
                    onClick={() => generateAIPreview(designSettings)} 
                    className="w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate Preview
                  </Button>

                  {/* Upload Design Image */}
                  <Button 
                    variant="outline" 
                    onClick={() => designUploadRef.current?.click()}
                    className="w-full"
                    disabled={isGenerating}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Design Image
                  </Button>

                  <div className="border-t pt-4">
                    <h3 className="font-serif text-lg font-bold text-charcoal mb-2">Describe your style</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI will analyze your prompt and generate design options
                    </p>

                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="e.g. minimalist floral with pink tones..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && generateAIDesigns()}
                      />
                      <Button onClick={generateAIDesigns} disabled={isGenerating || !aiPrompt.trim()}>
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      </Button>
                    </div>

                    {generatedDesigns.length > 0 && (
                      <div className="space-y-3 mb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Select a Design
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {generatedDesigns.map((design, index) => (
                            <button
                              key={index}
                              onClick={() => handleDesignSelect(design)}
                              className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all ${
                                selectedDesignImage === design ? 'border-primary' : 'border-border'
                              }`}
                            >
                              <Image
                                src={design}
                                alt={`Design ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Design Settings for AI Design */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Design Parameters</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-charcoal mb-1 block">Length</label>
                          <Select value={designSettings.nailLength} onValueChange={(v) => handleDesignSettingChange('nailLength', v)}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="short">Short</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="long">Long</SelectItem>
                              <SelectItem value="extra-long">Extra Long</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-charcoal mb-1 block">Shape</label>
                          <Select value={designSettings.nailShape} onValueChange={(v) => handleDesignSettingChange('nailShape', v)}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oval">Oval</SelectItem>
                              <SelectItem value="square">Square</SelectItem>
                              <SelectItem value="round">Round</SelectItem>
                              <SelectItem value="almond">Almond</SelectItem>
                              <SelectItem value="stiletto">Stiletto</SelectItem>
                              <SelectItem value="coffin">Coffin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-charcoal mb-1 block">Finish</label>
                          <Select value={designSettings.finish} onValueChange={(v) => handleDesignSettingChange('finish', v)}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="glossy">Glossy</SelectItem>
                              <SelectItem value="matte">Matte</SelectItem>
                              <SelectItem value="satin">Satin</SelectItem>
                              <SelectItem value="metallic">Metallic</SelectItem>
                              <SelectItem value="chrome">Chrome</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-charcoal mb-1 block">Texture</label>
                          <Select value={designSettings.texture} onValueChange={(v) => handleDesignSettingChange('texture', v)}>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="smooth">Smooth</SelectItem>
                              <SelectItem value="glitter">Glitter</SelectItem>
                              <SelectItem value="shimmer">Shimmer</SelectItem>
                              <SelectItem value="textured">Textured</SelectItem>
                              <SelectItem value="holographic">Holographic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Base Color Slider */}
                      <div>
                        <label className="text-xs font-semibold text-charcoal mb-2 block">Base Color</label>
                        <div className="space-y-2">
                          <Slider
                            value={[hexToHue(designSettings.baseColor)]}
                            onValueChange={handleColorChange}
                            max={360}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-full border-2 border-border"
                              style={{ backgroundColor: designSettings.baseColor }}
                            />
                            <span className="text-xs text-muted-foreground">{designSettings.baseColor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!designMode && (
                <div className="p-6 text-center text-muted-foreground">
                  <p className="text-sm">Select Design or AI Design to get started</p>
                </div>
              )}
            </div>
            <input
              ref={designUploadRef}
              type="file"
              accept="image/*"
              onChange={handleDesignUpload}
              className="hidden"
            />
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
              transform: `scale(${handReference === 1 ? 1.8 : handReference === 3 ? 2.03 : 2.9})`,
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
            onClick={() => setHandReference(handReference === 3 ? 2 : handReference === 2 ? 1 : 3)}
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
