# Drawing Canvas - Visual Feature Guide

## 🎨 Main Interface

```
┌─────────────────────────────────────────────────┐
│  [X]        Draw on Image              [SAVE]   │ ← Header
├─────────────────────────────────────────────────┤
│                                                  │
│                                    ┌──────┐     │
│                                    │ [+]  │     │ ← Zoom In
│                                    ├──────┤     │
│                                    │ [-]  │     │ ← Zoom Out
│         [Your Image Here]          ├──────┤     │
│         with drawing overlay       │ [⊡]  │     │ ← Reset Zoom
│                                    ├──────┤     │
│                                    │ [👁] │     │ ← Toggle Drawing
│                                    └──────┘     │
│                                                  │
│         "Pinch to zoom • Scroll to zoom"        │ ← Help Text
├─────────────────────────────────────────────────┤
│  [Undo] [Redo] [Clear]                          │ ← Actions
│  ┌─────────────────────────────────────────┐   │
│  │ 💡 Tip: Use zoom for precise details    │   │ ← Tip
│  └─────────────────────────────────────────┘   │
│  [🎨 Color]                          [●]        │ ← Color Picker
│  [● Texture]                      Solid         │ ← Texture Picker
│  [● Brush Size]                    8px          │ ← Size Picker
└─────────────────────────────────────────────────┘
```

## 🔍 Zoom Levels

```
0.5x  ─────────────  1x  ─────────────  5x
 ↓                    ↓                   ↓
[Full View]    [Normal View]    [Max Detail]
```

## 🎨 Color Palette (16 Colors)

```
Row 1: Gray  Black  White  Red    Pink   Yellow
Row 2: Green Cyan   Blue   Magenta Orange DarkPink
Row 3: Mint  Purple Coral  Gold
```

## 🖌️ Brush Sizes (10 Options)

```
1px  2px  4px  6px  8px  12px  16px  20px  24px  32px
 •    •    •    •    •     •     •     •     •     •
```

## 🎭 Brush Textures (5 Types)

```
● Solid   - Clean, precise lines
◉ Soft    - Blurred, gentle edges
⊙ Spray   - Scattered, airbrush effect
▬ Marker  - Flat, semi-transparent
✎ Pencil  - Textured, sketchy
```

## 📱 Mobile Gestures

### Zoom
```
    👆👆
   /    \
  /      \
 👇      👇
Pinch = Zoom Out

    👇👇
   \    /
    \  /
     👆
Spread = Zoom In
```

### Draw
```
    👆
    |
    |  ← Single finger
    |
    👇
Draw on canvas
```

## 🖱️ Desktop Controls

### Zoom
```
Mouse Wheel ↑ = Zoom In
Mouse Wheel ↓ = Zoom Out
```

### Draw
```
Click + Drag = Draw
```

## 🎯 Workflow Example

### Creating Detailed Nail Art

1. **Start**: Open drawing canvas
   ```
   [Original Image] → [Draw Button] → [Canvas Opens]
   ```

2. **Zoom In**: Focus on one nail
   ```
   [1x View] → [Pinch/Zoom In] → [3x View]
   ```

3. **Select Tools**: Choose color and brush
   ```
   [Color: Pink] + [Texture: Solid] + [Size: 2px]
   ```

4. **Draw Details**: Add precise designs
   ```
   [Draw on zoomed nail] → [Fine details visible]
   ```

5. **Check Work**: Toggle drawing visibility
   ```
   [Eye Icon] → [See original] → [Eye Icon] → [See drawing]
   ```

6. **Zoom Out**: See full result
   ```
   [3x View] → [Reset Zoom] → [1x View]
   ```

7. **Save**: Export your work
   ```
   [Save Button] → [Image saved at full resolution]
   ```

## 💡 Pro Tips

### For Best Results

1. **Zoom Level by Task**:
   - 0.5x-1x: Overall composition
   - 2x-3x: Individual nail details
   - 4x-5x: Ultra-fine details (gems, lines)

2. **Brush Size by Zoom**:
   - At 1x: Use 8-16px for coverage
   - At 2x: Use 4-8px for details
   - At 3x+: Use 1-4px for precision

3. **Color Selection**:
   - Start with base colors (gray, white, black)
   - Add accent colors (pink, gold, coral)
   - Use white for highlights

4. **Texture Usage**:
   - Solid: Main designs, outlines
   - Soft: Shadows, gradients
   - Spray: Glitter effects
   - Marker: Color fills
   - Pencil: Sketchy details

## 🚀 Quick Actions

```
Action              Desktop         Mobile
─────────────────────────────────────────────
Zoom In             Scroll Up       Pinch Out
Zoom Out            Scroll Down     Pinch In
Reset Zoom          [⊡] Button      [⊡] Button
Toggle Drawing      [👁] Button     [👁] Button
Undo                [Undo] Button   [Undo] Button
Redo                [Redo] Button   [Redo] Button
Clear All           [Clear] Button  [Clear] Button
Save                [Save] Button   [Save] Button
Close               [X] Button      [X] Button
```

## 🎨 Example Use Cases

### 1. French Tip Enhancement
```
1. Zoom to 2x on nail tips
2. Select white color, solid texture, 4px brush
3. Draw clean white tips
4. Zoom out to check symmetry
```

### 2. Glitter Accent
```
1. Select spray texture
2. Choose gold or silver color
3. Light taps for sparkle effect
4. Toggle visibility to check coverage
```

### 3. Detailed Nail Art
```
1. Zoom to 3x on target nail
2. Use 1-2px brush for fine lines
3. Switch colors as needed
4. Use undo liberally for perfection
```

### 4. Color Correction
```
1. Zoom to problem area
2. Select matching color
3. Use soft texture for blending
4. Larger brush for coverage
```
