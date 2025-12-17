# Hooks Overview

Custom React hooks that encapsulate reusable logic.

## In This Section

| Document | Description |
|----------|-------------|
| [Hooks Reference](./hooks-reference.md) | All hooks with usage examples |

## What Are Custom Hooks?

Custom hooks are functions that encapsulate reusable stateful logic. They allow you to extract component logic into reusable functions.

```typescript
// Example: A hook that fetches and manages project data
function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProject(projectId)
      .then(setProject)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [projectId])

  return { project, loading, error }
}
```

## Available Hooks

| Hook | Purpose |
|------|---------|
| `useProject` | Project CRUD operations |
| `useExcalidrawBoard` | Whiteboard persistence |
| `useExcalidrawCollab` | Real-time collaboration |
| `useProjectCollaboration` | Collaborator management |
| `useNotifications` | Notification system |
| `useRealtimeNotifications` | Live notifications |
| `useRealtimeProject` | Live project updates |
| `useSupabaseFileUpload` | File upload handling |
| `usePowerPointExport` | Export functionality |

## Hook Patterns

### Data Fetching

```typescript
function useData(id: string) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchData(id)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  return { data, loading, error, refetch: () => fetchData(id) }
}
```

### State Management

```typescript
function useToggle(initial = false) {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue(v => !v), [])
  return [value, toggle] as const
}
```

### Side Effects

```typescript
function useAutoSave(data: any, save: (data: any) => Promise<void>) {
  const debouncedSave = useMemo(
    () => debounce(save, 1000),
    [save]
  )

  useEffect(() => {
    debouncedSave(data)
    return () => debouncedSave.cancel()
  }, [data, debouncedSave])
}
```

### Subscriptions

```typescript
function useRealtimeData(channelName: string) {
  const [data, setData] = useState(null)

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'update' }, ({ payload }) => {
        setData(payload)
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [channelName])

  return data
}
```

## Hook Location

All custom hooks are in the `hooks/` directory:

```
hooks/
├── useProject.ts
├── useExcalidrawBoard.ts
├── useExcalidrawCollab.ts
├── useProjectCollaboration.ts
├── useNotifications.ts
├── useRealtimeNotifications.ts
├── useRealtimeProject.ts
├── useSupabaseFileUpload.ts
└── usePowerPointExport.ts
```

## Best Practices

### 1. Start with `use`

All hooks must start with `use`:

```typescript
// ✅ Good
function useProject() { }
function useAuth() { }

// ❌ Bad
function getProject() { }
function projectHook() { }
```

### 2. Return Consistent Shapes

Return objects for multiple values:

```typescript
// ✅ Good
return { data, loading, error, refetch }

// ❌ Avoid arrays for many values
return [data, loading, error, refetch]
```

### 3. Handle Cleanup

Always clean up subscriptions and timers:

```typescript
useEffect(() => {
  const subscription = subscribe()
  return () => subscription.unsubscribe()
}, [])
```

### 4. Memoize Callbacks

Prevent unnecessary re-renders:

```typescript
const handleSave = useCallback((data) => {
  save(data)
}, [save])
```

### 5. Use Dependencies Correctly

Include all values used inside the hook:

```typescript
useEffect(() => {
  fetchData(id)  // 'id' is used
}, [id])          // 'id' must be in deps
```

## Using Hooks

```typescript
// In a component
function ProjectPage({ projectId }) {
  const { project, loading, error } = useProject(projectId)
  const { saveBoard, hasUnsavedChanges } = useExcalidrawBoard(projectId)
  const { isConnected, connect } = useExcalidrawCollab(projectId, {
    userId: user.id,
    userName: user.email
  })

  if (loading) return <Loading />
  if (error) return <Error message={error} />

  return (
    <div>
      <h1>{project.title}</h1>
      {/* ... */}
    </div>
  )
}
```

---

← [Feature Components](../04-components/feature-components.md) | Next: [Hooks Reference](./hooks-reference.md) →

