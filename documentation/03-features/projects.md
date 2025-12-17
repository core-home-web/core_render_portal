# Projects

Projects are the core data entity in the Core Render Portal. Each project represents a 3D render request with detailed specifications.

## Overview

A project contains:
- **Basic Info:** Title, retailer, due date
- **Items:** Products to render
- **Versions:** Variations of each item
- **Parts:** Component specifications (finish, color, texture)

## Data Structure

```typescript
interface Project {
  id: string
  title: string
  retailer: string
  due_date?: string
  items: Item[]
  user_id?: string
  created_at: string
  updated_at: string
}

interface Item {
  id: string
  name: string
  hero_image?: string
  versions?: Version[]
}

interface Version {
  id: string
  versionNumber: number
  versionName?: string
  parts: Part[]
}

interface Part {
  id?: string
  name: string
  finish: string
  color: string
  texture: string
  files?: string[]
  notes?: string
}
```

## Creating a Project

### Multi-Step Form

The project creation form has four steps:

**Step 1: Project Details**
- Title (required)
- Retailer (required)
- Due date (optional)

**Step 2: Add Items**
- Item name
- Hero image upload

**Step 3: Add Parts**
- For each item, add parts with:
  - Name
  - Finish (e.g., Matte, Gloss)
  - Color (color picker)
  - Texture (e.g., Smooth, Rough)
  - Reference files

**Step 4: Review**
- Review all entered data
- Submit project

### Code Example

```typescript
// Creating a project via Supabase
import { supabase } from '@/lib/supaClient'

async function createProject(data: CreateProjectData) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title: data.title,
      retailer: data.retailer,
      due_date: data.dueDate,
      items: data.items,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single()

  if (error) throw error
  return project
}
```

## Reading Projects

### User's Projects

```typescript
// Get projects owned by current user
const { data: ownedProjects } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

### Shared Projects

```typescript
// Get projects shared with current user
const { data: sharedProjects } = await supabase
  .from('project_collaborators')
  .select(`
    project_id,
    permission_level,
    projects (*)
  `)
  .eq('user_id', userId)
```

### Single Project

```typescript
// Get a specific project
const { data: project } = await supabase
  .from('projects')
  .select('*')
  .eq('id', projectId)
  .single()
```

## Updating Projects

```typescript
// Update a project
async function updateProject(projectId: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

## Deleting Projects

```typescript
// Delete a project (cascades to related tables)
async function deleteProject(projectId: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) throw error
}
```

## Project History

Every change to a project is logged for auditing and restoration:

```typescript
interface ProjectLog {
  id: string
  project_id: string
  user_id: string
  action: string  // 'create', 'update', 'restore'
  details: {
    previous_data?: Project
    new_data?: Project
    changes?: Record<string, { from: any; to: any }>
  }
  timestamp: string
}
```

### Viewing History

```typescript
// Get project history
const { data: logs } = await supabase
  .from('project_logs')
  .select('*')
  .eq('project_id', projectId)
  .order('timestamp', { ascending: false })
```

### Restoring from History

```typescript
// Restore to a previous state
async function restoreProject(projectId: string, logId: string) {
  const { data: log } = await supabase
    .from('project_logs')
    .select('details')
    .eq('id', logId)
    .single()

  if (log?.details?.previous_data) {
    await updateProject(projectId, log.details.previous_data)
  }
}
```

## useProject Hook

The `useProject` hook provides a convenient interface:

```typescript
import { useProject } from '@/hooks/useProject'

function ProjectView({ projectId }) {
  const { 
    project,      // Project data
    loading,      // Loading state
    error,        // Error message
    updateProject,// Update function
    deleteProject // Delete function
  } = useProject(projectId)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>{project.title}</h1>
      <p>Retailer: {project.retailer}</p>
      {/* ... */}
    </div>
  )
}
```

## Items and Parts

### Adding an Item

```typescript
function addItem(project: Project, item: Omit<Item, 'id'>) {
  const newItem = {
    ...item,
    id: crypto.randomUUID()
  }
  
  return {
    ...project,
    items: [...project.items, newItem]
  }
}
```

### Adding a Part to a Version

```typescript
function addPart(project: Project, itemId: string, versionId: string, part: Part) {
  return {
    ...project,
    items: project.items.map(item => {
      if (item.id !== itemId) return item
      return {
        ...item,
        versions: item.versions?.map(version => {
          if (version.id !== versionId) return version
          return {
            ...version,
            parts: [...(version.parts || []), { ...part, id: crypto.randomUUID() }]
          }
        })
      }
    })
  }
}
```

## Related Files

| File | Purpose |
|------|---------|
| `app/project/new/page.tsx` | New project form |
| `app/project/[id]/page.tsx` | Project view page |
| `components/project/edit-project-form.tsx` | Edit form component |
| `hooks/useProject.ts` | Project hook |
| `types/index.ts` | Type definitions |

## Best Practices

1. **Always use transactions** for complex updates
2. **Validate data** with Zod schemas before saving
3. **Log changes** for audit trail
4. **Handle optimistic updates** for better UX

## Troubleshooting

### Project Not Saving

- Check user is authenticated
- Verify RLS policies allow the operation
- Check for validation errors

### Items Not Displaying

- Verify items array is not null
- Check JSONB structure is correct
- Ensure parts have required fields

### Permission Denied

- Verify user owns the project or is a collaborator
- Check permission level for the operation

---

← [Authentication](./authentication.md) | Next: [Collaboration](./collaboration.md) →

