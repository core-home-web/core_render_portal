# Hooks Reference

Complete reference for all custom hooks.

## useProject

Manages project data fetching and updates.

### Location
`hooks/useProject.ts`

### Usage

```typescript
import { useProject } from '@/hooks/useProject'

function ProjectPage({ projectId }) {
  const { 
    project,       // Project data
    loading,       // Loading state
    error,         // Error message
    updateProject, // Update function
    deleteProject, // Delete function
    refetch        // Refetch data
  } = useProject(projectId)

  // Use project data
}
```

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `project` | Project \| null | Project data |
| `loading` | boolean | Loading state |
| `error` | string \| null | Error message |
| `updateProject` | (updates) => Promise | Update project |
| `deleteProject` | () => Promise | Delete project |
| `refetch` | () => void | Refetch data |

---

## useExcalidrawBoard

Manages whiteboard persistence with Supabase.

### Location
`hooks/useExcalidrawBoard.ts`

### Usage

```typescript
import { useExcalidrawBoard } from '@/hooks/useExcalidrawBoard'

function WhiteboardPage({ projectId }) {
  const {
    board,              // Board data
    loading,            // Loading state
    error,              // Error message
    hasUnsavedChanges,  // Unsaved changes flag
    lastSavedAt,        // Last save timestamp
    saveBoard,          // Manual save
    updateLocalBoard,   // Update (triggers auto-save)
    forceSave,          // Force immediate save
    getInitialData      // Get initial Excalidraw data
  } = useExcalidrawBoard(projectId, {
    autoSaveInterval: 3000,  // Auto-save interval (ms)
    enableAutoSave: true,    // Enable auto-save
    debounceMs: 1000         // Debounce time (ms)
  })
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoSaveInterval` | number | 3000 | Auto-save interval |
| `enableAutoSave` | boolean | true | Enable auto-save |
| `debounceMs` | number | 1000 | Debounce time |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `board` | ExcalidrawSnapshot | Board data |
| `loading` | boolean | Loading state |
| `error` | string \| null | Error message |
| `hasUnsavedChanges` | boolean | Unsaved changes |
| `lastSavedAt` | Date \| null | Last save time |
| `saveBoard` | (snapshot) => Promise | Save board |
| `updateLocalBoard` | (elements, appState, files) => void | Update locally |
| `forceSave` | () => void | Force save |
| `getInitialData` | () => ExcalidrawSnapshot | Get initial data |

---

## useExcalidrawCollab

Real-time collaboration for the whiteboard.

### Location
`hooks/useExcalidrawCollab.ts`

### Usage

```typescript
import { useExcalidrawCollab } from '@/hooks/useExcalidrawCollab'

function WhiteboardPage({ projectId }) {
  const {
    isConnected,       // Connection status
    collaborators,     // Active collaborators
    broadcastElements, // Broadcast element changes
    broadcastCursor,   // Broadcast cursor position
    connect,           // Connect to channel
    disconnect         // Disconnect
  } = useExcalidrawCollab(projectId, {
    userId: user.id,
    userName: user.email,
    enableCursors: true,
    onRemoteChange: (elements) => {
      // Handle remote changes
    },
    throttleMs: 16  // Broadcast throttle
  })
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `userId` | string | required | User identifier |
| `userName` | string | required | Display name |
| `enableCursors` | boolean | true | Show cursors |
| `onRemoteChange` | (elements) => void | - | Remote change handler |
| `throttleMs` | number | 16 | Throttle time |
| `cursorThrottleMs` | number | 50 | Cursor throttle |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | boolean | Connection status |
| `collaborators` | Collaborator[] | Active users |
| `broadcastElements` | (elements) => void | Send elements |
| `broadcastCursor` | (x, y) => void | Send cursor |
| `connect` | () => void | Connect |
| `disconnect` | () => void | Disconnect |

---

## useProjectCollaboration

Manages project collaborators.

### Location
`hooks/useProjectCollaboration.ts`

### Usage

```typescript
import { useProjectCollaboration } from '@/hooks/useProjectCollaboration'

function CollaboratorsSection({ projectId }) {
  const {
    collaborators,      // List of collaborators
    invitations,        // Pending invitations
    loading,
    inviteUser,         // Send invitation
    removeCollaborator, // Remove collaborator
    updatePermission,   // Update permission level
    cancelInvitation,   // Cancel pending invitation
    refetch
  } = useProjectCollaboration(projectId)
}
```

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `collaborators` | Collaborator[] | Collaborators |
| `invitations` | Invitation[] | Pending invitations |
| `loading` | boolean | Loading state |
| `inviteUser` | (email, permission) => Promise | Invite user |
| `removeCollaborator` | (userId) => Promise | Remove user |
| `updatePermission` | (userId, level) => Promise | Update role |
| `cancelInvitation` | (invitationId) => Promise | Cancel invite |

---

## useNotifications

Manages user notifications.

### Location
`hooks/useNotifications.ts`

### Usage

```typescript
import { useNotifications } from '@/hooks/useNotifications'

function NotificationBell() {
  const {
    notifications,     // All notifications
    unreadCount,       // Unread count
    markAsRead,        // Mark as read
    markAllAsRead,     // Mark all as read
    deleteNotification // Delete notification
  } = useNotifications()
}
```

---

## useRealtimeNotifications

Real-time notification updates.

### Location
`hooks/useRealtimeNotifications.ts`

### Usage

```typescript
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

function App() {
  useRealtimeNotifications({
    onNewNotification: (notification) => {
      showToast(notification.message)
    }
  })
}
```

---

## useRealtimeProject

Real-time project updates.

### Location
`hooks/useRealtimeProject.ts`

### Usage

```typescript
import { useRealtimeProject } from '@/hooks/useRealtimeProject'

function ProjectPage({ projectId }) {
  const { project } = useRealtimeProject(projectId, {
    onUpdate: (updatedProject) => {
      console.log('Project updated:', updatedProject)
    }
  })
}
```

---

## useSupabaseFileUpload

Handles file uploads to Supabase Storage.

### Location
`hooks/useSupabaseFileUpload.ts`

### Usage

```typescript
import { useSupabaseFileUpload } from '@/hooks/useSupabaseFileUpload'

function ImageUploader() {
  const {
    uploading,       // Upload in progress
    progress,        // Upload progress (0-100)
    error,           // Error message
    uploadFile,      // Upload function
    uploadMultiple   // Upload multiple files
  } = useSupabaseFileUpload({
    bucket: 'project-images',
    folder: 'hero-images'
  })

  const handleUpload = async (file: File) => {
    const url = await uploadFile(file)
    setImageUrl(url)
  }
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bucket` | string | required | Storage bucket |
| `folder` | string | '' | Folder path |
| `maxSize` | number | 5MB | Max file size |

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `uploading` | boolean | Upload in progress |
| `progress` | number | Progress percentage |
| `error` | string \| null | Error message |
| `uploadFile` | (file) => Promise<string> | Upload single file |
| `uploadMultiple` | (files) => Promise<string[]> | Upload multiple |

---

## usePowerPointExport

Export functionality for presentations.

### Location
`hooks/usePowerPointExport.ts`

### Usage

```typescript
import { usePowerPointExport } from '@/hooks/usePowerPointExport'

function ExportButton({ project }) {
  const {
    exporting,
    progress,
    exportProject
  } = usePowerPointExport()

  const handleExport = async () => {
    await exportProject(project, {
      format: 'html',
      theme: 'default'
    })
  }
}
```

---

## Hook Composition

Hooks can be composed together:

```typescript
function useFullProject(projectId: string) {
  const project = useProject(projectId)
  const collaboration = useProjectCollaboration(projectId)
  const board = useExcalidrawBoard(projectId)

  return {
    ...project,
    collaborators: collaboration.collaborators,
    board: board.board
  }
}
```

---

← [Hooks Overview](./README.md) | Next: [API Overview](../06-api/README.md) →

