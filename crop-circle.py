#!/usr/bin/env python3
from PIL import Image, ImageDraw
import sys

def crop_to_circle(input_path, output_path):
    # Open the image
    img = Image.open(input_path).convert("RGBA")
    
    # Get dimensions
    width, height = img.size
    
    # Create a mask
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    # Draw a white circle on the mask
    draw.ellipse((0, 0, width, height), fill=255)
    
    # Apply the mask to the image
    output = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    output.paste(img, (0, 0))
    output.putalpha(mask)
    
    # Save the result
    output.save(output_path, 'PNG')
    print(f"Circular crop saved to {output_path}")

if __name__ == "__main__":
    crop_to_circle("public/logo-icon.png", "public/logo-icon.png")
