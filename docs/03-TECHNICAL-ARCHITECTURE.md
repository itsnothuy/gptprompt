# Technical Architecture Document

**Document Version**: 1.0.0  
**Last Updated**: 2026-02-01  
**Status**: ✅ Complete

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Chrome Browser                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   Popup UI   │    │   Service    │    │  Content Script  │  │
│  │  (React/TS)  │◄──►│   Worker     │◄──►│  (chatgpt.com)   │  │
│  │              │    │  (MV3 BG)    │    │                  │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│         │                   │                     │              │
│         │                   │                     │              │
│         ▼                   ▼                     ▼              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 chrome.storage.local                     │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────┐  │   │
│  │  │ prompts │  │ recent  │  │settings │  │  metadata │  │   │
│  │  │  Array  │  │  Array  │  │ Object  │  │  Object   │  │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └───────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Responsibilities

| Component | Responsibility | Runs On |
|-----------|----------------|---------|
| **Popup UI** | CRUD interface for prompts, settings | Extension popup |
| **Service Worker** | Message routing, command handling, storage coordination | Background |
| **Content Script** | DOM injection, prompt insertion, ChatGPT interaction | chatgpt.com pages |
| **Storage Layer** | Persistent data, cross-component state | chrome.storage.local |

---

## 2. Manifest V3 Configuration

### 2.1 manifest.json

```json
{
  "manifest_version": 3,
  "name": "GPTPrompt - ChatGPT Prompt Library",
  "version": "1.0.0",
  "description": "Save and quickly insert prompt templates into ChatGPT",
  
  "permissions": [
    "storage",
    "activeTab"
  ],
  
  "host_permissions": [
    "https://chatgpt.com/*",
    "https://chat.openai.com/*"
  ],
  
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  
  "background": {
    "service_worker": "service-worker.js",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": [
        "https://chatgpt.com/*",
        "https://chat.openai.com/*"
      ],
      "js": ["content-script.js"],
      "css": ["content-style.css"],
      "run_at": "document_idle"
    }
  ],
  
  "commands": {
    "open-prompt-picker": {
      "suggested_key": {
        "default": "Ctrl+J",
        "mac": "Command+J"
      },
      "description": "Open prompt picker"
    }
  },
  
  "web_accessible_resources": [
    {
      "resources": ["assets/*"],
      "matches": ["https://chatgpt.com/*", "https://chat.openai.com/*"]
    }
  ]
}
```

### 2.2 Permission Justification

| Permission | Why Needed | Minimal? |
|------------|------------|----------|
| `storage` | Store prompts locally | ✅ Yes |
| `activeTab` | Read page context when popup opened | ✅ Yes |
| `host_permissions` (chatgpt.com) | Inject content script, modify DOM | ✅ Yes - only target domains |

---

## 3. Data Models

### 3.1 Prompt Schema

```typescript
interface Prompt {
  id: string;              // UUID v4
  title: string;           // Required, max 100 chars
  content: string;         // Required, max 10000 chars
  description?: string;    // Optional, max 200 chars
  createdAt: number;       // Unix timestamp (ms)
  updatedAt: number;       // Unix timestamp (ms)
  usageCount: number;      // Times used
  lastUsedAt?: number;     // Unix timestamp (ms)
  selection?: [number, number];  // Auto-select range after insert
}

// Example
const examplePrompt: Prompt = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Code Review",
  content: "Please review this code for:\n1. Bugs\n2. Performance\n3. Best practices\n\nCode:\n{{code}}",
  description: "Comprehensive code review prompt",
  createdAt: 1706745600000,
  updatedAt: 1706745600000,
  usageCount: 42,
  lastUsedAt: 1706832000000,
  selection: [82, 90]  // Selects "{{code}}" after insertion
};
```

### 3.2 Storage Schema

```typescript
interface StorageSchema {
  // Core data
  prompts: Prompt[];
  
  // Usage tracking
  recentPromptIds: string[];  // Last 5 used prompt IDs
  
  // Settings
  settings: {
    theme: 'auto' | 'light' | 'dark';
    shortcut: string;  // e.g., "Ctrl+J"
    insertBehavior: 'replace' | 'append';
    showRecentCount: number;  // 0-10
  };
  
  // Metadata
  meta: {
    version: string;       // Schema version for migrations
    installedAt: number;   // First install timestamp
    lastOpenedAt: number;  // Last popup open timestamp
  };
}

// Default values
const DEFAULT_STORAGE: StorageSchema = {
  prompts: [],
  recentPromptIds: [],
  settings: {
    theme: 'auto',
    shortcut: 'Ctrl+J',
    insertBehavior: 'replace',
    showRecentCount: 5
  },
  meta: {
    version: '1.0.0',
    installedAt: Date.now(),
    lastOpenedAt: Date.now()
  }
};
```

### 3.3 Message Protocol

```typescript
// Popup → Service Worker → Content Script messaging

type MessageType = 
  | 'OPEN_PICKER'
  | 'INSERT_PROMPT'
  | 'GET_PROMPTS'
  | 'SAVE_PROMPT'
  | 'DELETE_PROMPT'
  | 'UPDATE_RECENT'
  | 'CHECK_CHATGPT_READY';

interface Message<T = unknown> {
  type: MessageType;
  payload?: T;
  tabId?: number;
}

interface Response<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Examples
const openPickerMessage: Message = {
  type: 'OPEN_PICKER'
};

const insertPromptMessage: Message<{ promptId: string }> = {
  type: 'INSERT_PROMPT',
  payload: { promptId: '550e8400-e29b-41d4-a716-446655440000' }
};
```

---

## 4. Component Details

### 4.1 Service Worker (Background)

**File**: `src/background/service-worker.ts`

**Responsibilities**:
- Handle keyboard shortcut commands
- Route messages between popup and content scripts
- Manage storage operations
- Coordinate state across components

```typescript
// Pseudo-code structure
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-prompt-picker') {
    // Send message to content script to open picker
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'OPEN_PICKER' });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_PROMPTS':
      // Fetch from storage and respond
      break;
    case 'SAVE_PROMPT':
      // Validate and save to storage
      break;
    // ... other handlers
  }
  return true; // Keep channel open for async response
});
```

### 4.2 Content Script

**File**: `src/content/content-script.ts`

**Responsibilities**:
- Inject prompt picker UI into ChatGPT page
- Listen for keyboard shortcuts and `/` trigger
- Insert prompt text into ChatGPT's ProseMirror editor
- Handle DOM changes (SPA navigation)

```typescript
// Pseudo-code structure

// 1. Create shadow DOM root for isolation
const shadowHost = document.createElement('div');
shadowHost.id = 'gptprompt-root';
document.body.appendChild(shadowHost);
const shadowRoot = shadowHost.attachShadow({ mode: 'closed' });

// 2. Watch for ChatGPT input element
const observeInput = () => {
  const inputElement = document.querySelector('#prompt-textarea');
  if (inputElement) {
    setupInputListeners(inputElement);
  } else {
    // Retry with MutationObserver or polling
    requestAnimationFrame(observeInput);
  }
};

// 3. Insert prompt into ProseMirror editor
const insertPrompt = (content: string) => {
  const input = document.querySelector('#prompt-textarea') as HTMLDivElement;
  if (!input) return false;
  
  // Clear existing content
  input.innerHTML = '';
  
  // Create paragraph elements for each line
  const lines = content.split('\n');
  lines.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line || '\u200B'; // Zero-width space for empty lines
    input.appendChild(p);
  });
  
  // Dispatch input event to trigger React state update
  input.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Focus the input
  input.focus();
  
  return true;
};
```

### 4.3 Popup UI

**File**: `src/popup/Popup.tsx`

**Responsibilities**:
- Display prompt list with search
- Handle CRUD operations
- Show settings
- Communicate with service worker

```typescript
// Pseudo-code structure
const Popup: React.FC = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  
  useEffect(() => {
    // Load prompts from storage
    chrome.storage.local.get(['prompts'], (result) => {
      setPrompts(result.prompts || []);
    });
  }, []);
  
  const filteredPrompts = useMemo(() => {
    if (!searchQuery) return prompts;
    const query = searchQuery.toLowerCase();
    return prompts.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query)
    );
  }, [prompts, searchQuery]);
  
  // ... render logic
};
```

---

## 5. File Structure

```
gptprompt/
├── docs/                          # Documentation
│   ├── 00-PROJECT-INDEX.md
│   ├── 01-RESEARCH-ANALYSIS.md
│   ├── 02-PRODUCT-REQUIREMENTS.md
│   ├── 03-TECHNICAL-ARCHITECTURE.md
│   ├── 04-IMPLEMENTATION-PLAN.md
│   ├── 05-UI-UX-SPECIFICATION.md
│   └── 06-DEVELOPMENT-GUIDE.md
│
├── src/
│   ├── background/
│   │   └── service-worker.ts      # MV3 background service worker
│   │
│   ├── content/
│   │   ├── content-script.ts      # Main content script
│   │   ├── content-style.css      # Injected styles
│   │   ├── picker/
│   │   │   ├── Picker.tsx         # Command palette component
│   │   │   ├── PromptItem.tsx     # Individual prompt row
│   │   │   └── SearchInput.tsx    # Search input component
│   │   └── utils/
│   │       ├── chatgpt-dom.ts     # ChatGPT-specific DOM utilities
│   │       └── inject.ts          # Prompt injection logic
│   │
│   ├── popup/
│   │   ├── Popup.tsx              # Main popup component
│   │   ├── views/
│   │   │   ├── ListView.tsx       # Prompt list view
│   │   │   ├── AddView.tsx        # Add prompt form
│   │   │   └── EditView.tsx       # Edit prompt form
│   │   ├── components/
│   │   │   ├── PromptCard.tsx     # Prompt card component
│   │   │   ├── SearchBar.tsx      # Search input
│   │   │   └── EmptyState.tsx     # No prompts state
│   │   └── popup.css              # Popup styles
│   │
│   ├── shared/
│   │   ├── types/
│   │   │   ├── prompt.ts          # Prompt type definitions
│   │   │   ├── storage.ts         # Storage schema types
│   │   │   └── messages.ts        # Message protocol types
│   │   ├── storage/
│   │   │   ├── storage.ts         # Storage abstraction layer
│   │   │   └── migrations.ts      # Schema migrations
│   │   ├── utils/
│   │   │   ├── uuid.ts            # UUID generation
│   │   │   └── search.ts          # Search/filter utilities
│   │   └── constants.ts           # Shared constants
│   │
│   └── assets/
│       └── icons/                 # Extension icons
│
├── public/
│   ├── popup.html                 # Popup HTML entry
│   └── manifest.json              # Extension manifest
│
├── tests/
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── e2e/                       # End-to-end tests
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 6. Technology Stack

### 6.1 Build & Development

| Tool | Purpose | Version |
|------|---------|---------|
| **Vite** | Build tool, dev server | 5.x |
| **TypeScript** | Type safety | 5.x |
| **@crxjs/vite-plugin** | Chrome extension support | 2.x |
| **ESLint** | Linting | 8.x |
| **Prettier** | Code formatting | 3.x |

### 6.2 UI & Styling

| Tool | Purpose | Version |
|------|---------|---------|
| **React** | UI framework | 18.x |
| **Tailwind CSS** | Utility-first CSS | 3.x |
| **cmdk** | Command palette | 0.2.x |
| **@radix-ui/react-dialog** | Accessible dialogs | 1.x |
| **lucide-react** | Icons | Latest |

### 6.3 Testing

| Tool | Purpose | Version |
|------|---------|---------|
| **Vitest** | Unit testing | 1.x |
| **Testing Library** | Component testing | 14.x |
| **Playwright** | E2E testing | 1.x |

---

## 7. API Design

### 7.1 Storage API Abstraction

```typescript
// src/shared/storage/storage.ts

export const StorageAPI = {
  // Prompts
  async getPrompts(): Promise<Prompt[]> {
    const result = await chrome.storage.local.get('prompts');
    return result.prompts || [];
  },
  
  async savePrompt(prompt: Prompt): Promise<void> {
    const prompts = await this.getPrompts();
    const index = prompts.findIndex(p => p.id === prompt.id);
    
    if (index >= 0) {
      prompts[index] = { ...prompt, updatedAt: Date.now() };
    } else {
      prompts.push({ ...prompt, createdAt: Date.now(), updatedAt: Date.now() });
    }
    
    await chrome.storage.local.set({ prompts });
  },
  
  async deletePrompt(id: string): Promise<void> {
    const prompts = await this.getPrompts();
    const filtered = prompts.filter(p => p.id !== id);
    await chrome.storage.local.set({ prompts: filtered });
    
    // Also remove from recents
    await this.removeFromRecent(id);
  },
  
  // Recent prompts
  async getRecentPromptIds(): Promise<string[]> {
    const result = await chrome.storage.local.get('recentPromptIds');
    return result.recentPromptIds || [];
  },
  
  async addToRecent(promptId: string): Promise<void> {
    let recents = await this.getRecentPromptIds();
    recents = recents.filter(id => id !== promptId);
    recents.unshift(promptId);
    recents = recents.slice(0, 5); // Keep only 5
    await chrome.storage.local.set({ recentPromptIds: recents });
  },
  
  async removeFromRecent(promptId: string): Promise<void> {
    const recents = await this.getRecentPromptIds();
    const filtered = recents.filter(id => id !== promptId);
    await chrome.storage.local.set({ recentPromptIds: filtered });
  },
  
  // Settings
  async getSettings(): Promise<Settings> {
    const result = await chrome.storage.local.get('settings');
    return { ...DEFAULT_SETTINGS, ...result.settings };
  },
  
  async updateSettings(updates: Partial<Settings>): Promise<void> {
    const current = await this.getSettings();
    await chrome.storage.local.set({ settings: { ...current, ...updates } });
  }
};
```

### 7.2 ChatGPT DOM API

```typescript
// src/content/utils/chatgpt-dom.ts

export const ChatGPTDOM = {
  SELECTORS: {
    input: '#prompt-textarea',
    form: 'main form',
    sendButton: 'button[data-testid="send-button"]',
    darkMode: 'html.dark'
  },
  
  getInputElement(): HTMLDivElement | null {
    return document.querySelector(this.SELECTORS.input);
  },
  
  isReady(): boolean {
    return this.getInputElement() !== null;
  },
  
  isDarkMode(): boolean {
    return document.querySelector(this.SELECTORS.darkMode) !== null;
  },
  
  insertText(text: string): boolean {
    const input = this.getInputElement();
    if (!input) return false;
    
    // Clear existing content
    input.innerHTML = '';
    
    // Insert as paragraphs (ProseMirror format)
    const lines = text.split('\n');
    lines.forEach(line => {
      const p = document.createElement('p');
      p.textContent = line || '\u200B';
      input.appendChild(p);
    });
    
    // Trigger React state update
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Focus
    input.focus();
    
    return true;
  },
  
  setSelectionRange(start: number, end: number): void {
    const input = this.getInputElement();
    if (!input) return;
    
    // Complex selection logic for ProseMirror
    // ... (see research analysis for implementation)
  },
  
  watchForInput(callback: (input: HTMLDivElement) => void): () => void {
    let attempts = 0;
    const maxAttempts = 50;
    
    const check = () => {
      const input = this.getInputElement();
      if (input) {
        callback(input);
        return;
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        requestAnimationFrame(check);
      }
    };
    
    check();
    
    // Also set up MutationObserver for SPA navigation
    const observer = new MutationObserver(() => {
      const input = this.getInputElement();
      if (input) {
        callback(input);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }
};
```

---

## 8. Security Considerations

### 8.1 Content Security

| Concern | Mitigation |
|---------|------------|
| XSS in prompt content | Use `textContent` not `innerHTML` for user data |
| CSS injection | Shadow DOM isolation for injected UI |
| Malicious prompts | No eval, sanitize before display |

### 8.2 Data Privacy

| Concern | Mitigation |
|---------|------------|
| Data leakage | All data local, no external requests |
| Storage access | Only extension code can access chrome.storage |
| Tab access | activeTab only, no broad host permissions |

### 8.3 Extension Security

| Concern | Mitigation |
|---------|------------|
| Code injection | CSP via manifest, no inline scripts |
| Update hijacking | Chrome Web Store handles updates |
| Dependency vulnerabilities | Regular npm audit, minimal deps |

---

## 9. Performance Considerations

### 9.1 Bundle Size Budget

| Component | Target | Actual |
|-----------|--------|--------|
| Content script | < 50KB | TBD |
| Popup | < 100KB | TBD |
| Service worker | < 20KB | TBD |
| **Total** | **< 200KB** | TBD |

### 9.2 Runtime Performance

| Metric | Target | Approach |
|--------|--------|----------|
| Picker open | < 100ms | Pre-render, virtualization |
| Search filter | < 50ms | In-memory, debounce |
| Prompt insert | < 100ms | Direct DOM, no framework |
| Storage read | < 50ms | chrome.storage.local is fast |

### 9.3 Memory Management

- Use `WeakMap` for DOM references
- Clean up observers on navigation
- Limit recent prompts to 5
- Paginate prompt list if > 100 items

---

## 10. Error Handling

### 10.1 Error Categories

```typescript
enum ErrorCode {
  // Storage errors
  STORAGE_READ_FAILED = 'STORAGE_READ_FAILED',
  STORAGE_WRITE_FAILED = 'STORAGE_WRITE_FAILED',
  
  // DOM errors
  INPUT_NOT_FOUND = 'INPUT_NOT_FOUND',
  INJECTION_FAILED = 'INJECTION_FAILED',
  
  // Validation errors
  INVALID_PROMPT = 'INVALID_PROMPT',
  PROMPT_NOT_FOUND = 'PROMPT_NOT_FOUND',
  
  // Communication errors
  MESSAGE_FAILED = 'MESSAGE_FAILED',
  TAB_NOT_FOUND = 'TAB_NOT_FOUND'
}

interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}
```

### 10.2 Error Recovery

| Error | Recovery Strategy |
|-------|-------------------|
| Input not found | Retry with backoff, show user warning |
| Storage write failed | Retry once, show error toast |
| Message failed | Retry with new channel |
| DOM changed | Re-query selectors |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-01 | GPT-4 | Initial architecture |

---

*Document prepared as part of GPTPrompt extension planning*
