#!/usr/bin/env python3
from PIL import Image, ImageDraw
import sys

# Load the original splash image
img = Image.open('assets/splash.png')
width, height = img.size

# Create a new image with ivory background
new_size = 2732  # Standard iOS splash size
new_img = Image.new('RGBA', (new_size, new_size), (255, 245, 240, 255))  # #FFF5F0

# Calculate scaled size (60% of original)
scale_factor = 0.6
scaled_width = int(width * scale_factor)
scaled_height = int(height * scale_factor)

# Resize the original image
scaled_img = img.resize((scaled_width, scaled_height), Image.Resampling.LANCZOS)

# Calculate position to center the scaled image
x = (new_size - scaled_width) // 2
y = (new_size - scaled_height) // 2

# Paste the scaled image onto the new background
new_img.paste(scaled_img, (x, y), scaled_img if scaled_img.mode == 'RGBA' else None)

# Save the new splash screen
new_img.save('assets/splash-scaled.png')
print(f"Created splash-scaled.png: {new_size}x{new_size} with design at 60% scale")

# Also save as the main splash
new_img.save('assets/splash.png')
print(f"Updated splash.png")
