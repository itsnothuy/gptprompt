# GPTPrompt - Chrome Extension Project

## 📋 Document Index

| Document | Description | Status |
|----------|-------------|--------|
| [01-RESEARCH-ANALYSIS.md](./01-RESEARCH-ANALYSIS.md) | Competitive analysis of 6 open-source extensions | ✅ Complete |
| [02-PRODUCT-REQUIREMENTS.md](./02-PRODUCT-REQUIREMENTS.md) | PRD with user stories, scope, and acceptance criteria | ✅ Complete |
| [03-TECHNICAL-ARCHITECTURE.md](./03-TECHNICAL-ARCHITECTURE.md) | System design, MV3 architecture, data models | ✅ Complete |
| [04-IMPLEMENTATION-PLAN.md](./04-IMPLEMENTATION-PLAN.md) | Phase-by-phase development roadmap | ✅ Complete |
| [05-UI-UX-SPECIFICATION.md](./05-UI-UX-SPECIFICATION.md) | Wireframes, component specs, interaction patterns | ✅ Complete |
| [06-DEVELOPMENT-GUIDE.md](./06-DEVELOPMENT-GUIDE.md) | Setup instructions, coding standards, testing | ✅ Complete |

## 🎯 Project Summary

**GPTPrompt** is a Chrome/Chromium browser extension (Manifest V3) that provides a local-first prompt library for ChatGPT users. Users can:

1. Save prompt templates locally
2. Quickly search and select prompts
3. Inject prompts into ChatGPT's input field
4. Organize prompts with tags/folders (v2)

## 🔑 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Vanilla TypeScript + Vite | Lighter bundle, full control, no framework overhead |
| UI Library | Tailwind CSS + shadcn/ui patterns | Modern, accessible, consistent with research findings |
| Storage | `chrome.storage.local` | Local-first, no sync complexity for MVP |
| Injection Method | Content Script + DOM manipulation | Direct ProseMirror editor interaction |
| Trigger UX | Popup + Keyboard shortcut + `/` trigger | Multiple access patterns for different user preferences |

## 📅 Last Updated

**Date**: 2026-02-01  
**Version**: 1.0.0 (Planning Phase)
