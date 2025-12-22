"use client"

import { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Rect, Circle, Text, Transformer } from 'react-konva'
import { Undo, Redo, X, Eye, EyeOff, Pencil, Eraser, Hand, Scissors, ImagePlus, Check, Palette } from 'lucide-react'
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
type ToolMode = 'draw' | 'pan' | 'eraser' | 'rect' | 'circle' | 'text' | 'select' | 'crop' | 'sticker' | 'cutout'

type Shape = {
  id: string
  type: 'rect' | 'circle' | 'text' | 'image' | 'sticker'
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
  rotation?: number
  scaleX?: number
  scaleY?: number
}

type Sticker = {
  id: string
  image: HTMLImageElement
  thumbnail: string
}

type CutoutPath = {
  points: number[]
  closed: boolean
}

type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

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
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBrushSize, setShowBrushSize] = useState(false)
  const [cropArea, setCropArea] = useState<CropArea | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [cutoutPath, setCutoutPath] = useState<CutoutPath | null>(null)
  const [isDrawingCutout, setIsDrawingCutout] = useState(false)
  const [showStickerLibrary, setShowStickerLibrary] = useState(false)
  const lastTouchDistanceRef = useRef<number>(0)
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null)
  const lastTapTimeRef = useRef<number>(0)
  
  // Color picker state (HSL)
  const [hue, setHue] = useState(0) // 0-360
  const [saturation, setSaturation] = useState(100) // Always 100 for vibrant colors
  const [lightness, setLightness] = useState(50) // 0-100
  
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
    // Handle double-tap to reset zoom
    if ('touches' in e.evt && e.evt.touches.length === 1) {
      const now = Date.now()
      const timeSinceLastTap = now - lastTapTimeRef.current
      
      if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
        // Double tap detected - reset zoom and position
        const stage = stageRef.current
        if (stage) {
          stage.scale({ x: 1, y: 1 })
          stage.position({ x: 0, y: 0 })
          setZoom(1)
          if ('vibrate' in navigator) {
            navigator.vibrate(10)
          }
        }
        lastTapTimeRef.current = 0
        return
      }
      lastTapTimeRef.current = now
    }
    
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
    
    // Allow panning when not in drawing/eraser mode or when middle mouse button
    const isMiddleButton = 'button' in e.evt && e.evt.button === 1
    const shouldPan = toolMode === 'pan' || isMiddleButton
    
    if (shouldPan) {
      // Stage will handle dragging automatically
      return
    }
    
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
    
    if (toolMode === 'cutout') {
      // Start drawing cutout path
      setIsDrawingCutout(true)
      setCutoutPath({
        points: [transformedPos.x, transformedPos.y],
        closed: false
      })
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
    // Handle pinch zoom with simultaneous pan
    if ('touches' in e.evt && e.evt.touches.length === 2) {
      e.evt.preventDefault()
      const touch1 = e.evt.touches[0]
      const touch2 = e.evt.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const currentCenter = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      }

      if (lastTouchDistanceRef.current > 0 && lastTouchCenterRef.current) {
        const stage = stageRef.current
        if (!stage) return

        // Calculate zoom
        const delta = distance - lastTouchDistanceRef.current
        const scaleBy = 1 + delta * 0.01
        const oldScale = stage.scaleX()
        const newScale = Math.min(Math.max(oldScale * scaleBy, 0.5), 5)

        // Calculate pan (movement of center point)
        const centerDelta = {
          x: currentCenter.x - lastTouchCenterRef.current.x,
          y: currentCenter.y - lastTouchCenterRef.current.y
        }

        // Get the point we're zooming around
        const stagePos = stage.position()
        const mousePointTo = {
          x: (currentCenter.x - stagePos.x) / oldScale,
          y: (currentCenter.y - stagePos.y) / oldScale,
        }

        // Apply zoom and pan together
        const newPos = {
          x: currentCenter.x - mousePointTo.x * newScale + centerDelta.x,
          y: currentCenter.y - mousePointTo.y * newScale + centerDelta.y,
        }

        stage.scale({ x: newScale, y: newScale })
        stage.position(newPos)
        setZoom(newScale)
      }

      lastTouchDistanceRef.current = distance
      lastTouchCenterRef.current = currentCenter
      return
    }
    
    if (!isDrawing && !isDrawingCutout || toolMode === 'pan' || toolMode === 'select') return
    
    const stage = e.target.getStage()
    if (!stage) return
    
    const pos = stage.getPointerPosition()
    if (!pos) return
    
    const transform = stage.getAbsoluteTransform().copy().invert()
    const transformedPos = transform.point(pos)
    
    if (toolMode === 'cutout' && isDrawingCutout && cutoutPath) {
      // Add point to cutout path
      setCutoutPath({
        ...cutoutPath,
        points: [...cutoutPath.points, transformedPos.x, transformedPos.y]
      })
      return
    }
    
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
    }
    
    // Handle cutout completion
    if (toolMode === 'cutout' && isDrawingCutout && cutoutPath) {
      setIsDrawingCutout(false)
      // Close the path and create sticker
      createStickerFromCutout()
      return
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
        // Add to sticker library
        const newSticker: Sticker = {
          id: `sticker-lib-${Date.now()}`,
          image: img,
          thumbnail: event.target?.result as string
        }
        setStickers([...stickers, newSticker])
        
        // Also add directly to canvas
        const maxSize = 200
        let width = img.width
        let height = img.height
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          width = width * ratio
          height = height * ratio
        }
        
        const newShape: Shape = {
          id: `sticker-${Date.now()}`,
          type: 'sticker',
          x: canvasDimensions.width / 2 - width / 2,
          y: canvasDimensions.height / 2 - height / 2,
          width,
          height,
          image: img,
          fill: 'transparent',
          stroke: 'transparent',
          strokeWidth: 0,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        }
        
        setShapes([...shapes, newShape])
        setUndoneShapes([])
        setToolMode('select')
        setSelectedShapeId(newShape.id)
        setShowStickerLibrary(false)
        
        if ('vibrate' in navigator) navigator.vibrate(10)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const createStickerFromCutout = () => {
    if (!cutoutPath || !stageRef.current) return
    
    const stage = stageRef.current
    
    // Calculate bounding box of the cutout path
    const points = cutoutPath.points
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    
    for (let i = 0; i < points.length; i += 2) {
      minX = Math.min(minX, points[i])
      maxX = Math.max(maxX, points[i])
      minY = Math.min(minY, points[i + 1])
      maxY = Math.max(maxY, points[i + 1])
    }
    
    const width = maxX - minX
    const height = maxY - minY
    
    if (width < 10 || height < 10) {
      setCutoutPath(null)
      setToolMode('draw')
      return
    }
    
    // Create a temporary canvas to extract the cutout
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const ctx = tempCanvas.getContext('2d')
    
    if (!ctx || !image) return
    
    // Draw the clipped image
    ctx.save()
    ctx.beginPath()
    
    // Translate path points relative to bounding box
    for (let i = 0; i < points.length; i += 2) {
      const x = points[i] - minX
      const y = points[i + 1] - minY
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.clip()
    
    // Draw the image portion
    ctx.drawImage(
      image,
      minX, minY, width, height,
      0, 0, width, height
    )
    ctx.restore()
    
    // Convert to image
    const dataUrl = tempCanvas.toDataURL('image/png')
    const img = new window.Image()
    img.onload = () => {
      // Add to sticker library
      const newSticker: Sticker = {
        id: `cutout-${Date.now()}`,
        image: img,
        thumbnail: dataUrl
      }
      setStickers([...stickers, newSticker])
      
      // Add to canvas
      const newShape: Shape = {
        id: `sticker-${Date.now()}`,
        type: 'sticker',
        x: minX,
        y: minY,
        width,
        height,
        image: img,
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      }
      
      setShapes([...shapes, newShape])
      setUndoneShapes([])
      setToolMode('select')
      setSelectedShapeId(newShape.id)
      setCutoutPath(null)
      
      if ('vibrate' in navigator) navigator.vibrate([10, 50, 10])
    }
    img.src = dataUrl
  }

  const handleSave = () => {
    const stage = stageRef.current
    if (!stage) return
    
    const originalScale = stage.scaleX()
    const originalPosition = stage.position()
    
    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })
    
    // Create a temporary canvas to export only the drawing layers (without the original image)
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvasDimensions.width
    tempCanvas.height = canvasDimensions.height
    const ctx = tempCanvas.getContext('2d')
    
    if (ctx) {
      // Draw lines
      lines.forEach(line => {
        ctx.save()
        ctx.globalCompositeOperation = line.globalCompositeOperation || 'source-over'
        ctx.strokeStyle = line.color
        ctx.lineWidth = line.width
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        
        // Apply texture effects
        if (line.texture === 'soft') {
          ctx.globalAlpha = 0.6
          ctx.shadowBlur = 2
          ctx.shadowColor = line.color
        } else if (line.texture === 'marker') {
          ctx.globalAlpha = 0.7
          ctx.lineCap = 'square'
        } else if (line.texture === 'spray') {
          ctx.globalAlpha = 0.3
          ctx.lineWidth = line.width * 1.5
        }
        
        ctx.beginPath()
        for (let i = 0; i < line.points.length; i += 2) {
          if (i === 0) {
            ctx.moveTo(line.points[i], line.points[i + 1])
          } else {
            ctx.lineTo(line.points[i], line.points[i + 1])
          }
        }
        ctx.stroke()
        ctx.restore()
      })
      
      // Draw shapes
      shapes.forEach(shape => {
        ctx.save()
        ctx.fillStyle = shape.fill
        ctx.strokeStyle = shape.stroke
        ctx.lineWidth = shape.strokeWidth
        
        if (shape.type === 'rect' && shape.width && shape.height) {
          if (shape.fill !== 'transparent') {
            ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
          }
          if (shape.stroke !== 'transparent') {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
          }
        } else if (shape.type === 'circle' && shape.radius) {
          ctx.beginPath()
          ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI)
          if (shape.fill !== 'transparent') {
            ctx.fill()
          }
          if (shape.stroke !== 'transparent') {
            ctx.stroke()
          }
        } else if (shape.type === 'text' && shape.text) {
          ctx.font = '24px sans-serif'
          ctx.fillStyle = shape.fill
          ctx.fillText(shape.text, shape.x, shape.y)
        } else if ((shape.type === 'image' || shape.type === 'sticker') && shape.image && shape.width && shape.height) {
          ctx.translate(shape.x + shape.width / 2, shape.y + shape.height / 2)
          ctx.rotate((shape.rotation || 0) * Math.PI / 180)
          ctx.scale(shape.scaleX || 1, shape.scaleY || 1)
          ctx.drawImage(shape.image, -shape.width / 2, -shape.height / 2, shape.width, shape.height)
        }
        ctx.restore()
      })
    }
    
    const drawingOnlyDataUrl = tempCanvas.toDataURL('image/png')
    
    stage.scale({ x: originalScale, y: originalScale })
    stage.position(originalPosition)
    
    onSave(drawingOnlyDataUrl)
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
    
    // Smoother zoom with smaller increments
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const scaleBy = 1.05 // Smaller increment for smoother zoom
    const newScale = direction > 0 
      ? Math.min(oldScale * scaleBy, 5) 
      : Math.max(oldScale / scaleBy, 0.5)
    
    setZoom(newScale)
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }
    
    stage.scale({ x: newScale, y: newScale })
    stage.position(newPos)
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

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col select-none">
      {/* Top Bar - Minimal */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 safe-top">
        <button
          onClick={onClose}
          className="w-10 h-10 bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 active:scale-95 transition-all flex items-center justify-center rounded-full touch-manipulation"
        >
          <X className="w-5 h-5" />
        </button>
        
        {cropArea && (
          <button
            onClick={applyCrop}
            className="w-10 h-10 bg-[#8B7355] text-white hover:bg-[#8B7355]/90 active:scale-95 transition-all flex items-center justify-center rounded-full touch-manipulation shadow-lg"
          >
            <Check className="w-5 h-5" />
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

      {/* Canvas Container - Full Screen */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative touch-none"
      >
        {/* Cutout Mode Instructions */}
        {toolMode === 'cutout' && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-3 rounded-full text-sm font-medium z-50 backdrop-blur-sm shadow-2xl">
            Draw around an area to create a sticker
          </div>
        )}

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
            draggable={toolMode === 'pan' || toolMode === 'select'}
            dragBoundFunc={(pos) => {
              // Allow free dragging
              return pos
            }}
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
                    if (shape.type === 'image' || shape.type === 'sticker' && shape.image) {
                      return (
                        <KonvaImage
                          key={shape.id}
                          id={shape.id}
                          x={shape.x}
                          y={shape.y}
                          image={shape.image}
                          width={shape.width}
                          height={shape.height}
                          rotation={shape.rotation || 0}
                          scaleX={shape.scaleX || 1}
                          scaleY={shape.scaleY || 1}
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
            {/* Cutout path overlay */}
            {cutoutPath && (
              <Layer>
                <Line
                  points={cutoutPath.points}
                  stroke="#8B7355"
                  strokeWidth={3}
                  dash={[10, 5]}
                  lineCap="round"
                  lineJoin="round"
                  closed={false}
                />
              </Layer>
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

      {/* Right Vertical Toolbar - Snapchat Style */}
      <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 sm:gap-3 z-40">
        {/* Drawing Tools */}
        <button
          onClick={() => {
            setToolMode('draw')
            if ('vibrate' in navigator) navigator.vibrate(5)
          }}
          className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-95 ${
            toolMode === 'draw' 
              ? 'bg-white text-[#8B7355]' 
              : 'bg-black/40 backdrop-blur-sm text-white hover:bg-black/60'
          }`}
        >
          <Pencil className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            setToolMode('eraser')
            if ('vibrate' in navigator) navigator.vibrate(5)
          }}
          className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-95 ${
            toolMode === 'eraser' 
              ? 'bg-white text-[#8B7355]' 
              : 'bg-black/40 backdrop-blur-sm text-white hover:bg-black/60'
          }`}
        >
          <Eraser className="w-5 h-5" />
        </button>

        {/* Color Picker Toggle */}
        <button
          onClick={() => {
            setShowColorPicker(!showColorPicker)
            setShowBrushSize(false)
            if ('vibrate' in navigator) navigator.vibrate(5)
          }}
          className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all shadow-lg bg-black/40 backdrop-blur-sm hover:bg-black/60 relative active:scale-95"
        >
          <div 
            className="w-6 h-6 rounded-full border-2 border-white"
            style={{ backgroundColor: currentColor }}
          />
        </button>

        {/* Brush Size Toggle */}
        <button
          onClick={() => {
            setShowBrushSize(!showBrushSize)
            setShowColorPicker(false)
            if ('vibrate' in navigator) navigator.vibrate(5)
          }}
          className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all shadow-lg bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 active:scale-95"
        >
          <div 
            className="bg-white rounded-full"
            style={{ 
              width: toolMode === 'eraser' ? Math.min(eraserSize / 2, 20) : Math.min(brushSize * 1.5, 20), 
              height: toolMode === 'eraser' ? Math.min(eraserSize / 2, 20) : Math.min(brushSize * 1.5, 20) 
            }}
          />
        </button>

        {/* Scissors/Sticker Tool */}
        <button
          onClick={() => {
            setShowStickerLibrary(!showStickerLibrary)
            setShowColorPicker(false)
            setShowBrushSize(false)
            if ('vibrate' in navigator) navigator.vibrate(5)
          }}
          className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all shadow-lg active:scale-95 ${
            showStickerLibrary 
              ? 'bg-white text-[#8B7355]' 
              : 'bg-black/40 backdrop-blur-sm text-white hover:bg-black/60'
          }`}
        >
          <Scissors className="w-5 h-5" />
        </button>

        {/* Undo/Redo */}
        <button
          onClick={undo}
          disabled={lines.length === 0 && shapes.length === 0}
          className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all shadow-lg bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 disabled:opacity-30 active:scale-95"
        >
          <Undo className="w-5 h-5" />
        </button>

        <button
          onClick={redo}
          disabled={undoneLines.length === 0 && undoneShapes.length === 0}
          className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all shadow-lg bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 disabled:opacity-30 active:scale-95"
        >
          <Redo className="w-5 h-5" />
        </button>

        {/* Toggle Drawing Visibility */}
        <button
          onClick={() => setShowDrawing(!showDrawing)}
          className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all shadow-lg bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 active:scale-95"
        >
          {showDrawing ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </div>

      {/* Color Picker Panel - Slides from right */}
      {showColorPicker && (
        <div className="absolute right-14 sm:right-20 top-1/2 -translate-y-1/2 w-72 sm:w-80 bg-gradient-to-br from-white to-gray-50 backdrop-blur-xl rounded-3xl shadow-2xl p-5 sm:p-6 z-50 max-h-[80vh] overflow-y-auto border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-2xl shadow-lg border-2 border-white ring-2 ring-gray-200"
                style={{ backgroundColor: currentColor }}
              />
              <div>
                <span className="text-base font-semibold text-gray-900 block">Color</span>
                <span className="text-xs text-gray-500">{currentColor.toUpperCase()}</span>
              </div>
            </div>
            <button
              onClick={() => setShowColorPicker(false)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Hue Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Hue</label>
              <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{Math.round(hue)}°</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => {
                  setHue(Number(e.target.value))
                  setSaturation(100) // Always use full saturation
                }}
                className="w-full h-3 rounded-full appearance-none cursor-pointer shadow-inner"
                style={{
                  background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
                }}
              />
            </div>
          </div>
          
          {/* Lightness Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Brightness</label>
              <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{Math.round(lightness)}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={lightness}
                onChange={(e) => setLightness(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer shadow-inner"
                style={{
                  background: `linear-gradient(to right, hsl(${hue}, 100%, 0%), hsl(${hue}, 100%, 50%), hsl(${hue}, 100%, 100%))`
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Brush Size Panel - Slides from right */}
      {showBrushSize && (
        <div className="absolute right-14 sm:right-20 top-1/2 -translate-y-1/2 w-44 sm:w-48 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-3 sm:p-4 z-50 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-900">
              {toolMode === 'eraser' ? 'Eraser' : 'Brush'} Size
            </span>
            <button
              onClick={() => setShowBrushSize(false)}
              className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
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
                  className={`aspect-square border-2 flex items-center justify-center transition-all active:scale-95 rounded-xl ${
                    currentSize === size ? 'border-[#8B7355] bg-[#8B7355]/10' : 'border-gray-200 bg-white hover:border-gray-400'
                  }`}
                >
                  <div 
                    className="bg-gray-900 rounded-full"
                    style={{ width: Math.min(size, 16), height: Math.min(size, 16) }}
                  />
                </button>
              )
            })}
          </div>

          {/* Brush Texture */}
          {toolMode === 'draw' && (
            <div className="mt-4">
              <div className="text-xs text-gray-600 mb-2">Texture</div>
              <div className="grid grid-cols-3 gap-2">
                {BRUSH_TEXTURES.map(texture => (
                  <button
                    key={texture.value}
                    onClick={() => setBrushTexture(texture.value)}
                    className={`flex flex-col items-center p-2 border-2 transition-all active:scale-95 rounded-xl ${
                      brushTexture === texture.value ? 'border-[#8B7355] bg-[#8B7355]/10' : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    <span className="text-lg mb-0.5">{texture.icon}</span>
                    <span className="text-[9px] text-gray-600">{texture.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sticker Library Panel - Slides from right */}
      {showStickerLibrary && (
        <div className="absolute right-14 sm:right-20 top-1/2 -translate-y-1/2 w-64 sm:w-72 bg-gradient-to-br from-white to-gray-50 backdrop-blur-xl rounded-3xl shadow-2xl p-5 sm:p-6 z-50 max-h-[80vh] overflow-y-auto border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-semibold text-gray-900">Stickers</span>
            <button
              onClick={() => setShowStickerLibrary(false)}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="mb-4 space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#8B7355] to-[#A0826D] text-white rounded-2xl font-medium text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ImagePlus className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
            
            <button
              onClick={() => {
                setToolMode('cutout')
                setShowStickerLibrary(false)
                setCutoutPath(null)
                if ('vibrate' in navigator) navigator.vibrate(10)
              }}
              className="w-full py-3 px-4 bg-white border-2 border-[#8B7355] text-[#8B7355] rounded-2xl font-medium text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4" />
              <span>Draw Cutout</span>
            </button>
          </div>

          {/* Sticker Grid */}
          {stickers.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => {
                    // Add sticker to canvas
                    const newShape: Shape = {
                      id: `sticker-${Date.now()}`,
                      type: 'sticker',
                      x: canvasDimensions.width / 2 - 75,
                      y: canvasDimensions.height / 2 - 75,
                      width: 150,
                      height: 150,
                      image: sticker.image,
                      fill: 'transparent',
                      stroke: 'transparent',
                      strokeWidth: 0,
                      rotation: 0,
                      scaleX: 1,
                      scaleY: 1
                    }
                    setShapes([...shapes, newShape])
                    setUndoneShapes([])
                    setToolMode('select')
                    setSelectedShapeId(newShape.id)
                    setShowStickerLibrary(false)
                    if ('vibrate' in navigator) navigator.vibrate(10)
                  }}
                  className="aspect-square rounded-2xl border-2 border-gray-200 hover:border-[#8B7355] active:scale-95 transition-all overflow-hidden bg-white shadow-sm hover:shadow-md"
                >
                  <img 
                    src={sticker.thumbnail} 
                    alt="Sticker" 
                    className="w-full h-full object-contain p-2"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ImagePlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No stickers yet</p>
              <p className="text-xs mt-1">Upload an image or draw a cutout</p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Save Button */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 safe-bottom">
        <button
          onClick={handleSave}
          className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-[#8B7355] font-medium text-sm rounded-full shadow-2xl hover:bg-gray-50 active:scale-95 transition-all"
        >
          Save Design
        </button>
      </div>
    </div>
  )
}
