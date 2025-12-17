# Architecture Overview

How the Core Render Portal is structured and how components work together.

## In This Section

| Document | Description |
|----------|-------------|
| [Tech Stack](./tech-stack.md) | Technologies used |
| [Folder Structure](./folder-structure.md) | Project organization |
| [Data Flow](./data-flow.md) | How data moves |
| [Database Schema](./database-schema.md) | Database tables |

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js App Router                          │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │   Pages    │  │ Components │  │   Hooks    │                 │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                 │
│        │               │               │                         │
│        └───────────────┼───────────────┘                         │
│                        │                                          │
│                ┌───────▼───────┐                                  │
│                │   Lib Utils   │                                  │
│                └───────┬───────┘                                  │
└────────────────────────┼────────────────────────────────────────┘
                         │
                 HTTPS / WebSocket
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                        SUPABASE                                  │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   Auth   │  │ Database │  │ Storage  │  │ Realtime │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└──────────────────────────────────────────────────────────────────┘
```

## Core Principles

1. **Server Components by Default** - Better performance
2. **Supabase as Backend** - No custom backend needed
3. **Type Safety** - TypeScript throughout
4. **Component-Based UI** - shadcn/ui + Tailwind

## Security

- Row Level Security (RLS) on all tables
- JWT authentication via Supabase
- Environment variables for secrets

---

← [First Run](../01-getting-started/first-run.md) | Next: [Tech Stack](./tech-stack.md) →

