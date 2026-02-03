# 🚀 Quick Start: Load Extension

## ⚡ 3 Steps to Load

1. **Build**
   ```bash
   npm run build
   ```

2. **Open Chrome Extensions**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"

3. **Load Unpacked**
   - Click "Load unpacked"
   - Select `/Users/huy/Desktop/gptprompt/dist` ✅
   - **NOT** the root folder ❌

---

## ⚠️ Fix "Service Worker Failed" Error

You loaded from the **wrong folder**!

**Wrong**: `/Users/huy/Desktop/gptprompt` ❌  
**Correct**: `/Users/huy/Desktop/gptprompt/dist` ✅

**Solution**:
1. Remove the extension
2. Load from `dist/` folder

---

## 🔄 After Code Changes

```bash
# Rebuild
npm run build

# In Chrome, click refresh icon on extension card
```

---

## ✅ Test It Works

1. Go to https://chat.openai.com
2. Press `Cmd+J` (Mac) or `Ctrl+J` (Windows)
3. Prompt picker should appear!

---

See **LOADING-EXTENSION.md** for detailed troubleshooting.
