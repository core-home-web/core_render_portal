export interface Project {
  id: string
  title: string
  retailer: string
  project_logo?: string
  due_date?: string
  items: Item[]
  user_id?: string
  created_at: string
  updated_at: string
}

export interface PartGroup {
  id: string
  name: string
  description?: string
  color?: string
  created_at?: string
}

export interface Item {
  id: string
  name: string
  hero_image?: string
  parts: Part[]
  groups?: PartGroup[]
}

export interface Part {
  id: string
  name: string
  finish: string
  color: string
  texture: string
  files: string[]
  x?: number
  y?: number
  notes?: string
  groupId?: string
}

export interface CreateProjectData {
  title: string
  retailer: string
  items: Omit<Item, 'id'>[]
}

export interface FormStep {
  id: number
  title: string
  description: string
  isComplete: boolean
}

export interface ProjectLog {
  id: string
  project_id: string
  user_id: string
  action: string
  details: {
    previous_data?: Project
    new_data?: Project
    restored_from_log_id?: string
    changes?: {
      title?: { from: string; to: string }
      retailer?: { from: string; to: string }
      items_count?: { from: number; to: number }
    }
  }
  timestamp: string
}

// Project Collaboration Types
export interface ProjectCollaborator {
  id: string
  project_id: string
  user_id: string
  permission_level: 'view' | 'edit' | 'admin'
  invited_by: string
  joined_at: string
  created_at: string
  updated_at: string
  user?: {
    email: string
    full_name?: string
  }
  user_email?: string
  user_full_name?: string
}

export interface ProjectInvitation {
  id: string
  project_id: string
  email: string
  permission_level: 'view' | 'edit' | 'admin'
  invited_by: string
  invitation_token: string
  expires_at: string
  accepted_at?: string
  created_at: string
}

export interface ProjectWithCollaboration extends Project {
  collaboration_enabled?: boolean
  public_view?: boolean
  collaborators?: ProjectCollaborator[]
  invitations?: ProjectInvitation[]
  user_permission?: 'owner' | 'admin' | 'edit' | 'view'
}

export interface InviteUserData {
  email: string
  permission_level: 'view' | 'edit' | 'admin'
}

export interface CollaborationStats {
  total_collaborators: number
  pending_invitations: number
  project_owner: string
}
