# Appendix D: File Structure Reference

Complete directory tree of the Core Render Portal codebase.

---

## Root Directory

```
core-render-portal/
├── app/                          # Next.js App Router pages
├── components/                   # React components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
├── types/                        # TypeScript types
├── tests/                        # Test files
├── docs/                         # SQL scripts and setup guides
├── public/                       # Static assets
├── documentation/                # Project documentation
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Environment template
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
└── vitest.config.ts              # Test configuration
```

---

## App Directory (Pages)

```
app/
├── api/                          # API routes
│   ├── notify-collaborators/
│   │   └── route.ts             # Notify collaborators endpoint
│   ├── project/
│   │   └── route.ts             # Project operations
│   ├── request-access/
│   │   └── route.ts             # Request project access
│   ├── send-invitation/
│   │   └── route.ts             # Send invitation email
│   └── upload/
│       └── route.ts             # File upload handler
├── auth/
│   ├── login/
│   │   └── page.tsx             # Login page
│   └── signup/
│       └── page.tsx             # Signup page
├── dashboard/
│   └── page.tsx                 # Main dashboard
├── project/
│   ├── [id]/
│   │   ├── page.tsx             # Project view/edit
│   │   └── whiteboard/
│   │       └── page.tsx         # Project whiteboard
│   ├── invite/
│   │   └── [token]/
│   │       └── page.tsx         # Accept invitation
│   ├── new/
│   │   └── page.tsx             # Create project wizard
│   └── success/
│       └── page.tsx             # Project created success
├── projects/
│   └── page.tsx                 # All projects list
├── settings/
│   └── page.tsx                 # User settings
├── globals.css                  # Global styles
├── layout.tsx                   # Root layout
└── page.tsx                     # Home page
```

---

## Components Directory

```
components/
├── auth/
│   ├── login-form.tsx           # Login form
│   └── signup-form.tsx          # Signup form
├── image-annotation/
│   ├── AnnotationWorkspace.tsx  # Annotation workspace
│   ├── FileUpload.tsx           # File upload component
│   ├── ImageCanvas.tsx          # Canvas with zoom/pan
│   ├── ImageTabs.tsx            # Image tab navigation
│   ├── useFileUpload.ts         # File upload hook
│   └── useImageManager.ts       # Image state management
├── layout/
│   ├── DashboardLayout.tsx      # Dashboard wrapper
│   ├── Sidebar.tsx              # Navigation sidebar
│   └── index.ts                 # Exports
├── project/
│   ├── collaborators-list.tsx   # List collaborators
│   ├── edit-project-form.tsx    # Project edit form
│   ├── export-project-modal.tsx # Export options
│   ├── invite-user-modal.tsx    # Invite modal
│   └── project-logs.tsx         # Activity history
├── ui/
│   ├── animated-progress-bar.tsx# Progress indicator
│   ├── bulk-file-upload.tsx     # Bulk upload
│   ├── button.tsx               # Button component
│   ├── card.tsx                 # Card component
│   ├── checkbox.tsx             # Checkbox
│   ├── file-upload.tsx          # Single file upload
│   ├── input.tsx                # Input field
│   ├── item-editor.tsx          # Item edit form
│   ├── label.tsx                # Form label
│   ├── notification.tsx         # Toast notifications
│   ├── project-overview.tsx     # Items overview
│   ├── select.tsx               # Dropdown select
│   └── themed-button.tsx        # Team-themed button
└── whiteboard/
    ├── CoreRenderBoard.tsx      # Wrapper component
    ├── ExcalidrawBoard.tsx      # Excalidraw integration
    └── index.ts                 # Exports
```

---

## Hooks Directory

```
hooks/
├── useExcalidrawBoard.ts        # Whiteboard persistence
├── useExcalidrawCollab.ts       # Collaboration features
├── useNotifications.ts          # Notification system
├── usePowerPointExport.ts       # Export functionality
├── useProject.ts                # Project CRUD operations
├── useProjectBoard.ts           # Board management
├── useProjectCollaboration.ts   # Collaboration management
├── useRealtimeNotifications.ts  # Real-time updates
├── useRealtimeProject.ts        # Live project sync
└── useSupabaseFileUpload.ts     # Storage uploads
```

---

## Lib Directory

```
lib/
├── auth-context.tsx             # Auth provider & hook
├── date-utils.ts                # Date formatting utilities
├── supaAdmin.ts                 # Server-side Supabase client
├── supaClient.ts                # Client-side Supabase client
├── theme-context.tsx            # Theme provider & hook
├── user-settings.ts             # User settings utilities
└── utils.ts                     # General utilities (cn)
```

---

## Types Directory

```
types/
├── index.ts                     # Main type definitions
└── schemas.ts                   # Zod validation schemas
```

---

*Return to [Appendices](./README.md)*
