# Konva.js Drawing Canvas Features

## Overview
Your drawing canvas now uses Konva.js, a powerful 2D canvas library that provides better performance and more features than vanilla canvas.

## Implemented Features

### Drawing Tools
- **Freehand Drawing** - Draw with multiple brush textures (solid, soft, spray, marker, pencil)
- **Eraser** - Remove parts of your drawing
- **Shapes** - Add rectangles and circles
- **Text** - Add text annotations
- **Select Mode** - Select, move, resize, and rotate shapes using Konva's Transformer

### Brush Features
- 5 brush textures with different visual effects
- 10 brush sizes (1px to 32px)
- 16 color options
- Separate eraser size control

### Canvas Controls
- **Zoom In/Out** - Mouse wheel or buttons (0.5x to 5x)
- **Pan Mode** - Drag to move around the canvas
- **Show/Hide Drawing** - Toggle drawing layer visibility
- **Undo/Redo** - Full history for both lines and shapes
- **Clear All** - Remove all drawings and shapes
- **Delete Selected** - Remove individual shapes

### Konva-Specific Benefits
1. **Layer Management** - Separate layers for image, drawings, and shapes
2. **Transform Controls** - Built-in transformer for shape manipulation
3. **Hardware Acceleration** - Better performance on all devices
4. **Event Handling** - Precise mouse/touch event handling with coordinate transformation
5. **High-Quality Export** - Export at 2x pixel ratio for crisp images

### Shape Manipulation
When in Select Mode:
- Click on any shape to select it
- Drag to move
- Use corner handles to resize
- Use rotation handle to rotate
- Delete button appears when shape is selected

## Usage

The canvas automatically handles:
- Touch and mouse events
- Zoom transformations
- Pan offsets
- Shape selection and manipulation
- Export without zoom/pan applied

## Technical Details

- Uses `react-konva` for React integration
- Konva Transformer for shape manipulation
- Separate layers for optimal rendering
- Coordinate transformation for accurate drawing at any zoom level
- High-resolution export (2x pixel ratio)
