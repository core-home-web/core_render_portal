export interface Project {
  id: string
  title: string
  retailer: string
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

export interface Version {
  id: string
  versionNumber: number
  versionName?: string  // Optional custom name
  parts: Part[]
  created_at?: string
}

export interface Item {
  id: string
  name: string
  hero_image?: string
  parts?: Part[]  // Old format - keep for backward compatibility
  versions?: Version[]  // New format
  groups?: PartGroup[]
}

export interface Part {
  id?: string  // Optional for backward compatibility
  name: string
  finish: string
  color: string
  texture: string
  files?: string[]  // Optional for backward compatibility
  x?: number
  y?: number
  notes?: string
  groupId?: string
  annotation_data?: {
    x: number
    y: number
    id: string
  }
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

/**
 * Helper function to get parts from an item, supporting both legacy (parts) and new (versions) formats
 * For versions format, returns parts from the first version
 * Can be extended to return all parts from all versions if needed
 */
export function getItemParts(item: Item): Part[] {
  // If versions exist, get parts from first version
  // Could be extended to return all parts from all versions
  if (item.versions && item.versions.length > 0) {
    return item.versions[0].parts || []
  }
  // Fall back to legacy parts array
  return item.parts || []
}

/**
 * Helper function to get all parts from all versions
 */
export function getAllItemParts(item: Item): Part[] {
  if (item.versions && item.versions.length > 0) {
    return item.versions.flatMap(version => version.parts || [])
  }
  return item.parts || []
}

/**
 * Helper function to check if item uses new versions format
 */
export function hasVersions(item: Item): boolean {
  return !!(item.versions && item.versions.length > 0)
}

export interface CollaborationStats {
  total_collaborators: number
  pending_invitations: number
  project_owner: string
}
