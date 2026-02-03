# 🔧 How to Load the Extension in Chrome

## ⚠️ Common Error: "Service worker registration failed"

If you see this error:
```
Service worker registration failed. Status code: 11
Uncaught SyntaxError: Cannot use import statement outside a module
```

**This means you're loading from the wrong directory!**

---

## ✅ Correct Way to Load the Extension

### Step 1: Build the Extension
```bash
npm run build
```

This creates the `dist/` folder with all compiled JavaScript files.

### Step 2: Open Chrome Extensions Page
1. Open Chrome/Edge
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)

### Step 3: Load from the DIST folder
1. Click **"Load unpacked"**
2. Navigate to: `/Users/huy/Desktop/gptprompt/dist` ⚠️ **NOT the root folder!**
3. Select the `dist` folder
4. Click **"Select"**

---

## 📁 Directory Structure Explained

```
gptprompt/
├── manifest.json          ❌ DO NOT load from here (source files)
├── src/                   ❌ TypeScript source files
│   ├── background/
│   │   └── index.ts      ❌ TypeScript (not executable)
│   └── content/
│       └── index.tsx     ❌ TypeScript (not executable)
│
└── dist/                  ✅ LOAD FROM HERE!
    ├── manifest.json      ✅ Built manifest
    ├── service-worker-loader.js  ✅ Compiled JavaScript
    └── assets/
        └── *.js           ✅ All compiled files
```

---

## 🎯 Quick Fix

If you already loaded from the wrong folder:

1. Go to `chrome://extensions/`
2. Find "GPTPrompt"
3. Click **Remove**
4. Run `npm run build`
5. Click **Load unpacked**
6. Select `/Users/huy/Desktop/gptprompt/dist` ✅
7. Done!

---

## 🔄 Development Workflow

### Option 1: Manual Build (Recommended for Testing)
```bash
# Make changes to code
npm run build

# Reload extension in Chrome
# Click the refresh icon on the extension card
```

### Option 2: Watch Mode (Auto-rebuild)
```bash
# Terminal 1: Watch and rebuild on changes
npm run dev

# Chrome will auto-reload (HMR)
```

### Option 3: Production Build
```bash
# For final testing or distribution
npm run build

# Load dist/ folder in Chrome
```

---

## 🐛 Troubleshooting

### Issue: Extension doesn't appear after loading
**Solution**: Make sure you selected the `dist` folder, not the root folder.

### Issue: Changes not showing up
**Solution**: 
1. Run `npm run build`
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension card

### Issue: "Unexpected token 'export'"
**Solution**: You're loading source TypeScript files instead of built JavaScript. Load from `dist/` folder.

### Issue: "Failed to load module script"
**Solution**: Run `npm run build` first, then load from `dist/` folder.

---

## ✅ Verify Installation

After loading, you should see:

1. ✅ Extension icon in toolbar
2. ✅ No errors in `chrome://extensions/`
3. ✅ Can click extension icon to open popup
4. ✅ Can press `Cmd+J` (Mac) or `Ctrl+J` (Windows/Linux) on ChatGPT pages

To test:
1. Go to https://chat.openai.com
2. Press `Cmd+J` or `Ctrl+J`
3. Prompt picker should appear

---

## 📦 Build Output Verification

After running `npm run build`, verify these files exist:

```bash
ls -la dist/
# Should see:
# - manifest.json
# - service-worker-loader.js
# - assets/
# - src/
# - public/
```

If any are missing, the build failed. Check for errors in the terminal.

---

## 🚀 Ready to Test!

Once loaded from `dist/`:
- ✅ No service worker errors
- ✅ Extension works correctly
- ✅ All TypeScript is compiled to JavaScript
- ✅ All features functional
