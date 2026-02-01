# UI/UX Specification

**Document Version**: 1.0.0  
**Last Updated**: 2026-02-01  
**Status**: ✅ Complete

---

## 1. Design Principles

### 1.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Speed First** | Every interaction should feel instant (<100ms) |
| **Keyboard Native** | Full functionality without touching mouse |
| **Seamless Integration** | UI should feel like part of ChatGPT |
| **Progressive Disclosure** | Simple by default, powerful on demand |
| **Minimal Friction** | Fewest clicks/keystrokes to accomplish tasks |

### 1.2 Design Language

- **Colors**: Inherit from ChatGPT's theme (light/dark)
- **Typography**: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- **Spacing**: 4px base unit (4, 8, 12, 16, 24, 32, 48)
- **Border Radius**: 6px (inputs), 8px (cards), 12px (modals)
- **Shadows**: Subtle, layered (ChatGPT style)

---

## 2. Color System

### 2.1 Light Mode

```css
:root {
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f7f7f8;
  --bg-tertiary: #ececf1;
  --bg-hover: #f0f0f0;
  --bg-selected: #e5e5e5;
  
  /* Text */
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --text-inverse: #ffffff;
  
  /* Borders */
  --border-default: #e5e5e5;
  --border-hover: #d0d0d0;
  --border-focus: #10a37f;
  
  /* Accent */
  --accent-primary: #10a37f;
  --accent-hover: #0d8a6a;
  --accent-light: #d1f3e7;
  
  /* Semantic */
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-success: #10b981;
}
```

### 2.2 Dark Mode

```css
.dark {
  /* Backgrounds */
  --bg-primary: #343541;
  --bg-secondary: #40414f;
  --bg-tertiary: #2a2b32;
  --bg-hover: #4a4b57;
  --bg-selected: #565869;
  
  /* Text */
  --text-primary: #ececf1;
  --text-secondary: #c5c5d2;
  --text-tertiary: #8e8ea0;
  --text-inverse: #1a1a1a;
  
  /* Borders */
  --border-default: #4a4b57;
  --border-hover: #565869;
  --border-focus: #10a37f;
  
  /* Accent */
  --accent-primary: #10a37f;
  --accent-hover: #1db588;
  --accent-light: #1a4a3a;
}
```

---

## 3. Component Specifications

### 3.1 Popup UI

#### 3.1.1 Popup Container

```
┌─────────────────────────────────┐
│  GPTPrompt          [Settings]  │  ← Header (44px)
├─────────────────────────────────┤
│  🔍 Search prompts...           │  ← Search (40px)
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ Code Review               │  │  ← Prompt Card
│  │ Review code for bugs...   │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Explain Concept           │  │
│  │ Explain X like I'm 5...   │  │
│  └───────────────────────────┘  │
│                                 │
│  [Empty state when no prompts]  │
│                                 │
├─────────────────────────────────┤
│  [+ Add Prompt]                 │  ← Footer (48px)
└─────────────────────────────────┘

Width: 400px
Min Height: 300px
Max Height: 600px
```

#### 3.1.2 Prompt Card

```
┌─────────────────────────────────────────────┐
│  Title Here                        [⋮]      │  ← Title + Actions (28px)
│  Description or content preview...          │  ← Description (20px)
└─────────────────────────────────────────────┘

Padding: 12px
Gap: 4px
Border Radius: 8px
Hover: bg-hover
```

**States**:
- Default: `bg-secondary`, `border-default`
- Hover: `bg-hover`, shadow-sm
- Selected/Focus: `border-focus`, ring-2

#### 3.1.3 Add/Edit Form

```
┌─────────────────────────────────┐
│  ← Back       Add New Prompt    │
├─────────────────────────────────┤
│                                 │
│  Title *                        │
│  ┌───────────────────────────┐  │
│  │ Enter title...            │  │
│  └───────────────────────────┘  │
│                                 │
│  Content *                      │
│  ┌───────────────────────────┐  │
│  │ Enter prompt content...   │  │
│  │                           │  │
│  │                           │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  Description (optional)         │
│  ┌───────────────────────────┐  │
│  │ Brief description...      │  │
│  └───────────────────────────┘  │
│                                 │
│         [Cancel]  [Save]        │
└─────────────────────────────────┘
```

---

### 3.2 Command Palette (Picker)

#### 3.2.1 Picker Container

```
┌───────────────────────────────────────────────────────┐
│  🔍 Search prompts...                                 │  ← Input (48px)
├───────────────────────────────────────────────────────┤
│                                                       │
│  Recent                                               │  ← Section Header
│  ┌─────────────────────────────────────────────────┐  │
│  │ 📋  Code Review                                 │  │
│  │     Review code for bugs, performance...        │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  All Prompts                                          │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 📋  Explain Concept                   ▸        │  │  ← Selected
│  │     Explain any topic simply...                 │  │
│  └─────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 📋  Summarize Text                              │  │
│  │     Create concise summaries...                 │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
├───────────────────────────────────────────────────────┤
│  ↑↓ Navigate   ↵ Insert   Esc Close                  │  ← Footer (32px)
└───────────────────────────────────────────────────────┘

Width: 560px
Max Height: 400px
Position: Center of viewport, offset up slightly
```

#### 3.2.2 Picker Item

```
┌─────────────────────────────────────────────────────────┐
│  📋  Title of the Prompt                     [selected] │
│      Description or first line of content...           │
└─────────────────────────────────────────────────────────┘

Height: 56px
Padding: 8px 12px
Icon: 16px
Title: 14px, font-medium
Description: 12px, text-secondary, truncate
```

**States**:
- Default: transparent background
- Hover: `bg-hover`
- Selected: `bg-selected`, left border accent
- Keyboard focus: same as selected

---

### 3.3 Empty States

#### 3.3.1 No Prompts (Popup)

```
┌─────────────────────────────────┐
│                                 │
│           📝                    │
│                                 │
│     No prompts yet              │
│                                 │
│  Create your first prompt to    │
│  get started.                   │
│                                 │
│      [+ Create Prompt]          │
│                                 │
└─────────────────────────────────┘
```

#### 3.3.2 No Search Results (Picker)

```
┌─────────────────────────────────┐
│  🔍 "search term"               │
├─────────────────────────────────┤
│                                 │
│     No prompts found            │
│                                 │
│  Try a different search term    │
│  or create a new prompt.        │
│                                 │
└─────────────────────────────────┘
```

---

## 4. Interaction Patterns

### 4.1 Keyboard Shortcuts

| Context | Shortcut | Action |
|---------|----------|--------|
| Global (on ChatGPT) | `Ctrl+J` / `Cmd+J` | Open picker |
| Picker | `↑` / `↓` | Navigate items |
| Picker | `Enter` / `Tab` | Insert selected prompt |
| Picker | `Escape` | Close picker |
| Picker | Type anything | Filter prompts |
| Popup | `Escape` | Go back / Close |
| Form | `Ctrl+Enter` | Save |

### 4.2 Mouse Interactions

| Element | Click | Hover | Double-Click |
|---------|-------|-------|--------------|
| Prompt Card (Popup) | Open edit view | Highlight | - |
| Prompt Item (Picker) | Insert prompt | Highlight + show actions | - |
| Search Input | Focus | - | Select all |
| Action Button | Execute action | Show tooltip | - |

### 4.3 Touch Interactions

| Element | Tap | Long Press |
|---------|-----|------------|
| Prompt Card | Open edit | Show context menu |
| Prompt Item | Insert | Show preview |

---

## 5. Animation Specifications

### 5.1 Picker Animations

```css
/* Picker enter */
@keyframes picker-enter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.picker-enter {
  animation: picker-enter 150ms ease-out;
}

/* Picker exit */
@keyframes picker-exit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}

.picker-exit {
  animation: picker-exit 100ms ease-in;
}
```

### 5.2 Item Highlight

```css
/* Selection indicator */
.item-selected {
  background-color: var(--bg-selected);
  transition: background-color 100ms ease;
}

/* Left border accent */
.item-selected::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 3px;
  background-color: var(--accent-primary);
  border-radius: 2px;
}
```

### 5.3 Timing Values

| Animation | Duration | Easing |
|-----------|----------|--------|
| Picker open | 150ms | ease-out |
| Picker close | 100ms | ease-in |
| Item hover | 100ms | ease |
| Item select | 100ms | ease |
| Toast appear | 200ms | ease-out |
| Toast dismiss | 150ms | ease-in |

---

## 6. Responsive Behavior

### 6.1 Popup Sizing

| Viewport | Popup Width | Popup Height |
|----------|-------------|--------------|
| Default | 400px | 300-600px (auto) |
| Small | 360px | 280-500px |

### 6.2 Picker Positioning

```typescript
// Calculate picker position
const getPickerPosition = () => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  return {
    // Centered horizontally
    left: Math.max(20, (viewportWidth - 560) / 2),
    // Positioned in upper third of screen
    top: Math.min(viewportHeight * 0.2, 100),
    // Cap width on small screens
    width: Math.min(560, viewportWidth - 40),
    // Cap height
    maxHeight: Math.min(400, viewportHeight - 200),
  };
};
```

---

## 7. Accessibility

### 7.1 ARIA Labels

```html
<!-- Picker -->
<div
  role="dialog"
  aria-modal="true"
  aria-label="Prompt picker"
>
  <input
    role="combobox"
    aria-expanded="true"
    aria-haspopup="listbox"
    aria-controls="prompt-listbox"
    aria-label="Search prompts"
  />
  
  <ul
    id="prompt-listbox"
    role="listbox"
    aria-label="Prompts"
  >
    <li
      role="option"
      aria-selected="true"
    >
      Prompt title
    </li>
  </ul>
</div>
```

### 7.2 Focus Management

1. **Picker opens**: Focus search input
2. **Search clears**: Keep focus on input
3. **Item selected with keyboard**: Announce selection
4. **Picker closes**: Return focus to ChatGPT input
5. **Popup opens**: Focus search input
6. **Form opens**: Focus first field

### 7.3 Screen Reader Announcements

| Event | Announcement |
|-------|--------------|
| Picker opens | "Prompt picker opened. Type to search." |
| Results updated | "{count} prompts found" |
| Item selected | "{title}. Press Enter to insert." |
| Prompt inserted | "Prompt inserted" |
| Error | "Error: {message}" |

---

## 8. Error States

### 8.1 Validation Errors

```
┌───────────────────────────────┐
│  Title *                      │
│  ┌─────────────────────────┐  │
│  │                     ⚠️  │  │  ← Red border
│  └─────────────────────────┘  │
│  Title is required            │  ← Error message (red)
└───────────────────────────────┘
```

### 8.2 Toast Notifications

```
┌─────────────────────────────────────┐
│  ✓  Prompt saved successfully       │
└─────────────────────────────────────┘

Position: Top-right of popup
Duration: 3 seconds
Auto-dismiss: Yes
```

### 8.3 Insertion Failure

```
┌─────────────────────────────────────────────────┐
│                                                  │
│  ⚠️  Couldn't insert prompt                      │
│                                                  │
│  ChatGPT input not found. Make sure you're on   │
│  the ChatGPT page and try again.                │
│                                                  │
│                        [Try Again]  [Close]      │
└─────────────────────────────────────────────────┘
```

---

## 9. Component Library

### 9.1 Button Variants

```tsx
// Primary (accent)
<Button variant="primary">Save Prompt</Button>

// Secondary (outline)
<Button variant="secondary">Cancel</Button>

// Ghost (text only)
<Button variant="ghost">← Back</Button>

// Danger (destructive)
<Button variant="danger">Delete</Button>

// Icon button
<Button variant="icon" aria-label="Settings">
  <SettingsIcon />
</Button>
```

### 9.2 Input Variants

```tsx
// Text input
<Input
  label="Title"
  placeholder="Enter title..."
  error="Title is required"
  required
/>

// Textarea
<Textarea
  label="Content"
  placeholder="Enter prompt content..."
  rows={5}
  maxLength={10000}
/>

// Search input
<SearchInput
  placeholder="Search prompts..."
  value={search}
  onChange={setSearch}
  onClear={() => setSearch('')}
/>
```

---

## 10. Figma/Design Handoff Notes

> If creating visual designs, include these specifications:

### 10.1 Icon Set

Use Lucide icons for consistency:
- `Search` - Search input
- `Plus` - Add prompt
- `Edit2` - Edit action
- `Trash2` - Delete action
- `Settings` - Settings
- `ChevronLeft` - Back navigation
- `Clipboard` - Prompt item icon
- `X` - Close/Clear

### 10.2 Typography Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| heading-lg | 18px | 600 | 24px | Page titles |
| heading-md | 16px | 600 | 22px | Section headers |
| body | 14px | 400 | 20px | Default text |
| body-sm | 13px | 400 | 18px | Descriptions |
| caption | 12px | 400 | 16px | Helper text |

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-01 | GPT-4 | Initial UI/UX specification |

---

*Document prepared as part of GPTPrompt extension planning*
