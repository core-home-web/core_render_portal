# Development Overview

This section covers development practices, standards, and workflows.

## In This Section

| Document | Description |
|----------|-------------|
| [Coding Standards](./coding-standards.md) | Code style and conventions |
| [Testing](./testing.md) | Writing and running tests |
| [Debugging](./debugging.md) | Debugging tips |
| [Contributing](./contributing.md) | How to contribute |

## Development Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Start dev server
pnpm dev

# 4. Make changes, test locally

# 5. Commit changes
git add .
git commit -m "feat: add my feature"

# 6. Push and create PR
git push origin feature/my-feature
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run tests |
| `pnpm test:ui` | Run tests with UI |
| `pnpm type-check` | Check TypeScript types |

## Code Quality Tools

### ESLint

Catches code quality issues:

```bash
pnpm lint      # Check for issues
pnpm lint:fix  # Auto-fix issues
```

### Prettier

Formats code consistently:

```bash
pnpm format    # Format all files
```

### TypeScript

Type checking:

```bash
pnpm type-check  # Check types
```

### Husky (Pre-commit Hooks)

Automatically runs on commit:
- ESLint
- Prettier
- Type checking

## IDE Setup (VS Code)

### Recommended Extensions

- **ESLint** - Inline linting
- **Prettier** - Format on save
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **TypeScript** - TypeScript support
- **GitLens** - Git integration

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Project Standards

### File Organization

```
app/           # Pages and API routes
components/    # React components
hooks/         # Custom hooks
lib/           # Utilities
types/         # TypeScript types
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx` |
| Hooks | camelCase with `use` | `useProject.ts` |
| Utilities | camelCase | `utils.ts` |
| Types | PascalCase | `Project` |
| Files | kebab-case | `edit-project-form.tsx` |

### Import Order

1. React/Next.js
2. External libraries
3. Internal imports (@/)
4. Relative imports (./)

```typescript
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useProject } from '@/hooks/useProject'

import { localHelper } from './helpers'
```

## Git Workflow

### Branch Names

```
feature/add-whiteboard
fix/login-error
docs/update-readme
refactor/cleanup-components
```

### Commit Messages

Follow conventional commits:

```
feat: add whiteboard export
fix: resolve login redirect
docs: update setup guide
refactor: simplify project hook
chore: update dependencies
```

### Pull Requests

1. Create from feature branch
2. Fill out PR template
3. Request review
4. Address feedback
5. Merge when approved

## Environment Setup

### Prerequisites

- Node.js 18+
- pnpm
- Git
- VS Code (recommended)

### First Time Setup

```bash
# Clone repo
git clone <repository-url>
cd core-render-portal

# Install dependencies
pnpm install

# Set up environment
cp env.example .env.local
# Edit .env.local with your values

# Start dev server
pnpm dev
```

---

← [Troubleshooting](../08-deployment/troubleshooting.md) | Next: [Coding Standards](./coding-standards.md) →

