# Whiteboard

The whiteboard feature provides an interactive canvas for visual project planning, powered by Excalidraw.

## Overview

- **Library:** Excalidraw
- **Storage:** Supabase (project_boards table)
- **Collaboration:** Real-time via Supabase Realtime
- **Export:** PNG, SVG, JSON, HTML

## Features

### Drawing Tools
- Selection tool
- Rectangle, ellipse, diamond
- Arrow, line
- Freehand drawing
- Text
- Image embedding
- Eraser

### Collaboration
- Real-time sync across users
- Cursor position sharing
- Element change broadcasting
- Conflict resolution

### Persistence
- Auto-save (debounced)
- Manual save button
- Project data initialization

### Export Options
- PNG (high-quality raster)
- SVG (scalable vector)
- JSON (Excalidraw format)
- HTML (standalone presentation)

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    Whiteboard Page                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  ExcalidrawBoard                          │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │                  Excalidraw                          │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│            ┌─────────────────┼─────────────────┐               │
│            │                 │                 │               │
│            ▼                 ▼                 ▼               │
│   useExcalidrawBoard  useExcalidrawCollab  ExportMenu         │
│   (Persistence)       (Real-time)          (Export)           │
│            │                 │                                  │
│            └────────┬────────┘                                  │
│                     │                                           │
│                     ▼                                           │
│            Supabase (Database + Realtime)                      │
└────────────────────────────────────────────────────────────────┘
```

## Implementation

### ExcalidrawBoard Component

The main wrapper component:

```typescript
// components/whiteboard/ExcalidrawBoard.tsx
import dynamic from 'next/dynamic'
import '@excalidraw/excalidraw/index.css'

// Dynamic import (client-side only)
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
)

export interface ExcalidrawBoardProps {
  projectId: string
  initialData?: ExcalidrawSnapshot
  readOnly?: boolean
  theme?: 'light' | 'dark'
  onChange?: (elements, appState, files) => void
  onReady?: (api: ExcalidrawImperativeAPI) => void
  isCollaborating?: boolean
  onCollaborationTrigger?: () => void
}

export const ExcalidrawBoard = forwardRef<ExcalidrawBoardRef, ExcalidrawBoardProps>(
  function ExcalidrawBoard(props, ref) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>()

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getSnapshot: () => ({
        elements: excalidrawAPI?.getSceneElements() || [],
        appState: excalidrawAPI?.getAppState() || {},
        files: excalidrawAPI?.getFiles() || {}
      }),
      exportToPng: () => /* ... */,
      exportToSvg: () => /* ... */,
      exportToJson: () => /* ... */
    }))

    return (
      <div className="w-full h-full">
        <Excalidraw
          initialData={props.initialData}
          onChange={props.onChange}
          onPointerUpdate={props.onPointerUpdate}
          excalidrawAPI={setExcalidrawAPI}
          viewModeEnabled={props.readOnly}
          theme={props.theme}
        >
          <LiveCollaborationTrigger
            isCollaborating={props.isCollaborating}
            onSelect={props.onCollaborationTrigger}
          />
        </Excalidraw>
      </div>
    )
  }
)
```

### Persistence Hook

```typescript
// hooks/useExcalidrawBoard.ts
export function useExcalidrawBoard(projectId: string, options = {}) {
  const [board, setBoard] = useState<ExcalidrawSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fetch board on mount
  useEffect(() => {
    fetchBoard()
  }, [projectId])

  const fetchBoard = async () => {
    const { data } = await supabase.rpc('get_or_create_project_board', {
      p_project_id: projectId
    })
    setBoard(data)
    setLoading(false)
  }

  // Debounced save
  const saveBoard = useMemo(
    () => debounce(async (snapshot) => {
      await supabase.rpc('save_project_board', {
        p_project_id: projectId,
        p_board_snapshot: snapshot
      })
      setHasUnsavedChanges(false)
    }, options.debounceMs || 1000),
    [projectId]
  )

  const updateLocalBoard = useCallback((elements, appState, files) => {
    const snapshot = { elements: [...elements], appState, files }
    setBoard(snapshot)
    setHasUnsavedChanges(true)
    if (options.enableAutoSave !== false) {
      saveBoard(snapshot)
    }
  }, [saveBoard])

  return {
    board,
    loading,
    hasUnsavedChanges,
    updateLocalBoard,
    saveBoard,
    forceSave: () => saveBoard.flush()
  }
}
```

### Collaboration Hook

```typescript
// hooks/useExcalidrawCollab.ts
export function useExcalidrawCollab(projectId: string, options) {
  const [isConnected, setIsConnected] = useState(false)
  const [collaborators, setCollaborators] = useState([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  const connect = useCallback(() => {
    const channel = supabase
      .channel(`whiteboard:${projectId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setCollaborators(Object.values(state).flat())
      })
      .on('broadcast', { event: 'elements' }, ({ payload }) => {
        options.onRemoteChange?.(payload.elements)
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        // Update cursor position
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: options.userId,
            userName: options.userName
          })
          setIsConnected(true)
        }
      })

    channelRef.current = channel
  }, [projectId])

  const broadcastElements = useCallback((elements) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'elements',
      payload: { userId: options.userId, elements }
    })
  }, [])

  return {
    isConnected,
    collaborators,
    connect,
    disconnect: () => channelRef.current?.unsubscribe(),
    broadcastElements
  }
}
```

### Project Data Initialization

When a whiteboard is first opened, it can be populated with project data:

```typescript
// components/whiteboard/initializeProjectBoard.ts
import { generateProjectBoardLayout } from '@/lib/excalidraw-utils'

export function initializeProjectBoard(project: Project): ExcalidrawSnapshot {
  const elements = generateProjectBoardLayout(project)
  
  return {
    elements,
    appState: {
      viewBackgroundColor: '#ffffff',
      zoom: { value: 1 },
      scrollX: 0,
      scrollY: 0
    },
    files: {}
  }
}
```

## Export Menu

```typescript
// components/whiteboard/ExportMenu.tsx
export function ExportMenu({ boardRef }) {
  const exportFormats = [
    { id: 'png', label: 'PNG Image', icon: ImageIcon },
    { id: 'svg', label: 'SVG Vector', icon: FileIcon },
    { id: 'json', label: 'Excalidraw File', icon: CodeIcon },
    { id: 'html', label: 'HTML Presentation', icon: GlobeIcon }
  ]

  const handleExport = async (format: string) => {
    switch (format) {
      case 'png':
        const pngBlob = await boardRef.current?.exportToPng()
        saveAs(pngBlob, 'whiteboard.png')
        break
      case 'svg':
        const svgElement = await boardRef.current?.exportToSvg()
        // ... convert to blob and save
        break
      // ... other formats
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Export</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {exportFormats.map(format => (
          <DropdownMenuItem 
            key={format.id}
            onClick={() => handleExport(format.id)}
          >
            <format.icon className="mr-2 h-4 w-4" />
            {format.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Database Schema

```sql
CREATE TABLE project_boards (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  board_snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Related Files

| File | Purpose |
|------|---------|
| `app/project/[id]/whiteboard/page.tsx` | Whiteboard page |
| `components/whiteboard/ExcalidrawBoard.tsx` | Main component |
| `components/whiteboard/ExportMenu.tsx` | Export options |
| `hooks/useExcalidrawBoard.ts` | Persistence |
| `hooks/useExcalidrawCollab.ts` | Real-time sync |
| `lib/excalidraw-utils.ts` | Element generators |

## Troubleshooting

### Whiteboard Not Loading

- Check Excalidraw CSS is imported
- Verify dynamic import is working
- Check browser console for errors

### Changes Not Saving

- Check network connectivity
- Verify RLS policies allow saving
- Check for database errors

### Collaboration Not Working

- Verify Supabase Realtime is enabled
- Check WebSocket connection
- Ensure both users are connected

### Export Failing

- Ensure board has content
- Check browser supports Blob APIs
- Verify CSP allows blob URLs

---

← [Collaboration](./collaboration.md) | Next: [Image Annotation](./image-annotation.md) →

