# Product Requirements Document (PRD)

**Document Version**: 1.0.0  
**Last Updated**: 2026-02-01  
**Status**: ✅ Complete

---

## 1. Product Overview

### 1.1 Product Name
**GPTPrompt** - A local-first prompt library for ChatGPT

### 1.2 Problem Statement
ChatGPT users frequently reuse similar prompts but have no efficient way to:
- Store and retrieve prompts quickly
- Search through a personal prompt library
- Insert prompts without copy-paste friction
- Keep prompts private and local

### 1.3 Solution
A Chrome/Chromium extension that provides:
- Local storage of prompt templates
- Fast search and selection via command palette
- One-click injection into ChatGPT's input
- Keyboard-first interaction design

### 1.4 Target Users
| User Type | Description | Key Needs |
|-----------|-------------|-----------|
| Power Users | Daily ChatGPT users, professionals | Speed, keyboard shortcuts, organization |
| Casual Users | Occasional ChatGPT users | Simplicity, visual prompt cards |
| Privacy-Conscious | Users avoiding cloud storage | Local-only storage, minimal permissions |

---

## 2. User Stories

### 2.1 Core User Stories (MVP - Must Have)

#### US-001: Quick Prompt Insertion
**As a** ChatGPT user  
**I want to** select a saved prompt and insert it into the chat input  
**So that** I can start conversations faster without retyping

**Acceptance Criteria:**
- [ ] User can open prompt picker with Ctrl/Cmd+J
- [ ] User sees a list of saved prompts
- [ ] User can click or press Enter to insert selected prompt
- [ ] Prompt appears in ChatGPT input field (not auto-sent)
- [ ] Input field gains focus after insertion

---

#### US-002: Save New Prompt
**As a** ChatGPT user  
**I want to** save a prompt with a title and content  
**So that** I can reuse it later

**Acceptance Criteria:**
- [ ] User can access "Add Prompt" from extension popup
- [ ] Form includes: Title (required), Content (required), Description (optional)
- [ ] Prompt is saved to `chrome.storage.local`
- [ ] New prompt appears in the prompt list immediately
- [ ] Form validates required fields before save

---

#### US-003: Search Prompts
**As a** ChatGPT user  
**I want to** search my prompts by keyword  
**So that** I can quickly find the right prompt

**Acceptance Criteria:**
- [ ] Search input is visible and focused when picker opens
- [ ] Search filters prompts in real-time (< 100ms perceived delay)
- [ ] Search matches against title and content
- [ ] Empty results show helpful message
- [ ] Search is case-insensitive

---

#### US-004: Keyboard Navigation
**As a** power user  
**I want to** navigate prompts using only the keyboard  
**So that** I can work faster without touching the mouse

**Acceptance Criteria:**
- [ ] Arrow Up/Down moves selection
- [ ] Enter inserts selected prompt
- [ ] Tab inserts selected prompt (alternative)
- [ ] Escape closes the picker
- [ ] Visual indicator shows current selection

---

#### US-005: Edit Existing Prompt
**As a** ChatGPT user  
**I want to** modify a saved prompt  
**So that** I can improve it over time

**Acceptance Criteria:**
- [ ] User can click "Edit" on a prompt in the list
- [ ] Edit form pre-fills with existing data
- [ ] Changes are saved to storage
- [ ] Updated prompt reflects immediately in the list

---

#### US-006: Delete Prompt
**As a** ChatGPT user  
**I want to** remove prompts I no longer need  
**So that** my library stays organized

**Acceptance Criteria:**
- [ ] User can delete a prompt from the edit view
- [ ] Confirmation dialog prevents accidental deletion
- [ ] Prompt is removed from storage and UI
- [ ] Recent prompts list updates if deleted prompt was recent

---

### 2.2 Enhanced User Stories (v1.1 - Should Have)

#### US-007: Slash Command Trigger
**As a** ChatGPT user  
**I want to** type `/` in the chat input to open prompt picker  
**So that** I don't have to use a separate keyboard shortcut

**Acceptance Criteria:**
- [ ] Typing `/` when input is empty opens inline prompt picker
- [ ] Picker appears near the input (not blocking it)
- [ ] Selecting a prompt replaces the `/` with prompt content
- [ ] Pressing Escape removes the `/` and closes picker

---

#### US-008: Recent Prompts
**As a** frequent user  
**I want to** see my recently used prompts at the top  
**So that** I can access common prompts even faster

**Acceptance Criteria:**
- [ ] Last 5 used prompts shown in "Recent" section
- [ ] Most recent prompt is first
- [ ] Using a prompt moves it to the top of recents
- [ ] Deleting a prompt removes it from recents

---

#### US-009: Dark Mode Support
**As a** ChatGPT user  
**I want to** have the extension match ChatGPT's theme  
**So that** the UI feels integrated

**Acceptance Criteria:**
- [ ] Extension detects ChatGPT's dark/light mode
- [ ] UI automatically switches themes
- [ ] Transition is smooth (no flash)

---

### 2.3 Future User Stories (v2.0 - Nice to Have)

#### US-010: Tags/Categories
**As a** organized user  
**I want to** tag prompts with categories  
**So that** I can filter by topic

---

#### US-011: Variable Placeholders
**As a** advanced user  
**I want to** use `{{variable}}` in prompts  
**So that** I can fill in dynamic values

---

#### US-012: Import/Export
**As a** user switching devices  
**I want to** export and import my prompts as JSON  
**So that** I can backup or share my library

---

#### US-013: Folders/Hierarchy
**As a** power user with many prompts  
**I want to** organize prompts into folders  
**So that** I can navigate a large library

---

## 3. Functional Requirements

### 3.1 Prompt Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | Create prompt with title, content, optional description | P0 |
| FR-002 | Read/list all prompts from storage | P0 |
| FR-003 | Update existing prompt | P0 |
| FR-004 | Delete prompt with confirmation | P0 |
| FR-005 | Track and display recent prompts (last 5) | P1 |
| FR-006 | Search prompts by title and content | P0 |

### 3.2 ChatGPT Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-101 | Inject prompt text into ChatGPT input field | P0 |
| FR-102 | Handle ProseMirror editor (not plain textarea) | P0 |
| FR-103 | Focus input after prompt insertion | P0 |
| FR-104 | Detect and handle ChatGPT DOM changes (SPA) | P0 |
| FR-105 | Support selection range auto-select after insert | P1 |

### 3.3 User Interface

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-201 | Popup UI for prompt management (CRUD) | P0 |
| FR-202 | In-page command palette for prompt selection | P0 |
| FR-203 | Keyboard shortcut (Ctrl/Cmd+J) to open picker | P0 |
| FR-204 | Dark mode support matching ChatGPT | P1 |
| FR-205 | Empty state with onboarding guidance | P1 |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | Prompt picker open time | < 100ms |
| NFR-002 | Search filtering latency | < 50ms |
| NFR-003 | Prompt insertion time | < 100ms |
| NFR-004 | Extension memory footprint | < 50MB |
| NFR-005 | Storage: Support 1000+ prompts | No degradation |

### 4.2 Privacy & Security

| ID | Requirement |
|----|-------------|
| NFR-101 | All data stored locally (chrome.storage.local) |
| NFR-102 | No external API calls for core functionality |
| NFR-103 | Minimal permissions (activeTab, storage, chatgpt.com only) |
| NFR-104 | No tracking, analytics, or telemetry |
| NFR-105 | Content scripts only injected on chatgpt.com |

### 4.3 Compatibility

| ID | Requirement |
|----|-------------|
| NFR-201 | Chrome 88+ (MV3 minimum) |
| NFR-202 | Chromium-based browsers (Edge, Brave, Arc) |
| NFR-203 | chatgpt.com domain (both www and non-www) |

### 4.4 Accessibility

| ID | Requirement |
|----|-------------|
| NFR-301 | Full keyboard navigation |
| NFR-302 | ARIA labels on interactive elements |
| NFR-303 | Focus management (trap in modals) |
| NFR-304 | Sufficient color contrast (WCAG AA) |

---

## 5. Scope Definition

### 5.1 In Scope (MVP)

- ✅ Local prompt storage (CRUD)
- ✅ Command palette UI with search
- ✅ Keyboard shortcut trigger
- ✅ ChatGPT input injection
- ✅ Popup for prompt management
- ✅ Basic theming (light/dark)

### 5.2 Out of Scope (MVP)

- ❌ Cloud sync
- ❌ User accounts
- ❌ Sharing prompts
- ❌ Variable templates
- ❌ Tags/folders
- ❌ Import/export
- ❌ Mobile support
- ❌ Firefox support (MV3 differences)
- ❌ API integration (GPT API calls)

### 5.3 Assumptions

1. ChatGPT web interface structure remains relatively stable
2. Users have Chrome 88+ or compatible Chromium browser
3. Users have English UI (localization deferred)
4. ChatGPT uses ProseMirror-based contenteditable input

### 5.4 Dependencies

| Dependency | Type | Risk |
|------------|------|------|
| ChatGPT DOM structure | External | Medium - May change with updates |
| Chrome Extensions MV3 API | Platform | Low - Stable API |
| chrome.storage.local | Platform | Low - Well-documented |

---

## 6. Success Metrics

### 6.1 Launch Criteria (MVP)

- [ ] All P0 functional requirements implemented
- [ ] Zero critical bugs
- [ ] Performance targets met
- [ ] Manual QA passed on Chrome, Edge, Brave
- [ ] Extension loads in < 2 seconds

### 6.2 Post-Launch Metrics (if distributed)

| Metric | Target | Measurement |
|--------|--------|-------------|
| User activation | 50% create 1+ prompts in first session | Storage check |
| Retention | 30% weekly active | Usage timestamp |
| Performance | < 100ms prompt insert | Timing logs |
| Reliability | < 1% injection failures | Error logging |

---

## 7. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ChatGPT DOM changes break injection | Medium | High | Abstract selectors, add fallbacks, monitor changes |
| MV3 restrictions block features | Low | Medium | Design within MV3 constraints from start |
| Storage limits exceeded | Low | Medium | Implement pagination, cleanup old data |
| User confusion with ProseMirror | Medium | Medium | Test thoroughly, document expected behavior |

---

## 8. Open Questions

> These require decisions before implementation:

1. **Q: Should we support chatgpt.com/chat/* routes only, or also /share, /g/* (GPTs)?**
   - A: MVP targets main chat interface. GPTs and share pages deferred.

2. **Q: Should prompt insertion replace existing input or append?**
   - A: Replace by default. Consider append option in v2.

3. **Q: How to handle ChatGPT being logged out or having an error state?**
   - A: Gracefully degrade - show picker but warn if input not found.

4. **Q: Localization?**
   - A: English only for MVP. i18n infrastructure for v2.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-01 | GPT-4 | Initial PRD |

---

*Document prepared as part of GPTPrompt extension planning*
