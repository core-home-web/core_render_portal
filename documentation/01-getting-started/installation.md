# Installation

Clone the repository and install dependencies.

## Step 1: Clone the Repository

```bash
cd ~/Desktop  # or wherever you keep projects
git clone <repository-url> core-render-portal
cd core-render-portal
```

## Step 2: Install Dependencies

```bash
pnpm install
```

This installs Next.js, Supabase, Tailwind CSS, shadcn/ui, and all other dependencies.

## Step 3: Verify Installation

```bash
ls -la
```

You should see:
- `app/` - Next.js pages
- `components/` - React components
- `hooks/` - Custom hooks
- `lib/` - Utilities
- `node_modules/` - Dependencies

## Project Structure

| Folder | Purpose |
|--------|---------|
| `app/` | Next.js App Router pages and API routes |
| `components/` | Reusable React components |
| `hooks/` | Custom React hooks |
| `lib/` | Utility functions and clients |
| `types/` | TypeScript type definitions |
| `docs/` | SQL scripts and guides |
| `documentation/` | This documentation |

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run tests |

---

← [Prerequisites](./prerequisites.md) | Next: [Environment Setup](./environment-setup.md) →

