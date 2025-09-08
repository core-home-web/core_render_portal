'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  Palette,
  Layers,
  Zap,
  Settings,
  Star,
  Plus,
  Eye,
} from 'lucide-react'

export interface PartTemplate {
  id: string
  name: string
  category: string
  description: string
  icon: React.ReactNode
  defaults: {
    finish: string
    color: string
    texture: string
    notes?: string
  }
  tags: string[]
}

const PART_TEMPLATES: PartTemplate[] = [
  {
    id: 'front-panel',
    name: 'Front Panel',
    category: 'Structural',
    description: 'Main front-facing surface of the product',
    icon: <Package className="w-5 h-5" />,
    defaults: {
      finish: 'Matte',
      color: '#3B82F6',
      texture: 'Smooth',
      notes: 'Primary user interface surface',
    },
    tags: ['visible', 'primary', 'structural'],
  },
  {
    id: 'side-panel',
    name: 'Side Panel',
    category: 'Structural',
    description: 'Side surface panels and supports',
    icon: <Layers className="w-5 h-5" />,
    defaults: {
      finish: 'Satin',
      color: '#6B7280',
      texture: 'Smooth',
      notes: 'Supporting structural element',
    },
    tags: ['support', 'structural', 'secondary'],
  },
  {
    id: 'handle',
    name: 'Handle',
    category: 'Functional',
    description: 'Grip and control elements',
    icon: <Zap className="w-5 h-5" />,
    defaults: {
      finish: 'Textured',
      color: '#10B981',
      texture: 'Grip Pattern',
      notes: 'Ergonomic grip surface',
    },
    tags: ['ergonomic', 'functional', 'grip'],
  },
  {
    id: 'accent',
    name: 'Accent',
    category: 'Decorative',
    description: 'Decorative and branding elements',
    icon: <Star className="w-5 h-5" />,
    defaults: {
      finish: 'Glossy',
      color: '#F59E0B',
      texture: 'Smooth',
      notes: 'Brand accent element',
    },
    tags: ['decorative', 'branding', 'accent'],
  },
  {
    id: 'technical',
    name: 'Technical',
    category: 'Functional',
    description: 'Technical and mechanical components',
    icon: <Settings className="w-5 h-5" />,
    defaults: {
      finish: 'Industrial',
      color: '#374151',
      texture: 'Matte',
      notes: 'Technical component',
    },
    tags: ['technical', 'mechanical', 'industrial'],
  },
  {
    id: 'custom',
    name: 'Custom',
    category: 'Other',
    description: 'Custom part with user-defined specifications',
    icon: <Plus className="w-5 h-5" />,
    defaults: {
      finish: 'Custom',
      color: '#8B5CF6',
      texture: 'Custom',
      notes: 'Custom part specification',
    },
    tags: ['custom', 'user-defined'],
  },
]

interface PartTemplatesProps {
  onSelectTemplate: (template: PartTemplate) => void
  className?: string
}

export function PartTemplates({
  onSelectTemplate,
  className = '',
}: PartTemplatesProps) {
  const categories = Array.from(new Set(PART_TEMPLATES.map((t) => t.category)))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Part Templates
        </CardTitle>
        <CardDescription>
          Quick-start with pre-defined part types and smart defaults
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
              {category}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {PART_TEMPLATES.filter(
                (template) => template.category === category
              ).map((template) => (
                <div
                  key={template.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-900">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Finish:
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {template.defaults.finish}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Color:
                            </span>
                            <div
                              className="w-3 h-3 rounded border"
                              style={{
                                backgroundColor: template.defaults.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
