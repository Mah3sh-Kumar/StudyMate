# Quick Setup Guide

## Option 1: Generate Placeholder Images (Recommended for Development)

### Using the Script (Requires Node.js)

1. Install sharp package:
```bash
npm install sharp
# or
pnpm add sharp
```

2. Run the placeholder generator:
```bash
node assets/images/create-placeholders.js
```

This will create all required placeholder images with a simple "SM" logo.

---

## Option 2: Download Placeholder Images

### Quick Online Solution:

1. Visit https://dummyimage.com/
2. Create images with these settings:
   - **icon.png**: https://dummyimage.com/1024x1024/4A90E2/ffffff.png&text=SM
   - **adaptive-icon.png**: Same as above (copy icon.png)
   - **favicon.png**: https://dummyimage.com/64x64/4A90E2/ffffff.png&text=SM
   - **splash-icon.png**: https://dummyimage.com/200x200/4A90E2/ffffff.png&text=SM

3. Download and save each to `assets/images/` with the correct filename

---

## Option 3: Use Your Own Icon

1. Create or find a 1024x1024 PNG image
2. Save it as `icon.png` in this folder
3. Copy it to:
   - `adaptive-icon.png` (same file)
   - `favicon.png` (resize to 64x64)
   - `splash-icon.png` (resize to 200x200)

---

## Option 4: Use Expo's Default Icon (Temporary)

If you just need to get the app running, you can temporarily comment out the icon in `app.json`:

```json
{
  "expo": {
    // "icon": "./assets/images/icon.png",  // Comment this out temporarily
    ...
  }
}
```

Then Expo will use a default icon.

---

## After Adding Images

1. Restart your Expo development server:
```bash
npm start
# or
pnpm start
```

2. Clear cache if needed:
```bash
npx expo start -c
```

---

**Note:** For production, replace placeholders with proper app icons designed for your brand.

