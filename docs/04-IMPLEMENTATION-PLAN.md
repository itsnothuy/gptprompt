# Implementation Plan

**Document Version**: 1.0.0  
**Last Updated**: 2026-02-01  
**Status**: ✅ Complete

---

## 1. Overview

This document outlines a phase-by-phase implementation plan for the GPTPrompt Chrome extension. Each phase builds on the previous one, with clear deliverables and validation criteria.

### Timeline Summary

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| Phase 0 | Project Setup | 1 day | 🔲 Not Started |
| Phase 1 | Core Infrastructure | 2-3 days | 🔲 Not Started |
| Phase 2 | Popup UI | 2-3 days | 🔲 Not Started |
| Phase 3 | Content Script & Injection | 2-3 days | 🔲 Not Started |
| Phase 4 | Command Palette (Picker) | 2-3 days | 🔲 Not Started |
| Phase 5 | Integration & Polish | 2-3 days | 🔲 Not Started |
| Phase 6 | Testing & Documentation | 2-3 days | 🔲 Not Started |

**Total Estimated Time**: 13-18 days

---

## 2. Phase 0: Project Setup

### 2.1 Objectives
- Initialize project structure
- Configure build tooling
- Set up development workflow

### 2.2 Tasks

| Task | Description | Priority |
|------|-------------|----------|
| T0.1 | Initialize npm project | P0 |
| T0.2 | Install and configure Vite | P0 |
| T0.3 | Install @crxjs/vite-plugin | P0 |
| T0.4 | Configure TypeScript | P0 |
| T0.5 | Set up Tailwind CSS | P0 |
| T0.6 | Create manifest.json | P0 |
| T0.7 | Set up ESLint + Prettier | P1 |
| T0.8 | Create basic folder structure | P0 |
| T0.9 | Add placeholder files | P0 |
| T0.10 | Test extension loads in Chrome | P0 |

### 2.3 Deliverables
- [ ] Project builds successfully with `npm run build`
- [ ] Extension can be loaded in Chrome (shows empty popup)
- [ ] Hot reload works in development
- [ ] TypeScript compiles without errors

### 2.4 Commands to Run

```bash
# Create project directory
mkdir gptprompt && cd gptprompt

# Initialize npm
npm init -y

# Install dependencies
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom
npm install -D @crxjs/vite-plugin@beta
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint prettier eslint-config-prettier

# Initialize Tailwind
npx tailwindcss init -p

# Create tsconfig
npx tsc --init
```

### 2.5 Validation
```bash
# Build and verify
npm run build
# Load dist/ folder in chrome://extensions
# Verify popup opens (even if empty)
```

---

## 3. Phase 1: Core Infrastructure

### 3.1 Objectives
- Implement data models and types
- Create storage abstraction layer
- Set up message passing infrastructure
- Build service worker foundation

### 3.2 Tasks

| Task | Description | Priority |
|------|-------------|----------|
| T1.1 | Define Prompt type interface | P0 |
| T1.2 | Define StorageSchema interface | P0 |
| T1.3 | Define Message types | P0 |
| T1.4 | Implement StorageAPI class | P0 |
| T1.5 | Create UUID utility | P0 |
| T1.6 | Implement service worker | P0 |
| T1.7 | Add message listener in service worker | P0 |
| T1.8 | Create constants file | P1 |
| T1.9 | Add error types | P1 |
| T1.10 | Write unit tests for StorageAPI | P1 |

### 3.3 Deliverables
- [ ] `src/shared/types/prompt.ts` - Prompt interface
- [ ] `src/shared/types/storage.ts` - Storage schema
- [ ] `src/shared/types/messages.ts` - Message types
- [ ] `src/shared/storage/storage.ts` - Storage API
- [ ] `src/shared/utils/uuid.ts` - UUID generation
- [ ] `src/background/service-worker.ts` - Background script
- [ ] `src/shared/constants.ts` - Constants

### 3.4 Code Snippets

**T1.1: Prompt Type**
```typescript
// src/shared/types/prompt.ts
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  usageCount: number;
  lastUsedAt?: number;
  selection?: [number, number];
}

export type NewPrompt = Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>;
```

**T1.4: Storage API**
```typescript
// src/shared/storage/storage.ts
import type { Prompt, StorageSchema, Settings } from '../types';
import { generateUUID } from '../utils/uuid';

const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  shortcut: 'Ctrl+J',
  insertBehavior: 'replace',
  showRecentCount: 5,
};

export const storage = {
  async getPrompts(): Promise<Prompt[]> {
    const result = await chrome.storage.local.get('prompts');
    return result.prompts ?? [];
  },

  async createPrompt(data: NewPrompt): Promise<Prompt> {
    const prompts = await this.getPrompts();
    const now = Date.now();
    const prompt: Prompt = {
      ...data,
      id: generateUUID(),
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    };
    prompts.push(prompt);
    await chrome.storage.local.set({ prompts });
    return prompt;
  },

  async updatePrompt(id: string, updates: Partial<Prompt>): Promise<Prompt | null> {
    const prompts = await this.getPrompts();
    const index = prompts.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    prompts[index] = {
      ...prompts[index],
      ...updates,
      updatedAt: Date.now(),
    };
    await chrome.storage.local.set({ prompts });
    return prompts[index];
  },

  async deletePrompt(id: string): Promise<boolean> {
    const prompts = await this.getPrompts();
    const filtered = prompts.filter(p => p.id !== id);
    if (filtered.length === prompts.length) return false;
    
    await chrome.storage.local.set({ prompts: filtered });
    await this.removeFromRecent(id);
    return true;
  },

  async getRecentPromptIds(): Promise<string[]> {
    const result = await chrome.storage.local.get('recentPromptIds');
    return result.recentPromptIds ?? [];
  },

  async addToRecent(promptId: string): Promise<void> {
    let recents = await this.getRecentPromptIds();
    recents = recents.filter(id => id !== promptId);
    recents.unshift(promptId);
    recents = recents.slice(0, 5);
    await chrome.storage.local.set({ recentPromptIds: recents });
  },

  async removeFromRecent(promptId: string): Promise<void> {
    const recents = await this.getRecentPromptIds();
    await chrome.storage.local.set({ 
      recentPromptIds: recents.filter(id => id !== promptId) 
    });
  },

  async incrementUsage(promptId: string): Promise<void> {
    const prompts = await this.getPrompts();
    const index = prompts.findIndex(p => p.id === promptId);
    if (index === -1) return;
    
    prompts[index].usageCount++;
    prompts[index].lastUsedAt = Date.now();
    await chrome.storage.local.set({ prompts });
  },

  async getSettings(): Promise<Settings> {
    const result = await chrome.storage.local.get('settings');
    return { ...DEFAULT_SETTINGS, ...result.settings };
  },

  async updateSettings(updates: Partial<Settings>): Promise<void> {
    const current = await this.getSettings();
    await chrome.storage.local.set({ settings: { ...current, ...updates } });
  },
};
```

### 3.5 Validation
- [ ] Unit tests pass for StorageAPI
- [ ] Service worker logs message when extension loads
- [ ] Storage can read/write prompts

---

## 4. Phase 2: Popup UI

### 4.1 Objectives
- Create functional popup interface
- Implement prompt list view
- Implement add/edit forms
- Add search functionality

### 4.2 Tasks

| Task | Description | Priority |
|------|-------------|----------|
| T2.1 | Create popup HTML entry | P0 |
| T2.2 | Create main Popup component | P0 |
| T2.3 | Implement ListView component | P0 |
| T2.4 | Implement PromptCard component | P0 |
| T2.5 | Implement SearchBar component | P0 |
| T2.6 | Implement AddView component | P0 |
| T2.7 | Implement EditView component | P0 |
| T2.8 | Implement EmptyState component | P1 |
| T2.9 | Add navigation between views | P0 |
| T2.10 | Style with Tailwind CSS | P0 |
| T2.11 | Add loading states | P1 |
| T2.12 | Add error handling | P1 |

### 4.3 Deliverables
- [ ] Popup displays list of prompts
- [ ] User can add new prompt
- [ ] User can edit existing prompt
- [ ] User can delete prompt
- [ ] Search filters prompts
- [ ] Empty state shows when no prompts

### 4.4 Component Tree

```
Popup
├── Header
│   └── Logo + Title
├── SearchBar
├── ViewContainer
│   ├── ListView (default)
│   │   ├── PromptCard[]
│   │   └── EmptyState (when no prompts)
│   ├── AddView
│   │   └── PromptForm
│   └── EditView
│       └── PromptForm
└── Footer
    └── "Add Prompt" button
```

### 4.5 Validation
- [ ] Can create a prompt and see it in the list
- [ ] Can edit a prompt and see changes
- [ ] Can delete a prompt
- [ ] Search works (case-insensitive)
- [ ] UI is responsive and polished

---

## 5. Phase 3: Content Script & Injection

### 5.1 Objectives
- Create content script that runs on ChatGPT
- Implement prompt injection into ProseMirror
- Handle ChatGPT DOM detection
- Set up message receiving

### 5.2 Tasks

| Task | Description | Priority |
|------|-------------|----------|
| T3.1 | Create content script entry | P0 |
| T3.2 | Implement ChatGPT DOM utilities | P0 |
| T3.3 | Implement input detection/watching | P0 |
| T3.4 | Implement prompt text insertion | P0 |
| T3.5 | Implement selection range logic | P1 |
| T3.6 | Add dark mode detection | P1 |
| T3.7 | Handle SPA navigation | P0 |
| T3.8 | Add message listener | P0 |
| T3.9 | Test on chatgpt.com | P0 |
| T3.10 | Test on chat.openai.com | P0 |

### 5.3 Deliverables
- [ ] Content script loads on ChatGPT pages
- [ ] Can programmatically insert text into ChatGPT input
- [ ] Text persists (React state updated)
- [ ] Works after SPA navigation

### 5.4 Key Implementation

```typescript
// src/content/utils/chatgpt-dom.ts

export const ChatGPTDOM = {
  SELECTORS: {
    input: '#prompt-textarea',
    form: 'main form',
    darkMode: 'html.dark',
  },

  getInput(): HTMLDivElement | null {
    return document.querySelector(this.SELECTORS.input);
  },

  isReady(): boolean {
    return this.getInput() !== null;
  },

  isDarkMode(): boolean {
    return document.querySelector(this.SELECTORS.darkMode) !== null;
  },

  insertText(text: string, selection?: [number, number]): boolean {
    const input = this.getInput();
    if (!input) {
      console.warn('[GPTPrompt] Input element not found');
      return false;
    }

    // Clear existing content
    input.innerHTML = '';

    // Split by newlines and create paragraph elements
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      const p = document.createElement('p');
      // Use zero-width space for empty lines to maintain structure
      p.textContent = line || '\u200B';
      input.appendChild(p);
    });

    // Dispatch input event to update React state
    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);

    // Focus the input
    input.focus();

    // Handle selection range if provided
    if (selection && selection[0] < selection[1]) {
      this.setSelection(selection[0], selection[1]);
    }

    return true;
  },

  setSelection(start: number, end: number): void {
    const input = this.getInput();
    if (!input) return;

    try {
      const range = document.createRange();
      const sel = window.getSelection();
      
      // Find the correct text nodes
      const walker = document.createTreeWalker(
        input,
        NodeFilter.SHOW_TEXT,
        null
      );

      let charCount = 0;
      let startNode: Text | null = null;
      let startOffset = 0;
      let endNode: Text | null = null;
      let endOffset = 0;

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const nodeLength = node.textContent?.length || 0;

        if (!startNode && charCount + nodeLength >= start) {
          startNode = node;
          startOffset = start - charCount;
        }

        if (!endNode && charCount + nodeLength >= end) {
          endNode = node;
          endOffset = end - charCount;
          break;
        }

        charCount += nodeLength + 1; // +1 for newline between paragraphs
      }

      if (startNode && endNode && sel) {
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch (error) {
      console.warn('[GPTPrompt] Failed to set selection:', error);
    }
  },

  watchForReady(callback: () => void): () => void {
    // First try immediately
    if (this.isReady()) {
      callback();
      return () => {};
    }

    // Poll with requestAnimationFrame
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      if (this.isReady()) {
        callback();
        return;
      }
      requestAnimationFrame(check);
    };
    check();

    // Also use MutationObserver for reliability
    const observer = new MutationObserver(() => {
      if (this.isReady()) {
        callback();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  },
};
```

### 5.5 Validation
- [ ] Console shows "[GPTPrompt] Ready" when input detected
- [ ] Calling `ChatGPTDOM.insertText("test")` fills the input
- [ ] Text is not lost on focus change
- [ ] Works on fresh page load and after navigation

---

## 6. Phase 4: Command Palette (Picker)

### 6.1 Objectives
- Build in-page command palette UI
- Implement search and navigation
- Integrate with popup via messaging
- Add keyboard shortcut support

### 6.2 Tasks

| Task | Description | Priority |
|------|-------------|----------|
| T4.1 | Install cmdk and Radix UI | P0 |
| T4.2 | Create Shadow DOM container | P0 |
| T4.3 | Build Picker component | P0 |
| T4.4 | Implement search filtering | P0 |
| T4.5 | Add keyboard navigation | P0 |
| T4.6 | Add recent prompts section | P1 |
| T4.7 | Style to match ChatGPT | P0 |
| T4.8 | Handle dark mode | P1 |
| T4.9 | Connect Ctrl+J shortcut | P0 |
| T4.10 | Add prompt selection handler | P0 |
| T4.11 | Add close on outside click | P0 |
| T4.12 | Add Escape to close | P0 |

### 6.3 Deliverables
- [ ] Ctrl+J opens command palette overlay
- [ ] Search filters prompts in real-time
- [ ] Arrow keys navigate list
- [ ] Enter/Tab inserts selected prompt
- [ ] Escape closes picker
- [ ] Clicking outside closes picker
- [ ] UI matches ChatGPT's theme

### 6.4 Key Implementation

```typescript
// src/content/picker/Picker.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Command } from 'cmdk';
import type { Prompt } from '../../shared/types/prompt';
import { ChatGPTDOM } from '../utils/chatgpt-dom';
import { storage } from '../../shared/storage/storage';

interface PickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Picker: React.FC<PickerProps> = ({ isOpen, onClose }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load prompts and recents
      Promise.all([
        storage.getPrompts(),
        storage.getRecentPromptIds(),
      ]).then(([p, r]) => {
        setPrompts(p);
        setRecentIds(r);
      });

      // Check theme
      setIsDark(ChatGPTDOM.isDarkMode());
    }
  }, [isOpen]);

  const recentPrompts = useMemo(() => {
    return recentIds
      .map(id => prompts.find(p => p.id === id))
      .filter((p): p is Prompt => p !== undefined);
  }, [prompts, recentIds]);

  const filteredPrompts = useMemo(() => {
    if (!search) return prompts;
    const query = search.toLowerCase();
    return prompts.filter(
      p =>
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query)
    );
  }, [prompts, search]);

  const handleSelect = async (prompt: Prompt) => {
    const success = ChatGPTDOM.insertText(prompt.content, prompt.selection);
    if (success) {
      await storage.addToRecent(prompt.id);
      await storage.incrementUsage(prompt.id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`gptprompt-picker ${isDark ? 'dark' : ''}`}>
      <Command
        className="gptprompt-command"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose();
        }}
      >
        <Command.Input
          placeholder="Search prompts..."
          value={search}
          onValueChange={setSearch}
          autoFocus
        />
        <Command.List>
          <Command.Empty>No prompts found.</Command.Empty>

          {recentPrompts.length > 0 && !search && (
            <Command.Group heading="Recent">
              {recentPrompts.map((prompt) => (
                <Command.Item
                  key={`recent-${prompt.id}`}
                  value={`recent-${prompt.title}`}
                  onSelect={() => handleSelect(prompt)}
                >
                  <div className="prompt-item">
                    <span className="prompt-title">{prompt.title}</span>
                    {prompt.description && (
                      <span className="prompt-desc">{prompt.description}</span>
                    )}
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading={search ? 'Results' : 'All Prompts'}>
            {filteredPrompts.map((prompt) => (
              <Command.Item
                key={prompt.id}
                value={prompt.title}
                onSelect={() => handleSelect(prompt)}
              >
                <div className="prompt-item">
                  <span className="prompt-title">{prompt.title}</span>
                  {prompt.description && (
                    <span className="prompt-desc">{prompt.description}</span>
                  )}
                </div>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>

        <div className="picker-footer">
          <span>↑↓ Navigate</span>
          <span>↵ Insert</span>
          <span>Esc Close</span>
        </div>
      </Command>
    </div>
  );
};
```

### 6.5 Validation
- [ ] Ctrl/Cmd+J opens picker when on ChatGPT
- [ ] Picker is centered and properly styled
- [ ] Typing filters prompts
- [ ] Arrow keys move selection
- [ ] Enter inserts prompt into ChatGPT
- [ ] Escape or click outside closes picker

---

## 7. Phase 5: Integration & Polish

### 7.1 Objectives
- Connect all components end-to-end
- Handle edge cases
- Add animations and transitions
- Improve UX details

### 7.2 Tasks

| Task | Description | Priority |
|------|-------------|----------|
| T5.1 | Wire popup "Insert" button to content script | P0 |
| T5.2 | Add loading spinners | P1 |
| T5.3 | Add toast notifications | P1 |
| T5.4 | Handle ChatGPT logged out state | P1 |
| T5.5 | Add error boundaries | P1 |
| T5.6 | Add keyboard shortcut hints | P1 |
| T5.7 | Polish animations | P2 |
| T5.8 | Add settings page | P2 |
| T5.9 | Handle extension update | P2 |
| T5.10 | Add onboarding flow | P2 |

### 7.3 Deliverables
- [ ] End-to-end flow works: Popup → Save → Picker → Insert
- [ ] Edge cases handled gracefully
- [ ] UI feels polished and responsive
- [ ] Error states are helpful

### 7.4 Validation
- [ ] Create prompt in popup, insert via picker
- [ ] Edit prompt in popup, picker shows update
- [ ] Delete prompt, picker updates
- [ ] Works on fresh install
- [ ] Works after browser restart

---

## 8. Phase 6: Testing & Documentation

### 8.1 Objectives
- Achieve test coverage
- Document for users and developers
- Prepare for distribution

### 8.2 Tasks

| Task | Description | Priority |
|------|-------------|----------|
| T6.1 | Write unit tests for storage | P0 |
| T6.2 | Write unit tests for utilities | P0 |
| T6.3 | Write component tests | P1 |
| T6.4 | Write E2E test for main flow | P1 |
| T6.5 | Create README.md | P0 |
| T6.6 | Write user guide | P1 |
| T6.7 | Create CHANGELOG.md | P1 |
| T6.8 | Add LICENSE | P0 |
| T6.9 | Create build/release script | P1 |
| T6.10 | Prepare Chrome Web Store assets | P2 |

### 8.3 Deliverables
- [ ] 80%+ code coverage on core logic
- [ ] README with installation and usage
- [ ] Developer documentation
- [ ] E2E test passes

---

## 9. Risk Management

### 9.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| ChatGPT DOM changes | Medium | High | Abstract selectors, add fallback detection | Dev |
| MV3 limitations | Low | Medium | Research upfront, design within constraints | Dev |
| Performance issues | Low | Medium | Profile early, optimize as needed | Dev |
| React bundle size | Medium | Low | Consider Preact or vanilla for content script | Dev |

### 9.2 Schedule Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep | High | Medium | Strict MVP definition, defer nice-to-haves |
| Underestimation | Medium | Medium | Add buffer to estimates, prioritize ruthlessly |
| Blockers | Low | High | Identify dependencies early, have fallback plans |

---

## 10. Definition of Done

### 10.1 Feature Complete

- [ ] All P0 tasks completed
- [ ] No P0 bugs open
- [ ] Code reviewed (self or peer)
- [ ] Tests written for critical paths
- [ ] Documentation updated

### 10.2 Release Ready

- [ ] All P0 and P1 tasks completed
- [ ] No P0 or P1 bugs open
- [ ] QA passed on Chrome, Edge, Brave
- [ ] Performance targets met
- [ ] README complete
- [ ] Build produces valid CRX/ZIP

---

## 11. Progress Tracking

> Update this section as work progresses

| Phase | Started | Completed | Notes |
|-------|---------|-----------|-------|
| Phase 0 | - | - | - |
| Phase 1 | - | - | - |
| Phase 2 | - | - | - |
| Phase 3 | - | - | - |
| Phase 4 | - | - | - |
| Phase 5 | - | - | - |
| Phase 6 | - | - | - |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-01 | GPT-4 | Initial implementation plan |

---

*Document prepared as part of GPTPrompt extension planning*
