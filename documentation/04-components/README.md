# Components Overview

This section documents the React components used in the Core Render Portal.

## In This Section

| Document | Description |
|----------|-------------|
| [UI Components](./ui-components.md) | Base UI components (shadcn/ui) |
| [Layout Components](./layout-components.md) | DashboardLayout, Sidebar |
| [Feature Components](./feature-components.md) | Project, whiteboard components |

## Component Organization

Components are organized by purpose:

```
components/
├── ui/                  # Base UI components (shadcn/ui)
├── layout/              # Layout components
├── auth/                # Authentication components
├── project/             # Project-related components
├── image-annotation/    # Image annotation components
└── whiteboard/          # Whiteboard components
```

## Component Patterns

### File Naming

- **PascalCase for components:** `Button.tsx`, `DashboardLayout.tsx`
- **kebab-case for multi-word:** `edit-project-form.tsx`
- **index.ts for exports:** Re-export from directories

### Component Structure

```typescript
// Standard component structure
'use client'  // If client-side interactivity needed

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ComponentProps {
  /** Description of prop */
  propName: string
  /** Optional prop with default */
  optionalProp?: boolean
  /** Children */
  children?: React.ReactNode
}

export function Component({ 
  propName, 
  optionalProp = false,
  children 
}: ComponentProps) {
  const [state, setState] = useState(false)

  return (
    <div className={cn('base-classes', optionalProp && 'conditional-class')}>
      {children}
    </div>
  )
}
```

### Export Pattern

```typescript
// components/ui/index.ts
export { Button } from './button'
export { Input } from './input'
export { Card, CardHeader, CardContent } from './card'
```

## Component Categories

### UI Components (Base)

Primitive components from shadcn/ui:

| Component | Description |
|-----------|-------------|
| `Button` | Clickable button with variants |
| `Input` | Text input field |
| `Select` | Dropdown select |
| `Card` | Container card |
| `Dialog` | Modal dialog |
| `Badge` | Status badge |
| `Tooltip` | Hover tooltip |

### Layout Components

Page structure components:

| Component | Description |
|-----------|-------------|
| `DashboardLayout` | Main app layout |
| `Sidebar` | Navigation sidebar |

### Auth Components

Authentication UI:

| Component | Description |
|-----------|-------------|
| `LoginForm` | Login form |
| `SignupForm` | Registration form |

### Project Components

Project management UI:

| Component | Description |
|-----------|-------------|
| `EditProjectForm` | Project editing form |
| `CollaboratorsList` | List of collaborators |
| `InviteUserModal` | Invitation modal |
| `ProjectLogs` | Activity history |

### Whiteboard Components

Whiteboard feature:

| Component | Description |
|-----------|-------------|
| `ExcalidrawBoard` | Main whiteboard |
| `ExportMenu` | Export options |

## Styling Approach

### Tailwind CSS

All components use Tailwind CSS for styling:

```typescript
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Click me
</button>
```

### Class Merging

The `cn()` utility merges classes safely:

```typescript
import { cn } from '@/lib/utils'

function Component({ className, variant }) {
  return (
    <div className={cn(
      'base-classes',
      variant === 'primary' && 'primary-classes',
      className  // Allow overrides
    )}>
      ...
    </div>
  )
}
```

### Theme Colors

Team-based theming uses CSS variables:

```css
:root {
  --primary: 173 69% 48%;  /* Teal */
}

.theme-industrial {
  --primary: 27 94% 61%;   /* Orange */
}
```

## Common Props

### className

Allow additional classes:

```typescript
interface Props {
  className?: string
}

<Component className="mt-4" />
```

### children

For composable components:

```typescript
interface Props {
  children: React.ReactNode
}

<Card>
  <CardContent>Content here</CardContent>
</Card>
```

### Forwarded Refs

For DOM access:

```typescript
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    return <button ref={ref} {...props} />
  }
)
```

## Server vs Client Components

### Server Components (Default)

- No interactivity
- Can fetch data directly
- Render on server

```typescript
// No 'use client' directive
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

### Client Components

- Has interactivity (onClick, onChange)
- Uses hooks (useState, useEffect)
- Renders on client

```typescript
'use client'

export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

## Best Practices

1. **Keep components focused** - One responsibility per component
2. **Use TypeScript** - Define prop interfaces
3. **Document props** - Use JSDoc comments
4. **Compose components** - Build from smaller pieces
5. **Handle loading states** - Show loading UI
6. **Handle errors** - Display error messages

---

← [Export](../03-features/export.md) | Next: [UI Components](./ui-components.md) →

