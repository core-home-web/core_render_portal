# Debugging

Tips and techniques for debugging the Core Render Portal.

## Browser DevTools

### Console Tab

```
F12 → Console
```

**View:**
- JavaScript errors (red)
- Warnings (yellow)
- Log messages
- Network errors

**Useful Commands:**
```javascript
// In console
console.log(variable)    // Log value
console.table(array)     // Log as table
console.dir(object)      // Expandable object
```

### Network Tab

```
F12 → Network
```

**View:**
- API requests and responses
- Status codes
- Request/response bodies
- Timing information

**Filter by type:**
- Fetch/XHR - API calls
- WS - WebSocket (Supabase Realtime)

### React DevTools

Install the React DevTools browser extension.

**View:**
- Component tree
- Props and state
- Hooks values
- Component re-renders

### Application Tab

```
F12 → Application
```

**View:**
- Cookies (auth session)
- Local Storage
- Session Storage

## Debugging Techniques

### Console Logging

```typescript
function MyComponent({ projectId }) {
  console.log('Rendering with projectId:', projectId)
  
  const { project, loading } = useProject(projectId)
  console.log('Project state:', { project, loading })
  
  return <div>...</div>
}
```

### Conditional Breakpoints

In DevTools Sources tab:
1. Click line number to add breakpoint
2. Right-click → "Add conditional breakpoint"
3. Enter condition: `projectId === 'abc123'`

### Debugger Statement

```typescript
function handleSubmit(data) {
  debugger  // Execution pauses here
  saveProject(data)
}
```

### React Strict Mode

Detects issues by double-rendering:

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <React.StrictMode>
          {children}
        </React.StrictMode>
      </body>
    </html>
  )
}
```

## Common Issues

### Infinite Re-renders

**Symptom:** Page freezes, console fills with logs

**Causes:**
- Setting state in useEffect without deps
- Object/array as dependency (new reference each render)

**Debug:**
```typescript
useEffect(() => {
  console.log('Effect running, deps:', { projectId, items })
}, [projectId, items])
```

**Fixes:**
```typescript
// Use useMemo for derived values
const memoizedValue = useMemo(() => computeValue(items), [items])

// Use useCallback for functions
const handleClick = useCallback(() => {
  doSomething()
}, [])
```

### Stale Closures

**Symptom:** Using old values in callbacks

**Debug:**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    console.log('Current count:', count)  // Might be stale
  }, 1000)
  return () => clearInterval(interval)
}, [count])  // Add count to deps
```

### Hydration Mismatch

**Symptom:** "Text content does not match server-rendered HTML"

**Causes:**
- Using `Date.now()`, `Math.random()` in render
- Browser-only APIs without checking

**Fix:**
```typescript
// Use useEffect for client-only values
const [time, setTime] = useState<Date | null>(null)

useEffect(() => {
  setTime(new Date())
}, [])
```

## Supabase Debugging

### Log All Queries

```typescript
// Temporary debugging
const { data, error } = await supabase
  .from('projects')
  .select('*')

console.log('Query result:', { data, error })
```

### Check Auth State

```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)
console.log('Is authenticated:', !!user)
```

### RLS Debugging

```sql
-- In Supabase SQL Editor
-- Check effective policies
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Test as specific user
SET LOCAL request.jwt.claims.sub = 'user-uuid';
SELECT * FROM projects;
```

## VS Code Debugging

### Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Breakpoints

1. Click in gutter to add breakpoint
2. Start debugging (F5)
3. Execution pauses at breakpoint
4. Inspect variables in sidebar

## Error Boundaries

Catch and display component errors:

```typescript
// components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 text-red-600">
          <h2>Something went wrong</h2>
          <pre>{this.state.error?.message}</pre>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Performance Debugging

### React Profiler

1. Open React DevTools
2. Go to Profiler tab
3. Click Record
4. Perform actions
5. Click Stop
6. Analyze render times

### Why Did You Render

```bash
pnpm add -D @welldone-software/why-did-you-render
```

```typescript
// pages/_app.tsx (development only)
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render')
  whyDidYouRender(React, { trackAllPureComponents: true })
}
```

## Logging Best Practices

### Use Descriptive Messages

```typescript
// ✅ Good
console.log('ProjectForm: submitting with data:', data)
console.log('useProject: fetch completed, project:', project?.id)

// ❌ Bad
console.log(data)
console.log('here')
```

### Group Related Logs

```typescript
console.group('Save Project Flow')
console.log('Input:', data)
console.log('Validated:', validatedData)
console.log('Result:', result)
console.groupEnd()
```

### Remove Before Commit

Use ESLint to catch leftover logs:

```json
// .eslintrc.json
{
  "rules": {
    "no-console": "warn"
  }
}
```

---

← [Testing](./testing.md) | Next: [Contributing](./contributing.md) →

