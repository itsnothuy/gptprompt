# GPTPrompt - Prompt Library for ChatGPT

<p align="center">
  <img src="public/icons/icon128.png" alt="GPTPrompt Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Save and manage prompt templates for ChatGPT</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#development">Development</a> •
  <a href="#documentation">Documentation</a>
</p>

---

## Features

- 📝 **Save Prompts Locally** - Create and store prompt templates with title, content, and description
- ⚡ **Quick Insert** - Open command palette with `Cmd+J` / `Ctrl+J` on ChatGPT
- 🔍 **Fuzzy Search** - Find prompts instantly by typing
- ⌨️ **Keyboard First** - Navigate entirely with keyboard shortcuts
- 🌙 **Dark Mode** - Matches ChatGPT's theme automatically
- 🔒 **Privacy First** - All data stored locally, no server required
- 🎯 **Manifest V3** - Built with the latest Chrome extension standards

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store page
2. Click "Add to Chrome"

### From Source (Development)

```bash
# Clone the repository
git clone https://github.com/itsnothuy/gptprompt.git
cd gptprompt

# Install dependencies
npm install

# Build the extension
npm run build

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the `dist` folder
```

## Usage

### Adding a Prompt

1. Click the GPTPrompt extension icon in your toolbar
2. Click "Add Prompt"
3. Fill in the title, content, and optional description
4. Click "Save"

### Inserting a Prompt

1. Open [ChatGPT](https://chat.openai.com) or [ChatGPT](https://chatgpt.com)
2. Press `Cmd+J` (Mac) or `Ctrl+J` (Windows/Linux)
3. Type to search for a prompt
4. Press `Enter` to insert

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + J` | Open prompt picker |
| `↑` / `↓` | Navigate prompts |
| `Enter` | Insert selected prompt |
| `Escape` | Close picker |

## Development

### Prerequisites

- Node.js 18+
- npm 9+
- Chrome/Chromium browser

### Setup

```bash
# Install dependencies
npm install

# Start development server (with HMR)
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

### Project Structure

```
gptprompt/
├── docs/                 # Project documentation
├── src/
│   ├── background/       # Service worker
│   ├── content/          # Content scripts (picker)
│   ├── popup/            # Popup UI
│   ├── shared/           # Shared utilities
│   └── styles/           # Global styles
├── public/               # Static assets
├── tests/                # Test files
└── manifest.json         # Extension manifest
```

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs) folder:

| Document | Description |
|----------|-------------|
| [00-PROJECT-INDEX.md](./docs/00-PROJECT-INDEX.md) | Documentation overview |
| [01-RESEARCH-ANALYSIS.md](./docs/01-RESEARCH-ANALYSIS.md) | Competitive analysis |
| [02-PRODUCT-REQUIREMENTS.md](./docs/02-PRODUCT-REQUIREMENTS.md) | Product requirements |
| [03-TECHNICAL-ARCHITECTURE.md](./docs/03-TECHNICAL-ARCHITECTURE.md) | System design |
| [04-IMPLEMENTATION-PLAN.md](./docs/04-IMPLEMENTATION-PLAN.md) | Development roadmap |
| [05-UI-UX-SPECIFICATION.md](./docs/05-UI-UX-SPECIFICATION.md) | UI/UX design specs |
| [06-DEVELOPMENT-GUIDE.md](./docs/06-DEVELOPMENT-GUIDE.md) | Developer guide |

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite + @crxjs/vite-plugin
- **Styling**: Tailwind CSS
- **UI Components**: cmdk, Radix UI
- **Testing**: Vitest, Testing Library

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

<p align="center">
  Made with ❤️ for the ChatGPT community
</p>
