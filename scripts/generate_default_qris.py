from PIL import Image, ImageDraw, ImageFont
import os

output_path = r"c:\Users\andik\OneDrive\Documents\TEKNIK INFORMATIKA\Project\Masjid Sudalmiyah\public\images\qris-sudalmiyah.png"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

width, height = 600, 760
img = Image.new("RGBA", (width, height), (250, 248, 245, 255))
draw = ImageDraw.Draw(img)

# Card background with border
card_x0, card_y0, card_x1, card_y1 = 30, 30, 570, 730
draw.rounded_rectangle([card_x0, card_y0, card_x1, card_y1], radius=24, fill=(255, 255, 255, 255), outline=(229, 231, 235, 255), width=2)

# Red Top Bar
draw.rounded_rectangle([60, 55, 540, 105], radius=12, fill=(185, 28, 28, 255))
draw.text((300, 80), "QRIS", fill=(255, 255, 255, 255), anchor="mm")

# Merchant Info
draw.text((300, 140), "MASJID SUDALMIYAH RAIS UMS", fill=(28, 25, 23, 255), anchor="mm")
draw.text((300, 165), "NMID: ID1020260389100", fill=(120, 113, 108, 255), anchor="mm")
draw.text((300, 185), "Universitas Muhammadiyah Surakarta", fill=(168, 162, 158, 255), anchor="mm")

# QR Box Outline
draw.rounded_rectangle([130, 215, 470, 555], radius=16, fill=(255, 255, 255, 255), outline=(229, 231, 235, 255), width=2)

# QR Finder Patterns (Top-Left, Top-Right, Bottom-Left)
def draw_finder(x, y):
    draw.rounded_rectangle([x, y, x + 64, y + 64], radius=8, fill=(28, 25, 23, 255))
    draw.rounded_rectangle([x + 10, y + 10, x + 54, y + 54], radius=6, fill=(255, 255, 255, 255))
    draw.rounded_rectangle([x + 20, y + 20, x + 44, y + 44], radius=4, fill=(28, 25, 23, 255))

draw_finder(155, 240)
draw_finder(381, 240)
draw_finder(155, 466)

# Timing Patterns & Modules
for i in range(16):
    for j in range(16):
        px = 235 + i * 8
        py = 240 + j * 18
        if (i + j) % 2 == 0 or (i * j) % 3 == 0:
            draw.rectangle([px, py, px + 5, py + 5], fill=(28, 25, 23, 255))

# Center Red QRIS Badge
draw.rounded_rectangle([270, 365, 330, 405], radius=6, fill=(185, 28, 28, 255))
draw.text((300, 385), "QRIS", fill=(255, 255, 255, 255), anchor="mm")

# Bottom Info
draw.text((300, 610), "Mendukung Semua Aplikasi E-Wallet & Mobile Banking", fill=(68, 64, 60, 255), anchor="mm")
draw.text((300, 635), "BSI, BCA, Mandiri, BRI, GoPay, OVO, ShopeePay, DANA, LinkAja", fill=(120, 113, 108, 255), anchor="mm")
draw.text((300, 680), "Terdaftar Resmi Bank Indonesia & ASPI", fill=(13, 92, 88, 255), anchor="mm")

img.save(output_path, "PNG")
print("Saved default QRIS image at:", output_path)
