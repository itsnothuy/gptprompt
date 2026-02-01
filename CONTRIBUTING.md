# Contributing to GPTPrompt

Thank you for your interest in contributing to GPTPrompt! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

- Be respectful and inclusive
- Welcome newcomers and help them contribute
- Focus on constructive feedback
- Accept responsibility for mistakes

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git
- Chrome/Chromium browser

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/gptprompt.git
   cd gptprompt
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/itsnothuy/gptprompt.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start development**:
   ```bash
   npm run dev
   ```

---

## Development Workflow

### Branch Naming

Use descriptive branch names:

```
feature/add-prompt-categories
fix/picker-not-closing
docs/update-readme
refactor/storage-module
```

### Making Changes

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Test your changes**:
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes** following our [commit message guidelines](#commit-messages)

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub

---

## Pull Request Process

### Before Submitting

- [ ] Run `npm run lint` and fix any errors
- [ ] Run `npm run type-check` with no errors
- [ ] Run `npm run test` with all tests passing
- [ ] Update documentation if needed
- [ ] Add tests for new functionality

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Added comments for complex logic
- [ ] Updated documentation
- [ ] Added tests
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged

---

## Coding Standards

### TypeScript

- Use explicit types for function parameters and returns
- Avoid `any` type - use `unknown` if type is truly unknown
- Use interfaces for object shapes
- Use type guards for runtime type checking

```typescript
// ✅ Good
function createPrompt(data: PromptInput): Prompt {
  return { ...data, id: generateId() };
}

// ❌ Bad
function createPrompt(data: any): any {
  return { ...data, id: generateId() };
}
```

### React

- Use functional components
- Use hooks for state and effects
- Memoize expensive computations
- Extract reusable logic into custom hooks

```tsx
// ✅ Good
function PromptCard({ prompt, onEdit }: PromptCardProps) {
  const handleClick = useCallback(() => {
    onEdit(prompt.id);
  }, [prompt.id, onEdit]);

  return <div onClick={handleClick}>{prompt.title}</div>;
}
```

### File Organization

- One component per file
- Group related files in directories
- Use index files for public exports
- Keep files under 300 lines

### CSS/Tailwind

- Use Tailwind utility classes
- Extract repeated patterns to components
- Follow mobile-first approach
- Use CSS variables for theming

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code change that neither fixes bug nor adds feature |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Examples

```
feat(picker): add fuzzy search functionality

fix(popup): resolve form validation error on empty title

docs(readme): update installation instructions

refactor(storage): simplify prompt retrieval logic
```

---

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Chrome version
- Extension version
- Screenshots if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use case / problem it solves
- Proposed solution (if any)
- Mockups if applicable

### Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `feature` | New feature request |
| `docs` | Documentation improvement |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |

---

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

Thank you for contributing! 🙏
