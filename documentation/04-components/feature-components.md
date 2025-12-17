# Feature Components

Components specific to features like projects, collaboration, and whiteboard.

## Project Components

Located in `components/project/`.

### EditProjectForm

Form for editing project details.

```typescript
import { EditProjectForm } from '@/components/project/edit-project-form'

<EditProjectForm 
  project={project}
  onSave={(updatedProject) => handleSave(updatedProject)}
  onCancel={() => setEditing(false)}
/>
```

### CollaboratorsList

Displays project collaborators.

```typescript
import { CollaboratorsList } from '@/components/project/collaborators-list'

<CollaboratorsList 
  projectId={project.id}
  isOwner={isOwner}
  onRemove={(userId) => handleRemove(userId)}
/>
```

### InviteUserModal

Modal for inviting users.

```typescript
import { InviteUserModal } from '@/components/project/invite-user-modal'

<InviteUserModal
  isOpen={showInvite}
  onClose={() => setShowInvite(false)}
  projectId={project.id}
  projectTitle={project.title}
  onInviteSuccess={() => refreshCollaborators()}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | boolean | Modal visibility |
| `onClose` | () => void | Close handler |
| `projectId` | string | Project to invite to |
| `projectTitle` | string | For email template |
| `onInviteSuccess` | () => void | Success callback |

### EditableDueDate

Inline editable due date component.

```typescript
import { EditableDueDate } from '@/components/project/editable-due-date'

<EditableDueDate
  projectId={project.id}
  dueDate={project.due_date}
  onUpdate={(newDate) => setDueDate(newDate)}
  canEdit={hasEditPermission}
/>
```

### ProjectLogs

Activity history for a project.

```typescript
import { ProjectLogs } from '@/components/project/project-logs'

<ProjectLogs 
  projectId={project.id}
  onRestore={(logId) => handleRestore(logId)}
/>
```

### ExportProjectModal

Export options for a project.

```typescript
import { ExportProjectModal } from '@/components/project/export-project-modal'

<ExportProjectModal
  isOpen={showExport}
  onClose={() => setShowExport(false)}
  project={project}
/>
```

### UserRoleDisplay

Shows user's role in a project.

```typescript
import { UserRoleDisplay } from '@/components/project/user-role-display'

<UserRoleDisplay role="admin" /> // Shows badge with role
```

## Whiteboard Components

Located in `components/whiteboard/`.

### ExcalidrawBoard

Main whiteboard component.

```typescript
import { ExcalidrawBoard } from '@/components/whiteboard'

const boardRef = useRef<ExcalidrawBoardRef>(null)

<ExcalidrawBoard
  ref={boardRef}
  projectId={project.id}
  initialData={boardData}
  onChange={(elements, appState, files) => {
    handleChange(elements, appState, files)
  }}
  onReady={(api) => setExcalidrawApi(api)}
  isCollaborating={isConnected}
  onCollaborationTrigger={() => toggleCollaboration()}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `projectId` | string | Project identifier |
| `initialData` | ExcalidrawSnapshot | Initial board state |
| `readOnly` | boolean | View-only mode |
| `theme` | 'light' \| 'dark' | Color theme |
| `onChange` | function | Change callback |
| `onReady` | function | API ready callback |
| `isCollaborating` | boolean | Collaboration status |
| `onCollaborationTrigger` | function | Toggle collaboration |

**Ref Methods:**

```typescript
interface ExcalidrawBoardRef {
  getSnapshot(): ExcalidrawSnapshot
  exportToPng(): Promise<Blob>
  exportToSvg(): Promise<SVGSVGElement>
  exportToJson(): string
  updateElements(elements: ExcalidrawElement[]): void
  resetView(): void
}
```

### ExportMenu

Dropdown for export options.

```typescript
import { ExportMenu } from '@/components/whiteboard/ExportMenu'

<ExportMenu boardRef={boardRef} />
```

## Auth Components

Located in `components/auth/`.

### LoginForm

Login form with validation.

```typescript
import { LoginForm } from '@/components/auth/login-form'

<LoginForm 
  onSuccess={() => router.push('/dashboard')}
/>
```

### SignupForm

Registration form with team selection.

```typescript
import { SignupForm } from '@/components/auth/signup-form'

<SignupForm 
  onSuccess={() => router.push('/dashboard')}
  invitationToken={token}  // Optional: pre-fill from invitation
/>
```

## Image Annotation Components

Located in `components/image-annotation/`.

### AnnotationWorkspace

Container for image annotation.

```typescript
import { AnnotationWorkspace } from '@/components/image-annotation'

<AnnotationWorkspace
  item={selectedItem}
  onUpdateParts={(parts) => updateItemParts(item.id, parts)}
/>
```

### ImageCanvas

Displays image with markers.

```typescript
import { ImageCanvas } from '@/components/image-annotation/ImageCanvas'

<ImageCanvas
  imageUrl={item.hero_image}
  parts={item.parts}
  onAddMarker={(x, y) => addPart(x, y)}
  onSelectPart={(part) => setSelectedPart(part)}
/>
```

### PartDetailsPanel

Edit panel for part specifications.

```typescript
import { PartDetailsPanel } from '@/components/image-annotation/PartDetailsPanel'

<PartDetailsPanel
  part={selectedPart}
  onUpdate={(updated) => updatePart(updated)}
  onDelete={(partId) => deletePart(partId)}
/>
```

## Common Patterns

### Loading States

```typescript
function ProjectView({ projectId }) {
  const { project, loading, error } = useProject(projectId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>Error loading project</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return <ProjectDetails project={project} />
}
```

### Modal Pattern

```typescript
function ProjectPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        Open Modal
      </Button>

      <SomeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false)
          // Refresh data
        }}
      />
    </>
  )
}
```

### Form Pattern

```typescript
function EditForm({ initialData, onSave }) {
  const [data, setData] = useState(initialData)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(data)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
```

## Component Index

| Component | Location | Purpose |
|-----------|----------|---------|
| `EditProjectForm` | `project/` | Edit project |
| `CollaboratorsList` | `project/` | Show collaborators |
| `InviteUserModal` | `project/` | Invite users |
| `EditableDueDate` | `project/` | Inline date edit |
| `ProjectLogs` | `project/` | Activity history |
| `ExportProjectModal` | `project/` | Export options |
| `UserRoleDisplay` | `project/` | Role badge |
| `ExcalidrawBoard` | `whiteboard/` | Main whiteboard |
| `ExportMenu` | `whiteboard/` | Export dropdown |
| `LoginForm` | `auth/` | Login form |
| `SignupForm` | `auth/` | Signup form |
| `AnnotationWorkspace` | `image-annotation/` | Annotation container |
| `ImageCanvas` | `image-annotation/` | Image with markers |
| `PartDetailsPanel` | `image-annotation/` | Part editing |

---

← [Layout Components](./layout-components.md) | Next: [Hooks Overview](../05-hooks/README.md) →

