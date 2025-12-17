# Folder Structure

Project organization explained.

## Root Directory

```
core-render-portal/
├── app/                    # Next.js App Router (pages & API)
├── components/             # React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and clients
├── types/                  # TypeScript types
├── docs/                   # SQL scripts and legacy docs
├── documentation/          # This documentation
├── tests/                  # Test files
├── public/                 # Static assets
├── package.json            # Dependencies
└── tailwind.config.js      # Tailwind config
```

## app/ Directory

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
├── globals.css             # Global CSS
├── auth/                   # Auth pages
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/page.tsx      # Dashboard
├── projects/page.tsx       # Projects list
├── project/
│   ├── new/page.tsx        # Create project
│   └── [id]/
│       ├── page.tsx        # Project view
│       └── whiteboard/page.tsx
├── settings/page.tsx       # Settings
└── api/                    # API routes
```

## components/ Directory

```
components/
├── ui/                     # Base UI (shadcn/ui)
├── layout/                 # Layout components
├── auth/                   # Auth components
├── project/                # Project components
├── whiteboard/             # Whiteboard components
└── image-annotation/       # Annotation components
```

## hooks/ Directory

```
hooks/
├── useProject.ts
├── useExcalidrawBoard.ts
├── useExcalidrawCollab.ts
├── useProjectCollaboration.ts
└── ...
```

## lib/ Directory

```
lib/
├── supaClient.ts           # Supabase client
├── supaAdmin.ts            # Admin client
├── auth-context.tsx        # Auth context
├── theme-context.tsx       # Theme context
├── utils.ts                # Utilities
└── excalidraw-utils.ts     # Excalidraw helpers
```

---

← [Tech Stack](./tech-stack.md) | Next: [Data Flow](./data-flow.md) →

