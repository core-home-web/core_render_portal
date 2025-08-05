export interface Project {
  id: string
  title: string
  retailer: string
  items: Item[]
  created_at: string
  updated_at: string
}

export interface Item {
  id: string
  name: string
  hero_image?: string
  parts: Part[]
}

export interface Part {
  id: string
  name: string
  finish: string
  color: string
  texture: string
  files: string[]
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