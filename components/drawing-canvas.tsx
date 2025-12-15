"use client"

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Undo, Redo, Trash2, Palette, X } from 'lucide-react'

interface DrawingCanvasProps {
  imageUrl: string
  onSave: (dataUrl: string) => void
  onClose: () => void
}

type DrawingLine = {
  points: { x: number; y: number }[]
  color: string
  width: number
  texture: BrushTexture
}

type BrushTexture = 'solid' | 'soft' | 'spray' | 'marker' | 'pencil'

const COLORS = [
  '#808080', // Gray (default)
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#FF6B9D', // Pink
  '#FFD93D', // Yellow
  '#00FF00', // Green
  '#00FFFF', // Cyan
  '#0000FF', // Blue
  '#FF00FF', // Magenta
  '#FFA500', // Orange
]

const BRUSH_SIZES = [2, 4, 6, 8, 12, 16, 20, 24]

const BRUSH_TEXTURES: { value: BrushTexture; label: string; icon: string }[] = [
  { value: 'solid', label: 'Solid', icon: '●' },
  { value: 'soft', label: 'Soft', icon: '◉' },
  { value: 'spray', label: 'Spray', icon: '⊙' },
  { value: 'marker', label: 'Marker', icon: '▬' },
  { value: 'pencil', label: 'Pencil', icon: '✎' },
]

export function DrawingCanvas({ imageUrl, onSave, onClose }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('#808080') // Gray default
  const [brushSize, setBrushSize] = useState(8) // 8px default
  const [brushTexture, setBrushTexture] = useState<BrushTexture>('solid')
  const [lines, setLines] = useState<DrawingLine[]>([])
  const [currentLine, setCurrentLine] = useState<DrawingLine | null>(null)
  const [undoneLines, setUndoneLines] = useState<DrawingLine[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBrushPicker, setShowBrushPicker] = useState(false)
  const [showTexturePicker, setShowTexturePicker] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 })
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Load and setup canvas
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    // Use proxy for R2 images to avoid CORS issues
    const proxiedUrl = imageUrl.includes('r2.dev') || imageUrl.includes('r2.cloudflarestorage.com')
      ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
      : imageUrl
    img.src = proxiedUrl
    
    img.onload = () => {
      imageRef.current = img
      
      if (containerRef.current && canvasRef.current) {
        const container = containerRef.current
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight
        
        // Calculate dimensions to fit image in container while maintaining aspect ratio
        const imgAspect = img.width / img.height
        const containerAspect = containerWidth / containerHeight
        
        let width, height
        if (imgAspect > containerAspect) {
          width = containerWidth
          height = containerWidth / imgAspect
        } else {
          height = containerHeight
          width = containerHeight * imgAspect
        }
        
        setCanvasDimensions({ width, height })
        
        const canvas = canvasRef.current
        canvas.width = width
        canvas.height = height
        
        setImageLoaded(true)
        redrawCanvas([], img, width, height)
      }
    }
  }, [imageUrl])

  // Redraw canvas with image and all lines
  const redrawCanvas = useCallback((linesToDraw: DrawingLine[], img?: HTMLImageElement, w?: number, h?: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const image = img || imageRef.current
    const width = w || canvasDimensions.width
    const height = h || canvasDimensions.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw image
    if (image) {
      ctx.drawImage(image, 0, 0, width, height)
    }
    
    // Draw all lines
    linesToDraw.forEach(line => {
      if (line.points.length < 2) return
      
      drawLineWithTexture(ctx, line)
    })
  }, [canvasDimensions])

  // Draw line with texture
  const drawLineWithTexture = (ctx: CanvasRenderingContext2D, line: DrawingLine) => {
    const texture = line.texture || 'solid'
    
    switch (texture) {
      case 'solid':
        // Standard solid line
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.width
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalAlpha = 1
        
        ctx.beginPath()
        ctx.moveTo(line.points[0].x, line.points[0].y)
        for (let i = 1; i < line.points.length; i++) {
          ctx.lineTo(line.points[i].x, line.points[i].y)
        }
        ctx.stroke()
        break
        
      case 'soft':
        // Soft brush with gradient edges
        ctx.globalAlpha = 0.6
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.width
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.filter = 'blur(1px)'
        
        ctx.beginPath()
        ctx.moveTo(line.points[0].x, line.points[0].y)
        for (let i = 1; i < line.points.length; i++) {
          ctx.lineTo(line.points[i].x, line.points[i].y)
        }
        ctx.stroke()
        ctx.filter = 'none'
        ctx.globalAlpha = 1
        break
        
      case 'spray':
        // Spray paint effect
        ctx.fillStyle = line.color
        ctx.globalAlpha = 0.1
        
        for (let i = 0; i < line.points.length; i++) {
          const point = line.points[i]
          const density = 15
          
          for (let j = 0; j < density; j++) {
            const angle = Math.random() * Math.PI * 2
            const radius = Math.random() * line.width
            const x = point.x + Math.cos(angle) * radius
            const y = point.y + Math.sin(angle) * radius
            
            ctx.beginPath()
            ctx.arc(x, y, 1, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        ctx.globalAlpha = 1
        break
        
      case 'marker':
        // Marker with slight transparency and flat edges
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.width
        ctx.lineCap = 'square'
        ctx.lineJoin = 'miter'
        ctx.globalAlpha = 0.7
        
        ctx.beginPath()
        ctx.moveTo(line.points[0].x, line.points[0].y)
        for (let i = 1; i < line.points.length; i++) {
          ctx.lineTo(line.points[i].x, line.points[i].y)
        }
        ctx.stroke()
        ctx.globalAlpha = 1
        break
        
      case 'pencil':
        // Pencil with texture
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.width * 0.8
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.globalAlpha = 0.8
        
        // Draw main line
        ctx.beginPath()
        ctx.moveTo(line.points[0].x, line.points[0].y)
        for (let i = 1; i < line.points.length; i++) {
          ctx.lineTo(line.points[i].x, line.points[i].y)
        }
        ctx.stroke()
        
        // Add texture with random dots
        ctx.globalAlpha = 0.3
        for (let i = 0; i < line.points.length; i += 2) {
          const point = line.points[i]
          if (Math.random() > 0.5) {
            ctx.fillStyle = line.color
            ctx.fillRect(point.x, point.y, 1, 1)
          }
        }
        ctx.globalAlpha = 1
        break
    }
  }

  // Redraw when lines change
  useEffect(() => {
    if (imageLoaded) {
      const allLines = currentLine ? [...lines, currentLine] : lines
      redrawCanvas(allLines)
    }
  }, [lines, currentLine, imageLoaded, redrawCanvas])

  const getCoordinates = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    
    const rect = canvas.getBoundingClientRect()
    
    let clientX, clientY
    if ('touches' in e) {
      if (e.touches.length === 0) return null
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    const coords = getCoordinates(e)
    if (!coords) return
    
    setIsDrawing(true)
    setCurrentLine({
      points: [coords],
      color: currentColor,
      width: brushSize,
      texture: brushTexture
    })
    setUndoneLines([]) // Clear redo stack when starting new drawing
  }

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault()
    if (!isDrawing || !currentLine) return
    
    const coords = getCoordinates(e)
    if (!coords) return
    
    setCurrentLine({
      ...currentLine,
      points: [...currentLine.points, coords]
    })
  }

  const stopDrawing = () => {
    if (currentLine && currentLine.points.length > 0) {
      setLines([...lines, currentLine])
      setCurrentLine(null)
    }
    setIsDrawing(false)
  }

  const undo = () => {
    if (lines.length === 0) return
    const lastLine = lines[lines.length - 1]
    setUndoneLines([...undoneLines, lastLine])
    setLines(lines.slice(0, -1))
  }

  const redo = () => {
    if (undoneLines.length === 0) return
    const lineToRedo = undoneLines[undoneLines.length - 1]
    setLines([...lines, lineToRedo])
    setUndoneLines(undoneLines.slice(0, -1))
  }

  const clear = () => {
    setLines([])
    setUndoneLines([])
    setCurrentLine(null)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-[#E8E8E8]">
        <button
          onClick={onClose}
          className="w-10 h-10 border border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 flex items-center justify-center"
        >
          <X className="w-5 h-5" strokeWidth={1} />
        </button>
        <h2 className="font-serif text-lg font-light text-[#1A1A1A] tracking-tight">Draw on Image</h2>
        <button
          onClick={handleSave}
          className="h-10 px-4 bg-[#1A1A1A] text-white font-light text-xs tracking-wider uppercase hover:bg-[#1A1A1A]/90 active:scale-95 transition-all duration-300"
        >
          Save
        </button>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-[#F8F7F5]"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="touch-none max-w-full max-h-full border border-[#E8E8E8]"
          style={{
            width: canvasDimensions.width,
            height: canvasDimensions.height,
            cursor: 'crosshair'
          }}
        />
      </div>

      {/* Controls */}
      <div className="p-4 bg-white border-t border-[#E8E8E8] space-y-3">
        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={undo}
            disabled={lines.length === 0}
            className="h-10 px-4 border border-[#E8E8E8] text-[#1A1A1A] font-light text-xs tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Undo className="w-4 h-4" strokeWidth={1} />
            Undo
          </button>
          <button
            onClick={redo}
            disabled={undoneLines.length === 0}
            className="h-10 px-4 border border-[#E8E8E8] text-[#1A1A1A] font-light text-xs tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Redo className="w-4 h-4" strokeWidth={1} />
            Redo
          </button>
          <button
            onClick={clear}
            disabled={lines.length === 0}
            className="h-10 px-4 border border-[#E8E8E8] text-[#1A1A1A] font-light text-xs tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1} />
            Clear
          </button>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker)
              setShowBrushPicker(false)
              setShowTexturePicker(false)
            }}
            className="w-full flex items-center justify-between p-3 border border-[#E8E8E8] bg-white hover:border-[#8B7355] transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-[#1A1A1A]" strokeWidth={1} />
              <span className="text-[#1A1A1A] font-light tracking-wider uppercase text-sm">Color</span>
            </div>
            <div 
              className="w-8 h-8 border-2 border-[#E8E8E8]"
              style={{ backgroundColor: currentColor }}
            />
          </button>
          
          {showColorPicker && (
            <div className="grid grid-cols-5 gap-2 p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setCurrentColor(color)
                    setShowColorPicker(false)
                  }}
                  className={`w-full aspect-square border-2 transition-all active:scale-95 ${
                    currentColor === color ? 'border-[#8B7355] scale-110' : 'border-[#E8E8E8]'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Brush Texture Picker */}
        <div className="space-y-2">
          <button
            onClick={() => {
              setShowTexturePicker(!showTexturePicker)
              setShowColorPicker(false)
              setShowBrushPicker(false)
            }}
            className="w-full flex items-center justify-between p-3 border border-[#E8E8E8] bg-white hover:border-[#8B7355] transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <span className="text-[#1A1A1A] text-xl">
                {BRUSH_TEXTURES.find(t => t.value === brushTexture)?.icon}
              </span>
              <span className="text-[#1A1A1A] font-light tracking-wider uppercase text-sm">Texture</span>
            </div>
            <span className="text-[#6B6B6B] text-sm capitalize font-light">{brushTexture}</span>
          </button>
          
          {showTexturePicker && (
            <div className="grid grid-cols-5 gap-2 p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
              {BRUSH_TEXTURES.map(texture => (
                <button
                  key={texture.value}
                  onClick={() => {
                    setBrushTexture(texture.value)
                    setShowTexturePicker(false)
                  }}
                  className={`flex flex-col items-center p-2 border transition-all active:scale-95 ${
                    brushTexture === texture.value ? 'border-[#8B7355] bg-white scale-110' : 'border-[#E8E8E8] bg-white'
                  }`}
                >
                  <span className="text-[#1A1A1A] text-2xl mb-1">{texture.icon}</span>
                  <span className="text-[#1A1A1A] text-[9px] font-light">{texture.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brush Size Picker */}
        <div className="space-y-2">
          <button
            onClick={() => {
              setShowBrushPicker(!showBrushPicker)
              setShowColorPicker(false)
              setShowTexturePicker(false)
            }}
            className="w-full flex items-center justify-between p-3 border border-[#E8E8E8] bg-white hover:border-[#8B7355] transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div 
                className="bg-[#1A1A1A]"
                style={{ width: Math.min(brushSize + 8, 24), height: Math.min(brushSize + 8, 24), borderRadius: '50%' }}
              />
              <span className="text-[#1A1A1A] font-light tracking-wider uppercase text-sm">Brush Size</span>
            </div>
            <span className="text-[#6B6B6B] font-light">{brushSize}px</span>
          </button>
          
          {showBrushPicker && (
            <div className="grid grid-cols-4 gap-2 p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
              {BRUSH_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setBrushSize(size)
                    setShowBrushPicker(false)
                  }}
                  className={`w-full aspect-square border flex items-center justify-center transition-all active:scale-95 ${
                    brushSize === size ? 'border-[#8B7355] bg-white scale-110' : 'border-[#E8E8E8] bg-white'
                  }`}
                >
                  <div 
                    className="bg-[#1A1A1A]"
                    style={{ width: Math.min(size, 20), height: Math.min(size, 20), borderRadius: '50%' }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
