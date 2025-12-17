"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Palette, Sparkles, Upload, Loader2, X, ChevronDown, Share2 } from "lucide-react"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"
import { CreditsDisplay } from "@/components/credits-display"
import { useCredits } from "@/hooks/use-credits"
import { toast } from "sonner"
import { BottomNav } from "@/components/bottom-nav"
import { DrawingCanvas } from "@/components/drawing-canvas"
import { Pencil } from "lucide-react"

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

type DesignTab = {
  id: string
  name: string
  finalPreviews: string[]
  designSettings: DesignSettings
  selectedDesignImages: string[]
  drawingImageUrl: string | null
  aiPrompt: string
  originalImage: string | null
}

export default function CapturePage() {
  const router = useRouter()
  const { credits, hasCredits, refresh: refreshCredits } = useCredits()
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [isFlipping, setIsFlipping] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showZoomIndicator, setShowZoomIndicator] = useState(false)
  const [handReference, setHandReference] = useState<1 | 2 | 3>(3)
  const [designMode, setDesignMode] = useState<DesignMode>(null)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedDesigns, setGeneratedDesigns] = useState<string[]>([])
  const [selectedDesignImages, setSelectedDesignImages] = useState<string[]>([])
  const [finalPreview, setFinalPreview] = useState<string | null>(null)
  const [finalPreviews, setFinalPreviews] = useState<string[]>([])
  const [colorLightness, setColorLightness] = useState(65) // 0-100 for lightness (matches initial color)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null)
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false)
  const [drawingImageUrl, setDrawingImageUrl] = useState<string | null>(null)
  
  // Tabs for multiple designs
  const [designTabs, setDesignTabs] = useState<DesignTab[]>([
    {
      id: '1',
      name: 'Design 1',
      finalPreviews: [],
      designSettings: {
        nailLength: 'medium',
        nailShape: 'oval',
        baseColor: '#FF6B9D',
        finish: 'glossy',
        texture: 'smooth',
        patternType: 'solid',
        styleVibe: 'elegant',
        accentColor: '#FFFFFF'
      },
      selectedDesignImages: [],
      drawingImageUrl: null,
      aiPrompt: '',
      originalImage: null
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')
  
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

  // Influence weights for Nail Editor
  // designImage and baseColor are inversely linked (sum to 100)
  const [influenceWeights, setInfluenceWeights] = useState({
    nailEditor_designImage: 0,
    nailEditor_baseColor: 100,
    nailEditor_finish: 100,
    nailEditor_texture: 100
  })

  // Nail Editor influence handlers
  const handleNailEditorDesignImageInfluence = (value: number) => {
    setInfluenceWeights(prev => ({
      ...prev,
      nailEditor_designImage: value,
      nailEditor_baseColor: 100 - value
    }))
  }

  const handleNailEditorBaseColorInfluence = (value: number) => {
    setInfluenceWeights(prev => ({
      ...prev,
      nailEditor_baseColor: value,
      nailEditor_designImage: 100 - value
    }))
  }
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const designUploadRef = useRef<HTMLInputElement>(null)
  const lastTouchDistanceRef = useRef<number>(0)
  const zoomIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Get active tab
  const activeTab = designTabs.find(tab => tab.id === activeTabId) || designTabs[0]
  
  // Sync current state with active tab
  useEffect(() => {
    if (activeTab) {
      setFinalPreviews(activeTab.finalPreviews)
      setDesignSettings(activeTab.designSettings)
      setSelectedDesignImages(activeTab.selectedDesignImages)
      setDrawingImageUrl(activeTab.drawingImageUrl)
      setAiPrompt(activeTab.aiPrompt)
      setCapturedImage(activeTab.originalImage)
      
      // Only start camera if tab has no content (no image and no designs)
      if (!activeTab.originalImage && activeTab.finalPreviews.length === 0) {
        setTimeout(() => {
          startCamera()
        }, 100)
      } else {
        // If tab has an image or designs, stop camera
        stopCamera()
      }
    }
  }, [activeTabId])
  
  // Update active tab when state changes
  useEffect(() => {
    setDesignTabs(tabs => tabs.map(tab => 
      tab.id === activeTabId 
        ? {
            ...tab,
            finalPreviews,
            designSettings,
            selectedDesignImages,
            drawingImageUrl,
            aiPrompt,
            originalImage: capturedImage
          }
        : tab
    ))
  }, [finalPreviews, designSettings, selectedDesignImages, drawingImageUrl, aiPrompt, capturedImage, activeTabId])
  
  // Add new tab
  const addNewTab = () => {
    const newId = String(designTabs.length + 1)
    const newTab: DesignTab = {
      id: newId,
      name: `Design ${newId}`,
      finalPreviews: [],
      designSettings: {
        nailLength: 'medium',
        nailShape: 'oval',
        baseColor: '#FF6B9D',
        finish: 'glossy',
        texture: 'smooth',
        patternType: 'solid',
        styleVibe: 'elegant',
        accentColor: '#FFFFFF'
      },
      selectedDesignImages: [],
      drawingImageUrl: null,
      aiPrompt: '',
      originalImage: null
    }
    setDesignTabs([...designTabs, newTab])
    setActiveTabId(newId)
    
    // Start camera for new tab since it has no image
    setTimeout(() => {
      startCamera()
    }, 100)
  }
  
  // Remove tab
  const removeTab = (tabId: string) => {
    if (designTabs.length === 1) return // Don't remove last tab
    
    const newTabs = designTabs.filter(tab => tab.id !== tabId)
    setDesignTabs(newTabs)
    
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id)
    }
  }
  const abortControllerRef = useRef<AbortController | null>(null)

  // Check for user session and existing tabs on mount
  useEffect(() => {
    const initializePage = async () => {
      // Ensure user data is in localStorage
      const userStr = localStorage.getItem("ivoryUser")
      if (!userStr) {
        try {
          const sessionRes = await fetch('/api/auth/session')
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            if (sessionData.user) {
              localStorage.setItem("ivoryUser", JSON.stringify(sessionData.user))
              console.log('User session restored from API')
            } else {
              console.error('No user session found')
              router.push("/")
              return
            }
          }
        } catch (error) {
          console.error('Failed to fetch user session:', error)
          router.push("/")
          return
        }
      }

      // Check for existing tabs
      const savedTabs = localStorage.getItem("captureSession_designTabs")
      const savedActiveTabId = localStorage.getItem("captureSession_activeTabId")
      
      if (savedTabs) {
        try {
          const tabs = JSON.parse(savedTabs)
          // Check if any tab has content (original image or generated designs)
          const hasContent = tabs.some((tab: DesignTab) => tab.originalImage || tab.finalPreviews.length > 0)
          
          if (hasContent) {
            setDesignTabs(tabs)
            if (savedActiveTabId) {
              setActiveTabId(savedActiveTabId)
            }
            console.log('Restored design tabs from session:', tabs)
            
            // Find the active tab and check if it needs camera
            const activeTabToRestore = tabs.find((t: DesignTab) => t.id === savedActiveTabId) || tabs[0]
            // Only start camera if the active tab has no content (no image AND no designs)
            if (!activeTabToRestore.originalImage && activeTabToRestore.finalPreviews.length === 0) {
              setTimeout(() => startCamera(), 100)
            }
            // If tab has content, don't start camera at all
            return
          }
        } catch (e) {
          console.error('Error parsing saved tabs:', e)
        }
      }
      
      // No existing tabs with content, start camera
      startCamera()
    }

    initializePage()
    
    return () => {
      stopCamera()
      if (zoomIndicatorTimeoutRef.current) {
        clearTimeout(zoomIndicatorTimeoutRef.current)
      }
    }
  }, [])

  // Save design tabs whenever they change
  useEffect(() => {
    localStorage.setItem("captureSession_designTabs", JSON.stringify(designTabs))
    console.log('Saved design tabs to session')
  }, [designTabs])

  // Save active tab ID whenever it changes
  useEffect(() => {
    localStorage.setItem("captureSession_activeTabId", activeTabId)
  }, [activeTabId])

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

  const generateAIPreview = async (settings: DesignSettings) => {
    if (!capturedImage) return
    
    // Check credits before generating
    if (!hasCredits(1)) {
      toast.error('Insufficient credits', {
        description: 'You need 1 credit to generate a design. Refer friends to earn more!',
        action: {
          label: 'Get Credits',
          onClick: () => router.push('/settings/credits'),
        },
      })
      return
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    
    setIsGenerating(true)
    setGenerationProgress(0)
    
    // Simulate progress updates - 70 seconds to reach 95%
    // Update every 500ms, so 140 updates total
    // 95% / 140 updates = ~0.68% per update
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) return prev
        // Gradually slow down as we approach 95%
        const increment = (95 - prev) * 0.015 + 0.3
        return Math.min(prev + increment, 95)
      })
    }, 500)
    
    try {
      const prompt = buildPrompt(settings)
      
      // Build weights for Nail Editor
      const weights = {
        designImage: influenceWeights.nailEditor_designImage,
        stylePrompt: 0, // Not used in Nail Editor
        baseColor: influenceWeights.nailEditor_baseColor,
        finish: influenceWeights.nailEditor_finish,
        texture: influenceWeights.nailEditor_texture,
        nailLength: 100,
        nailShape: 100
      }
      
      const response = await fetch('/api/generate-nail-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          originalImage: capturedImage,
          selectedDesignImages: selectedDesignImages,
          drawingImageUrl: drawingImageUrl,
          influenceWeights: weights
        }),
        signal: abortControllerRef.current.signal
      })

      if (response.ok) {
        setGenerationProgress(100)
        const { imageUrl, imageUrls, creditsRemaining } = await response.json()
        // Use imageUrls if available (new format), fallback to imageUrl for backward compatibility
        const images = imageUrls || [imageUrl]
        setFinalPreviews(images)
        setFinalPreview(images[0]) // Set first image as primary for backward compatibility
        
        // Refresh credits display
        refreshCredits()
        
        // Auto-save the designs
        await autoSaveDesigns(images)
      } else {
        const error = await response.json()
        toast.error('Generation failed', {
          description: error.error || 'Failed to generate design',
        })
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation cancelled by user')
      } else {
        console.error('Error generating AI preview:', error)
      }
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
      setGenerationProgress(0)
      abortControllerRef.current = null
    }
  }

  const cancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsGenerating(false)
      setGenerationProgress(0)
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

  // Auto-set design mode to 'design' on mount
  useEffect(() => {
    if (capturedImage && !designMode) {
      setDesignMode('design')
    }
  }, [capturedImage, designMode])

  const generateAIDesigns = async () => {
    if (!aiPrompt.trim()) return

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()

    setIsGenerating(true)
    setGenerationProgress(0)
    
    // Simulate progress updates - 70 seconds to reach 95%
    // Update every 500ms, so 140 updates total
    // 95% / 140 updates = ~0.68% per update
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) return prev
        // Gradually slow down as we approach 95%
        const increment = (95 - prev) * 0.015 + 0.3
        return Math.min(prev + increment, 95)
      })
    }, 500)
    
    try {
      const response = await fetch('/api/analyze-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
        signal: abortControllerRef.current.signal
      })

      if (response.ok) {
        setGenerationProgress(100)
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
      clearInterval(progressInterval)
      setIsGenerating(false)
      setGenerationProgress(0)
      abortControllerRef.current = null
    }
  }

  const handleDesignSelect = (designUrl: string) => {
    setSelectedDesignImages([...selectedDesignImages, designUrl])
    handleNailEditorDesignImageInfluence(100)
  }

  const handleDesignUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check if adding these files would exceed max (5 images)
    if (selectedDesignImages.length + files.length > 5) {
      toast.error('Maximum 5 design images', {
        description: 'You can upload up to 5 reference images',
      })
      return
    }

    setIsGenerating(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/analyze-design-image', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          return data.imageUrl
        }
        return null
      })

      const uploadedUrls = (await Promise.all(uploadPromises)).filter(url => url !== null) as string[]
      
      if (uploadedUrls.length > 0) {
        setSelectedDesignImages([...selectedDesignImages, ...uploadedUrls])
        handleNailEditorDesignImageInfluence(100)
        toast.success(`${uploadedUrls.length} design image${uploadedUrls.length > 1 ? 's' : ''} uploaded!`)
      }
    } catch (error) {
      console.error('Error uploading design:', error)
      toast.error('Failed to upload images')
    } finally {
      setIsGenerating(false)
    }
  }

  const removeDesignImage = (imageUrl: string) => {
    setSelectedDesignImages(selectedDesignImages.filter(url => url !== imageUrl))
    if (selectedDesignImages.length === 1) {
      // Last image being removed, reset influence
      handleNailEditorDesignImageInfluence(0)
    }
  }

  const applyDesign = async () => {
    await generateAIPreview(designSettings)
  }

  const autoSaveDesigns = async (images: string[]) => {
    console.log('autoSaveDesigns called with images:', images)
    console.log('autoSaveDesigns called with capturedImage:', capturedImage)
    
    if (!images || images.length === 0) {
      console.error('No designs available to save')
      return false
    }

    try {
      let userStr = localStorage.getItem("ivoryUser")
      
      // If user data is missing, try to fetch it from session
      if (!userStr) {
        console.log('User data missing, fetching from session...')
        try {
          const sessionRes = await fetch('/api/auth/session')
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            if (sessionData.user) {
              localStorage.setItem("ivoryUser", JSON.stringify(sessionData.user))
              userStr = JSON.stringify(sessionData.user)
              console.log('User session restored')
            }
          }
        } catch (error) {
          console.error('Failed to fetch user session:', error)
        }
      }
      
      if (!userStr) {
        console.error('No user found in localStorage')
        toast.error('Session expired', {
          description: 'Please log in again to save your designs',
        })
        router.push("/")
        return false
      }

      const user = JSON.parse(userStr)
      console.log(`Auto-saving ${images.length} design(s) for user:`, user.id)
      
      // Show loading toast
      const loadingToast = toast.loading(`Saving ${images.length} design${images.length > 1 ? 's' : ''}...`)
      
      // Save all designs
      const savePromises = images.map((imageUrl, index) => {
        const payload = {
          userId: user.id,
          title: `Design ${new Date().toLocaleDateString()}${images.length > 1 ? ` (${index + 1})` : ''}`,
          imageUrl: imageUrl,
          originalImageUrl: capturedImage,
          designSettings,
          aiPrompt: aiPrompt || null,
          isPublic: false,
        }
        
        console.log(`Sending save request for design ${index + 1}:`, payload)
        
        return fetch('/api/looks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      })

      const responses = await Promise.all(savePromises)

      // Dismiss loading toast
      toast.dismiss(loadingToast)

      // Check if all saves were successful
      const allSuccessful = responses.every(response => response.ok)
      const successCount = responses.filter(response => response.ok).length

      console.log(`Save results: ${successCount}/${images.length} successful`)

      if (allSuccessful) {
        toast.success(`${images.length} design${images.length > 1 ? 's' : ''} saved! 🎉`, {
          description: 'Redirecting to your collection...',
          duration: 2000,
        })
        
        // Clear session data after successful save
        localStorage.removeItem("captureSession_designTabs")
        localStorage.removeItem("captureSession_activeTabId")
        
        // Small delay to show the success message, then redirect
        setTimeout(() => {
          // Redirect based on user type
          if (user.userType === 'tech') {
            router.push("/tech/dashboard?tab=designs")
          } else {
            router.push("/home")
          }
          router.refresh()
        }, 1500)
        return true
      } else if (successCount > 0) {
        toast.success(`${successCount} of ${images.length} designs saved`, {
          description: 'Redirecting to your collection...',
        })
        
        // Clear session data after partial save
        localStorage.removeItem("captureSession_designTabs")
        localStorage.removeItem("captureSession_activeTabId")
        
        setTimeout(() => {
          // Redirect based on user type
          if (user.userType === 'tech') {
            router.push("/tech/dashboard?tab=designs")
          } else {
            router.push("/home")
          }
          router.refresh()
        }, 1500)
        return true
      } else {
        const error = await responses[0].json()
        console.error('Failed to save designs:', error)
        toast.error('Failed to save designs', {
          description: error.error || 'Please try again',
        })
        return false
      }
    } catch (error) {
      console.error('Error saving designs:', error)
      toast.error('An error occurred while saving', {
        description: 'Please check your connection and try again',
      })
      return false
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
        if (selectedDesignImages.length > 0) {
          localStorage.setItem("selectedDesignImages", JSON.stringify(selectedDesignImages))
        }
      }
      router.push("/editor")
    }
  }

  const changePhoto = () => {
    // Clear the current tab's data
    setDesignTabs(tabs => tabs.map(tab => 
      tab.id === activeTabId 
        ? {
            ...tab,
            originalImage: null,
            finalPreviews: [],
            selectedDesignImages: [],
            drawingImageUrl: null
          }
        : tab
    ))
    
    // Clear current state
    setCapturedImage(null)
    setFinalPreview(null)
    setFinalPreviews([])
    setSelectedDesignImages([])
    setGeneratedDesigns([])
    setDesignMode(null)
    setDrawingImageUrl(null)
    
    // Start camera for new photo
    startCamera()
  }

  const handleDrawingComplete = (dataUrl: string) => {
    setDrawingImageUrl(dataUrl)
    setShowDrawingCanvas(false)
    toast.success('Drawing saved!', {
      description: 'Your drawing will guide the AI design generation',
    })
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
      <div className="fixed inset-0 z-[100] bg-white flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 pt-14 px-4 sm:px-6 pb-4 z-10 bg-white border-b border-[#E8E8E8]">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={changePhoto}
              className="h-10 px-3 sm:px-4 border border-[#E8E8E8] text-[#1A1A1A] font-light text-xs tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" strokeWidth={1} />
              <span className="hidden sm:inline">Change</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <h1 className="font-serif text-base sm:text-xl font-light text-[#1A1A1A] tracking-tight hidden xs:block">
                Design Your Nails
              </h1>
              <div className="flex items-center">
                <CreditsDisplay showLabel={true} credits={credits} />
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {designTabs.map((tab) => (
              <div key={tab.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTabId(tab.id)}
                  className={`h-8 px-3 font-light text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                    activeTabId === tab.id
                      ? 'bg-[#1A1A1A] text-white'
                      : 'border border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F8F7F5]'
                  }`}
                >
                  {tab.name}
                  {tab.finalPreviews.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 ${
                      activeTabId === tab.id ? 'bg-white/20' : 'bg-[#F8F7F5]'
                    }`}>
                      {tab.finalPreviews.length}
                    </span>
                  )}
                </button>
                {designTabs.length > 1 && (
                  <button
                    onClick={() => removeTab(tab.id)}
                    className="w-6 h-6 border border-[#E8E8E8] text-[#6B6B6B] hover:bg-[#F8F7F5] hover:text-[#1A1A1A] transition-all duration-300 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" strokeWidth={1} />
                  </button>
                )}
              </div>
            ))}
            {designTabs.length < 5 && (
              <button
                onClick={addNewTab}
                className="h-8 px-3 border border-[#E8E8E8] text-[#1A1A1A] font-light text-xs tracking-wider uppercase hover:bg-[#F8F7F5] transition-all duration-300 flex items-center gap-1 whitespace-nowrap"
              >
                <span className="text-lg leading-none">+</span>
                New
              </button>
            )}
          </div>
        </div>

        {/* Image Preview - Original on left, generated thumbnails on right */}
        <div className="pt-32 pb-4 px-4 overflow-y-auto" style={{ height: 'calc(65vh - 80px)', minHeight: '400px' }}>
          <div className="max-w-2xl mx-auto h-full">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
                {/* Original Image */}
                <div className="relative overflow-hidden border border-[#E8E8E8] group h-full bg-white">
                  <div className="relative bg-[#F8F7F5] h-full">
                    <Image src={capturedImage} alt="Original" fill className="object-contain" />
                    {/* Change Photo Overlay */}
                    <button
                      onClick={changePhoto}
                      className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 active:scale-95"
                    >
                      <div className="bg-white p-4">
                        <Upload className="w-7 h-7 text-[#1A1A1A]" strokeWidth={1} />
                      </div>
                    </button>
                    {/* Label */}
                    <div className="absolute top-3 left-3 bg-white border border-[#E8E8E8] px-3 py-1.5">
                      <span className="text-xs font-light tracking-wider uppercase text-[#1A1A1A]">Original</span>
                    </div>
                    {/* Draw Button */}
                    <button
                      onClick={() => setShowDrawingCanvas(true)}
                      className="absolute bottom-3 right-3 bg-[#2D7A4F] hover:bg-[#2D7A4F]/90 text-white p-3 active:scale-95 transition-all"
                      title={drawingImageUrl ? 'Drawing added - click to edit' : 'Draw on image'}
                    >
                      <Pencil className="w-5 h-5" strokeWidth={1} />
                    </button>
                  </div>
                </div>

                {/* Preview Placeholder or Generated Thumbnails */}
                <div className="relative overflow-hidden border border-[#E8E8E8] h-full bg-white">
                  {finalPreviews.length > 0 ? (
                    /* Show generated images as thumbnails */
                    <div className="relative bg-[#F8F7F5] h-full p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-light tracking-wider uppercase text-[#1A1A1A]">AI Designs</div>
                        <div className="bg-white border border-[#E8E8E8] px-2.5 py-1">
                          <span className="text-xs font-light text-[#1A1A1A]">{finalPreviews.length}</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
                        {finalPreviews.map((imageUrl, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageModal(imageUrl)}
                            className="relative overflow-hidden border border-[#E8E8E8] hover:border-[#8B7355] transition-all active:scale-95 aspect-[3/2] group"
                          >
                            <Image src={imageUrl} alt={`Design ${index + 1}`} fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="bg-white p-2.5 border border-[#E8E8E8]">
                                <Sparkles className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-[#F8F7F5] flex items-center justify-center h-full">
                      {isGenerating ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                      {/* Dimmed GIF Background */}
                      <div className="absolute inset-0 opacity-30">
                        <Image 
                          src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGdkNWtib3JrcXhvcHFiaHdraHR5aDJsN3Bzcmx2ajZyNWJlemM1biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ljj4pInW5JllK/giphy.gif"
                          alt="Generating..."
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjZlOXJvZThrOXpndThicm83NXM5N2V4cWpjaXFkNXQ1MHNiZ2dwaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QaDc2Wn7tfLFu/giphy.gif") {
                              target.src = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjZlOXJvZThrOXpndThicm83NXM5N2V4cWpjaXFkNXQ1MHNiZ2dwaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QaDc2Wn7tfLFu/giphy.gif";
                            }
                          }}
                        />
                      </div>
                      
                      {/* Loading Overlay with Percentage */}
                      <div className="relative z-10 flex flex-col items-center justify-center gap-4 px-6">
                        {/* Circular Progress */}
                        <div className="relative w-32 h-32">
                          {/* Background Circle */}
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="rgba(255, 255, 255, 0.2)"
                              strokeWidth="8"
                              fill="none"
                            />
                            {/* Progress Circle */}
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="url(#gradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 56}`}
                              strokeDashoffset={`${2 * Math.PI * 56 * (1 - generationProgress / 100)}`}
                              className="transition-all duration-300 ease-out"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF6B9D" />
                                <stop offset="100%" stopColor="#C44569" />
                              </linearGradient>
                            </defs>
                          </svg>
                          
                          {/* Percentage Text */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl font-bold text-white drop-shadow-lg">
                                {Math.round(generationProgress)}%
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Loading Text */}
                        <div className="text-center">
                          <p className="text-white font-semibold text-lg drop-shadow-lg mb-1">
                            Creating Your Design
                          </p>
                          <p className="text-white/80 text-sm drop-shadow">
                            This may take a moment...
                          </p>
                        </div>
                        
                        {/* Animated Sparkles */}
                        <div className="flex gap-2">
                          <Sparkles className="w-5 h-5 text-white animate-pulse" style={{ animationDelay: '0ms' }} />
                          <Sparkles className="w-5 h-5 text-white animate-pulse" style={{ animationDelay: '150ms' }} />
                          <Sparkles className="w-5 h-5 text-white animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                      ) : (
                        <div className="text-center px-4">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#8B7355]" strokeWidth={1} />
                          <p className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase">
                            Configure design below
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Image Modal */}
        {selectedImageModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImageModal(null)}
          >
            <div className="relative max-w-5xl w-full max-h-[90vh]">
              {/* Close button */}
              <button
                onClick={() => setSelectedImageModal(null)}
                className="absolute -top-14 right-0 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Image */}
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-2xl">
                <Image 
                  src={selectedImageModal} 
                  alt="Design Preview" 
                  fill 
                  className="object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Image info */}
              <div className="mt-4 text-center" onClick={(e) => e.stopPropagation()}>
                <p className="text-white/80 text-sm font-medium">Tap outside to close</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Drawer */}
        <div className="fixed left-0 right-0 bg-white border-t border-[#E8E8E8] z-20 touch-action-pan-y" style={{ bottom: '80px', height: 'calc(35vh - 80px)', minHeight: '240px', maxHeight: '370px' }}>
          <div className="max-w-2xl mx-auto h-full flex flex-col">
            <div className="h-1 w-16 bg-[#E8E8E8] mx-auto my-3 flex-shrink-0"></div>

            <div className="w-full flex-1 flex flex-col overflow-hidden">
              {(designMode === 'design' || designMode === null) && (
                <div className="p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
                  {/* Low Credits Warning */}
                  {credits !== null && credits <= 2 && credits > 0 && (
                    <div className="bg-[#FFF9E6] border border-[#E8E8E8] p-4 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 border border-[#E8E8E8] bg-white flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">⚠️</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#1A1A1A] font-light tracking-wider uppercase mb-1 text-xs">Low on credits!</p>
                          <p className="text-[#6B6B6B] text-xs leading-relaxed font-light">
                            You have {credits} credit{credits !== 1 ? 's' : ''} left. 
                            <button 
                              onClick={() => router.push('/settings/credits')}
                              className="underline ml-1 hover:text-[#1A1A1A]"
                            >
                              Get more
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No Credits Warning */}
                  {credits !== null && credits === 0 && (
                    <div className="bg-[#FFF0F0] border border-[#E8E8E8] p-4 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 border border-[#E8E8E8] bg-white flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">❌</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#1A1A1A] font-light tracking-wider uppercase mb-1 text-xs">No credits remaining</p>
                          <p className="text-[#6B6B6B] text-xs leading-relaxed font-light">
                            Refer 3 friends to earn 1 free credit!
                            <button 
                              onClick={() => router.push('/settings/credits')}
                              className="underline ml-1 hover:text-[#1A1A1A]"
                            >
                              Learn more
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generate Preview Button */}
                  {!isGenerating ? (
                    <button 
                      onClick={() => generateAIPreview(designSettings)} 
                      className="w-full h-12 bg-[#1A1A1A] text-white font-light text-sm tracking-wider uppercase hover:bg-[#1A1A1A]/90 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                      disabled={!hasCredits(1)}
                    >
                      <Sparkles className="w-5 h-5" strokeWidth={1} />
                      Generate Preview
                      {credits !== null && (
                        <span className="ml-2 text-xs opacity-80 font-light">
                          (1 credit)
                        </span>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={cancelGeneration}
                      className="w-full h-12 border border-[#E8E8E8] text-[#1A1A1A] font-light text-sm tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" strokeWidth={1} />
                      Cancel Generation
                    </button>
                  )}

                  {/* Drawing Status */}
                  {drawingImageUrl && (
                    <div className="bg-[#F0FFF4] border border-[#E8E8E8] p-4 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 border border-[#E8E8E8] bg-white flex items-center justify-center flex-shrink-0">
                          <Pencil className="w-4 h-4 text-[#2D7A4F]" strokeWidth={1} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[#1A1A1A] font-light tracking-wider uppercase mb-1 text-xs">Drawing added</p>
                          <p className="text-[#6B6B6B] text-xs leading-relaxed font-light">
                            Your drawing will guide the AI to create designs following your outline
                          </p>
                        </div>
                        <button
                          onClick={() => setDrawingImageUrl(null)}
                          className="text-[#6B6B6B] hover:text-[#1A1A1A]"
                        >
                          <X className="w-5 h-5" strokeWidth={1} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upload Design Image */}
                  <button 
                    onClick={() => designUploadRef.current?.click()}
                    className="w-full h-11 border border-[#E8E8E8] text-[#1A1A1A] font-light text-xs tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                    disabled={isGenerating || selectedDesignImages.length >= 5}
                  >
                    <Upload className="w-4 h-4" strokeWidth={1} />
                    Upload Design Images ({selectedDesignImages.length}/5)
                  </button>

                  {/* Uploaded Design Previews with Influence Control */}
                  {selectedDesignImages.length > 0 && (
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'design-images' ? null : 'design-images')}
                        className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-border bg-white/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-md active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex -space-x-2">
                            {selectedDesignImages.slice(0, 3).map((img, idx) => (
                              <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                <Image src={img} alt={`Design ${idx + 1}`} fill className="object-cover" />
                              </div>
                            ))}
                            {selectedDesignImages.length > 3 && (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta to-rose flex items-center justify-center border-2 border-white shadow-sm">
                                <span className="text-white text-xs font-bold">+{selectedDesignImages.length - 3}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-bold text-charcoal mb-0.5">{selectedDesignImages.length} Design{selectedDesignImages.length > 1 ? 's' : ''}</p>
                            <p className="text-xs text-muted-foreground">Tap to adjust influence</p>
                          </div>
                          <span className="text-sm font-bold text-white bg-gradient-to-r from-terracotta to-rose px-3 py-1.5 rounded-full shadow-sm">{influenceWeights.nailEditor_designImage}%</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ml-2 ${expandedSection === 'design-images' ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedSection === 'design-images' && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
                          {/* Design Images Grid */}
                          <div className="grid grid-cols-3 gap-2">
                            {selectedDesignImages.map((img, idx) => (
                              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                <Image src={img} alt={`Design ${idx + 1}`} fill className="object-cover" />
                                <button
                                  onClick={() => removeDesignImage(img)}
                                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          
                          {/* Influence Slider */}
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-medium text-muted-foreground">Design Images</label>
                            <span className="text-xs font-bold text-primary">{influenceWeights.nailEditor_designImage}%</span>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 h-2 rounded-full" style={{
                              background: 'linear-gradient(to right, #e0e0e0 0%, #9b59b6 50%, #8e44ad 100%)',
                              top: '50%',
                              transform: 'translateY(-50%)'
                            }} />
                            <Slider
                              value={[influenceWeights.nailEditor_designImage]}
                              onValueChange={(value) => handleNailEditorDesignImageInfluence(value[0])}
                              min={0}
                              max={100}
                              step={5}
                              className="w-full relative z-10"
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Base Color: {influenceWeights.nailEditor_baseColor}%
                          </p>
                          <button
                            onClick={() => setSelectedDesignImages([])}
                            className="w-full mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove All Design Images
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-[#E8E8E8] pt-4">
                    <p className="text-xs font-light text-[#6B6B6B] uppercase tracking-widest mb-4">Design Parameters</p>

                    {/* Nail Length - Collapsible */}
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'length' ? null : 'length')}
                        className="w-full flex items-center justify-between p-3 border border-[#E8E8E8] bg-white hover:border-[#8B7355] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-light text-[#1A1A1A] tracking-wide">Nail Length</span>
                          <span className="text-xs text-[#6B6B6B] capitalize font-light">{designSettings.nailLength.replace('-', ' ')}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#6B6B6B] transition-transform ${expandedSection === 'length' ? 'rotate-180' : ''}`} strokeWidth={1} />
                      </button>
                      {expandedSection === 'length' && (
                        <div className="mt-2 p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
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
                                className={`flex flex-col items-center justify-end p-2 border transition-all ${
                                  designSettings.nailLength === length.value
                                    ? 'border-[#8B7355] bg-white'
                                    : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]'
                                }`}
                              >
                                <div className={`w-4 ${length.height} bg-[#8B7355] mb-1.5`} />
                                <span className="text-[10px] font-light text-[#1A1A1A]">{length.label}</span>
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
                        className="w-full flex items-center justify-between p-3 border border-[#E8E8E8] bg-white hover:border-[#8B7355] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-light text-[#1A1A1A] tracking-wide">Nail Shape</span>
                          <span className="text-xs text-[#6B6B6B] capitalize font-light">{designSettings.nailShape}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#6B6B6B] transition-transform ${expandedSection === 'shape' ? 'rotate-180' : ''}`} strokeWidth={1} />
                      </button>
                      {expandedSection === 'shape' && (
                        <div className="mt-2 p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
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
                                className={`flex flex-col items-center p-2 border transition-all ${
                                  designSettings.nailShape === shape.value
                                    ? 'border-[#8B7355] bg-white'
                                    : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]'
                                }`}
                              >
                                <svg viewBox="0 0 24 24" className="w-6 h-10 mb-1">
                                  <path d={shape.path} fill="currentColor" className="text-[#8B7355]" />
                                </svg>
                                <span className="text-[10px] font-light text-[#1A1A1A]">{shape.label}</span>
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
                        className="w-full flex items-center justify-between p-3 border border-[#E8E8E8] bg-white hover:border-[#8B7355] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-light text-[#1A1A1A] tracking-wide">Base Color</span>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 border border-[#E8E8E8]"
                              style={{ backgroundColor: designSettings.baseColor }}
                            />
                            <span className="text-xs text-[#6B6B6B] font-light">{designSettings.baseColor}</span>
                          </div>
                        </div>
                        <span className="text-xs font-light text-[#1A1A1A] bg-[#F8F7F5] border border-[#E8E8E8] px-2 py-1 mr-2">{influenceWeights.nailEditor_baseColor}%</span>
                        <ChevronDown className={`w-4 h-4 text-[#6B6B6B] transition-transform ${expandedSection === 'color' ? 'rotate-180' : ''}`} strokeWidth={1} />
                      </button>
                      {expandedSection === 'color' && (
                        <div className="mt-2 space-y-3 p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
                          <div>
                            <label className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase mb-1.5 block">Hue</label>
                            <div className="relative">
                              <div className="absolute inset-0 h-2 rounded-full" style={{
                                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                                top: '50%',
                                transform: 'translateY(-50%)'
                              }} />
                              <Slider
                                value={[hexToHsl(designSettings.baseColor).hue]}
                                onValueChange={handleHueChange}
                                max={360}
                                step={1}
                                className="w-full relative z-10"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-[#6B6B6B] font-light tracking-wider uppercase mb-1.5 block">Lightness</label>
                            <div className="relative">
                              <div className="absolute inset-0 h-2 rounded-full" style={{
                                background: 'linear-gradient(to right, #1a1a1a 0%, #808080 50%, #ffffff 100%)',
                                top: '50%',
                                transform: 'translateY(-50%)'
                              }} />
                              <Slider
                                value={[colorLightness]}
                                onValueChange={handleLightnessChange}
                                max={100}
                                min={10}
                                step={1}
                                className="w-full relative z-10"
                              />
                            </div>
                          </div>
                          <div className="border-t border-[#E8E8E8] pt-3">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-xs font-light tracking-wider uppercase text-[#6B6B6B]">Base Color</label>
                              <span className="text-xs font-light text-[#1A1A1A]">{influenceWeights.nailEditor_baseColor}%</span>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-0 h-2 rounded-full" style={{
                                background: 'linear-gradient(to right, #e0e0e0 0%, #FF6B9D 50%, #FF1493 100%)',
                                top: '50%',
                                transform: 'translateY(-50%)'
                              }} />
                              <Slider
                                value={[influenceWeights.nailEditor_baseColor]}
                                onValueChange={(value) => handleNailEditorBaseColorInfluence(value[0])}
                                min={0}
                                max={100}
                                step={5}
                                className="w-full relative z-10"
                              />
                            </div>
                            <p className="text-[10px] text-[#6B6B6B] font-light mt-1">
                              {selectedDesignImages.length > 0 && `Design Images: ${influenceWeights.nailEditor_designImage}%`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Finish - Collapsible */}
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'finish' ? null : 'finish')}
                        className="w-full flex items-center justify-between p-3 border border-[#E8E8E8] bg-white hover:border-[#8B7355] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-light text-[#1A1A1A] tracking-wide">Finish</span>
                          <span className="text-xs text-[#6B6B6B] capitalize font-light">{designSettings.finish}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#6B6B6B] transition-transform ${expandedSection === 'finish' ? 'rotate-180' : ''}`} strokeWidth={1} />
                      </button>
                      {expandedSection === 'finish' && (
                        <div className="mt-2 p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
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
                                className={`flex flex-col items-center p-2 border transition-all ${
                                  designSettings.finish === finish.value
                                    ? 'border-[#8B7355] bg-white'
                                    : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]'
                                }`}
                              >
                                <div className={`w-full h-12 ${finish.gradient} mb-1.5`} />
                                <span className="text-[10px] font-light text-[#1A1A1A]">{finish.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Texture - Collapsible */}
                    <div className="mb-3">
                      <button
                        onClick={() => setExpandedSection(expandedSection === 'texture' ? null : 'texture')}
                        className="w-full flex items-center justify-between p-3 border border-[#E8E8E8] bg-white hover:border-[#8B7355] transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-light text-[#1A1A1A] tracking-wide">Texture</span>
                          <span className="text-xs text-[#6B6B6B] capitalize font-light">{designSettings.texture}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-[#6B6B6B] transition-transform ${expandedSection === 'texture' ? 'rotate-180' : ''}`} strokeWidth={1} />
                      </button>
                      {expandedSection === 'texture' && (
                        <div className="mt-2 p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
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
                                className={`flex flex-col items-center p-2 border transition-all ${
                                  designSettings.texture === texture.value
                                    ? 'border-[#8B7355] bg-white'
                                    : 'border-[#E8E8E8] bg-white hover:border-[#8B7355]'
                                }`}
                              >
                                <div className={`w-full h-12 ${texture.pattern} mb-1.5 ${texture.value === 'glitter' ? 'animate-pulse' : ''}`} 
                                  style={texture.value === 'textured' ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,.05) 2px, rgba(0,0,0,.05) 4px)' } : {}}
                                />
                                <span className="text-[10px] font-light text-[#1A1A1A]">{texture.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}


            </div>
            <input
              ref={designUploadRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleDesignUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav onCenterAction={changePhoto} centerActionLabel="Capture" />

        {/* Drawing Canvas Modal */}
        {showDrawingCanvas && capturedImage && (
          <DrawingCanvas
            imageUrl={capturedImage}
            onSave={handleDrawingComplete}
            onClose={() => setShowDrawingCanvas(false)}
          />
        )}
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
