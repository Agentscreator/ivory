"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Save, Palette, Sparkles, Upload, Loader2 } from "lucide-react"
import Image from "next/image"

type Nail = {
  id: number
  x: number
  y: number
  selected: boolean
  color: string
}

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

type InfluenceWeights = {
  designImage: number
  stylePrompt: number
  manualParams: number
}

const baseColors = ["#FF6B9D", "#C44569", "#A8E6CF", "#FFD93D", "#6C5CE7", "#E17055", "#FDCB6E", "#74B9FF"]

export default function EditorPage() {
  const router = useRouter()
  const [image, setImage] = useState<string | null>(null)
  const [nails, setNails] = useState<Nail[]>([])
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDesigns, setGeneratedDesigns] = useState<string[]>([])
  const [selectedDesignImage, setSelectedDesignImage] = useState<string | null>(null)
  const [dalleImage, setDalleImage] = useState<string | null>(null)
  const [expandedImage, setExpandedImage] = useState<'original' | 'dalle' | null>(null)
  const [isGeneratingDalle, setIsGeneratingDalle] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Design settings
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

  // Influence weights (0-100%)
  const [influenceWeights, setInfluenceWeights] = useState<InfluenceWeights>({
    designImage: 100,
    stylePrompt: 50,
    manualParams: 100
  })

  useEffect(() => {
    const savedImage = localStorage.getItem("currentEditingImage")
    if (savedImage) {
      // If it's a data URL, upload to R2 first
      if (savedImage.startsWith('data:')) {
        uploadOriginalImage(savedImage)
      } else {
        // It's already a URL (from R2 or elsewhere)
        setImage(savedImage)
      }
      setNails([
        { id: 1, x: 30, y: 40, selected: false, color: "#FF6B9D" },
        { id: 2, x: 45, y: 35, selected: false, color: "#FF6B9D" },
        { id: 3, x: 60, y: 30, selected: false, color: "#FF6B9D" },
        { id: 4, x: 72, y: 35, selected: false, color: "#FF6B9D" },
        { id: 5, x: 85, y: 42, selected: false, color: "#FF6B9D" },
      ])
    }
  }, [])

  const uploadOriginalImage = async (dataUrl: string) => {
    try {
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      const formData = new FormData()
      formData.append('file', blob, `original-${Date.now()}.jpg`)
      formData.append('type', 'image')
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (uploadResponse.ok) {
        const { url } = await uploadResponse.json()
        setImage(url)
      } else {
        // Fallback to data URL if upload fails
        setImage(dataUrl)
      }
    } catch (error) {
      console.error('Error uploading original image:', error)
      // Fallback to data URL if upload fails
      setImage(dataUrl)
    }
  }

  const buildPrompt = (settings: DesignSettings) => {
    return `Ultra-detailed, high-resolution nail art design applied ONLY inside a fingernail area. Nail length: ${settings.nailLength}, Nail shape: ${settings.nailShape}. Base color: ${settings.baseColor}. Finish: ${settings.finish}. Texture: ${settings.texture}. Design style: ${settings.patternType} pattern, ${settings.styleVibe} aesthetic. Accent color: ${settings.accentColor}. Highly realistic nail polish appearance: smooth polish, crisp clean edges, even color distribution, professional salon quality with maximum detail, subtle natural reflections. Design must: stay strictly within the nail surface, follow realistic nail curvature, respect nail boundaries, appear physically painted onto the nail with expert precision. Ultra-high resolution rendering, realistic lighting, natural skin reflection preserved, sharp details, vibrant colors with accurate saturation.`
  }

  // Generate AI preview using gpt-image-1-mini
  // This applies design settings to the user's actual hand image
  // Called from: Design tab (settings change), AI Designs tab (after selection), Upload tab (after upload)
  const generateAIPreview = async (settings: DesignSettings, selectedImage?: string) => {
    setIsGeneratingDalle(true)
    try {
      const prompt = buildPrompt(settings)
      
      // API route uses gpt-image-1-mini for fast, real-time preview generation
      const response = await fetch('/api/generate-nail-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          originalImage: image,
          selectedDesignImage: selectedImage || selectedDesignImage,
          influenceWeights
        }),
      })

      if (response.ok) {
        const { imageUrl } = await response.json()
        setDalleImage(imageUrl)
      }
    } catch (error) {
      console.error('Error generating AI preview:', error)
    } finally {
      setIsGeneratingDalle(false)
    }
  }

  const handleDesignSettingChange = (key: keyof DesignSettings, value: string) => {
    const newSettings = { ...designSettings, [key]: value }
    setDesignSettings(newSettings)
    generateAIPreview(newSettings)
  }

  // Generate AI design concepts using gpt-4o-mini + gpt-image-1
  // Step 1: gpt-4o-mini analyzes prompt and extracts design parameters
  // Step 2: gpt-image-1 generates 3 standalone design concept images
  // These are NOT applied to the user's hand yet - just inspiration/reference
  const generateAIDesigns = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)
    try {
      // API route uses gpt-4o-mini for prompt analysis + gpt-image-1 for concept generation
      const response = await fetch('/api/analyze-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })

      if (response.ok) {
        const { designs, inferredSettings } = await response.json()
        setGeneratedDesigns(designs)
        
        // Update design settings based on AI inference
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

  // When user selects an AI-generated design concept
  // Now we use gpt-image-1-mini to apply that design to their actual hand
  const handleDesignSelect = async (designUrl: string) => {
    setSelectedDesignImage(designUrl)
    // This calls gpt-image-1-mini to apply the selected design to the user's hand
    await generateAIPreview(designSettings, designUrl)
  }

  // Handle custom design image upload
  // Step 1: Upload to R2 storage (NO AI MODEL USED)
  // Step 2: Use gpt-image-1-mini to apply uploaded design to user's hand
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('=== STARTING FILE UPLOAD ===')
    console.log('File name:', file.name)
    console.log('File size:', file.size, 'bytes')
    console.log('File type:', file.type)

    setIsGenerating(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('Sending request to /api/analyze-design-image...')

      // Upload to R2 storage (no AI model used here)
      const response = await fetch('/api/analyze-design-image', {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        const { imageUrl } = data
        
        console.log('=== DESIGN UPLOAD RESULT ===')
        console.log('Uploaded Image URL:', imageUrl)
        console.log('===========================')
        
        setSelectedDesignImage(imageUrl)
        
        // Now use gpt-image-1-mini to apply uploaded design to user's hand
        await generateAIPreview(designSettings, imageUrl)
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', errorData)
      }
    } catch (error) {
      console.error('Error uploading design:', error)
    } finally {
      setIsGenerating(false)
      console.log('Upload process complete')
    }
  }

  const handleSave = async () => {
    try {
      const userStr = localStorage.getItem("ivoryUser")
      if (!userStr) {
        router.push("/")
        return
      }

      const user = JSON.parse(userStr)
      
      // dalleImage is now a permanent R2 URL from the backend
      const finalImageUrl = dalleImage || image || "/placeholder.svg"
      
      const response = await fetch('/api/looks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: `Design ${new Date().toLocaleDateString()}`,
          imageUrl: finalImageUrl,
          originalImageUrl: image,
          designSettings,
          aiPrompt: aiPrompt || null,
          isPublic: false,
        }),
      })

      if (response.ok) {
        router.push("/home")
      } else {
        alert('Failed to save design')
      }
    } catch (error) {
      console.error('Error saving look:', error)
      alert('An error occurred while saving')
    }
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="active:scale-95 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-lg sm:text-xl font-bold text-charcoal">Design Editor</h1>
          </div>
          <Button onClick={handleSave} className="h-9 sm:h-10 active:scale-95 transition-transform">
            <Save className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </header>

      {/* Main Canvas - Side by Side Images */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-[450px]">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Original Image */}
          <button
            onClick={() => setExpandedImage(expandedImage === 'original' ? null : 'original')}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
              expandedImage === 'original' ? 'border-primary shadow-xl' : 'border-border'
            }`}
          >
            <div className="aspect-[3/4] relative bg-white">
              <Image src={image} alt="Original" fill className="object-cover" />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs py-2 text-center font-semibold">
              Original
            </div>
          </button>

          {/* DALL-E Generated Image */}
          <button
            onClick={() => setExpandedImage(expandedImage === 'dalle' ? null : 'dalle')}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
              expandedImage === 'dalle' ? 'border-primary shadow-xl' : 'border-border'
            }`}
          >
            <div className="aspect-[3/4] relative bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              {isGeneratingDalle ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Generating...</p>
                </div>
              ) : dalleImage ? (
                <Image src={dalleImage} alt="AI Generated" fill className="object-cover" />
              ) : (
                <div className="text-center px-4">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Configure design to generate AI preview</p>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs py-2 text-center font-semibold">
              AI Preview
            </div>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-center text-muted-foreground mb-4 px-4">
          Tap images to expand • Configure design below
        </p>
      </main>

      {/* Bottom Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border rounded-t-3xl shadow-2xl safe-bottom z-20">
        <div className="max-w-2xl mx-auto">
          <div className="h-1 w-12 bg-border rounded-full mx-auto my-2 sm:my-3"></div>

          <Tabs defaultValue="design" className="w-full">
            <TabsList className="w-full justify-start px-4 sm:px-6 bg-transparent border-b rounded-none h-12 sm:h-14 overflow-x-auto">
              <TabsTrigger value="design" className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                Design
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                AI Designs
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="p-4 sm:p-6 space-y-4 max-h-80 overflow-y-auto">
              {/* Influence Weights Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 space-y-4 border border-purple-200">
                <h4 className="text-sm font-bold text-charcoal">Design Influence Controls</h4>
                
                {/* Design Image Weight */}
                {selectedDesignImage && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-charcoal">Design Image</label>
                      <span className="text-xs font-bold text-primary">{influenceWeights.designImage}%</span>
                    </div>
                    <Slider
                      value={[influenceWeights.designImage]}
                      onValueChange={(value) => setInfluenceWeights(prev => ({ ...prev, designImage: value[0] }))}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {influenceWeights.designImage === 0 ? 'Ignore uploaded image' : 
                       influenceWeights.designImage === 100 ? 'Follow image exactly' : 
                       'Blend with other inputs'}
                    </p>
                  </div>
                )}

                {/* Style Prompt Weight */}
                {aiPrompt && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-charcoal">Style Description</label>
                      <span className="text-xs font-bold text-primary">{influenceWeights.stylePrompt}%</span>
                    </div>
                    <Slider
                      value={[influenceWeights.stylePrompt]}
                      onValueChange={(value) => setInfluenceWeights(prev => ({ ...prev, stylePrompt: value[0] }))}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {influenceWeights.stylePrompt === 0 ? 'Ignore text prompt' : 
                       influenceWeights.stylePrompt === 100 ? 'Follow description strongly' : 
                       'Blend with other inputs'}
                    </p>
                  </div>
                )}

                {/* Manual Parameters Weight */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-charcoal">Manual Settings</label>
                    <span className="text-xs font-bold text-primary">{influenceWeights.manualParams}%</span>
                  </div>
                  <Slider
                    value={[influenceWeights.manualParams]}
                    onValueChange={(value) => setInfluenceWeights(prev => ({ ...prev, manualParams: value[0] }))}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {influenceWeights.manualParams === 0 ? 'Ignore manual settings' : 
                     influenceWeights.manualParams === 100 ? 'Full priority to settings' : 
                     'Use as general guidance'}
                  </p>
                </div>
              </div>

              {/* Nail Length */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-charcoal mb-2 block">Nail Length</label>
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
              <div>
                <label className="text-xs sm:text-sm font-semibold text-charcoal mb-2 block">Nail Shape</label>
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

              {/* Base Color */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-charcoal mb-2 block">Base Color</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {baseColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleDesignSettingChange('baseColor', color)}
                      className={`w-12 h-12 rounded-full border-4 transition-all flex-shrink-0 ${
                        designSettings.baseColor === color ? "border-primary scale-110" : "border-white"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Finish */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-charcoal mb-2 block">Finish</label>
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
              <div>
                <label className="text-xs sm:text-sm font-semibold text-charcoal mb-2 block">Texture</label>
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

              <Button 
                onClick={() => generateAIPreview(designSettings)} 
                className="w-full"
                disabled={isGeneratingDalle}
              >
                {isGeneratingDalle ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate Preview
              </Button>
            </TabsContent>

            <TabsContent value="ai" className="p-4 sm:p-6 max-h-80 overflow-y-auto space-y-4">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal mb-1.5 sm:mb-2">Describe your style</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  AI will analyze your prompt and generate design options
                </p>

                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="e.g. minimalist floral with pink tones..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
                    onKeyDown={(e) => e.key === "Enter" && generateAIDesigns()}
                  />
                  <Button onClick={generateAIDesigns} disabled={isGenerating || !aiPrompt.trim()} className="h-11 sm:h-12 px-3 sm:px-4">
                    {isGenerating ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </Button>
                </div>

                {isGenerating && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Analyzing and generating designs...</p>
                  </div>
                )}

                {generatedDesigns.length > 0 && (
                  <div className="space-y-3">
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
              </div>
            </TabsContent>

            <TabsContent value="upload" className="p-4 max-h-80 overflow-y-auto">
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-terracotta to-rose flex items-center justify-center">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Upload Custom Design</h3>
                <p className="text-sm text-muted-foreground mb-4">AI will analyze and apply it to your nails</p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
