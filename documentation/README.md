# Core Render Portal Documentation

Welcome to the Core Render Portal documentation. This guide will help you understand, set up, and contribute to the project from scratch.

## What is Core Render Portal?

Core Render Portal is an internal tool for managing 3D render projects with a structured multi-step workflow. It enables teams to:

- Create and manage render projects with detailed specifications
- Collaborate with team members via real-time features
- Annotate images and organize project parts
- Use an interactive whiteboard for visual planning
- Export presentations and project data

## Quick Navigation

| Section | Description |
|---------|-------------|
| [Getting Started](./01-getting-started/README.md) | Set up your development environment |
| [Architecture](./02-architecture/README.md) | Understand how the system works |
| [Features](./03-features/README.md) | Learn about each feature |
| [Components](./04-components/README.md) | UI component reference |
| [Hooks](./05-hooks/README.md) | Custom React hooks |
| [API](./06-api/README.md) | API endpoints and functions |
| [Database](./07-database/README.md) | Database schema and setup |
| [Deployment](./08-deployment/README.md) | Deploy to production |
| [Development](./09-development/README.md) | Coding standards and testing |
| [Glossary](./glossary.md) | Key terms and concepts |

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd core-render-portal

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# 4. Run development server
pnpm dev

# 5. Open http://localhost:3000
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | UI component library |
| **Supabase** | Backend-as-a-service (auth, database, storage) |
| **Excalidraw** | Collaborative whiteboard |
| **Zod** | Schema validation |
| **Vitest** | Testing framework |

## Learning Path

1. **[Prerequisites](./01-getting-started/prerequisites.md)** - What you need before starting
2. **[Installation](./01-getting-started/installation.md)** - Set up the project locally
3. **[Architecture Overview](./02-architecture/README.md)** - Understand the big picture
4. **[Database Setup](./07-database/README.md)** - Set up your Supabase backend
5. **[Features Overview](./03-features/README.md)** - Learn what the app can do

---

*Last updated: December 2024*

