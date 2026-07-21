from PIL import Image
import os

src = r"C:\Users\USER\.cursor\projects\c-Users-USER-OneDrive-Desktop-Modestus\assets\c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_94a3df3f6fe0ac9b0d26fcdc956cfe07_images_media__1784441360125-bca44b61-98bb-4a93-8c7f-d0a45e749040.png"
out_dir = r"c:\Users\USER\OneDrive\Desktop\Modestus\public\images"
os.makedirs(out_dir, exist_ok=True)

img = Image.open(src)
W, H = img.size
print(f"Source: {W}x{H}")

crops = {
    "hero-model.png": (210, 115, 440, 395),
    "category-men.png": (22, 422, 108, 512),
    "category-women.png": (215, 422, 301, 512),
    "category-kids.png": (418, 422, 504, 512),
    "promo-model.png": (300, 555, 605, 725),
    "product-1.png": (5, 900, 147, 1018),
    "product-2.png": (155, 900, 297, 1018),
    "product-3.png": (305, 900, 447, 1018),
    "product-4.png": (455, 900, 597, 1018),
}

for name, box in crops.items():
    cropped = img.crop(box)
    path = os.path.join(out_dir, name)
    cropped.save(path)
    print(f"Saved {name}: {cropped.size}")
