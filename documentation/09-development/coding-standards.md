# Coding Standards

Code style and conventions for the Core Render Portal.

## TypeScript

### Strict Mode

The project uses TypeScript strict mode. Always:
- Define types for function parameters
- Define return types for complex functions
- Avoid `any` type

```typescript
// ✅ Good
function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Bad
function getUser(id) {
  // ...
}
```

### Type Definitions

Define interfaces for data structures:

```typescript
// types/index.ts
export interface Project {
  id: string
  title: string
  retailer: string
  items: Item[]
}

export interface Item {
  id: string
  name: string
  hero_image?: string
}
```

### Type Imports

Use `type` imports for types:

```typescript
import type { Project } from '@/types'
import { supabase } from '@/lib/supaClient'
```

## React Components

### Functional Components

Always use functional components:

```typescript
// ✅ Good
export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}

// ❌ Bad
class Button extends React.Component {
  // ...
}
```

### Props Interface

Define props with interface:

```typescript
interface ButtonProps {
  /** Button text content */
  children: React.ReactNode
  /** Click handler */
  onClick?: () => void
  /** Visual variant */
  variant?: 'primary' | 'secondary'
  /** Disabled state */
  disabled?: boolean
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  // ...
}
```

### Client Components

Mark client components with `'use client'`:

```typescript
'use client'

import { useState } from 'react'

export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  // ...
}
```

## Hooks

### Naming

Always prefix with `use`:

```typescript
// ✅ Good
export function useProject(id: string) { }
export function useAuth() { }

// ❌ Bad
export function getProject(id: string) { }
export function projectManager() { }
```

### Return Types

Return objects for multiple values:

```typescript
// ✅ Good
export function useProject(id: string) {
  return { project, loading, error, refetch }
}

// ✅ Okay for simple values
export function useToggle(initial: boolean) {
  return [value, toggle] as const
}
```

### Dependencies

Include all dependencies in useEffect/useCallback:

```typescript
// ✅ Good
useEffect(() => {
  fetchData(projectId)
}, [projectId])

// ❌ Bad - missing dependency
useEffect(() => {
  fetchData(projectId)
}, [])
```

## Styling

### Tailwind CSS

Use Tailwind utilities:

```typescript
// ✅ Good
<button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
  Click
</button>

// ❌ Bad - inline styles
<button style={{ backgroundColor: 'blue', padding: '8px 16px' }}>
  Click
</button>
```

### cn() Utility

Use for conditional classes:

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes'
)}>
```

### Responsive Design

Mobile-first approach:

```typescript
// Base styles for mobile, then larger screens
<div className="w-full md:w-1/2 lg:w-1/3">
```

## File Organization

### Component Files

One component per file:

```typescript
// components/ui/button.tsx
export function Button() { }

// components/project/project-card.tsx
export function ProjectCard() { }
```

### Index Files

Re-export from index.ts:

```typescript
// components/ui/index.ts
export { Button } from './button'
export { Input } from './input'
export { Card } from './card'
```

### Imports

Use absolute imports:

```typescript
// ✅ Good
import { Button } from '@/components/ui/button'

// ❌ Avoid
import { Button } from '../../../components/ui/button'
```

## Error Handling

### Try-Catch

Always handle errors:

```typescript
// ✅ Good
try {
  await saveProject(data)
} catch (error) {
  console.error('Failed to save:', error)
  setError('Failed to save project')
}

// ❌ Bad - unhandled errors
await saveProject(data)
```

### Error States

Show error states to users:

```typescript
function ProjectView() {
  const { project, loading, error } = useProject(id)

  if (loading) return <Loading />
  if (error) return <Error message={error} />
  
  return <div>{project.title}</div>
}
```

## Comments

### JSDoc for Props

Document component props:

```typescript
interface ButtonProps {
  /** The button's visible text */
  children: React.ReactNode
  /** Called when button is clicked */
  onClick?: () => void
  /** Makes button non-interactive */
  disabled?: boolean
}
```

### Explanatory Comments

Explain complex logic:

```typescript
// Calculate permission: owner has all rights, 
// admins can edit and invite, editors can only edit
const canEdit = isOwner || permission === 'admin' || permission === 'edit'
const canInvite = isOwner || permission === 'admin'
```

### Avoid Obvious Comments

```typescript
// ❌ Bad
// Set loading to true
setLoading(true)

// ✅ Good - explains WHY
// Disable form while saving to prevent double submission
setLoading(true)
```

## Async/Await

### Use Async/Await

Prefer async/await over .then():

```typescript
// ✅ Good
const project = await fetchProject(id)

// ❌ Avoid
fetchProject(id).then(project => { })
```

### Handle Loading States

```typescript
const [loading, setLoading] = useState(false)

async function handleSubmit() {
  setLoading(true)
  try {
    await saveData()
  } finally {
    setLoading(false)
  }
}
```

## Testing

### Name Tests Clearly

```typescript
describe('ProjectCard', () => {
  it('displays project title', () => { })
  it('shows loading state while fetching', () => { })
  it('handles click events', () => { })
})
```

### Test Behavior, Not Implementation

```typescript
// ✅ Good - tests behavior
it('shows error message when save fails', async () => {
  // ...
})

// ❌ Bad - tests implementation
it('calls setError with message', async () => {
  // ...
})
```

---

← [Development Overview](./README.md) | Next: [Testing](./testing.md) →

