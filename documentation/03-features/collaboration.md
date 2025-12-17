# Collaboration

The collaboration feature allows project owners to share projects with team members.

## Overview

- **Invitation System:** Email-based invitations
- **Permission Levels:** View, Edit, Admin
- **Real-time Updates:** Via Supabase Realtime

## Permission Levels

| Level | View | Edit | Invite Others | Delete |
|-------|------|------|---------------|--------|
| View | Yes | No | No | No |
| Edit | Yes | Yes | No | No |
| Admin | Yes | Yes | Yes | No |
| Owner | Yes | Yes | Yes | Yes |

### Permission Details

**View Only:**
- Can view project details
- Can see all items and parts
- Can view project history
- Cannot make changes

**Can Edit:**
- Everything in View
- Can edit project details
- Can add/edit items and parts
- Can use whiteboard
- Cannot invite others

**Admin:**
- Everything in Edit
- Can invite collaborators
- Can manage permissions
- Can remove collaborators
- Cannot delete project

**Owner:**
- Full control
- Can delete project
- Can transfer ownership

## Invitation Flow

### Sending an Invitation

```
1. Owner opens "Invite Users" modal
2. Enters email and selects permission level
3. System creates invitation record
4. Email sent via Resend API
5. Invitation expires in 7 days
```

### Accepting an Invitation

```
1. Recipient clicks link in email
2. If not logged in → Sign up or sign in
3. System validates token
4. Creates collaborator record
5. Project appears in recipient's dashboard
```

## Implementation

### Sending Invitations

```typescript
// API Route: app/api/send-invitation/route.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const { projectId, email, permissionLevel, projectTitle } = await request.json()
  
  // Create invitation record
  const { data: invitation } = await supabase
    .from('project_invitations')
    .insert({
      project_id: projectId,
      invited_email: email,
      permission_level: permissionLevel,
      invited_by: userId
    })
    .select()
    .single()

  // Send email
  await resend.emails.send({
    from: 'Core Home <onboarding@resend.dev>',
    to: email,
    subject: `Project Collaboration Invitation: ${projectTitle}`,
    html: generateInvitationEmail(invitation.token, projectTitle, permissionLevel)
  })

  return Response.json({ success: true })
}
```

### Accepting Invitations

```typescript
// API Route: app/api/accept-invitation/route.ts
export async function POST(request: Request) {
  const { token } = await request.json()
  const userId = (await supabase.auth.getUser()).data.user?.id

  // Find invitation
  const { data: invitation } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invitation) {
    return Response.json({ error: 'Invalid or expired invitation' }, { status: 400 })
  }

  // Create collaborator record
  await supabase
    .from('project_collaborators')
    .insert({
      project_id: invitation.project_id,
      user_id: userId,
      permission_level: invitation.permission_level,
      invited_by: invitation.invited_by
    })

  // Mark invitation as accepted
  await supabase
    .from('project_invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invitation.id)

  return Response.json({ success: true, projectId: invitation.project_id })
}
```

## UI Components

### Invite User Modal

```typescript
// components/project/invite-user-modal.tsx
export function InviteUserModal({ 
  isOpen, 
  onClose, 
  projectId, 
  projectTitle 
}) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'view' | 'edit' | 'admin'>('view')
  const [sending, setSending] = useState(false)

  const handleInvite = async () => {
    setSending(true)
    try {
      await fetch('/api/send-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          email,
          permissionLevel: permission,
          projectTitle
        })
      })
      onClose()
    } catch (error) {
      console.error('Failed to send invitation:', error)
    } finally {
      setSending(false)
    }
  }

  // ... render form
}
```

### Collaborators List

```typescript
// components/project/collaborators-list.tsx
export function CollaboratorsList({ projectId }) {
  const [collaborators, setCollaborators] = useState([])

  useEffect(() => {
    fetchCollaborators()
  }, [projectId])

  const fetchCollaborators = async () => {
    const { data } = await supabase
      .rpc('get_project_collaborators_with_users', { 
        p_project_id: projectId 
      })
    setCollaborators(data || [])
  }

  return (
    <div>
      {collaborators.map(collab => (
        <div key={collab.id}>
          <span>{collab.user_email}</span>
          <Badge>{collab.permission_level}</Badge>
        </div>
      ))}
    </div>
  )
}
```

## Real-time Collaboration

The whiteboard feature includes real-time collaboration:

```typescript
// hooks/useExcalidrawCollab.ts
export function useExcalidrawCollab(projectId: string, options) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  const connect = useCallback(() => {
    const channel = supabase.channel(`whiteboard:${projectId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setCollaborators(Object.values(state).flat())
      })
      .on('broadcast', { event: 'elements' }, ({ payload }) => {
        options.onRemoteChange?.(payload.elements)
      })
      .subscribe()

    channelRef.current = channel
  }, [projectId])

  const broadcastElements = useCallback((elements) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'elements',
      payload: { elements }
    })
  }, [])

  return { collaborators, connect, broadcastElements }
}
```

## Database Tables

### project_collaborators

```sql
CREATE TABLE project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT CHECK (permission_level IN ('view', 'edit', 'admin')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);
```

### project_invitations

```sql
CREATE TABLE project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  permission_level TEXT NOT NULL,
  token UUID DEFAULT gen_random_uuid() UNIQUE,
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ
);
```

## Related Files

| File | Purpose |
|------|---------|
| `app/api/send-invitation/route.ts` | Send invitation API |
| `app/project/invite/page.tsx` | Invitation acceptance page |
| `components/project/invite-user-modal.tsx` | Invite UI |
| `components/project/collaborators-list.tsx` | List collaborators |
| `hooks/useProjectCollaboration.ts` | Collaboration hook |
| `hooks/useExcalidrawCollab.ts` | Whiteboard sync |

## Troubleshooting

### Invitation Email Not Received

- Check spam folder
- Verify Resend API key is valid
- Check email address is correct

### "Invalid Invitation" Error

- Invitation may have expired (7 days)
- Token may have already been used
- Check user is logged in with correct email

### Permission Denied After Joining

- Verify collaborator record was created
- Check permission level is correct
- Refresh the page

---

← [Projects](./projects.md) | Next: [Whiteboard](./whiteboard.md) →

