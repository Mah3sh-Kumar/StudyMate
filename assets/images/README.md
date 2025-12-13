# Assets Images Directory

This directory contains the app icons and images required by StudyMate.

## Required Images

Based on `app.json`, the following images are required:

### 1. **icon.png** (Main App Icon)
- **Path:** `./assets/images/icon.png`
- **Usage:** Main app icon for iOS and general use
- **Recommended Size:** 1024x1024 pixels
- **Format:** PNG with transparency support

### 2. **adaptive-icon.png** (Android Adaptive Icon)
- **Path:** `./assets/images/adaptive-icon.png`
- **Usage:** Android adaptive icon foreground
- **Recommended Size:** 1024x1024 pixels
- **Format:** PNG with transparency
- **Note:** Background color is set to `#ffffff` in app.json

### 3. **favicon.png** (Web Favicon)
- **Path:** `./assets/images/favicon.png`
- **Usage:** Web browser favicon
- **Recommended Size:** 32x32 or 64x64 pixels
- **Format:** PNG or ICO

### 4. **splash-icon.png** (Splash Screen Icon)
- **Path:** `./assets/images/splash-icon.png`
- **Usage:** Splash screen icon
- **Recommended Size:** 200x200 pixels (width set to 200 in config)
- **Format:** PNG
- **Note:** Resize mode is set to "contain" with white background

## Creating Icons

### Option 1: Use an Icon Generator
1. Visit [Expo Icon Generator](https://www.appicon.co/) or [IconKitchen](https://icon.kitchen/)
2. Upload a 1024x1024 PNG image
3. Generate all required sizes
4. Download and place in this directory

### Option 2: Create Manually
1. Design a 1024x1024 icon in your preferred design tool
2. Export as PNG with transparency
3. Use the same file for `icon.png` and `adaptive-icon.png`
4. Create a smaller version (32x32 or 64x64) for `favicon.png`
5. Create a 200x200 version for `splash-icon.png`

### Option 3: Use a Placeholder
For development, you can use a simple colored square:
- Create a 1024x1024 PNG with a solid color or simple design
- Copy it to all required filenames

## Quick Setup (Temporary Placeholder)

If you need to quickly create placeholder images, you can:

1. **Using ImageMagick** (if installed):
```bash
# Create placeholder icon
convert -size 1024x1024 xc:#4A90E2 -pointsize 200 -fill white -gravity center -annotate +0+0 "SM" assets/images/icon.png

# Copy for other icons
cp assets/images/icon.png assets/images/adaptive-icon.png
cp assets/images/icon.png assets/images/favicon.png
cp assets/images/icon.png assets/images/splash-icon.png
```

2. **Using Online Tools:**
   - Visit https://dummyimage.com/1024x1024/4A90E2/ffffff.png&text=SM
   - Download and save as `icon.png`
   - Resize copies for other sizes

3. **Using Design Tools:**
   - Figma, Canva, or Adobe Illustrator
   - Export at required sizes

## Icon Design Tips

- **Keep it simple:** Icons should be recognizable at small sizes
- **Use high contrast:** Ensure visibility on various backgrounds
- **Follow platform guidelines:**
  - iOS: [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
  - Android: [Material Design Icons](https://material.io/design/iconography/product-icons.html)

## Current Status

⚠️ **Missing Images:** All image files are currently missing. The app will not build until these are added.

---

**Note:** Once you add the image files, restart your Expo development server for changes to take effect.

