# Development Guide

**Document Version**: 1.0.0  
**Last Updated**: 2026-02-01  
**Status**: ✅ Complete

---

## 1. Prerequisites

### 1.1 Required Software

| Software | Minimum Version | Recommended |
|----------|----------------|-------------|
| Node.js | 18.0.0 | 20.x LTS |
| npm | 9.0.0 | 10.x |
| Chrome/Chromium | 116+ | Latest |
| Git | 2.30+ | Latest |

### 1.2 Recommended VS Code Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "styled-components.vscode-styled-components",
    "ms-playwright.playwright"
  ]
}
```

---

## 2. Project Setup

### 2.1 Initialize Project

```bash
# Create project directory
mkdir gptprompt-extension
cd gptprompt-extension

# Initialize npm project
npm init -y

# Install core dependencies
npm install react react-dom cmdk

# Install dev dependencies
npm install -D \
  typescript \
  vite \
  @crxjs/vite-plugin \
  @types/chrome \
  @types/react \
  @types/react-dom \
  tailwindcss \
  postcss \
  autoprefixer \
  eslint \
  prettier \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  vitest \
  @testing-library/react \
  jsdom
```

### 2.2 Project Structure

Create the following directory structure:

```
gptprompt-extension/
├── src/
│   ├── background/
│   │   └── index.ts              # Service worker
│   ├── content/
│   │   ├── index.ts              # Content script entry
│   │   ├── picker/
│   │   │   ├── Picker.tsx        # Command palette component
│   │   │   ├── PickerItem.tsx    # Individual prompt item
│   │   │   └── index.tsx         # Picker mount/unmount logic
│   │   └── chatgpt-dom.ts        # ChatGPT DOM utilities
│   ├── popup/
│   │   ├── index.html            # Popup HTML
│   │   ├── main.tsx              # Popup entry
│   │   ├── App.tsx               # Popup root component
│   │   ├── pages/
│   │   │   ├── PromptList.tsx    # List view
│   │   │   └── PromptForm.tsx    # Add/Edit form
│   │   └── components/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── PromptCard.tsx
│   ├── shared/
│   │   ├── storage.ts            # Storage API wrapper
│   │   ├── messaging.ts          # Chrome messaging utilities
│   │   ├── types.ts              # TypeScript types
│   │   └── utils.ts              # Shared utilities
│   └── styles/
│       └── globals.css           # Tailwind + global styles
├── public/
│   └── icons/
│       ├── icon16.png
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png
├── tests/
│   ├── unit/
│   │   ├── storage.test.ts
│   │   └── utils.test.ts
│   └── e2e/
│       └── popup.spec.ts
├── manifest.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
└── package.json
```

### 2.3 Configuration Files

#### manifest.json

```json
{
  "manifest_version": 3,
  "name": "GPTPrompt - Prompt Library for ChatGPT",
  "version": "1.0.0",
  "description": "Save and manage prompt templates for ChatGPT",
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["https://chat.openai.com/*", "https://chatgpt.com/*"],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "public/icons/icon16.png",
      "32": "public/icons/icon32.png",
      "48": "public/icons/icon48.png",
      "128": "public/icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://chat.openai.com/*", "https://chatgpt.com/*"],
      "js": ["src/content/index.ts"],
      "run_at": "document_idle"
    }
  ],
  "commands": {
    "open-picker": {
      "suggested_key": {
        "default": "Ctrl+J",
        "mac": "Command+J"
      },
      "description": "Open prompt picker"
    }
  },
  "icons": {
    "16": "public/icons/icon16.png",
    "32": "public/icons/icon32.png",
    "48": "public/icons/icon48.png",
    "128": "public/icons/icon128.png"
  }
}
```

#### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
    },
  },
});
```

#### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["chrome", "vitest/globals"]
  },
  "include": ["src/**/*", "tests/**/*"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#10a37f',
          hover: '#0d8a6a',
          light: '#d1f3e7',
        },
      },
      animation: {
        'picker-enter': 'picker-enter 150ms ease-out',
        'picker-exit': 'picker-exit 100ms ease-in',
      },
      keyframes: {
        'picker-enter': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(-8px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'picker-exit': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.96)' },
        },
      },
    },
  },
  plugins: [],
};
```

#### .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_' },
    ],
  },
};
```

#### .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

---

## 3. Development Workflow

### 3.1 NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit"
  }
}
```

### 3.2 Development Mode

```bash
# Start development server with HMR
npm run dev
```

The extension will be built to the `dist` directory.

### 3.3 Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `dist` folder
5. The extension is now installed for development

### 3.4 Hot Module Replacement

With `@crxjs/vite-plugin`, changes to:
- **Popup/Content Script React components**: Auto-refresh
- **Background service worker**: Manual reload required
- **manifest.json**: Manual reload required

---

## 4. Coding Standards

### 4.1 TypeScript Guidelines

```typescript
// ✅ DO: Use explicit types for function parameters and returns
function createPrompt(data: PromptInput): Prompt {
  // ...
}

// ❌ DON'T: Use `any` type
function badFunction(data: any): any {
  // ...
}

// ✅ DO: Use type guards
function isPrompt(obj: unknown): obj is Prompt {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj
  );
}

// ✅ DO: Use const assertions for literals
const STORAGE_KEYS = {
  PROMPTS: 'prompts',
  SETTINGS: 'settings',
} as const;
```

### 4.2 React Guidelines

```tsx
// ✅ DO: Use functional components with TypeScript
interface PromptCardProps {
  prompt: Prompt;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  return (
    <div className="prompt-card">
      {/* ... */}
    </div>
  );
}

// ✅ DO: Use custom hooks for reusable logic
function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    storage.getPrompts().then((data) => {
      setPrompts(data);
      setLoading(false);
    });
  }, []);
  
  return { prompts, loading, setPrompts };
}

// ✅ DO: Memoize expensive computations
const filteredPrompts = useMemo(
  () => prompts.filter((p) => p.title.toLowerCase().includes(search)),
  [prompts, search]
);
```

### 4.3 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `PromptCard.tsx` |
| Hooks | camelCase with `use` prefix | `usePrompts.ts` |
| Utilities | camelCase | `storage.ts` |
| Types | camelCase | `types.ts` |
| Tests | Same as source + `.test` | `storage.test.ts` |
| CSS Modules | Same as component | `PromptCard.module.css` |

### 4.4 Import Order

```typescript
// 1. React imports
import { useState, useEffect, useMemo } from 'react';

// 2. Third-party libraries
import { Command } from 'cmdk';

// 3. Internal aliases (@/)
import { storage } from '@/shared/storage';
import type { Prompt } from '@/shared/types';

// 4. Relative imports
import { PromptCard } from './PromptCard';

// 5. Styles
import './styles.css';
```

---

## 5. Testing Strategy

### 5.1 Test Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
```

Create `tests/setup.ts`:

```typescript
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock chrome API
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
};

vi.stubGlobal('chrome', mockChrome);
```

### 5.2 Unit Test Examples

```typescript
// tests/unit/storage.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storage } from '@/shared/storage';

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPrompts', () => {
    it('returns empty array when no prompts exist', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({});
      
      const result = await storage.getPrompts();
      
      expect(result).toEqual([]);
    });

    it('returns prompts from storage', async () => {
      const mockPrompts = [
        { id: '1', title: 'Test', content: 'Content' },
      ];
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        prompts: mockPrompts,
      });
      
      const result = await storage.getPrompts();
      
      expect(result).toEqual(mockPrompts);
    });
  });

  describe('savePrompt', () => {
    it('adds new prompt with generated id', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({ prompts: [] });
      
      await storage.savePrompt({
        title: 'New Prompt',
        content: 'Content',
      });
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        prompts: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: 'New Prompt',
            content: 'Content',
          }),
        ]),
      });
    });
  });
});
```

### 5.3 Component Test Example

```tsx
// tests/unit/PromptCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromptCard } from '@/popup/components/PromptCard';

describe('PromptCard', () => {
  const mockPrompt = {
    id: '1',
    title: 'Test Prompt',
    content: 'Test content',
    description: 'Test description',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it('renders prompt title and description', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onEdit when clicked', () => {
    const onEdit = vi.fn();
    render(
      <PromptCard
        prompt={mockPrompt}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('article'));
    
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

---

## 6. Debugging

### 6.1 Popup Debugging

1. Right-click the extension icon
2. Select "Inspect popup"
3. DevTools opens for the popup

### 6.2 Content Script Debugging

1. Open ChatGPT in Chrome
2. Open DevTools (F12)
3. Go to Sources → Content Scripts → your extension
4. Set breakpoints as needed

### 6.3 Service Worker Debugging

1. Go to `chrome://extensions/`
2. Find your extension
3. Click "Service worker" link
4. DevTools opens for the background script

### 6.4 Console Logging Strategy

```typescript
// Use prefixed logging for easy filtering
const log = {
  content: (...args: unknown[]) => console.log('[GPTPrompt:Content]', ...args),
  popup: (...args: unknown[]) => console.log('[GPTPrompt:Popup]', ...args),
  bg: (...args: unknown[]) => console.log('[GPTPrompt:Background]', ...args),
};

// Usage
log.content('Picker opened');
log.popup('Prompt saved', prompt);
```

---

## 7. Build & Deployment

### 7.1 Production Build

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Run tests
npm run test

# Build for production
npm run build
```

The production build will be in the `dist` folder.

### 7.2 Extension Packaging

```bash
# Create a ZIP for Chrome Web Store
cd dist
zip -r ../gptprompt-extension.zip .
```

### 7.3 Chrome Web Store Submission Checklist

- [ ] All screenshots prepared (1280x800 or 640x400)
- [ ] Promotional images (440x280 small, 920x680 large)
- [ ] Detailed description written
- [ ] Privacy policy URL (if applicable)
- [ ] Extension tested on Chrome stable
- [ ] manifest.json version incremented
- [ ] No console errors in production build

### 7.4 Version Bumping

```bash
# Update version in manifest.json
# Follow semver: MAJOR.MINOR.PATCH

# v1.0.0 → v1.0.1 (bug fix)
# v1.0.0 → v1.1.0 (new feature)
# v1.0.0 → v2.0.0 (breaking change)
```

---

## 8. Common Issues & Solutions

### 8.1 Content Script Not Loading

**Symptom**: Picker doesn't appear on ChatGPT

**Solutions**:
1. Check `host_permissions` in manifest.json
2. Verify ChatGPT URL matches pattern
3. Reload extension after manifest changes
4. Check for console errors in content script

### 8.2 Storage Not Persisting

**Symptom**: Prompts lost after Chrome restart

**Solutions**:
1. Verify using `chrome.storage.local` not `sessionStorage`
2. Check for storage quota errors
3. Ensure `storage` permission in manifest

### 8.3 React Not Rendering in Content Script

**Symptom**: Shadow DOM renders but React components don't

**Solutions**:
1. Ensure Shadow DOM is in `open` mode
2. Import React explicitly in content script
3. Check for CSS conflicts with `all: initial`

### 8.4 HMR Not Working

**Symptom**: Changes don't reflect without manual reload

**Solutions**:
1. Check crxjs plugin version compatibility
2. Restart dev server
3. Background scripts always need manual reload

---

## 9. Performance Guidelines

### 9.1 Content Script Optimization

```typescript
// ✅ DO: Lazy load picker
const mountPicker = async () => {
  const { Picker } = await import('./picker/Picker');
  // Mount logic
};

// ✅ DO: Debounce search
const debouncedSearch = debounce((query: string) => {
  filterPrompts(query);
}, 150);

// ✅ DO: Use requestIdleCallback for non-critical work
requestIdleCallback(() => {
  preloadPrompts();
});
```

### 9.2 Bundle Size Monitoring

```bash
# Analyze bundle size
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ...
    visualizer({ open: true }),
  ],
});
```

---

## 10. Security Best Practices

### 10.1 Content Security

```typescript
// ✅ DO: Sanitize user input before DOM insertion
import DOMPurify from 'dompurify';

const safeContent = DOMPurify.sanitize(userContent);

// ✅ DO: Use textContent for plain text
element.textContent = prompt.title;

// ❌ DON'T: Use innerHTML with user content
element.innerHTML = prompt.content; // Dangerous!
```

### 10.2 Storage Security

```typescript
// ✅ DO: Validate data from storage
const prompts = await storage.getPrompts();
const validPrompts = prompts.filter(isValidPrompt);

// ✅ DO: Handle storage errors gracefully
try {
  await chrome.storage.local.set({ prompts });
} catch (error) {
  if (error.message.includes('QUOTA_EXCEEDED')) {
    notifyUser('Storage limit reached');
  }
}
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-01 | GPT-4 | Initial development guide |

---

*Document prepared as part of GPTPrompt extension planning*
