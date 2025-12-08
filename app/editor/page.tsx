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

  const applyColorToSelected = (color: string) => {
    setSelectedColor(color)
    setNails(nails.map((nail) => (nail.selected ? { ...nail, color } : nail)))
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

  const handleSave = () => {
    // In a real app, this would combine the image with nail overlays
    const newLook = {
      id: Date.now().toString(),
      imageUrl: image || "/placeholder.svg",
      title: `Design ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
    }

    const savedLooks = localStorage.getItem("ivoryLooks")
    const looks = savedLooks ? JSON.parse(savedLooks) : []
    looks.unshift(newLook)
    localStorage.setItem("ivoryLooks", JSON.stringify(looks))

    router.push("/home")
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush pb-96">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-serif text-xl font-bold text-charcoal">Design Editor</h1>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="overflow-hidden border-0 bg-white shadow-xl mb-6 relative">
          <div className="aspect-[3/4] relative">
            <Image src={image || "/placeholder.svg"} alt="Hand photo" fill className="object-cover" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            {/* Nail overlay indicators */}
            {nails.map((nail) => (
              <button
                type="button"
                key={nail.id}
                onClick={() => handleNailClick(nail.id)}
                className={`absolute w-8 h-8 rounded-full border-2 transition-all ${
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
        </Card>

        <p className="text-sm text-center text-muted-foreground mb-4">Tap on nails to select, then choose a design</p>
      </main>

      {/* Bottom Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border rounded-t-3xl shadow-2xl">
        <div className="max-w-2xl mx-auto">
          <div className="h-1 w-12 bg-border rounded-full mx-auto my-3"></div>

          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="w-full justify-start px-4 bg-transparent border-b rounded-none h-12">
              <TabsTrigger value="colors" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Designs
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="p-4 space-y-6 max-h-80 overflow-y-auto">
              <div>
                <h3 className="text-sm font-semibold text-charcoal mb-3">Classic Palette</h3>
                <div className="flex gap-3">
                  {colorPalettes.classic.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => applyColorToSelected(color)}
                      className={`w-14 h-14 rounded-full border-4 transition-all ${
                        selectedColor === color ? "border-primary scale-110" : "border-white"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-charcoal mb-3">Seasonal</h3>
                <div className="flex gap-3">
                  {colorPalettes.seasonal.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => applyColorToSelected(color)}
                      className={`w-14 h-14 rounded-full border-4 transition-all ${
                        selectedColor === color ? "border-primary scale-110" : "border-white"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-charcoal mb-3">Branded Collections</h3>
                <div className="flex gap-3">
                  {colorPalettes.branded.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => applyColorToSelected(color)}
                      className={`w-14 h-14 rounded-full border-4 transition-all ${
                        selectedColor === color ? "border-primary scale-110" : "border-white"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai" className="p-4 max-h-80 overflow-y-auto space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal mb-2">Describe your style</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tell Ivory what kind of nail art you want and it will generate unique designs
                </p>

                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="e.g. minimalist floral with gold accents..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && generateAIDesign()}
                  />
                  <Button onClick={generateAIDesign} disabled={isGenerating || !aiPrompt.trim()}>
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
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
