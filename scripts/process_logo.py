from PIL import Image, ImageOps
import numpy as np
import os

source_path = r"C:\Users\andik\.gemini\antigravity\brain\6a7001e2-f14d-450f-b528-dc2cf1dceac5\.user_uploaded\media_1791682455403_2e75dc58.jpg"
output_dir = r"c:\Users\andik\OneDrive\Documents\TEKNIK INFORMATIKA\Project\Masjid Sudalmiyah\public\images\logo"
os.makedirs(output_dir, exist_ok=True)

img = Image.open(source_path).convert("RGBA")
print(f"Source image size: {img.size}")

# Let's inspect the pixels
# Background is white / off-white (~240-255).
# The logo itself is dark/black (~0-40).
data = np.array(img, dtype=np.float32)

# Calculate lightness / grayscale value: 0 is black, 255 is white
gray = 0.299 * data[:, :, 0] + 0.587 * data[:, :, 1] + 0.114 * data[:, :, 2]

# Thresholding with smooth anti-aliasing:
# If gray > 230: alpha = 0 (completely transparent)
# If gray < 100: alpha = 255 (completely solid)
# In between: smooth transition
alpha = np.clip((230.0 - gray) / (230.0 - 100.0) * 255.0, 0, 255).astype(np.uint8)

# 1. Dark/Black version (pure dark #1a1a1a or original black)
dark_logo = np.zeros((img.height, img.width, 4), dtype=np.uint8)
dark_logo[:, :, 0] = 20   # R
dark_logo[:, :, 1] = 20   # G
dark_logo[:, :, 2] = 20   # B
dark_logo[:, :, 3] = alpha
img_dark = Image.fromarray(dark_logo, mode="RGBA")
# Crop bounding box of non-transparent pixels with slight padding
bbox = img_dark.getbbox()
if bbox:
    padding = 10
    crop_box = (
        max(0, bbox[0] - padding),
        max(0, bbox[1] - padding),
        min(img_dark.width, bbox[2] + padding),
        min(img_dark.height, bbox[3] + padding)
    )
    img_dark_cropped = img_dark.crop(crop_box)
else:
    img_dark_cropped = img_dark

img_dark_cropped.save(os.path.join(output_dir, "logo-masjid.png"), "PNG")
print("Saved logo-masjid.png")

# 2. White version for dark backgrounds (Footer, Hero banner)
white_logo = np.zeros((img.height, img.width, 4), dtype=np.uint8)
white_logo[:, :, 0] = 255 # R
white_logo[:, :, 1] = 255 # G
white_logo[:, :, 2] = 255 # B
white_logo[:, :, 3] = alpha
img_white = Image.fromarray(white_logo, mode="RGBA")
if bbox:
    img_white_cropped = img_white.crop(crop_box)
else:
    img_white_cropped = img_white

img_white_cropped.save(os.path.join(output_dir, "logo-masjid-white.png"), "PNG")
print("Saved logo-masjid-white.png")

# 3. Gold version (#D4AF37)
gold_logo = np.zeros((img.height, img.width, 4), dtype=np.uint8)
gold_logo[:, :, 0] = 212 # R (D4)
gold_logo[:, :, 1] = 175 # G (AF)
gold_logo[:, :, 2] = 55  # B (37)
gold_logo[:, :, 3] = alpha
img_gold = Image.fromarray(gold_logo, mode="RGBA")
if bbox:
    img_gold_cropped = img_gold.crop(crop_box)
else:
    img_gold_cropped = img_gold

img_gold_cropped.save(os.path.join(output_dir, "logo-masjid-gold.png"), "PNG")
print("Saved logo-masjid-gold.png")

# Also copy as favicon / app icon in public/
img_dark_cropped.resize((64, 64), Image.Resampling.LANCZOS).save(
    os.path.join(r"c:\Users\andik\OneDrive\Documents\TEKNIK INFORMATIKA\Project\Masjid Sudalmiyah\public", "favicon.ico"),
    "ICO"
)
print("Updated favicon.ico")
