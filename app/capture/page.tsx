"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Palette, Sparkles, Upload, Loader2, X, Save, ChevronDown } from "lucide-react"
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
  const [colorLightness, setColorLightness] = useState(65) // 0-100 for lightness (matches initial color)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
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

  // Influence weights for each input type
  // Note: designImage and baseColor are inversely linked (sum to 100)
  // In Smart Styling: designImage, stylePrompt, and baseColor share 100%
  const [influenceWeights, setInfluenceWeights] = useState({
    designImage: 0,
    stylePrompt: 33,
    baseColor: 100,
    finish: 100,
    texture: 100
  })

  // Handle linked sliders - when design image changes, adjust base color
  const handleDesignImageInfluence = (value: number) => {
    if (designMode === 'ai-design' && aiPrompt) {
      // Smart Styling: distribute 100% among designImage, stylePrompt, baseColor
      const remaining = 100 - value
      const stylePromptShare = Math.round(remaining * (influenceWeights.stylePrompt / (influenceWeights.stylePrompt + influenceWeights.baseColor)))
      const baseColorShare = remaining - stylePromptShare
      setInfluenceWeights(prev => ({
        ...prev,
        designImage: value,
        stylePrompt: stylePromptShare,
        baseColor: baseColorShare
      }))
    } else {
      // Nail Editor: inverse relationship between designImage and baseColor
      setInfluenceWeights(prev => ({
        ...prev,
        designImage: value,
        baseColor: 100 - value
      }))
    }
  }

  const handleStylePromptInfluence = (value: number) => {
    // Smart Styling: distribute 100% among designImage, stylePrompt, baseColor
    const remaining = 100 - value
    const designImageShare = Math.round(remaining * (influenceWeights.designImage / (influenceWeights.designImage + influenceWeights.baseColor)))
    const baseColorShare = remaining - designImageShare
    setInfluenceWeights(prev => ({
      ...prev,
      stylePrompt: value,
      designImage: designImageShare,
      baseColor: baseColorShare
    }))
  }

  const handleBaseColorInfluence = (value: number) => {
    if (designMode === 'ai-design' && aiPrompt) {
      // Smart Styling: distribute 100% among designImage, stylePrompt, baseColor
      const remaining = 100 - value
      const designImageShare = Math.round(remaining * (influenceWeights.designImage / (influenceWeights.designImage + influenceWeights.stylePrompt)))
      const stylePromptShare = remaining - designImageShare
      setInfluenceWeights(prev => ({
        ...prev,
        baseColor: value,
        designImage: designImageShare,
        stylePrompt: stylePromptShare
      }))
    } else {
      // Nail Editor: inverse relationship between baseColor and designImage
      setInfluenceWeights(prev => ({
        ...prev,
        baseColor: value,
        designImage: 100 - value
      }))
    }
  }
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const designUploadRef = useRef<HTMLInputElement>(null)
  const lastTouchDistanceRef = useRef<number>(0)
  const zoomIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Check for existing image on mount, skip camera if found
  useEffect(() => {
    const existingImage = localStorage.getItem("currentEditingImage")
    if (existingImage) {
      // User already has an image, go straight to design page
      setCapturedImage(existingImage)
    } else {
      // No existing image, start camera
      startCamera()
    }
    
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
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    
    setIsGenerating(true)
    try {
      const prompt = buildPrompt(settings)
      
      const response = await fetch('/api/generate-nail-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          originalImage: capturedImage,
          selectedDesignImage: selectedImage || selectedDesignImage,
          influenceWeights
        }),
        signal: abortControllerRef.current.signal
      })

      if (response.ok) {
        const { imageUrl } = await response.json()
        setFinalPreview(imageUrl)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation cancelled by user')
      } else {
        console.error('Error generating AI preview:', error)
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsGenerating(false)
    }
  }

  const handleDesignSettingChange = (key: keyof DesignSettings, value: string) => {
    const newSettings = { ...designSettings, [key]: value }
    setDesignSettings(newSettings)
  }

  // Convert hue (0-360) and lightness (0-100) to hex color
  const hslToHex = (hue: number, lightness: number) => {
    const h = hue / 360
    const s = 0.7 // Keep saturation constant
    const l = lightness / 100
    
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

  // Convert hex to hue (0-360) and lightness (0-100)
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    
    let hue = 0
    if (delta !== 0) {
      if (max === r) {
        hue = ((g - b) / delta) % 6
      } else if (max === g) {
        hue = (b - r) / delta + 2
      } else {
        hue = (r - g) / delta + 4
      }
      hue = Math.round(hue * 60)
      if (hue < 0) hue += 360
    }
    
    const lightness = Math.round(((max + min) / 2) * 100)
    
    return { hue, lightness }
  }

  const handleHueChange = (hue: number[]) => {
    const hex = hslToHex(hue[0], colorLightness)
    handleDesignSettingChange('baseColor', hex)
  }

  const handleLightnessChange = (lightness: number[]) => {
    setColorLightness(lightness[0])
    const { hue } = hexToHsl(designSettings.baseColor)
    const hex = hslToHex(hue, lightness[0])
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

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    setIsGenerating(true)
    try {
      const response = await fetch('/api/analyze-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
        signal: abortControllerRef.current.signal
      })

      if (response.ok) {
        const { designs, inferredSettings } = await response.json()
        setGeneratedDesigns(designs)
        
        if (inferredSettings) {
          setDesignSettings(prev => ({ ...prev, ...inferredSettings }))
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('AI design generation cancelled by user')
      } else {
        console.error("Error generating designs:", error)
      }
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }

  const handleDesignSelect = (designUrl: string) => {
    setSelectedDesignImage(designUrl)
    // When design image is selected, set its influence to 100 and base color to 0
    handleDesignImageInfluence(100)
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
        // When design image is uploaded, set its influence to 100 and base color to 0
        handleDesignImageInfluence(100)
        // Don't auto-generate - user must click "Generate Preview"
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

  const saveDesign = async () => {
    if (!finalPreview) {
      alert('Please generate a preview first')
      return
    }

    try {
      const userStr = localStorage.getItem("ivoryUser")
      if (!userStr) {
        router.push("/")
        return
      }

      const user = JSON.parse(userStr)
      
      const response = await fetch('/api/looks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: `Design ${new Date().toLocaleDateString()}`,
          imageUrl: finalPreview,
          originalImageUrl: capturedImage,
          designSettings,
          aiPrompt: aiPrompt || null,
          isPublic: false,
        }),
      })

      if (response.ok) {
        alert('Design saved successfully!')
        router.push("/home")
      } else {
        alert('Failed to save design')
      }
    } catch (error) {
      console.error('Error saving design:', error)
      alert('An error occurred while saving')
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

  const changePhoto = () => {
    setCapturedImage(null)
    setFinalPreview(null)
    setSelectedDesignImage(null)
    setGeneratedDesigns([])
    setDesignMode(null)
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
          <Button
            onClick={changePhoto}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Change Photo</span>
          </Button>
          <div className="text-charcoal font-semibold text-lg hidden sm:block">Design Your Nails</div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={saveDesign} 
              size="sm" 
              variant="outline"
              disabled={!finalPreview}
            >
              Save
            </Button>
            <Button 
              onClick={proceedToEditor} 
              size="sm" 
              disabled={!finalPreview && designMode === 'ai-design'}
            >
              Continue
            </Button>
          </div>
        </div>

        {/* Image Preview - Side by Side */}
        <div className="flex-1 pt-24 pb-[450px] px-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Original Image */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-border group">
                <div className="aspect-[3/4] relative bg-white">
                  <Image src={capturedImage} alt="Original" fill className="object-cover" />
                  {/* Change Photo Overlay */}
                  <button
                    onClick={changePhoto}
                    className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <div className="bg-white rounded-full p-3 shadow-lg">
                      <Upload className="w-6 h-6 text-charcoal" />
                    </div>
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs py-2 text-center font-semibold">
                  Original
                </div>
              </div>

              {/* Preview Image */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-border">
                <div className="aspect-[3/4] relative bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  {isGenerating ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image 
                        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGdkNWtib3JrcXhvcHFiaHdraHR5aDJsN3Bzcmx2ajZyNWJlemM1biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ljj4pInW5JllK/giphy.gif"
                        alt="Generating..."
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          // Fallback to second GIF if first one fails
                          const target = e.target as HTMLImageElement;
                          if (target.src !== "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjZlOXJvZThrOXpndThicm83NXM5N2V4cWpjaXFkNXQ1MHNiZ2dwaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QaDc2Wn7tfLFu/giphy.gif") {
                            target.src = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjZlOXJvZThrOXpndThicm83NXM5N2V4cWpjaXFkNXQ1MHNiZ2dwaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QaDc2Wn7tfLFu/giphy.gif";
                          }
                        }}
                      />
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border rounded-t-3xl shadow-2xl z-20 touch-action-pan-y">
          <div className="max-w-2xl mx-auto">
            <div className="h-1 w-12 bg-border rounded-full mx-auto my-3"></div>

            <div className="w-full">
              <div className="w-full flex px-6 bg-transparent border-b h-14 gap-2">
                <button
                  onClick={() => toggleDesignMode('design')}
                  className={`flex-1 flex items-center justify-center transition-all border-b-2 ${
                    designMode === 'design' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="font-semibold">Nail Editor</span>
                </button>
                <button
                  onClick={() => toggleDesignMode('ai-design')}
                  className={`flex-1 flex items-center justify-center transition-all border-b-2 ${
                    designMode === 'ai-design' 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="font-semibold">Smart Styling</span>
                </button>
              </div>

              {designMode === 'design' && (
                <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto overscroll-contain">
                  {/* Generate Preview Button */}
                  {!isGenerating ? (
                    <Button 
                      onClick={() => generateAIPreview(designSettings)} 
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Preview
                    </Button>
                  ) : (
                    <Button 
                      onClick={cancelGeneration}
                      variant="destructive"
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Generation
                    </Button>
                  )}

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

                  {/* Uploaded Design Preview with Influence Control */}
                  {selectedDesignImage && (
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'design-image' ? null : 'design-image')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-primary flex-shrink-0">
                            <Image src={selectedDesignImage} alt="Uploaded Design" fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold text-charcoal">Uploaded Design</p>
                            <p className="text-xs text-muted-foreground">Tap to adjust influence</p>
                          </div>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{influenceWeights.designImage}%</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ml-2 ${expandedSection === 'design-image' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'design-image' && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-medium text-muted-foreground">Design Image</label>
                            <span className="text-xs font-bold text-primary">{influenceWeights.designImage}%</span>
                          </div>
                          <Slider
                            value={[influenceWeights.designImage]}
                            onValueChange={(value) => handleDesignImageInfluence(value[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            Base Color: {influenceWeights.baseColor}%
                          </p>
                          <button
                            onClick={() => setSelectedDesignImage(null)}
                            className="w-full mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove Design Image
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-4">Design Parameters</p>

                    {/* Nail Length - Collapsible */}
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'length' ? null : 'length')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-semibold text-charcoal">Nail Length</span>
                          <span className="text-xs text-muted-foreground capitalize">{designSettings.nailLength.replace('-', ' ')}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === 'length' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'length' && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { value: 'short', label: 'Short', height: 'h-6' },
                              { value: 'medium', label: 'Medium', height: 'h-10' },
                              { value: 'long', label: 'Long', height: 'h-14' },
                              { value: 'extra-long', label: 'Extra', height: 'h-16' }
                            ].map((length) => (
                              <button
                                key={length.value}
                                onClick={() => handleDesignSettingChange('nailLength', length.value)}
                                className={`flex flex-col items-center justify-end p-2 rounded-lg border transition-all ${
                                  designSettings.nailLength === length.value
                                    ? 'border-primary bg-white'
                                    : 'border-border bg-white hover:border-primary/50'
                                }`}
                              >
                                <div className={`w-4 ${length.height} bg-gradient-to-t from-primary to-primary/60 rounded-t-full mb-1.5`} />
                                <span className="text-[10px] font-medium text-charcoal">{length.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Nail Shape - Collapsible */}
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'shape' ? null : 'shape')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-semibold text-charcoal">Nail Shape</span>
                          <span className="text-xs text-muted-foreground capitalize">{designSettings.nailShape}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === 'shape' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'shape' && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'oval', label: 'Oval', path: 'M12 4 C8 4 6 6 6 10 L6 18 C6 20 8 22 12 22 C16 22 18 20 18 18 L18 10 C18 6 16 4 12 4 Z' },
                              { value: 'square', label: 'Square', path: 'M8 4 L16 4 L16 20 C16 21 15 22 12 22 C9 22 8 21 8 20 Z' },
                              { value: 'round', label: 'Round', path: 'M12 4 C9 4 7 5 7 8 L7 18 C7 21 9 22 12 22 C15 22 17 21 17 18 L17 8 C17 5 15 4 12 4 Z' },
                              { value: 'almond', label: 'Almond', path: 'M12 2 C9 2 7 4 7 8 L7 18 C7 20 9 22 12 22 C15 22 17 20 17 18 L17 8 C17 4 15 2 12 2 Z' },
                              { value: 'stiletto', label: 'Stiletto', path: 'M12 2 L8 8 L8 18 C8 20 9 22 12 22 C15 22 16 20 16 18 L16 8 Z' },
                              { value: 'coffin', label: 'Coffin', path: 'M10 4 L14 4 L16 8 L16 18 L14 22 L10 22 L8 18 L8 8 Z' }
                            ].map((shape) => (
                              <button
                                key={shape.value}
                                onClick={() => handleDesignSettingChange('nailShape', shape.value)}
                                className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                                  designSettings.nailShape === shape.value
                                    ? 'border-primary bg-white'
                                    : 'border-border bg-white hover:border-primary/50'
                                }`}
                              >
                                <svg viewBox="0 0 24 24" className="w-6 h-10 mb-1">
                                  <path d={shape.path} fill="currentColor" className="text-primary" />
                                </svg>
                                <span className="text-[10px] font-medium text-charcoal">{shape.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Base Color - Collapsible */}
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'color' ? null : 'color')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-semibold text-charcoal">Base Color</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full border-2 border-border"
                              style={{ backgroundColor: designSettings.baseColor }}
                            />
                            <span className="text-xs text-muted-foreground">{designSettings.baseColor}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded mr-2">{influenceWeights.baseColor}%</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === 'color' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'color' && (
                        <div className="mt-2 space-y-3 p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Hue</label>
                            <Slider
                              value={[hexToHsl(designSettings.baseColor).hue]}
                              onValueChange={handleHueChange}
                              max={360}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">Lightness</label>
                            <Slider
                              value={[colorLightness]}
                              onValueChange={handleLightnessChange}
                              max={100}
                              min={10}
                              step={1}
                              className="w-full"
                            />
                          </div>
                          <div className="border-t pt-3">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-xs font-medium text-muted-foreground">Base Color</label>
                              <span className="text-xs font-bold text-primary">{influenceWeights.baseColor}%</span>
                            </div>
                            <Slider
                              value={[influenceWeights.baseColor]}
                              onValueChange={(value) => handleBaseColorInfluence(value[0])}
                              min={0}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {selectedDesignImage && `Design Image: ${influenceWeights.designImage}%`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Finish - Collapsible */}
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'finish' ? null : 'finish')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-semibold text-charcoal">Finish</span>
                          <span className="text-xs text-muted-foreground capitalize">{designSettings.finish}</span>
                        </div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded mr-2">{influenceWeights.finish}%</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === 'finish' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'finish' && (
                        <div className="mt-2 space-y-3 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'glossy', label: 'Glossy', gradient: 'bg-gradient-to-br from-pink-400 to-pink-600' },
                              { value: 'matte', label: 'Matte', gradient: 'bg-pink-400' },
                              { value: 'satin', label: 'Satin', gradient: 'bg-gradient-to-b from-pink-300 to-pink-500' },
                              { value: 'metallic', label: 'Metallic', gradient: 'bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300' },
                              { value: 'chrome', label: 'Chrome', gradient: 'bg-gradient-to-br from-gray-300 via-pink-200 to-gray-300' }
                            ].map((finish) => (
                              <button
                                key={finish.value}
                                onClick={() => handleDesignSettingChange('finish', finish.value)}
                                className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                                  designSettings.finish === finish.value
                                    ? 'border-primary bg-white'
                                    : 'border-border bg-white hover:border-primary/50'
                                }`}
                              >
                                <div className={`w-full h-12 rounded-lg ${finish.gradient} mb-1.5 ${finish.value === 'glossy' ? 'shadow-lg' : ''}`} />
                                <span className="text-[10px] font-medium text-charcoal">{finish.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="border-t pt-3">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-xs font-medium text-muted-foreground">Influence</label>
                              <span className="text-xs font-bold text-primary">{influenceWeights.finish}%</span>
                            </div>
                            <Slider
                              value={[influenceWeights.finish]}
                              onValueChange={(value) => setInfluenceWeights(prev => ({ ...prev, finish: value[0] }))}
                              min={0}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Texture - Collapsible */}
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'texture' ? null : 'texture')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-semibold text-charcoal">Texture</span>
                          <span className="text-xs text-muted-foreground capitalize">{designSettings.texture}</span>
                        </div>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded mr-2">{influenceWeights.texture}%</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === 'texture' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'texture' && (
                        <div className="mt-2 space-y-3 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'smooth', label: 'Smooth', pattern: 'bg-pink-400' },
                              { value: 'glitter', label: 'Glitter', pattern: 'bg-gradient-to-br from-pink-300 via-pink-500 to-pink-300 bg-[length:4px_4px]' },
                              { value: 'shimmer', label: 'Shimmer', pattern: 'bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300' },
                              { value: 'textured', label: 'Textured', pattern: 'bg-pink-400' },
                              { value: 'holographic', label: 'Holo', pattern: 'bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300' }
                            ].map((texture) => (
                              <button
                                key={texture.value}
                                onClick={() => handleDesignSettingChange('texture', texture.value)}
                                className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                                  designSettings.texture === texture.value
                                    ? 'border-primary bg-white'
                                    : 'border-border bg-white hover:border-primary/50'
                                }`}
                              >
                                <div className={`w-full h-12 rounded-lg ${texture.pattern} mb-1.5 ${texture.value === 'glitter' ? 'animate-pulse' : ''}`} 
                                  style={texture.value === 'textured' ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,.05) 2px, rgba(0,0,0,.05) 4px)' } : {}}
                                />
                                <span className="text-[10px] font-medium text-charcoal">{texture.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="border-t pt-3">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-xs font-medium text-muted-foreground">Influence</label>
                              <span className="text-xs font-bold text-primary">{influenceWeights.texture}%</span>
                            </div>
                            <Slider
                              value={[influenceWeights.texture]}
                              onValueChange={(value) => setInfluenceWeights(prev => ({ ...prev, texture: value[0] }))}
                              min={0}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {designMode === 'ai-design' && (
                <div className="p-6 max-h-[500px] overflow-y-auto overscroll-contain space-y-4">
                  {/* Generate Preview Button */}
                  {!isGenerating ? (
                    <Button 
                      onClick={() => generateAIPreview(designSettings)} 
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Preview
                    </Button>
                  ) : (
                    <Button 
                      onClick={cancelGeneration}
                      variant="destructive"
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel Generation
                    </Button>
                  )}

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

                  {/* Uploaded Design Preview */}
                  {selectedDesignImage && !generatedDesigns.length && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-primary flex-shrink-0">
                        <Image src={selectedDesignImage} alt="Uploaded Design" fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-charcoal">Uploaded Design</p>
                        <p className="text-xs text-muted-foreground truncate">Ready to generate</p>
                      </div>
                      <button
                        onClick={() => setSelectedDesignImage(null)}
                        className="bg-gray-200 hover:bg-gray-300 text-charcoal rounded-full p-1.5 transition-all flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Uploaded Design Preview with Influence Control */}
                  {selectedDesignImage && !generatedDesigns.length && (
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'ai-design-image' ? null : 'ai-design-image')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-primary flex-shrink-0">
                            <Image src={selectedDesignImage} alt="Uploaded Design" fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-semibold text-charcoal">Uploaded Design</p>
                            <p className="text-xs text-muted-foreground">Tap to adjust influence</p>
                          </div>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">{influenceWeights.designImage}%</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ml-2 ${expandedSection === 'ai-design-image' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'ai-design-image' && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-medium text-muted-foreground">Design Image</label>
                            <span className="text-xs font-bold text-primary">{influenceWeights.designImage}%</span>
                          </div>
                          <Slider
                            value={[influenceWeights.designImage]}
                            onValueChange={(value) => handleDesignImageInfluence(value[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                          <p className="text-[10px] text-muted-foreground">
                            Base Color: {influenceWeights.baseColor}% • Style Prompt: {influenceWeights.stylePrompt}%
                          </p>
                          <button
                            onClick={() => setSelectedDesignImage(null)}
                            className="w-full mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove Design Image
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h3 className="font-serif text-lg font-bold text-charcoal mb-2">Describe your style</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI will analyze your prompt and generate design options
                    </p>

                    <div className="space-y-3">
                      <div className="flex gap-2">
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

                      {aiPrompt && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-medium text-muted-foreground">Style Prompt</label>
                            <span className="text-xs font-bold text-primary">{influenceWeights.stylePrompt}%</span>
                          </div>
                          <Slider
                            value={[influenceWeights.stylePrompt]}
                            onValueChange={(value) => handleStylePromptInfluence(value[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Base Color: {influenceWeights.baseColor}% {selectedDesignImage && `• Design Image: ${influenceWeights.designImage}%`}
                          </p>
                        </div>
                      )}
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
                    <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Design Parameters</p>
                      
                      {/* Nail Length - Collapsible Compact */}
                      <div>
                        <button
                          onClick={() => setExpandedSection(expandedSection === 'ai-length' ? null : 'ai-length')}
                          className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-charcoal">Length</span>
                            <span className="text-[10px] text-muted-foreground capitalize">{designSettings.nailLength.replace('-', ' ')}</span>
                          </div>
                          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expandedSection === 'ai-length' ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSection === 'ai-length' && (
                          <div className="mt-1.5 grid grid-cols-4 gap-1.5 p-1.5 bg-white rounded-lg">
                            {[
                              { value: 'short', label: 'Short', height: 'h-5' },
                              { value: 'medium', label: 'Med', height: 'h-7' },
                              { value: 'long', label: 'Long', height: 'h-9' },
                              { value: 'extra-long', label: 'XL', height: 'h-11' }
                            ].map((length) => (
                              <button
                                key={length.value}
                                onClick={() => {
                                  handleDesignSettingChange('nailLength', length.value)
                                  setExpandedSection(null)
                                }}
                                className={`flex flex-col items-center justify-end p-1.5 rounded border transition-all ${
                                  designSettings.nailLength === length.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className={`w-3 ${length.height} bg-gradient-to-t from-primary to-primary/60 rounded-t-full mb-1`} />
                                <span className="text-[9px] font-medium text-charcoal">{length.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Nail Shape - Collapsible Compact */}
                      <div>
                        <button
                          onClick={() => setExpandedSection(expandedSection === 'ai-shape' ? null : 'ai-shape')}
                          className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-charcoal">Shape</span>
                            <span className="text-[10px] text-muted-foreground capitalize">{designSettings.nailShape}</span>
                          </div>
                          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expandedSection === 'ai-shape' ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSection === 'ai-shape' && (
                          <div className="mt-1.5 grid grid-cols-3 gap-1.5 p-1.5 bg-white rounded-lg">
                            {[
                              { value: 'oval', label: 'Oval', path: 'M12 4 C8 4 6 6 6 10 L6 18 C6 20 8 22 12 22 C16 22 18 20 18 18 L18 10 C18 6 16 4 12 4 Z' },
                              { value: 'square', label: 'Square', path: 'M8 4 L16 4 L16 20 C16 21 15 22 12 22 C9 22 8 21 8 20 Z' },
                              { value: 'round', label: 'Round', path: 'M12 4 C9 4 7 5 7 8 L7 18 C7 21 9 22 12 22 C15 22 17 21 17 18 L17 8 C17 5 15 4 12 4 Z' },
                              { value: 'almond', label: 'Almond', path: 'M12 2 C9 2 7 4 7 8 L7 18 C7 20 9 22 12 22 C15 22 17 20 17 18 L17 8 C17 4 15 2 12 2 Z' },
                              { value: 'stiletto', label: 'Stiletto', path: 'M12 2 L8 8 L8 18 C8 20 9 22 12 22 C15 22 16 20 16 18 L16 8 Z' },
                              { value: 'coffin', label: 'Coffin', path: 'M10 4 L14 4 L16 8 L16 18 L14 22 L10 22 L8 18 L8 8 Z' }
                            ].map((shape) => (
                              <button
                                key={shape.value}
                                onClick={() => {
                                  handleDesignSettingChange('nailShape', shape.value)
                                  setExpandedSection(null)
                                }}
                                className={`flex flex-col items-center p-1.5 rounded border transition-all ${
                                  designSettings.nailShape === shape.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <svg viewBox="0 0 24 24" className="w-5 h-7 mb-0.5">
                                  <path d={shape.path} fill="currentColor" className="text-primary" />
                                </svg>
                                <span className="text-[9px] font-medium text-charcoal">{shape.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Finish - Collapsible Compact */}
                      <div>
                        <button
                          onClick={() => setExpandedSection(expandedSection === 'ai-finish' ? null : 'ai-finish')}
                          className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-charcoal">Finish</span>
                            <span className="text-[10px] text-muted-foreground capitalize">{designSettings.finish}</span>
                          </div>
                          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expandedSection === 'ai-finish' ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSection === 'ai-finish' && (
                          <div className="mt-1.5 grid grid-cols-3 gap-1.5 p-1.5 bg-white rounded-lg">
                            {[
                              { value: 'glossy', label: 'Glossy', gradient: 'bg-gradient-to-br from-pink-400 to-pink-600' },
                              { value: 'matte', label: 'Matte', gradient: 'bg-pink-400' },
                              { value: 'satin', label: 'Satin', gradient: 'bg-gradient-to-b from-pink-300 to-pink-500' },
                              { value: 'metallic', label: 'Metal', gradient: 'bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300' },
                              { value: 'chrome', label: 'Chrome', gradient: 'bg-gradient-to-br from-gray-300 via-pink-200 to-gray-300' }
                            ].map((finish) => (
                              <button
                                key={finish.value}
                                onClick={() => {
                                  handleDesignSettingChange('finish', finish.value)
                                  setExpandedSection(null)
                                }}
                                className={`flex flex-col items-center p-1.5 rounded border transition-all ${
                                  designSettings.finish === finish.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className={`w-full h-8 rounded ${finish.gradient} mb-1 ${finish.value === 'glossy' ? 'shadow-md' : ''}`} />
                                <span className="text-[9px] font-medium text-charcoal">{finish.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Texture - Collapsible Compact */}
                      <div>
                        <button
                          onClick={() => setExpandedSection(expandedSection === 'ai-texture' ? null : 'ai-texture')}
                          className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-charcoal">Texture</span>
                            <span className="text-[10px] text-muted-foreground capitalize">{designSettings.texture}</span>
                          </div>
                          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expandedSection === 'ai-texture' ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSection === 'ai-texture' && (
                          <div className="mt-1.5 grid grid-cols-3 gap-1.5 p-1.5 bg-white rounded-lg">
                            {[
                              { value: 'smooth', label: 'Smooth', pattern: 'bg-pink-400' },
                              { value: 'glitter', label: 'Glitter', pattern: 'bg-gradient-to-br from-pink-300 via-pink-500 to-pink-300' },
                              { value: 'shimmer', label: 'Shimmer', pattern: 'bg-gradient-to-r from-pink-300 via-pink-400 to-pink-300' },
                              { value: 'textured', label: 'Texture', pattern: 'bg-pink-400' },
                              { value: 'holographic', label: 'Holo', pattern: 'bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300' }
                            ].map((texture) => (
                              <button
                                key={texture.value}
                                onClick={() => {
                                  handleDesignSettingChange('texture', texture.value)
                                  setExpandedSection(null)
                                }}
                                className={`flex flex-col items-center p-1.5 rounded border transition-all ${
                                  designSettings.texture === texture.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className={`w-full h-8 rounded ${texture.pattern} mb-1`} 
                                  style={texture.value === 'textured' ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,.05) 2px, rgba(0,0,0,.05) 4px)' } : {}}
                                />
                                <span className="text-[9px] font-medium text-charcoal">{texture.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Base Color - Collapsible Compact */}
                      <div>
                        <button
                          onClick={() => setExpandedSection(expandedSection === 'ai-color' ? null : 'ai-color')}
                          className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-white hover:border-primary/50 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-charcoal">Base Color</span>
                            <div className="flex items-center gap-1.5">
                              <div 
                                className="w-5 h-5 rounded-full border-2 border-border"
                                style={{ backgroundColor: designSettings.baseColor }}
                              />
                              <span className="text-[10px] text-muted-foreground">{designSettings.baseColor}</span>
                            </div>
                          </div>
                          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expandedSection === 'ai-color' ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedSection === 'ai-color' && (
                          <div className="mt-1.5 space-y-2 p-2 bg-white rounded-lg">
                            <div>
                              <label className="text-[10px] text-muted-foreground mb-1 block">Hue</label>
                              <Slider
                                value={[hexToHsl(designSettings.baseColor).hue]}
                                onValueChange={handleHueChange}
                                max={360}
                                step={1}
                                className="w-full"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground mb-1 block">Lightness</label>
                              <Slider
                                value={[colorLightness]}
                                onValueChange={handleLightnessChange}
                                max={100}
                                min={10}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!designMode && (
                <div className="p-6 text-center text-muted-foreground">
                  <p className="text-sm">Select Nail Editor or Smart Styling to get started</p>
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
