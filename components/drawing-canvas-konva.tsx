"use client"

import { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Rect, Circle, Text, Transformer } from 'react-konva'
import { Undo, Redo, Trash2, Palette, X, ZoomIn, ZoomOut, Eye, EyeOff, Pencil, Eraser, Square, Circle as CircleIcon, Type, ChevronDown, ChevronUp, Hand, Scissors, ImagePlus } from 'lucide-react'
import Konva from 'konva'

interface DrawingCanvasProps {
  imageUrl: string
  onSave: (dataUrl: string) => void
  onClose: () => void
}

type DrawingLine = {
  points: number[]
  color: string
  width: number
  texture: BrushTexture
  isEraser?: boolean
  globalCompositeOperation?: 'source-over' | 'destination-out'
}

type BrushTexture = 'solid' | 'soft' | 'spray' | 'marker' | 'pencil'
type ToolMode = 'draw' | 'pan' | 'eraser' | 'rect' | 'circle' | 'text' | 'select' | 'crop' | 'sticker'

type Shape = {
  id: string
  type: 'rect' | 'circle' | 'text' | 'image'
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  text?: string
  image?: HTMLImageElement
  fill: string
  stroke: string
  strokeWidth: number
}

type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#FF6B9D', '#FFD93D', '#00FF00',
  '#00FFFF', '#0000FF', '#FF00FF', '#FFA500', '#C44569', '#A8E6CF',
]

const BRUSH_SIZES = [2, 4, 8, 12, 16, 24]

const BRUSH_TEXTURES: { value: BrushTexture; label: string; icon: string }[] = [
  { value: 'solid', label: 'Solid', icon: '●' },
  { value: 'soft', label: 'Soft', icon: '◉' },
  { value: 'marker', label: 'Marker', icon: '▬' },
]

export function DrawingCanvasKonva({ imageUrl, onSave, onClose }: DrawingCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [toolMode, setToolMode] = useState<ToolMode>('draw')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(8)
  const [eraserSize, setEraserSize] = useState(20)
  const [brushTexture, setBrushTexture] = useState<BrushTexture>('solid')
  const [lines, setLines] = useState<DrawingLine[]>([])
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null)
  const [undoneLines, setUndoneLines] = useState<DrawingLine[]>([])
  const [undoneShapes, setUndoneShapes] = useState<Shape[]>([])
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 })
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const shapeLayerRef = useRef<Konva.Layer>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // UI state
  const [zoom, setZoom] = useState(1)
  const [showDrawing, setShowDrawing] = useState(true)
  const [showZoomIndicator, setShowZoomIndicator] = useState(false)
  const [toolbarExpanded, setToolbarExpanded] = useState(false)
  const [cropArea, setCropArea] = useState<CropArea | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const lastTouchDistanceRef = useRef<number>(0)
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null)
  
  // Color picker state (HSL)
  const [hue, setHue] = useState(0) // 0-360
  const [saturation, setSaturation] = useState(0) // 0-100
  const [lightness, setLightness] = useState(0) // 0-100
  
  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }
  
  // Update current color when sliders change
  useEffect(() => {
    setCurrentColor(hslToHex(hue, saturation, lightness))
  }, [hue, saturation, lightness])

  // Load image
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    const proxiedUrl = imageUrl.includes('r2.dev') || imageUrl.includes('r2.cloudflarestorage.com')
      ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
      : imageUrl
    img.src = proxiedUrl
    
    img.onload = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight
        
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
        setImage(img)
      }
    }
  }, [imageUrl])

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Handle pinch zoom on touch devices
    if ('touches' in e.evt && e.evt.touches.length === 2) {
      e.evt.preventDefault()
      const touch1 = e.evt.touches[0]
      const touch2 = e.evt.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      lastTouchDistanceRef.current = distance
      lastTouchCenterRef.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      }
      return
    }
    
    if (toolMode === 'pan') return
    
    if (e.target === e.target.getStage()) {
      setSelectedShapeId(null)
      return
    }
    
    const stage = e.target.getStage()
    if (!stage) return
    
    const pos = stage.getPointerPosition()
    if (!pos) return
    
    const transform = stage.getAbsoluteTransform().copy().invert()
    const transformedPos = transform.point(pos)
    
    if (toolMode === 'select') {
      const clickedShape = e.target
      if (clickedShape.getClassName() !== 'Stage' && clickedShape.getClassName() !== 'Image') {
        setSelectedShapeId(clickedShape.id())
        // Haptic feedback on mobile
        if ('vibrate' in navigator) {
          navigator.vibrate(10)
        }
      }
      return
    }
    
    if (toolMode === 'rect' || toolMode === 'circle' || toolMode === 'crop') {
      setShapeStart(transformedPos)
      setIsDrawing(true)
      if (toolMode === 'crop') {
        setIsCropping(true)
      }
      return
    }
    
    if (toolMode === 'text') {
      const text = prompt('Enter text:')
      if (text) {
        const newShape: Shape = {
          id: `text-${Date.now()}`,
          type: 'text',
          x: transformedPos.x,
          y: transformedPos.y,
          text,
          fill: currentColor,
          stroke: currentColor,
          strokeWidth: 0
        }
        setShapes([...shapes, newShape])
        setUndoneShapes([])
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(10)
        }
      }
      return
    }
    
    if (toolMode === 'draw' || toolMode === 'eraser') {
      setIsDrawing(true)
      const currentSize = toolMode === 'eraser' ? eraserSize : brushSize
      
      const newLine: DrawingLine = {
        points: [transformedPos.x, transformedPos.y],
        color: currentColor,
        width: currentSize,
        texture: brushTexture,
        isEraser: toolMode === 'eraser',
        globalCompositeOperation: toolMode === 'eraser' ? 'destination-out' : 'source-over'
      }
      
      setLines([...lines, newLine])
      setUndoneLines([])
    }
  }

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Handle pinch zoom
    if ('touches' in e.evt && e.evt.touches.length === 2) {
      e.evt.preventDefault()
      const touch1 = e.evt.touches[0]
      const touch2 = e.evt.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )

      if (lastTouchDistanceRef.current > 0) {
        const stage = stageRef.current
        if (!stage) return

        const delta = distance - lastTouchDistanceRef.current
        const scaleBy = 1 + delta * 0.01
        const oldScale = stage.scaleX()
        const newScale = Math.min(Math.max(oldScale * scaleBy, 0.5), 5)

        // Get center point for zoom
        const center = lastTouchCenterRef.current
        if (center) {
          const stagePos = stage.position()
          const mousePointTo = {
            x: (center.x - stagePos.x) / oldScale,
            y: (center.y - stagePos.y) / oldScale,
          }

          const newPos = {
            x: center.x - mousePointTo.x * newScale,
            y: center.y - mousePointTo.y * newScale,
          }

          stage.scale({ x: newScale, y: newScale })
          stage.position(newPos)
          setZoom(newScale)
          setShowZoomIndicator(true)
        }
      }

      lastTouchDistanceRef.current = distance
      return
    }
    
    if (!isDrawing || toolMode === 'pan' || toolMode === 'select') return
    
    const stage = e.target.getStage()
    if (!stage) return
    
    const pos = stage.getPointerPosition()
    if (!pos) return
    
    const transform = stage.getAbsoluteTransform().copy().invert()
    const transformedPos = transform.point(pos)
    
    if ((toolMode === 'rect' || toolMode === 'circle') && shapeStart) {
      return
    }
    
    if (toolMode === 'draw' || toolMode === 'eraser') {
      const lastLine = lines[lines.length - 1]
      lastLine.points = lastLine.points.concat([transformedPos.x, transformedPos.y])
      setLines([...lines.slice(0, -1), lastLine])
    }
  }

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Reset pinch zoom tracking
    if ('touches' in e.evt && e.evt.touches.length < 2) {
      lastTouchDistanceRef.current = 0
      lastTouchCenterRef.current = null
      setTimeout(() => setShowZoomIndicator(false), 1500)
    }
    
    if (!isDrawing) return
    
    if ((toolMode === 'rect' || toolMode === 'circle' || toolMode === 'crop') && shapeStart) {
      const stage = e.target.getStage()
      if (!stage) return
      
      const pos = stage.getPointerPosition()
      if (!pos) return
      
      const transform = stage.getAbsoluteTransform().copy().invert()
      const transformedPos = transform.point(pos)
      
      const width = Math.abs(transformedPos.x - shapeStart.x)
      const height = Math.abs(transformedPos.y - shapeStart.y)
      
      if (width > 5 && height > 5) {
        if (toolMode === 'crop') {
          // Set crop area
          setCropArea({
            x: Math.min(shapeStart.x, transformedPos.x),
            y: Math.min(shapeStart.y, transformedPos.y),
            width,
            height
          })
          setIsCropping(false)
          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate([10, 50, 10])
          }
        } else {
          const newShape: Shape = {
            id: `${toolMode}-${Date.now()}`,
            type: toolMode,
            x: Math.min(shapeStart.x, transformedPos.x),
            y: Math.min(shapeStart.y, transformedPos.y),
            width: toolMode === 'rect' ? width : undefined,
            height: toolMode === 'rect' ? height : undefined,
            radius: toolMode === 'circle' ? Math.min(width, height) / 2 : undefined,
            fill: 'transparent',
            stroke: currentColor,
            strokeWidth: brushSize
          }
          
          if (toolMode === 'circle') {
            newShape.x = shapeStart.x + (transformedPos.x - shapeStart.x) / 2
            newShape.y = shapeStart.y + (transformedPos.y - shapeStart.y) / 2
          }
          
          setShapes([...shapes, newShape])
          setUndoneShapes([])
          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(10)
          }
        }
      }
      
      setShapeStart(null)
    }
    
    setIsDrawing(false)
  }

  const undo = () => {
    if (shapes.length > 0) {
      const lastShape = shapes[shapes.length - 1]
      setUndoneShapes([...undoneShapes, lastShape])
      setShapes(shapes.slice(0, -1))
    } else if (lines.length > 0) {
      const lastLine = lines[lines.length - 1]
      setUndoneLines([...undoneLines, lastLine])
      setLines(lines.slice(0, -1))
    }
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const redo = () => {
    if (undoneShapes.length > 0) {
      const shapeToRedo = undoneShapes[undoneShapes.length - 1]
      setShapes([...shapes, shapeToRedo])
      setUndoneShapes(undoneShapes.slice(0, -1))
    } else if (undoneLines.length > 0) {
      const lineToRedo = undoneLines[undoneLines.length - 1]
      setLines([...lines, lineToRedo])
      setUndoneLines(undoneLines.slice(0, -1))
    }
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  const clear = () => {
    if (confirm('Clear all drawings?')) {
      setLines([])
      setShapes([])
      setUndoneLines([])
      setUndoneShapes([])
      setSelectedShapeId(null)
    }
  }
  
  const deleteSelected = () => {
    if (selectedShapeId) {
      const shapeToDelete = shapes.find(s => s.id === selectedShapeId)
      if (shapeToDelete) {
        setUndoneShapes([...undoneShapes, shapeToDelete])
        setShapes(shapes.filter(s => s.id !== selectedShapeId))
        setSelectedShapeId(null)
      }
    }
  }

  const applyCrop = () => {
    if (!cropArea || !stageRef.current) return
    
    const stage = stageRef.current
    const originalScale = stage.scaleX()
    const originalPosition = stage.position()
    
    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })
    
    // Export only the cropped area
    const dataUrl = stage.toDataURL({
      pixelRatio: 2,
      x: cropArea.x,
      y: cropArea.y,
      width: cropArea.width,
      height: cropArea.height
    })
    
    stage.scale({ x: originalScale, y: originalScale })
    stage.position(originalPosition)
    
    // Create new image from cropped data
    const img = new window.Image()
    img.onload = () => {
      setImage(img)
      setCanvasDimensions({ width: cropArea.width, height: cropArea.height })
      setCropArea(null)
      setToolMode('draw')
      // Clear drawings as they won't align anymore
      setLines([])
      setShapes([])
    }
    img.src = dataUrl
  }

  const cancelCrop = () => {
    setCropArea(null)
    setToolMode('draw')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        // Add as a sticker/overlay
        const maxSize = 200 // Max width/height for sticker
        let width = img.width
        let height = img.height
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          width = width * ratio
          height = height * ratio
        }
        
        const newShape: Shape = {
          id: `image-${Date.now()}`,
          type: 'image',
          x: canvasDimensions.width / 2 - width / 2,
          y: canvasDimensions.height / 2 - height / 2,
          width,
          height,
          image: img,
          fill: 'transparent',
          stroke: 'transparent',
          strokeWidth: 0
        }
        
        setShapes([...shapes, newShape])
        setUndoneShapes([])
        setToolMode('select')
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = () => {
    const stage = stageRef.current
    if (!stage) return
    
    const originalScale = stage.scaleX()
    const originalPosition = stage.position()
    
    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })
    
    const dataUrl = stage.toDataURL({ pixelRatio: 2 })
    
    stage.scale({ x: originalScale, y: originalScale })
    stage.position(originalPosition)
    
    onSave(dataUrl)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 5))
    setShowZoomIndicator(true)
    setTimeout(() => setShowZoomIndicator(false), 1500)
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5))
    setShowZoomIndicator(true)
    setTimeout(() => setShowZoomIndicator(false), 1500)
  }

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    
    const stage = stageRef.current
    if (!stage) return
    
    const oldScale = stage.scaleX()
    const pointer = stage.getPointerPosition()
    if (!pointer) return
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    }
    
    const delta = e.evt.deltaY > 0 ? -0.1 : 0.1
    const newScale = Math.min(Math.max(oldScale + delta, 0.5), 5)
    
    setZoom(newScale)
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }
    
    stage.scale({ x: newScale, y: newScale })
    stage.position(newPos)
    setShowZoomIndicator(true)
    setTimeout(() => setShowZoomIndicator(false), 1500)
  }

  useEffect(() => {
    if (selectedShapeId && transformerRef.current && shapeLayerRef.current) {
      const selectedNode = shapeLayerRef.current.findOne(`#${selectedShapeId}`)
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode])
        transformerRef.current.getLayer()?.batchDraw()
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
    }
  }, [selectedShapeId])

  const getLineProps = (line: DrawingLine) => {
    const baseProps = {
      points: line.points,
      stroke: line.color,
      strokeWidth: line.width,
      globalCompositeOperation: (line.globalCompositeOperation || 'source-over') as 'source-over' | 'destination-out',
      lineCap: 'round' as const,
      lineJoin: 'round' as const,
    }
    
    switch (line.texture) {
      case 'soft':
        return { ...baseProps, opacity: 0.6, shadowBlur: 2, shadowColor: line.color }
      case 'marker':
        return { ...baseProps, opacity: 0.7, lineCap: 'square' as const }
      case 'spray':
        return { ...baseProps, opacity: 0.3, strokeWidth: line.width * 1.5 }
      default:
        return baseProps
    }
  }

  const getToolIcon = (tool: ToolMode) => {
    switch (tool) {
      case 'draw': return <Pencil className="w-5 h-5" />
      case 'eraser': return <Eraser className="w-5 h-5" />
      case 'rect': return <Square className="w-5 h-5" />
      case 'circle': return <CircleIcon className="w-5 h-5" />
      case 'text': return <Type className="w-5 h-5" />
      case 'pan': return <Hand className="w-5 h-5" />
      case 'select': return <Hand className="w-5 h-5" />
      case 'crop': return <Scissors className="w-5 h-5" />
      case 'sticker': return <ImagePlus className="w-5 h-5" />
    }
  }

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col select-none">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-[#E8E8E8] shrink-0 safe-top">
        <button
          onClick={onClose}
          className="w-9 h-9 border border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F8F7F5] active:scale-95 transition-all flex items-center justify-center rounded touch-manipulation"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="font-serif text-base font-light text-[#1A1A1A] tracking-tight">
          {cropArea ? 'Crop Image' : 'Draw'}
        </h2>
        {cropArea ? (
          <div className="flex gap-2">
            <button
              onClick={cancelCrop}
              className="h-9 px-3 border border-[#E8E8E8] text-[#1A1A1A] font-light text-xs tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all rounded touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={applyCrop}
              className="h-9 px-3 bg-[#8B7355] text-white font-light text-xs tracking-wider uppercase hover:bg-[#8B7355]/90 active:scale-95 transition-all rounded touch-manipulation"
            >
              Apply
            </button>
          </div>
        ) : (
          <button
            onClick={handleSave}
            className="h-9 px-3 bg-[#8B7355] text-white font-light text-xs tracking-wider uppercase hover:bg-[#8B7355]/90 active:scale-95 transition-all rounded touch-manipulation"
          >
            Save
          </button>
        )}
      </div>
      
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden bg-[#F8F7F5] relative touch-none"
      >
        {/* Zoom Indicator */}
        {showZoomIndicator && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-light z-50">
            {Math.round(zoom * 100)}%
          </div>
        )}

        {/* Floating Zoom Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-40">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 bg-white/95 backdrop-blur border border-[#E8E8E8] text-[#1A1A1A] hover:bg-white active:scale-95 transition-all flex items-center justify-center shadow-lg rounded"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 bg-white/95 backdrop-blur border border-[#E8E8E8] text-[#1A1A1A] hover:bg-white active:scale-95 transition-all flex items-center justify-center shadow-lg rounded"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDrawing(!showDrawing)}
            className="w-9 h-9 bg-white/95 backdrop-blur border border-[#E8E8E8] text-[#1A1A1A] hover:bg-white active:scale-95 transition-all flex items-center justify-center shadow-lg rounded"
          >
            {showDrawing ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {image && (
          <Stage
            ref={stageRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onWheel={handleWheel}
            scaleX={zoom}
            scaleY={zoom}
            draggable={true}
            className="shadow-lg max-w-full max-h-full"
            style={{
              cursor: toolMode === 'pan' ? 'grab' : toolMode === 'draw' || toolMode === 'eraser' ? 'crosshair' : 'default'
            }}
          >
            <Layer>
              <KonvaImage image={image} width={canvasDimensions.width} height={canvasDimensions.height} />
            </Layer>
            {showDrawing && (
              <>
                <Layer>
                  {lines.map((line, i) => (
                    <Line key={i} {...getLineProps(line)} />
                  ))}
                </Layer>
                <Layer ref={shapeLayerRef}>
                  {shapes.map((shape) => {
                    if (shape.type === 'rect') {
                      return (
                        <Rect
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          width={shape.width}
                          height={shape.height}
                          fill={shape.fill}
                          stroke={shape.stroke}
                          strokeWidth={shape.strokeWidth}
                          draggable={toolMode === 'select'}
                          onClick={() => toolMode === 'select' && setSelectedShapeId(shape.id)}
                        />
                      )
                    }
                    if (shape.type === 'circle') {
                      return (
                        <Circle
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          radius={shape.radius}
                          fill={shape.fill}
                          stroke={shape.stroke}
                          strokeWidth={shape.strokeWidth}
                          draggable={toolMode === 'select'}
                          onClick={() => toolMode === 'select' && setSelectedShapeId(shape.id)}
                        />
                      )
                    }
                    if (shape.type === 'text') {
                      return (
                        <Text
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          text={shape.text}
                          fontSize={24}
                          fill={shape.fill}
                          draggable={toolMode === 'select'}
                          onClick={() => toolMode === 'select' && setSelectedShapeId(shape.id)}
                        />
                      )
                    }
                    if (shape.type === 'image' && shape.image) {
                      return (
                        <KonvaImage
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          image={shape.image}
                          width={shape.width}
                          height={shape.height}
                          draggable={toolMode === 'select'}
                          onClick={() => toolMode === 'select' && setSelectedShapeId(shape.id)}
                        />
                      )
                    }
                    return null
                  })}
                  {toolMode === 'select' && <Transformer ref={transformerRef} />}
                </Layer>
              </>
            )}
            {/* Crop overlay */}
            {(isCropping || cropArea) && shapeStart && (
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={canvasDimensions.width}
                  height={canvasDimensions.height}
                  fill="black"
                  opacity={0.5}
                />
                {cropArea && (
                  <Rect
                    x={cropArea.x}
                    y={cropArea.y}
                    width={cropArea.width}
                    height={cropArea.height}
                    fill="transparent"
                    stroke="#8B7355"
                    strokeWidth={2}
                    dash={[10, 5]}
                  />
                )}
              </Layer>
            )}
          </Stage>
        )}
      </div>

      {/* Bottom Toolbar - Collapsible */}
      <div className="bg-white border-t border-[#E8E8E8] shrink-0 safe-bottom">
        {/* Toolbar Toggle */}
        <button
          onClick={() => {
            setToolbarExpanded(!toolbarExpanded)
            // Haptic feedback
            if ('vibrate' in navigator) {
              navigator.vibrate(5)
            }
          }}
          className="w-full flex items-center justify-center py-2 border-b border-[#E8E8E8] hover:bg-[#F8F7F5] transition-colors active:bg-[#F0EDE8]"
        >
          {toolbarExpanded ? <ChevronDown className="w-5 h-5 text-[#6B6B6B]" /> : <ChevronUp className="w-5 h-5 text-[#6B6B6B]" />}
        </button>

        {/* Quick Actions - Always Visible */}
        <div className="px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto">
          {/* Tool Selector */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {(['draw', 'eraser', 'rect', 'circle', 'text', 'crop'] as ToolMode[]).map((tool) => (
              <button
                key={tool}
                onClick={() => {
                  if (tool === 'crop') {
                    setCropArea(null)
                  }
                  setToolMode(tool)
                  // Haptic feedback
                  if ('vibrate' in navigator) {
                    navigator.vibrate(5)
                  }
                }}
                className={`flex-shrink-0 w-10 h-10 border flex items-center justify-center transition-all rounded active:scale-95 ${
                  toolMode === tool 
                    ? 'bg-[#8B7355] text-white border-[#8B7355]' 
                    : 'bg-white text-[#1A1A1A] border-[#E8E8E8]'
                }`}
                title={tool}
              >
                {getToolIcon(tool)}
              </button>
            ))}
            <button
              onClick={() => {
                fileInputRef.current?.click()
                // Haptic feedback
                if ('vibrate' in navigator) {
                  navigator.vibrate(5)
                }
              }}
              className="flex-shrink-0 w-10 h-10 border flex items-center justify-center transition-all rounded bg-white text-[#1A1A1A] border-[#E8E8E8] active:scale-95"
              title="Add Image"
            >
              <ImagePlus className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={undo}
              disabled={lines.length === 0 && shapes.length === 0}
              className="w-10 h-10 border border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F8F7F5] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center rounded"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={undoneLines.length === 0 && undoneShapes.length === 0}
              className="w-10 h-10 border border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F8F7F5] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center rounded"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Options */}
        {toolbarExpanded && (
          <div className="px-3 pb-3 space-y-3 max-h-[50vh] overflow-y-auto">
            {/* Color Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-light text-[#6B6B6B] uppercase tracking-wider">Color</div>
                <div 
                  className="w-8 h-8 rounded border-2 border-[#E8E8E8] shadow-sm"
                  style={{ backgroundColor: currentColor }}
                />
              </div>
              
              {/* Hue Slider */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-light text-[#6B6B6B]">Hue</label>
                  <span className="text-[10px] font-light text-[#1A1A1A]">{Math.round(hue)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={(e) => setHue(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                  }}
                />
              </div>
              
              {/* Saturation Slider */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-light text-[#6B6B6B]">Saturation</label>
                  <span className="text-[10px] font-light text-[#1A1A1A]">{Math.round(saturation)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`
                  }}
                />
              </div>
              
              {/* Lightness Slider */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-light text-[#6B6B6B]">Lightness</label>
                  <span className="text-[10px] font-light text-[#1A1A1A]">{Math.round(lightness)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lightness}
                  onChange={(e) => setLightness(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(${hue}, ${saturation}%, 0%), hsl(${hue}, ${saturation}%, 50%), hsl(${hue}, ${saturation}%, 100%))`
                  }}
                />
              </div>
              
              {/* Quick Color Presets */}
              <div className="grid grid-cols-8 gap-1.5 mt-3">
                {[
                  { h: 0, s: 0, l: 0, name: 'Black' },
                  { h: 0, s: 0, l: 100, name: 'White' },
                  { h: 0, s: 100, l: 50, name: 'Red' },
                  { h: 30, s: 100, l: 50, name: 'Orange' },
                  { h: 60, s: 100, l: 50, name: 'Yellow' },
                  { h: 120, s: 100, l: 50, name: 'Green' },
                  { h: 240, s: 100, l: 50, name: 'Blue' },
                  { h: 300, s: 100, l: 50, name: 'Purple' },
                ].map((preset) => (
                  <button
                    key={`${preset.h}-${preset.s}-${preset.l}`}
                    onClick={() => {
                      setHue(preset.h)
                      setSaturation(preset.s)
                      setLightness(preset.l)
                    }}
                    className="aspect-square rounded border border-[#E8E8E8] active:scale-95 transition-all"
                    style={{ backgroundColor: hslToHex(preset.h, preset.s, preset.l) }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Brush Size */}
            <div>
              <div className="text-xs font-light text-[#6B6B6B] mb-2 uppercase tracking-wider">
                {toolMode === 'eraser' ? 'Eraser' : 'Brush'} Size: {toolMode === 'eraser' ? eraserSize : brushSize}px
              </div>
              <div className="grid grid-cols-6 gap-2">
                {BRUSH_SIZES.map(size => {
                  const currentSize = toolMode === 'eraser' ? eraserSize : brushSize
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (toolMode === 'eraser') {
                          setEraserSize(size)
                        } else {
                          setBrushSize(size)
                        }
                      }}
                      className={`aspect-square border flex items-center justify-center transition-all active:scale-95 rounded ${
                        currentSize === size ? 'border-[#8B7355] bg-[#F8F7F5]' : 'border-[#E8E8E8] bg-white'
                      }`}
                    >
                      <div 
                        className="bg-[#1A1A1A] rounded-full"
                        style={{ width: Math.min(size, 16), height: Math.min(size, 16) }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Brush Texture */}
            {toolMode === 'draw' && (
              <div>
                <div className="text-xs font-light text-[#6B6B6B] mb-2 uppercase tracking-wider">Texture</div>
                <div className="grid grid-cols-3 gap-2">
                  {BRUSH_TEXTURES.map(texture => (
                    <button
                      key={texture.value}
                      onClick={() => setBrushTexture(texture.value)}
                      className={`flex flex-col items-center p-3 border transition-all active:scale-95 rounded ${
                        brushTexture === texture.value ? 'border-[#8B7355] bg-[#F8F7F5]' : 'border-[#E8E8E8] bg-white'
                      }`}
                    >
                      <span className="text-2xl mb-1">{texture.icon}</span>
                      <span className="text-[10px] font-light">{texture.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {selectedShapeId && (
                <button
                  onClick={deleteSelected}
                  className="flex-1 h-10 px-3 border border-red-300 text-red-600 font-light text-xs tracking-wider uppercase hover:bg-red-50 active:scale-95 transition-all rounded"
                >
                  Delete Selected
                </button>
              )}
              <button
                onClick={clear}
                disabled={lines.length === 0 && shapes.length === 0}
                className="flex-1 h-10 px-3 border border-[#E8E8E8] text-[#1A1A1A] font-light text-xs tracking-wider uppercase hover:bg-[#F8F7F5] active:scale-95 transition-all disabled:opacity-30 rounded"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
