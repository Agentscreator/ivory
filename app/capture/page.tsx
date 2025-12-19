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
  
  // Check localStorage immediately for loaded design to prevent camera flash
  const getInitialCapturedImage = () => {
    if (typeof window === 'undefined') return null
    const loadedImage = localStorage.getItem("currentEditingImage")
    if (loadedImage) {
      console.log('🎯 Found initial captured image in localStorage')
      console.log('🎯 Image length:', loadedImage.length)
      return loadedImage
    }
    console.log('❌ No initial captured image found')
    return null
  }
  
  const [capturedImage, setCapturedImage] = useState<string | null>(getInitialCapturedImage())
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
  
  // Debug: Log capturedImage whenever it changes
  useEffect(() => {
    console.log('📸 capturedImage changed:', capturedImage ? `${capturedImage.substring(0, 50)}... (length: ${capturedImage.length})` : 'NULL')
  }, [capturedImage])
  
  // Debug: Log selectedDesignImages whenever it changes
  useEffect(() => {
    console.log('🎨 selectedDesignImages changed:', selectedDesignImages.length, selectedDesignImages)
  }, [selectedDesignImages])
  const [finalPreview, setFinalPreview] = useState<string | null>(null)
  const [finalPreviews, setFinalPreviews] = useState<string[]>([])
  const [colorLightness, setColorLightness] = useState(65) // 0-100 for lightness (matches initial color)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null)
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false)
  const [drawingImageUrl, setDrawingImageUrl] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true) // Track if we're still initializing
  
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
    // Don't sync during initial load - let the initialization logic handle it
    if (isInitializing) return
    
    if (activeTab) {
      setFinalPreviews(activeTab.finalPreviews)
      setDesignSettings(activeTab.designSettings)
      setSelectedDesignImages(activeTab.selectedDesignImages)
      setDrawingImageUrl(activeTab.drawingImageUrl)
      setAiPrompt(activeTab.aiPrompt)
      setCapturedImage(activeTab.originalImage)
      
      // Stop camera when switching to a tab that has content
      if (activeTab.originalImage || activeTab.finalPreviews.length > 0) {
        stopCamera()
      }
    }
  }, [activeTabId, isInitializing])
  
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
    
    // Auto-start camera for new tab
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
  const hasLoadedDesignRef = useRef(false) // Track if we've loaded a design to prevent double-loading
  const isInitialLoadRef = useRef(true) // Track if we're in initial load to prevent premature saves

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

      // Check for loaded design metadata (from edit)
      console.log('=== CAPTURE PAGE INIT DEBUG ===')
      const loadedMetadata = localStorage.getItem("loadedDesignMetadata")
      const loadedEditingImage = localStorage.getItem("currentEditingImage")
      const loadedPreview = localStorage.getItem("generatedPreview")
      
      console.log('Checking localStorage:')
      console.log('- loadedMetadata:', loadedMetadata ? 'EXISTS' : 'NULL')
      console.log('- loadedEditingImage:', loadedEditingImage ? 'EXISTS' : 'NULL')
      console.log('- loadedPreview:', loadedPreview ? 'EXISTS' : 'NULL')
      console.log('- hasLoadedDesignRef:', hasLoadedDesignRef.current)
      
      if (loadedMetadata && loadedEditingImage && !hasLoadedDesignRef.current) {
        try {
          hasLoadedDesignRef.current = true // Mark as loaded to prevent double-loading
          
          const metadata = JSON.parse(loadedMetadata)
          console.log('✅ Loading design metadata for editing:', metadata)
          console.log('✅ selectedDesignImages from metadata:', metadata.selectedDesignImages)
          
          // Create a new tab with the loaded design
          const newTab: DesignTab = {
            id: '1',
            name: 'Edit',
            finalPreviews: loadedPreview ? [loadedPreview] : [],
            designSettings: metadata.designSettings || designSettings,
            selectedDesignImages: metadata.selectedDesignImages || [],
            drawingImageUrl: metadata.drawingImageUrl || null,
            aiPrompt: metadata.aiPrompt || '',
            originalImage: loadedEditingImage
          }
          
          // Save to session storage IMMEDIATELY so tab restoration logic sees it
          localStorage.setItem("captureSession_designTabs", JSON.stringify([newTab]))
          localStorage.setItem("captureSession_activeTabId", '1')
          console.log('✅ Saved loaded design to session storage')
          
          setDesignTabs([newTab])
          setActiveTabId('1')
          setCapturedImage(loadedEditingImage)
          console.log('✅ Set capturedImage to:', loadedEditingImage?.substring(0, 50) + '...')
          setDesignSettings(metadata.designSettings || designSettings)
          setSelectedDesignImages(metadata.selectedDesignImages || [])
          console.log('✅ Set selectedDesignImages to:', metadata.selectedDesignImages || [])
          setDrawingImageUrl(metadata.drawingImageUrl || null)
          setAiPrompt(metadata.aiPrompt || '')
          setFinalPreviews(loadedPreview ? [loadedPreview] : [])
          
          if (metadata.influenceWeights) {
            setInfluenceWeights(metadata.influenceWeights)
          }
          if (metadata.handReference) {
            setHandReference(metadata.handReference)
          }
          if (metadata.designMode) {
            setDesignMode(metadata.designMode)
          }
          if (metadata.colorLightness !== undefined) {
            setColorLightness(metadata.colorLightness)
          }
          
          // Set initializing to false immediately so UI updates
          setIsInitializing(false)
          
          // Don't clear localStorage immediately - React Strict Mode will remount
          // Clear it after a longer delay to allow for remounts
          setTimeout(() => {
            localStorage.removeItem("loadedDesignMetadata")
            localStorage.removeItem("currentEditingImage")
            localStorage.removeItem("generatedPreview")
            console.log('✅ Cleared localStorage after loading')
          }, 2000) // Increased delay to 2 seconds
          
          toast.success('Design loaded for editing!')
          console.log('✅ Design has content, camera will NOT start')
          
          // Mark initial load as complete after a short delay
          setTimeout(() => {
            isInitialLoadRef.current = false
          }, 200)
          
          return
        } catch (e) {
          console.error('Error loading design metadata:', e)
          hasLoadedDesignRef.current = false // Reset on error
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
            console.log('✅ Restored design tabs from session:', tabs)
            
            // Find the active tab and check if it needs camera
            const activeTabToRestore = tabs.find((t: DesignTab) => t.id === savedActiveTabId) || tabs[0]
            // Only start camera if the active tab has no content (no image AND no designs)
            if (!activeTabToRestore.originalImage && activeTabToRestore.finalPreviews.length === 0) {
              console.log('⚠️ Active tab has no content, starting camera')
              setTimeout(() => startCamera(), 100)
            } else {
              console.log('✅ Active tab has content, NOT starting camera')
            }
            
            // Mark initial load as complete
            setTimeout(() => {
              isInitialLoadRef.current = false
              setIsInitializing(false)
            }, 200)
            
            return
          }
        } catch (e) {
          console.error('Error parsing saved tabs:', e)
        }
      }
      
      // No existing tabs with content - auto-start camera
      console.log('⚠️ No saved tabs with content, starting camera')
      startCamera()
      
      // Mark initial load as complete
      setTimeout(() => {
        isInitialLoadRef.current = false
        setIsInitializing(false)
      }, 200)
    }

    initializePage()
    
    return () => {
      stopCamera()
      if (zoomIndicatorTimeoutRef.current) {
        clearTimeout(zoomIndicatorTimeoutRef.current)
      }
    }
  }, [])

  // Save design tabs whenever they change (but skip during initial load)
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      localStorage.setItem("captureSession_designTabs", JSON.stringify(designTabs))
      console.log('Saved design tabs to session')
    }
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
        // Create comprehensive metadata for remix/edit functionality
        const designMetadata = {
          designSettings,
          selectedDesignImages,
          drawingImageUrl,
          aiPrompt: aiPrompt || null,
          influenceWeights,
          handReference,
          designMode,
          colorLightness,
        }
        
        const payload = {
          userId: user.id,
          title: `Design ${new Date().toLocaleDateString()}${images.length > 1 ? ` (${index + 1})` : ''}`,
          imageUrl: imageUrl,
          originalImageUrl: capturedImage,
          designSettings,
          aiPrompt: aiPrompt || null,
          designMetadata, // Store all settings for remix/edit
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



  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    )
  }

  if (capturedImage) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#F8F7F5] via-white to-white flex flex-col">
        {/* Elegant Header */}
        <div className="absolute top-0 left-0 right-0 pt-12 sm:pt-14 px-4 sm:px-8 lg:px-12 pb-5 sm:pb-6 z-10 bg-white/95 backdrop-blur-md border-b border-[#E8E8E8]/50 transition-all duration-500">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div className="flex items-center gap-3 sm:gap-4">
                <h1 className="font-serif text-lg sm:text-2xl lg:text-3xl font-light text-[#1A1A1A] tracking-[-0.01em] leading-tight">
                  Design Your Nails
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                <button
                  onClick={changePhoto}
                  className="h-10 sm:h-11 px-4 sm:px-6 border border-[#E8E8E8] text-[#1A1A1A] font-light text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:bg-[#F8F7F5] hover:border-[#8B7355] active:scale-[0.98] transition-all duration-500 flex items-center gap-2 rounded-none"
                >
                  <Upload className="w-4 h-4" strokeWidth={1} />
                  <span className="hidden sm:inline">Change Photo</span>
                  <span className="sm:hidden">Change</span>
                </button>
                <div className="flex items-center">
                  <CreditsDisplay showLabel={true} credits={credits} />
                </div>
              </div>
            </div>
            
            {/* Elegant Tabs */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:justify-end scrollbar-hide">
              {designTabs.map((tab) => (
                <div key={tab.id} className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setActiveTabId(tab.id)}
                    className={`h-9 sm:h-10 px-4 sm:px-5 font-light text-[10px] sm:text-[11px] tracking-[0.2em] uppercase transition-all duration-500 flex items-center gap-2 whitespace-nowrap rounded-none ${
                      activeTabId === tab.id
                        ? 'bg-[#1A1A1A] text-white shadow-sm'
                        : 'border border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F8F7F5] hover:border-[#8B7355]'
                    }`}
                  >
                    {tab.name}
                    {tab.finalPreviews.length > 0 && (
                      <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-sm ${
                        activeTabId === tab.id ? 'bg-white/20' : 'bg-[#F8F7F5]'
                      }`}>
                        {tab.finalPreviews.length}
                      </span>
                    )}
                  </button>
                  {designTabs.length > 1 && (
                    <button
                      onClick={() => removeTab(tab.id)}
                      className="w-7 h-7 sm:w-8 sm:h-8 border border-[#E8E8E8] text-[#6B6B6B] hover:bg-[#F8F7F5] hover:text-[#1A1A1A] hover:border-[#8B7355] transition-all duration-500 flex items-center justify-center rounded-none"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1} />
                    </button>
                  )}
                </div>
              ))}
              {designTabs.length < 5 && (
                <button
                  onClick={addNewTab}
                  className="h-9 sm:h-10 px-4 sm:px-5 border border-[#E8E8E8] text-[#1A1A1A] font-light text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:bg-[#F8F7F5] hover:border-[#8B7355] transition-all duration-500 flex items-center gap-2 whitespace-nowrap rounded-none"
                >
                  <span className="text-base sm:text-lg leading-none">+</span>
                  <span className="hidden sm:inline">New Design</span>
                  <span className="sm:hidden">New</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Elegant Image Preview Section - Side by Side */}
        <div 
          className="pt-36 sm:pt-40 lg:pt-44 pb-4 sm:pb-6 px-4 sm:px-8 lg:px-12 overflow-y-auto transition-all duration-700" 
          style={{ 
            height: expandedSection ? 'calc(35vh - 80px)' : 'calc(65vh - 80px)', 
            minHeight: expandedSection ? '220px' : '420px' 
          }}
        >
          <div className="max-w-6xl mx-auto h-full">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 h-full">
                {/* Original Image Card */}
                <div className="relative overflow-hidden border border-[#E8E8E8]/50 group h-full bg-white shadow-sm hover:shadow-lg transition-all duration-700 rounded-sm animate-fade-in">
                  <div className="relative bg-gradient-to-br from-[#F8F7F5] to-white h-full">
                    <Image src={capturedImage} alt="Original" fill className="object-contain p-2 sm:p-4 md:p-6 transition-transform duration-700 group-hover:scale-[1.02]" />
                    {/* Elegant Change Photo Overlay */}
                    <button
                      onClick={changePhoto}
                      className="absolute inset-0 bg-black/0 hover:bg-black/60 transition-all duration-700 flex items-center justify-center opacity-0 group-hover:opacity-100 active:scale-[0.98]"
                    >
                      <div className="bg-white p-3 sm:p-5 md:p-6 shadow-2xl transform group-hover:scale-105 transition-transform duration-500 rounded-sm">
                        <Upload className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#1A1A1A]" strokeWidth={0.8} />
                      </div>
                    </button>
                    {/* Elegant Draw Button */}
                    <button
                      onClick={() => setShowDrawingCanvas(true)}
                      className="absolute bottom-2 sm:bottom-4 md:bottom-5 right-2 sm:right-4 md:right-5 bg-[#2D7A4F] hover:bg-[#2D7A4F]/90 text-white p-2 sm:p-3 md:p-4 active:scale-[0.95] transition-all duration-500 shadow-lg hover:shadow-xl rounded-sm"
                      title={drawingImageUrl ? 'Drawing added - click to edit' : 'Draw on image'}
                    >
                      <Pencil className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1} />
                    </button>
                  </div>
                </div>

                {/* AI Designs Card - Side by Side */}
                <div className="relative overflow-hidden border border-[#E8E8E8]/50 h-full bg-white shadow-sm hover:shadow-lg transition-all duration-700 rounded-sm animate-fade-in-delayed">
                  {finalPreviews.length > 0 ? (
                    /* Generated Designs Gallery */
                    <div className="relative bg-gradient-to-br from-[#F8F7F5] to-white h-full p-2 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 md:gap-4">
                      <div className="flex items-center justify-end">
                        <div className="bg-[#1A1A1A] text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 shadow-sm rounded-sm">
                          <span className="text-[10px] sm:text-xs md:text-sm font-light tracking-wider">{finalPreviews.length}</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2 sm:gap-3 md:gap-4 overflow-y-auto scrollbar-hide">
                        {finalPreviews.map((imageUrl, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageModal(imageUrl)}
                            className="relative overflow-hidden border border-[#E8E8E8]/50 hover:border-[#8B7355] transition-all duration-500 active:scale-[0.98] aspect-[3/2] group shadow-sm hover:shadow-md rounded-sm animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <Image src={imageUrl} alt={`Design ${index + 1}`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="bg-white p-2 sm:p-3 md:p-4 border border-[#E8E8E8]/50 shadow-lg transform group-hover:scale-110 transition-transform duration-500 rounded-sm">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#8B7355]" strokeWidth={1} />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative bg-gradient-to-br from-[#F8F7F5] to-white flex items-center justify-center h-full">
                      {isGenerating ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                      {/* Elegant Loading State */}
                      <div className="absolute inset-0 opacity-20">
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
                      
                      {/* Elegant Progress Indicator */}
                      <div className="relative z-10 flex flex-col items-center justify-center gap-6 sm:gap-8 px-6">
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="50%"
                              cy="50%"
                              r="45%"
                              stroke="rgba(255, 255, 255, 0.3)"
                              strokeWidth="6"
                              fill="none"
                            />
                            <circle
                              cx="50%"
                              cy="50%"
                              r="45%"
                              stroke="url(#gradient)"
                              strokeWidth="6"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 64}`}
                              strokeDashoffset={`${2 * Math.PI * 64 * (1 - generationProgress / 100)}`}
                              className="transition-all duration-500 ease-out"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8B7355" />
                                <stop offset="100%" stopColor="#1A1A1A" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl sm:text-5xl font-serif font-light text-white drop-shadow-2xl">
                                {Math.round(generationProgress)}%
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center space-y-2">
                          <p className="text-white font-light text-base sm:text-lg drop-shadow-lg tracking-wide">
                            Creating Your Design
                          </p>
                          <p className="text-white/70 text-xs sm:text-sm drop-shadow font-light tracking-wider">
                            This may take a moment...
                          </p>
                        </div>
                        
                        <div className="flex gap-3">
                          <Sparkles className="w-5 h-5 text-white animate-pulse" style={{ animationDelay: '0ms' }} />
                          <Sparkles className="w-5 h-5 text-white animate-pulse" style={{ animationDelay: '200ms' }} />
                          <Sparkles className="w-5 h-5 text-white animate-pulse" style={{ animationDelay: '400ms' }} />
                        </div>
                      </div>
                    </div>
                      ) : (
                        <div className="text-center px-6 space-y-4">
                          <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-[#8B7355]" strokeWidth={0.8} />
                          <p className="text-xs sm:text-sm text-[#6B6B6B] font-light tracking-[0.15em] uppercase">
                            Configure Your Design Below
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
S
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

        {/* Elegant Bottom Drawer with Mobile Optimization */}
        <div 
          className="fixed left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8E8E8]/50 z-20 touch-action-pan-y transition-all duration-500 shadow-2xl" 
          style={{ 
            bottom: '80px', 
            height: expandedSection ? 'calc(65vh - 80px)' : 'calc(35vh - 80px)', 
            minHeight: expandedSection ? '400px' : '240px', 
            maxHeight: expandedSection ? '600px' : '370px' 
          }}
        >
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Elegant Drag Handle */}
            <div className="h-1.5 w-20 bg-[#E8E8E8] rounded-full mx-auto my-4 flex-shrink-0 transition-all duration-300 hover:bg-[#8B7355]"></div>

            <div className="w-full flex-1 flex flex-col overflow-hidden">
              {(designMode === 'design' || designMode === null) && (
                <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 overflow-y-auto overscroll-contain flex-1 scrollbar-hide">
                  {/* Low Credits Warning */}
                  {credits !== null && credits <= 2 && credits > 0 && (
                    <div className="bg-gradient-to-r from-[#FFF9E6] to-[#FFF9E6]/50 border border-[#E8E8E8]/50 p-4 sm:p-5 text-sm rounded-sm shadow-sm animate-fade-in">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 border border-[#E8E8E8] bg-white flex items-center justify-center flex-shrink-0 rounded-sm shadow-sm">
                          <span className="text-lg sm:text-xl">⚠️</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#1A1A1A] font-light tracking-[0.15em] uppercase mb-2 text-[10px] sm:text-xs">Low on credits!</p>
                          <p className="text-[#6B6B6B] text-xs sm:text-sm leading-relaxed font-light">
                            You have {credits} credit{credits !== 1 ? 's' : ''} left. 
                            <button 
                              onClick={() => router.push('/settings/credits')}
                              className="underline ml-1 hover:text-[#1A1A1A] transition-colors duration-300"
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
                    <div className="bg-gradient-to-r from-[#FFF0F0] to-[#FFF0F0]/50 border border-[#E8E8E8]/50 p-4 sm:p-5 text-sm rounded-sm shadow-sm animate-fade-in">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 border border-[#E8E8E8] bg-white flex items-center justify-center flex-shrink-0 rounded-sm shadow-sm">
                          <span className="text-lg sm:text-xl">❌</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[#1A1A1A] font-light tracking-[0.15em] uppercase mb-2 text-[10px] sm:text-xs">No credits remaining</p>
                          <p className="text-[#6B6B6B] text-xs sm:text-sm leading-relaxed font-light">
                            Refer 3 friends to earn 1 free credit!
                            <button 
                              onClick={() => router.push('/settings/credits')}
                              className="underline ml-1 hover:text-[#1A1A1A] transition-colors duration-300"
                            >
                              Learn more
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Elegant Generate Preview Button */}
                  {!isGenerating ? (
                    <button 
                      onClick={() => generateAIPreview(designSettings)} 
                      className="w-full h-12 sm:h-14 bg-[#1A1A1A] text-white font-light text-[11px] sm:text-sm tracking-[0.2em] uppercase hover:bg-[#8B7355] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!hasCredits(1)}
                    >
                      <Sparkles className="w-5 h-5" strokeWidth={1} />
                      Generate Preview
                      {credits !== null && (
                        <span className="ml-2 text-[10px] sm:text-xs opacity-70 font-light">
                          (1 credit)
                        </span>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={cancelGeneration}
                      className="w-full h-12 sm:h-14 border border-[#E8E8E8] text-[#1A1A1A] font-light text-[11px] sm:text-sm tracking-[0.2em] uppercase hover:bg-[#F8F7F5] hover:border-[#8B7355] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 sm:gap-3 rounded-sm"
                    >
                      <X className="w-5 h-5" strokeWidth={1} />
                      Cancel Generation
                    </button>
                  )}

                  {/* Drawing Status */}
                  {drawingImageUrl && (
                    <div className="bg-gradient-to-r from-[#F0FFF4] to-[#F0FFF4]/50 border border-[#E8E8E8]/50 p-4 sm:p-5 text-sm rounded-sm shadow-sm animate-fade-in">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 border border-[#E8E8E8] bg-white flex items-center justify-center flex-shrink-0 rounded-sm shadow-sm">
                          <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-[#2D7A4F]" strokeWidth={1} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[#1A1A1A] font-light tracking-[0.15em] uppercase mb-2 text-[10px] sm:text-xs">Drawing added</p>
                          <p className="text-[#6B6B6B] text-xs sm:text-sm leading-relaxed font-light">
                            Your drawing will guide the AI to create designs following your outline
                          </p>
                        </div>
                        <button
                          onClick={() => setDrawingImageUrl(null)}
                          className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors duration-300 p-1"
                        >
                          <X className="w-5 h-5" strokeWidth={1} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Elegant Upload Design Image Button */}
                  <button 
                    onClick={() => designUploadRef.current?.click()}
                    className="w-full h-11 sm:h-12 border border-[#E8E8E8] text-[#1A1A1A] font-light text-[10px] sm:text-[11px] tracking-[0.2em] uppercase hover:bg-[#F8F7F5] hover:border-[#8B7355] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-2 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isGenerating || selectedDesignImages.length >= 5}
                  >
                    <Upload className="w-4 h-4" strokeWidth={1} />
                    <span className="hidden sm:inline">Upload Design Images</span>
                    <span className="sm:hidden">Upload Images</span>
                    <span className="text-[10px] opacity-70">({selectedDesignImages.length}/5)</span>
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
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#1A1A1A] via-black to-[#1A1A1A]">
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
          className="w-full h-full object-cover transition-all duration-500"
          style={{
            transform: `${facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'} scale(${zoom})`,
            filter: 'brightness(1.08) contrast(1.08) saturate(1.15)',
            opacity: isFlipping ? 0 : 1,
            transition: 'transform 0.3s ease-out, opacity 0.5s ease-out',
          }}
        />

        {/* Hand Reference Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[5] overflow-visible">
          <style jsx>{`
            @keyframes elegant-pulse {
              0%, 100% { opacity: 0.4; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.02); }
            }
            .hand-outline {
              animation: elegant-pulse 3s ease-in-out infinite;
            }
          `}</style>
          <img
            src={`/ref${handReference}.png`}
            alt="Hand reference"
            className="hand-outline w-full h-full object-contain transition-all duration-700"
            style={{
              transform: `scale(${handReference === 1 ? 1.8 : handReference === 3 ? 3.05 : 2.9})`,
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.6)) brightness(1.1)',
            }}
          />
        </div>

        {isFlipping && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] to-black flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 animate-fade-in">
              <Loader2 className="w-10 h-10 text-white animate-spin" strokeWidth={1.5} />
              <p className="text-white/80 text-sm font-light tracking-[0.2em] uppercase">Switching Camera</p>
            </div>
          </div>
        )}

        {/* Elegant Top Bar */}
        <div className="absolute top-0 left-0 right-0 pt-12 sm:pt-14 px-4 sm:px-6 pb-5 flex items-center justify-between z-10 bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur-sm">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-500 shadow-lg active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-white font-serif text-base sm:text-lg font-light tracking-[0.25em] uppercase">Capture</div>
          
          <div className="flex items-center">
            <CreditsDisplay showLabel={false} credits={credits} />
          </div>
        </div>

        {/* Elegant Zoom Indicator */}
        {showZoomIndicator && zoom > 1 && (
          <div className="absolute top-28 sm:top-32 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-500 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full flex items-center space-x-3 shadow-2xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-light text-sm tracking-wider">{zoom.toFixed(1)}×</span>
            </div>
          </div>
        )}

        {/* Elegant Right Side Controls */}
        <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-4 animate-fade-in-delayed">
          {/* Flip Camera Button */}
          <button
            onClick={flipCamera}
            disabled={isFlipping}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full backdrop-blur-md border flex flex-col items-center justify-center transition-all duration-500 active:scale-95 ${
              facingMode === "environment"
                ? "bg-white/95 border-white/50 text-[#1A1A1A] shadow-2xl"
                : "bg-white/10 border-white/20 hover:bg-white/20 text-white shadow-xl"
            } ${isFlipping ? "opacity-50" : ""}`}
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Hand Reference Toggle - Right Arrow */}
          <button
            onClick={() => setHandReference(handReference === 3 ? 2 : handReference === 2 ? 1 : 3)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white shadow-xl flex flex-col items-center justify-center transition-all duration-500 active:scale-95"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Elegant Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 pb-8 sm:pb-10 pt-8 px-6 z-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-500 shadow-xl flex items-center justify-center active:scale-95"
            >
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>

            <button
              onClick={capturePhoto}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-500 active:scale-95 shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f7f5 100%)',
                border: '5px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-inner"></div>
            </button>

            <div className="w-14 sm:w-16"></div>
          </div>
          
          {/* Elegant Instruction Text */}
          <div className="text-center mt-6 animate-fade-in">
            <p className="text-white/70 text-xs sm:text-sm font-light tracking-[0.15em] uppercase">
              Position your hand in the frame
            </p>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
    </div>
  )
}
