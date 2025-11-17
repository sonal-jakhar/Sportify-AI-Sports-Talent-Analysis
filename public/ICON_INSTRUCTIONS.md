# PWA Icon Instructions

This app requires two icon files for PWA functionality:

1. `icon-192.png` - 192x192 pixels
2. `icon-512.png` - 512x512 pixels

These icons should be placed in the `public/` directory.

## ✅ Quick Setup (Recommended)

### Option 1: Using Node.js Script (Easiest)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate icons:
   ```bash
   npm run generate-icons
   ```

This will automatically create `icon-192.png` and `icon-512.png` from the SVG source.

### Option 2: Using HTML Generator (No Node.js Required)

1. Open `scripts/generate-icons-html.html` in your web browser
2. Click "Generate Icons"
3. Right-click each icon preview and "Save Image As..."
4. Save as `icon-192.png` and `icon-512.png` in the `public/` folder

### Option 3: Manual Generation

1. Use an online tool like [RealFaviconGenerator](https://realfavicongenerator.net/) or [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
2. Upload `public/icon.svg` as source
3. Generate and download the required sizes
4. Place the PNG files in the `public/` directory

### Option 4: Using ImageMagick

```bash
convert -resize 192x192 public/icon.svg public/icon-192.png
convert -resize 512x512 public/icon.svg public/icon-512.png
```

## 📝 Notes

- The SVG source file (`icon.svg`) is already created in `public/`
- Icons use the Sportify brand color (#2563eb)
- Icons represent sports/athletics theme with AI/analysis elements
- After generating icons, the PWA will be fully installable
