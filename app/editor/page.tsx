"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Palette, Sparkles, Upload, Loader2 } from "lucide-react"
import Image from "next/image"

type Nail = {
  id: number
  x: number
  y: number
  selected: boolean
  color: string
}

const colorPalettes = {
  classic: ["#FF6B9D", "#C44569", "#A8E6CF", "#FFD93D", "#6C5CE7"],
  seasonal: ["#E17055", "#FDCB6E", "#74B9FF", "#A29BFE", "#FD79A8"],
  branded: ["#2C3E50", "#E74C3C", "#3498DB", "#F39C12", "#16A085"],
}

export default function EditorPage() {
  const router = useRouter()
  const [image, setImage] = useState<string | null>(null)
  const [nails, setNails] = useState<Nail[]>([])
  const [selectedColor, setSelectedColor] = useState("#FF6B9D")
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDesigns, setGeneratedDesigns] = useState<string[]>([])
  const [dalleImage, setDalleImage] = useState<string | null>(null)
  const [expandedImage, setExpandedImage] = useState<'original' | 'dalle' | null>(null)
  const [isGeneratingDalle, setIsGeneratingDalle] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const savedImage = localStorage.getItem("currentEditingImage")
    if (savedImage) {
      setImage(savedImage)
      // Mock nail positions (in a real app, this would use MediaPipe)
      setNails([
        { id: 1, x: 30, y: 40, selected: false, color: "#FF6B9D" },
        { id: 2, x: 45, y: 35, selected: false, color: "#FF6B9D" },
        { id: 3, x: 60, y: 30, selected: false, color: "#FF6B9D" },
        { id: 4, x: 72, y: 35, selected: false, color: "#FF6B9D" },
        { id: 5, x: 85, y: 42, selected: false, color: "#FF6B9D" },
      ])
    }
  }, [])

  const handleNailClick = (nailId: number) => {
    setNails(
      nails.map((nail) => {
        if (nail.id === nailId) {
          return { ...nail, selected: !nail.selected, color: nail.selected ? nail.color : selectedColor }
        }
        return nail
      }),
    )
  }

  const applyColorToSelected = async (color: string) => {
    setSelectedColor(color)
    setNails(nails.map((nail) => (nail.selected ? { ...nail, color } : nail)))
    
    // Generate DALL-E preview when color is applied
    await generateDallePreview(color)
  }

  const generateDallePreview = async (color?: string) => {
    setIsGeneratingDalle(true)
    try {
      const selectedNails = nails.filter(n => n.selected)
      const prompt = `Professional nail art design on human hand, ${selectedNails.length} nails painted with ${color || selectedColor} color, realistic photography, high quality, studio lighting`
      
      const response = await fetch('/api/generate-nail-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, originalImage: image }),
      })

      if (response.ok) {
        const { imageUrl } = await response.json()
        setDalleImage(imageUrl)
      }
    } catch (error) {
      console.error('Error generating DALL-E preview:', error)
    } finally {
      setIsGeneratingDalle(false)
    }
  }

  const generateAIDesign = async () => {
    if (!aiPrompt.trim()) return

    setIsGenerating(true)
    try {
      // Simulate AI generation - in production this would call an AI API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock generated designs
      const mockDesigns = ["/abstract-nail-art-design.jpg", "/floral-pattern-nails.jpg", "/geometric-nail-design.jpg"]

      setGeneratedDesigns(mockDesigns)
    } catch (error) {
      console.error("Error generating design:", error)
    } finally {
      setIsGenerating(false)
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
      
      // Save look to database
      const response = await fetch('/api/looks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: `Design ${new Date().toLocaleDateString()}`,
          imageUrl: image || "/placeholder.svg",
          originalImageUrl: image,
          nailPositions: nails,
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
              <Image src={image || "/placeholder.svg"} alt="Original" fill className="object-cover" />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
              {/* Nail overlay indicators */}
              {nails.map((nail) => (
                <button
                  type="button"
                  key={nail.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNailClick(nail.id)
                  }}
                  className={`absolute w-6 h-6 rounded-full border-2 transition-all active:scale-110 ${
                    nail.selected ? "border-white scale-125" : "border-white/60"
                  }`}
                  style={{
                    left: `${nail.x}%`,
                    top: `${nail.y}%`,
                    backgroundColor: nail.color,
                    transform: nail.selected ? "scale(1.25)" : "scale(1)",
                  }}
                />
              ))}
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
                  <p className="text-xs text-muted-foreground">Select colors to generate AI preview</p>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs py-2 text-center font-semibold">
              AI Preview
            </div>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-center text-muted-foreground mb-4 px-4">
          Tap images to expand • Select nails and choose colors below
        </p>
      </main>

      {/* Bottom Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border rounded-t-3xl shadow-2xl safe-bottom z-20">
        <div className="max-w-2xl mx-auto">
          <div className="h-1 w-12 bg-border rounded-full mx-auto my-2 sm:my-3"></div>

          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="w-full justify-start px-4 sm:px-6 bg-transparent border-b rounded-none h-12 sm:h-14 overflow-x-auto">
              <TabsTrigger value="colors" className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                Colors
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

            <TabsContent value="colors" className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-h-80 overflow-y-auto">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-charcoal mb-2.5 sm:mb-3">Classic Palette</h3>
                <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2">
                  {colorPalettes.classic.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => applyColorToSelected(color)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 transition-all active:scale-110 flex-shrink-0 ${
                        selectedColor === color ? "border-primary scale-110" : "border-white"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-charcoal mb-2.5 sm:mb-3">Seasonal</h3>
                <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2">
                  {colorPalettes.seasonal.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => applyColorToSelected(color)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 transition-all active:scale-110 flex-shrink-0 ${
                        selectedColor === color ? "border-primary scale-110" : "border-white"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-charcoal mb-2.5 sm:mb-3">Branded Collections</h3>
                <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2">
                  {colorPalettes.branded.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => applyColorToSelected(color)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 transition-all active:scale-110 flex-shrink-0 ${
                        selectedColor === color ? "border-primary scale-110" : "border-white"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="p-4 sm:p-6 max-h-80 overflow-y-auto space-y-4">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal mb-1.5 sm:mb-2">Describe your style</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                  Tell Ivory what kind of nail art you want and it will generate unique designs
                </p>

                <div className="flex gap-2 mb-4 sm:mb-6">
                  <Input
                    placeholder="e.g. minimalist floral..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
                    onKeyDown={(e) => e.key === "Enter" && generateAIDesign()}
                  />
                  <Button onClick={generateAIDesign} disabled={isGenerating || !aiPrompt.trim()} className="h-11 sm:h-12 px-3 sm:px-4 active:scale-95 transition-transform">
                    {isGenerating ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </Button>
                </div>

                {/* Quick prompts */}
                {generatedDesigns.length === 0 && !isGenerating && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Popular Styles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["Minimalist chic", "Floral garden", "Geometric modern", "Holographic glam", "French twist"].map(
                        (style) => (
                          <Button
                            key={style}
                            variant="outline"
                            size="sm"
                            className="bg-transparent"
                            onClick={() => {
                              setAiPrompt(style)
                              setGeneratedDesigns([])
                            }}
                          >
                            {style}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isGenerating && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Generating your designs...</p>
                  </div>
                )}

                {/* Generated designs */}
                {generatedDesigns.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Generated Designs
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {generatedDesigns.map((design, index) => (
                        <button
                          type="button"
                          key={index}
                          className="aspect-square relative rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all"
                        >
                          <Image
                            src={design || "/placeholder.svg"}
                            alt={`Design ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full bg-transparent" onClick={() => generateAIDesign()}>
                      Generate More
                    </Button>
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
                <p className="text-sm text-muted-foreground mb-4">Upload your own nail art patterns</p>
                <Button variant="outline">Choose File</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
