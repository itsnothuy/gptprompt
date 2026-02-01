# Research Analysis: Open-Source ChatGPT Prompt Extensions

**Document Version**: 1.0.0  
**Last Updated**: 2026-02-01  
**Status**: ✅ Complete

---

## Executive Summary

I analyzed 6 open-source ChatGPT prompt manager extensions to extract UI/UX patterns, technical approaches, and lessons learned. This document provides a comprehensive comparison and actionable insights for our implementation.

### Honest Assessment of Research Quality

| Repository | Data Quality | Notes |
|------------|--------------|-------|
| kohkimakimoto/chatgpt-prompt-snippets | ⭐⭐⭐⭐⭐ | Full code access, excellent documentation |
| xuannghia/chatgpt-prompts-manager | ⭐⭐⭐⭐⭐ | Plasmo-based, modern patterns |
| saeedezzati/superpower-chatgpt | ⭐⭐⭐⭐ | Large codebase, complex but informative |
| sailist/chatgpt-enhancement-extension | ⭐⭐⭐⭐ | Good prompt hint UX patterns |
| doosik71/ChatGPT-User-Prompt-Extension | ⭐⭐⭐ | Simple implementation, basic patterns |
| AI-Prompt-Genius/AI-Prompt-Genius | ⭐⭐⭐ | React-based, limited code visibility |

---

## 1. Comparative Analysis Table

| Feature | kohkimakimoto | xuannghia | superpower | sailist | doosik71 | AI-Prompt-Genius |
|---------|---------------|-----------|------------|---------|----------|------------------|
| **UI Surface** | In-page dialog (injected) | Popup + In-page | In-page (full integration) | In-page popup | Popup + injected button | Popup (React app) |
| **Trigger Method** | Ctrl/Cmd+J | Popup icon + `/` key | `@` and `#` keys | `/` key | Button + F9 | Click extension icon |
| **Search** | Fuzzy text search | Text filter | Full-text search | Prefix match | Dropdown select | Filter + categories |
| **Prompt Organization** | Markdown groups (H1/H2) | Flat list | Folders + chains | Regex groups | Flat list | Tags + folders |
| **Storage** | chrome.storage.local | Plasmo storage (local) | chrome.storage.local + sync | chrome.storage.local | localStorage | IndexedDB + sync |
| **Tech Stack** | React + Vite + cmdk | Plasmo + React + Mantine | Vanilla JS | TypeScript + Vite | Vanilla JS + HTML | React + Tailwind + DaisyUI |
| **MV3 Compliant** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | Partial | ✅ Yes |
| **Injection Strategy** | Content script creates root | Plasmo inline anchor | DOM manipulation | Content script modal | Injected panel | N/A (popup only) |

---

## 2. UI/UX Pattern Extraction

### Pattern 1: Command Palette UI (kohkimakimoto)
**What it does**: Uses `cmdk` library to create a Spotlight/Alfred-like search interface  
**Why it works**: Familiar pattern for power users, keyboard-first navigation  
**Code insight**:
```tsx
// Uses @radix-ui/react-dialog + cmdk
<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Type to search..." />
  <CommandList>
    <CommandGroup heading="Recently Used">...</CommandGroup>
    <CommandGroup heading="Category Name">...</CommandGroup>
  </CommandList>
</CommandDialog>
```
**Recommendation**: ✅ ADOPT - This is the gold standard for prompt selection UX

---

### Pattern 2: Slash Command Trigger (xuannghia)
**What it does**: Type `/` in ChatGPT input to open prompt suggestions  
**Why it works**: Contextual, doesn't require leaving the input area  
**Code insight**:
```tsx
// Content script listens for `/` in the input
if (event.key === '/' && ((!input && !open) || event.ctrlKey)) {
  setOpen(true)
  event.preventDefault()
}
```
**Recommendation**: ✅ ADOPT for v1.1 - Excellent friction-reducer

---

### Pattern 3: @ and # Trigger Menus (superpower-chatgpt)
**What it does**: `@` opens custom prompts, `#` opens prompt chains  
**Why it works**: Differentiated triggers for different content types  
**Code insight**:
```js
newTextAreaElement.placeholder = 'Send a message (Type @ for Custom Prompt and # for Prompt Chains)';
```
**Recommendation**: ⚠️ CONSIDER for v2 - Good but adds complexity

---

### Pattern 4: Selection Range in Prompts (xuannghia)
**What it does**: When inserting a prompt, auto-select a range for quick editing  
**Why it works**: Reduces friction for prompts with placeholders  
**Code insight**:
```tsx
interface Prompt {
  id: string
  title: string
  prompt: string
  selection?: [number, number]  // Auto-select this range after insert
}
```
**Recommendation**: ✅ ADOPT for v1.0 - Low effort, high impact

---

### Pattern 5: Variable Templates (superpower-chatgpt)
**What it does**: `{{variable}}` syntax with replacement modal  
**Why it works**: Makes prompts reusable without manual editing  
**Code insight**:
```js
const templateWords = textAreaElement.value.match(/{{(.*?)}}/g);
if (settings.promptTemplate && templateWords?.length > 0) {
  createTemplateWordsModal(templateWords);
}
```
**Recommendation**: ⚠️ DEFER to v2 - Nice feature but not MVP-critical

---

### Pattern 6: Keyboard Navigation (All)
**What it does**: Arrow keys + Tab/Enter for selection  
**Why it works**: Power users never touch the mouse  
**Code insight**:
```tsx
<Kbd>↑</Kbd> <Kbd>↓</Kbd> to navigate and <Kbd>Tab</Kbd> to select
<Kbd>Esc</Kbd> to close
```
**Recommendation**: ✅ MUST HAVE - Non-negotiable for keyboard users

---

### Pattern 7: Recent Prompts (kohkimakimoto)
**What it does**: Shows last 3 used prompts at the top  
**Why it works**: Reduces cognitive load for repetitive tasks  
**Code insight**:
```tsx
const updateRecentSnippets = (snippet: Snippet) => {
  chrome.storage.local.get(['recentSnippets'], (result) => {
    let recentSnippets = result.recentSnippets || [];
    recentSnippets = recentSnippets.filter((s) => s.name !== snippet.name);
    recentSnippets.unshift(snippet);
    if (recentSnippets.length > 3) recentSnippets.pop();
    chrome.storage.local.set({ recentSnippets });
  });
};
```
**Recommendation**: ✅ ADOPT - Simple but powerful

---

### Pattern 8: ProseMirror-aware Injection (kohkimakimoto, xuannghia)
**What it does**: Properly handles ChatGPT's ProseMirror editor (not just setting `.value`)  
**Why it works**: ChatGPT uses a contenteditable div, not a textarea  
**Code insight**:
```tsx
// kohkimakimoto approach - creates <p> elements
const div = document.getElementById('prompt-textarea') as HTMLDivElement;
const lines = snippet.body.split('\n');
lines.forEach((line) => {
  const p = document.createElement('p');
  p.textContent = line;
  div.appendChild(p);
});

// xuannghia approach - sets innerHTML and dispatches input event
let promptHTML = '';
lines.forEach((line) => {
  const p = document.createElement('p');
  p.innerText = line;
  promptHTML += p.outerHTML;
});
inputDom.innerHTML = promptHTML;
inputDom.dispatchEvent(new Event('input', { bubbles: true }));
```
**Recommendation**: ✅ CRITICAL - Must handle ProseMirror correctly

---

### Pattern 9: Dark Mode Detection (xuannghia)
**What it does**: Auto-detects ChatGPT's theme and matches it  
**Why it works**: Seamless visual integration  
**Code insight**:
```tsx
const html = document.querySelector('html');
const scheme = html.classList.contains('dark') ? 'dark' : 'light';
setColorScheme(scheme);
```
**Recommendation**: ✅ ADOPT - Essential for polish

---

### Pattern 10: MutationObserver for SPA (multiple)
**What it does**: Watches for DOM changes in single-page app  
**Why it works**: ChatGPT dynamically loads content  
**Code insight**:
```tsx
// xuannghia uses animationFrame polling
const cancelAnimationFrame = animationFrame(() => {
  const prompt = document.getElementById('prompt-textarea');
  if (prompt) {
    setInputDom(prompt);
    cancelAnimationFrame();
  }
}, 300);
```
**Recommendation**: ✅ CRITICAL - Required for reliability

---

## 3. Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Over-reliance on textarea.value
**Why it fails**: ChatGPT uses ProseMirror (contenteditable div), not a real textarea  
**Seen in**: Earlier versions of doosik71  

### ❌ Anti-Pattern 2: Not dispatching input events
**Why it fails**: ChatGPT's React state won't update without synthetic events  
**Solution**: Always dispatch `new Event('input', { bubbles: true })`

### ❌ Anti-Pattern 3: Complex permission requests
**Why it fails**: Users distrust extensions asking for broad permissions  
**Solution**: Request only `activeTab`, `storage`, and explicit host permissions for chatgpt.com

### ❌ Anti-Pattern 4: Backend dependency for core features
**Why it fails**: Creates privacy concerns and single point of failure  
**Solution**: Local-first architecture (superpower-chatgpt does this well for prompts)

### ❌ Anti-Pattern 5: No empty state handling
**Why it fails**: Confuses new users with blank screens  
**Solution**: Show onboarding prompts, sample data, or clear CTAs

---

## 4. Technical Stack Recommendations

Based on the research, here's my recommended stack:

| Component | Recommendation | Reasoning |
|-----------|----------------|-----------|
| Build Tool | **Vite** | Fast HMR, native TS support, used by 4/6 repos |
| Language | **TypeScript** | Type safety, better DX, used by 5/6 repos |
| UI Framework | **React** (optional) | Could go vanilla, but React simplifies state management |
| CSS | **Tailwind CSS** | Rapid iteration, consistent with modern extensions |
| Component Library | **cmdk** + **Radix UI** | Accessible, keyboard-friendly, proven in kohkimakimoto |
| Storage | **chrome.storage.local** | MV3 compliant, simple API |
| Extension Framework | **None** (or Plasmo for faster iteration) | Plasmo adds convenience but also bundle size |

### Framework Decision: Plasmo vs Vanilla

| Factor | Plasmo | Vanilla (Vite + crxjs) |
|--------|--------|------------------------|
| Setup time | ⭐⭐⭐⭐⭐ (minutes) | ⭐⭐⭐ (hours) |
| Bundle size | Larger | Smaller |
| HMR support | Built-in | Requires config |
| Flexibility | Limited | Full control |
| Learning curve | Low | Medium |
| Community | Growing | Mature |

**My recommendation**: Start with **Vite + crxjs/vite-plugin** for a balance of control and convenience. Plasmo is excellent but adds abstraction we may not need for this scope.

---

## 5. ChatGPT DOM Selectors (Current as of Jan 2026)

> ⚠️ **Warning**: These selectors may change with ChatGPT updates. Build with flexibility.

```typescript
const SELECTORS = {
  // Main input area (ProseMirror editor)
  inputArea: '#prompt-textarea',
  
  // Input form wrapper
  inputForm: 'main form',
  
  // Send button
  sendButton: 'main form textarea ~ button',  // Note: This is sibling selector
  
  // Alternative send button selector
  sendButtonAlt: 'button[data-testid="send-button"]',
  
  // Dark mode detection
  darkModeIndicator: 'html.dark',
  
  // Conversation container
  conversationContainer: 'main',
  
  // Message wrappers
  messageWrapper: '[id^="message-wrapper-"]',
};
```

---

## 6. Summary: Top 10 Patterns to Implement

| Priority | Pattern | Source | Complexity | Impact |
|----------|---------|--------|------------|--------|
| 1 | Command palette UI | kohkimakimoto | Medium | High |
| 2 | Keyboard navigation | All | Low | High |
| 3 | ProseMirror-aware injection | kohkimakimoto, xuannghia | Medium | Critical |
| 4 | Dark mode detection | xuannghia | Low | Medium |
| 5 | Recent prompts section | kohkimakimoto | Low | Medium |
| 6 | Selection range auto-select | xuannghia | Low | Medium |
| 7 | SPA mutation handling | Multiple | Medium | Critical |
| 8 | Ctrl/Cmd+J shortcut | kohkimakimoto | Low | High |
| 9 | `/` trigger in input | xuannghia | Medium | High |
| 10 | Fuzzy search | kohkimakimoto | Medium | Medium |

---

## Appendix: Repository Links

1. [kohkimakimoto/chatgpt-prompt-snippets](https://github.com/kohkimakimoto/chatgpt-prompt-snippets-chrome-extension) - MIT License
2. [xuannghia/chatgpt-prompts-manager](https://github.com/xuannghia/chatgpt-prompts-manager-extension) - No explicit license
3. [saeedezzati/superpower-chatgpt](https://github.com/saeedezzati/superpower-chatgpt) - Custom license (non-commercial)
4. [sailist/chatgpt-enhancement-extension](https://github.com/sailist/chatgpt-enhancement-extension) - MIT License
5. [doosik71/ChatGPT-User-Prompt-Extension](https://github.com/doosik71/ChatGPT-User-Prompt-Extension) - No explicit license
6. [AI-Prompt-Genius/AI-Prompt-Genius](https://github.com/AI-Prompt-Genius/AI-Prompt-Genius) - CC BY-NC-SA 4.0

---

*Document prepared as part of GPTPrompt extension planning*
