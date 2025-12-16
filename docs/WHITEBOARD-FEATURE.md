# Whiteboard Feature Documentation

## Overview

The Core Render Portal whiteboard feature provides a collaborative visual canvas for project teams to brainstorm, plan, and present project information. Built on [Excalidraw](https://github.com/excalidraw/excalidraw), it offers a hand-drawn aesthetic with professional collaboration capabilities.

## Features

### Core Capabilities

- **Hand-Drawn Style**: Beautiful, informal visual aesthetic
- **Infinite Canvas**: Unlimited space for ideas and content
- **Shape Library**: Rectangles, ellipses, arrows, text, freehand drawing
- **Real-Time Collaboration**: Multiple users can edit simultaneously
- **Persistence**: Auto-saves to Supabase database
- **Export Options**: PNG, SVG, JSON, and HTML exports

### Project Data Integration

When a whiteboard is first opened for a project, it automatically populates with:
- Project title and metadata
- Item cards showing item names and part counts
- Version badges for each version
- Part elements with finish, color, and texture details
- Connection arrows showing relationships

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Visual Editor Modal                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │               ExcalidrawBoard Component              │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │            Excalidraw Library               │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                  │
│              ┌─────────────┴─────────────┐                   │
│              ▼                           ▼                   │
│    useExcalidrawBoard          useExcalidrawCollab          │
│    (Persistence)               (Real-time Sync)              │
│              │                           │                   │
│              ▼                           ▼                   │
│    ┌─────────────────────────────────────────────────┐      │
│    │              Supabase Backend                    │      │
│    │  - project_boards table                          │      │
│    │  - Realtime channels                             │      │
│    └─────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Components

### ExcalidrawBoard

Main whiteboard component wrapping Excalidraw.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `projectId` | `string` | Project identifier |
| `initialData` | `ExcalidrawSnapshot` | Initial board state |
| `readOnly` | `boolean` | Enable view-only mode |
| `theme` | `'light' \| 'dark'` | Color theme |
| `onChange` | `function` | Board change callback |
| `onReady` | `function` | API ready callback |

**Ref Methods:**
- `getSnapshot()`: Get current board state
- `exportToPng()`: Export to PNG blob
- `exportToSvg()`: Export to SVG element
- `exportToJson()`: Export to JSON string
- `updateElements()`: Programmatically update elements
- `resetView()`: Reset view to fit content

### ExportMenu

Dropdown menu for export options.

**Features:**
- PNG export (high-quality raster)
- SVG export (scalable vector)
- JSON export (Excalidraw format)
- HTML export (standalone presentation)

## Hooks

### useExcalidrawBoard

Manages board persistence with Supabase.

```typescript
const {
  board,           // Current board data
  loading,         // Loading state
  error,           // Error message
  hasUnsavedChanges,
  lastSavedAt,
  saveBoard,       // Manual save
  updateLocalBoard,// Update local state (triggers auto-save)
  forceSave,       // Force immediate save
  getInitialData,  // Get initial data for Excalidraw
} = useExcalidrawBoard(projectId, options)
```

**Options:**
- `autoSaveInterval`: Auto-save interval (default: 3000ms)
- `enableAutoSave`: Enable auto-save (default: true)
- `debounceMs`: Debounce time (default: 1000ms)

### useExcalidrawCollab

Enables real-time collaboration via Supabase Realtime.

```typescript
const {
  isConnected,       // Connection status
  collaborators,     // Active collaborators
  broadcastElements, // Send element changes
  broadcastCursor,   // Send cursor position
  connect,           // Connect to channel
  disconnect,        // Disconnect
} = useExcalidrawCollab(projectId, options)
```

## Utilities

### excalidraw-utils.ts

Functions for creating Excalidraw elements from project data.

**Key Functions:**
- `createRectangle()`: Create rectangle element
- `createText()`: Create text element
- `createArrow()`: Create arrow element
- `createProjectItemCard()`: Create item card group
- `createPartElement()`: Create part element group
- `createVersionBadge()`: Create version badge
- `generateProjectBoardLayout()`: Generate full board layout
- `isBoardEmpty()`: Check if board has content

### initializeProjectBoard.ts

Functions for initializing boards with project data.

**Key Functions:**
- `initializeProjectBoard()`: Create initial board layout
- `shouldInitializeBoard()`: Check if initialization needed
- `mergeProjectDataWithBoard()`: Update board with new project data

## Database Schema

The whiteboard data is stored in the `project_boards` table:

```sql
CREATE TABLE project_boards (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  board_snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Snapshot Structure:**
```json
{
  "elements": [...],  // Excalidraw elements array
  "appState": {       // View state
    "viewBackgroundColor": "#ffffff",
    "zoom": { "value": 1 },
    "scrollX": 0,
    "scrollY": 0
  },
  "files": {}         // Embedded files (images)
}
```

## Usage

### Basic Usage

```tsx
import { VisualEditorModal } from '@/components/project/visual-editor-modal'

function ProjectPage({ project }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Whiteboard
      </Button>
      
      <VisualEditorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        project={project}
      />
    </>
  )
}
```

### Programmatic Element Creation

```typescript
import { generateProjectBoardLayout } from '@/lib/excalidraw-utils'

const elements = generateProjectBoardLayout(project)
// Use with ExcalidrawBoard initialData prop
```

## Troubleshooting

### Common Issues

1. **Board not loading**
   - Check network connectivity
   - Verify Supabase configuration
   - Check browser console for errors

2. **Changes not saving**
   - Ensure auto-save is enabled
   - Check for database permission errors
   - Verify project_boards table exists

3. **Collaboration not working**
   - Check Supabase Realtime is enabled
   - Verify channel permissions
   - Check for WebSocket connection issues

4. **Export failing**
   - Ensure board has content
   - Check browser compatibility
   - Verify CSP allows blob URLs

### Debug Mode

Enable debug logging:

```typescript
// In useExcalidrawBoard
console.log('Board state:', board)
console.log('Has unsaved changes:', hasUnsavedChanges)
```

## Migration from tldraw

The whiteboard was migrated from tldraw to Excalidraw. Key differences:

| Aspect | tldraw | Excalidraw |
|--------|--------|------------|
| Style | Clean, modern | Hand-drawn |
| Data Format | Store + Schema | Elements array |
| Sync | External server | Supabase Realtime |
| Export | Limited | PNG, SVG, JSON, HTML |

**Data Migration:**
- Legacy tldraw snapshots are detected and the board starts fresh
- No automatic conversion (boards are regenerated)

## Related Documentation

- [Excalidraw Documentation](https://docs.excalidraw.com/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Project Collaboration Guide](./INVITATION-SYSTEM-GUIDE.md)
