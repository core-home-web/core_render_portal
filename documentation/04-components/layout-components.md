# Layout Components

Components that provide the overall page structure and navigation.

## DashboardLayout

The main layout wrapper for authenticated pages.

### Location

`components/layout/DashboardLayout.tsx`

### Usage

```typescript
import { DashboardLayout } from '@/components/layout'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <h1>Dashboard Content</h1>
      <p>Your content here</p>
    </DashboardLayout>
  )
}
```

### Features

- Responsive sidebar navigation
- Header with user info
- Mobile menu toggle
- Theme-aware styling

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | required | Page content |

### Structure

```
┌────────────────────────────────────────────────────────────┐
│                        Header                               │
│  [Menu ☰]           Core Render Portal        [User 👤]    │
├────────────────────────────────────────────────────────────┤
│          │                                                  │
│ Sidebar  │              Main Content                        │
│          │                                                  │
│ Dashboard│              {children}                          │
│ Projects │                                                  │
│ Settings │                                                  │
│          │                                                  │
│          │                                                  │
│          │                                                  │
│ [Logout] │                                                  │
│          │                                                  │
└────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// components/layout/DashboardLayout.tsx
'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/lib/auth-context'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-[60px] 
                         bg-background border-b z-40 flex items-center px-4">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
        <span className="ml-4 font-semibold">Core Render Portal</span>
      </header>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main content */}
      <main className="lg:ml-64 mt-[60px] lg:mt-0">
        {children}
      </main>
    </div>
  )
}
```

## Sidebar

Navigation sidebar with links and user info.

### Location

`components/layout/Sidebar.tsx`

### Features

- Navigation links
- Active state indication
- User profile section
- Sign out button
- Responsive (mobile overlay)

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | false | Mobile sidebar visibility |
| `onClose` | () => void | - | Close handler for mobile |

### Navigation Items

| Item | Path | Icon |
|------|------|------|
| Dashboard | `/dashboard` | LayoutDashboard |
| Projects | `/projects` | FolderOpen |
| Settings | `/settings` | Settings |

### Implementation

```typescript
// components/layout/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
  X
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-sidebar border-r z-50',
        'transform transition-transform lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <span className="font-bold text-lg">Core Render</span>
          <button className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md',
                'hover:bg-accent transition-colors',
                pathname === item.href && 'bg-accent font-medium'
              )}
              onClick={onClose}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 
                          flex items-center justify-center">
              {user?.email?.[0].toUpperCase()}
            </div>
            <span className="text-sm truncate">{user?.email}</span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-muted-foreground
                     hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
```

## Responsive Behavior

### Desktop (lg and up)

- Sidebar always visible
- Main content shifts right
- No mobile header

### Mobile (below lg)

- Sidebar hidden by default
- Fixed header with menu button
- Sidebar overlays content when open
- Tap outside to close

## Theme Integration

Layout components use CSS variables for theming:

```css
.bg-background { background: hsl(var(--background)); }
.bg-sidebar { background: hsl(var(--sidebar-background)); }
.border-r { border-color: hsl(var(--border)); }
```

Team colors affect accent colors:
- **Product Development:** Teal accents
- **Industrial Design:** Orange accents

## Related Files

| File | Purpose |
|------|---------|
| `components/layout/DashboardLayout.tsx` | Main layout |
| `components/layout/Sidebar.tsx` | Navigation sidebar |
| `components/layout/index.ts` | Exports |
| `lib/auth-context.tsx` | User context |
| `lib/theme-context.tsx` | Theme context |

---

← [UI Components](./ui-components.md) | Next: [Feature Components](./feature-components.md) →

