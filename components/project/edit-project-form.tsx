'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { ExportProjectModal } from './export-project-modal'
import { ExportProgress } from './export-progress'
import { usePowerPointExport } from '@/hooks/usePowerPointExport'
import { Project, Item, Part } from '@/types'
import { supabase } from '@/lib/supaClient'
import { FileText } from 'lucide-react'
import { ProjectOverview } from '@/components/ui/project-overview'
import { ItemEditor } from '@/components/ui/item-editor'
import { useNotification } from '@/components/ui/notification'

interface EditProjectFormProps {
  project: Project
  onUpdate: (updatedProject: Project) => void
  onCancel: () => void
}

export function EditProjectForm({
  project,
  onUpdate,
  onCancel,
}: EditProjectFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Project>(project)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const {
    exportToPowerPoint,
    isExporting,
    progress,
    currentStep,
    error: exportError,
    resetExport,
  } = usePowerPointExport()
  const { showSuccess, showError, NotificationContainer } = useNotification()

  const updateProject = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get current session for auth
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      // Debug: Log the parameters being sent
      console.log('🔍 Attempting to update project with parameters:', {
        p_project_id: project.id,
        p_title: formData.title,
        p_retailer: formData.retailer,
        p_items: formData.items,
      })

      // Debug: Log current user session
      console.log('👤 Current user session:', {
        user_id: session.user.id,
        email: session.user.email,
      })

      // Debug: Log form data being sent (including groups)
      console.log('📤 Form data being sent to RPC:', {
        title: formData.title,
        retailer: formData.retailer,
        items: formData.items,
        groups_in_first_item: formData.items?.[0]?.groups || 'No groups',
      })

      // More detailed debugging of the items structure
      console.log('🔍 Detailed items structure:', {
        items_length: formData.items?.length || 0,
        first_item: formData.items?.[0]
          ? {
              name: formData.items[0].name,
              parts_count: formData.items[0].parts?.length || 0,
              groups_count: formData.items[0].groups?.length || 0,
              groups: formData.items[0].groups || [],
              has_groups_property: 'groups' in (formData.items[0] || {}),
              all_properties: Object.keys(formData.items[0] || {}),
            }
          : 'No first item',
      })

      let updatedProject

      // Try RPC function first, fallback to direct update if it fails
      try {
        // Test: Log the exact data being passed to RPC
        const rpcParams = {
          p_project_id: project.id,
          p_title: formData.title,
          p_retailer: formData.retailer,
          p_items: formData.items,
        }

        console.log('🚀 RPC Parameters being sent:', {
          ...rpcParams,
          items_deep_inspect: JSON.stringify(rpcParams.p_items, null, 2),
        })

        // Update project using RPC function with access control
        const { data: updatedProjectData, error: projectError } =
          await supabase.rpc('update_user_project', rpcParams)

        console.log('📊 RPC Response:', {
          data: updatedProjectData,
          error: projectError,
        })

        // Debug: Log the returned project data structure
        if (updatedProjectData && updatedProjectData.length > 0) {
          const rawProject = updatedProjectData[0]
          console.log('📥 RPC returned project data:', {
            id: rawProject.id,
            title: rawProject.title,
            retailer: rawProject.retailer,
            items_length: rawProject.items?.length || 0,
            first_item_name: rawProject.items?.[0]?.name || 'No first item',
            raw_data_keys: Object.keys(rawProject),
          })
        }

        if (projectError) {
          console.error('RPC Error:', projectError)
          throw projectError
        }

        if (!updatedProjectData || updatedProjectData.length === 0) {
          throw new Error('No project data returned from RPC')
        }

        updatedProject = updatedProjectData[0]
      } catch (rpcError) {
        console.error('RPC failed, trying direct update:', rpcError)

        // Fallback to direct update
        const { data: directUpdateData, error: directUpdateError } =
          await supabase
            .from('projects')
            .update({
              title: formData.title,
              retailer: formData.retailer,
              items: formData.items,
            })
            .eq('id', project.id)
            .eq('user_id', session.user.id)
            .select()

        if (directUpdateError) {
          console.error('Direct update error:', directUpdateError)
          throw directUpdateError
        }

        if (!directUpdateData || directUpdateData.length === 0) {
          throw new Error('No project data returned from direct update')
        }

        updatedProject = directUpdateData[0]
      }

      // Enhanced change detection for comprehensive logging
      const changes: any = {
        title:
          project.title !== formData.title
            ? { from: project.title, to: formData.title }
            : null,
        retailer:
          project.retailer !== formData.retailer
            ? { from: project.retailer, to: formData.retailer }
            : null,
        items_count:
          project.items.length !== formData.items.length
            ? { from: project.items.length, to: formData.items.length }
            : null,
      }

      // Track item changes
      if (project.items.length === formData.items.length) {
        project.items.forEach((oldItem, index) => {
          const newItem = formData.items[index]
          if (newItem) {
            // Track item name changes
            if (oldItem.name !== newItem.name) {
              changes[`item_${index}_name`] = {
                from: oldItem.name,
                to: newItem.name,
              }
            }

            // Track hero image changes
            if (oldItem.hero_image !== newItem.hero_image) {
              changes[`item_${index}_hero_image`] = {
                from: oldItem.hero_image || 'None',
                to: newItem.hero_image || 'None',
              }
            }

            // Track part changes
            if (oldItem.parts.length !== newItem.parts.length) {
              changes[`item_${index}_parts_count`] = {
                from: oldItem.parts.length,
                to: newItem.parts.length,
              }
            } else {
              // Track individual part changes
              oldItem.parts.forEach((oldPart, partIndex) => {
                const newPart = newItem.parts[partIndex]
                if (newPart) {
                  if (oldPart.name !== newPart.name) {
                    changes[`item_${index}_part_${partIndex}_name`] = {
                      from: oldPart.name,
                      to: newPart.name,
                    }
                  }
                  if (oldPart.finish !== newPart.finish) {
                    changes[`item_${index}_part_${partIndex}_finish`] = {
                      from: oldPart.finish,
                      to: newPart.finish,
                    }
                  }
                  if (oldPart.color !== newPart.color) {
                    changes[`item_${index}_part_${partIndex}_color`] = {
                      from: oldPart.color,
                      to: newPart.color,
                    }
                  }
                  if (oldPart.texture !== newPart.texture) {
                    changes[`item_${index}_part_${partIndex}_texture`] = {
                      from: oldPart.texture,
                      to: newPart.texture,
                    }
                  }
                  if (oldPart.groupId !== newPart.groupId) {
                    changes[`item_${index}_part_${partIndex}_group`] = {
                      from: oldPart.groupId || 'None',
                      to: newPart.groupId || 'None',
                    }
                  }
                }
              })
            }

            // Track group changes
            const oldGroups = oldItem.groups || []
            const newGroups = newItem.groups || []
            if (oldGroups.length !== newGroups.length) {
              changes[`item_${index}_groups_count`] = {
                from: oldGroups.length,
                to: newGroups.length,
              }
            } else {
              // Track individual group changes
              oldGroups.forEach((oldGroup, groupIndex) => {
                const newGroup = newGroups[groupIndex]
                if (newGroup) {
                  if (oldGroup.name !== newGroup.name) {
                    changes[`item_${index}_group_${groupIndex}_name`] = {
                      from: oldGroup.name,
                      to: newGroup.name,
                    }
                  }
                  if (oldGroup.color !== newGroup.color) {
                    changes[`item_${index}_group_${groupIndex}_color`] = {
                      from: oldGroup.color || 'None',
                      to: newGroup.color || 'None',
                    }
                  }
                }
              })
            }
          }
        })
      }

      // Filter out null changes and log only actual changes
      const actualChanges = Object.entries(changes).filter(
        ([_, value]) => value !== null
      )

      if (actualChanges.length > 0) {
        console.log('📝 Project changes detected:', actualChanges)
      } else {
        console.log('📝 No changes detected in project')
      }

      console.log('✅ Project update successful:', updatedProject)

      showSuccess('Project Saved', 'Your project has been successfully updated.')
      onUpdate(updatedProject as Project)
    } catch (error) {
      console.error('❌ Error updating project:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project'
      setError(errorMessage)
      showError('Save Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Item editor handlers
  const handleEditItem = (index: number) => {
    setEditingItemIndex(index)
  }

  const handleSaveItem = (updatedItem: any) => {
    const newItems = [...formData.items]
    newItems[editingItemIndex!] = updatedItem
    setFormData({ ...formData, items: newItems })
    setEditingItemIndex(null)
  }

  const handleCancelEdit = () => {
    setEditingItemIndex(null)
  }

  const handleDeleteItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
    if (editingItemIndex === index) {
      setEditingItemIndex(null)
    }
  }

  const handleAddItemFromOverview = () => {
    const newItem: Omit<Item, 'id'> = {
      name: `New Item ${formData.items.length + 1}`,
      hero_image: '',
      parts: [],
    }
    setFormData({ ...formData, items: [...formData.items, newItem as Item] })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Project</h1>
          <p className="text-muted-foreground">
            Manage and edit your project items
          </p>
        </div>

        {/* Progress Steps - Hide when editing item */}
        {editingItemIndex === null && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { id: 1, title: 'Project Details', description: 'Basic project information' },
                { id: 2, title: 'Add Items', description: 'Add items to be rendered' },
                { id: 3, title: 'Project Overview', description: 'Manage and edit items' },
                { id: 4, title: 'Review', description: 'Review and submit project' },
              ].map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step.id === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      step.id === 3 ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <h2 className="text-xl font-semibold">Project Overview</h2>
              <p className="text-muted-foreground">Manage and edit items</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Project Overview Grid - Show when not editing item */}
        {editingItemIndex !== null ? (
          <ItemEditor
            item={formData.items[editingItemIndex]}
            projectLogo={formData.project_logo}
            onSave={handleSaveItem}
            onCancel={handleCancelEdit}
            onDelete={() => handleDeleteItem(editingItemIndex)}
          />
        ) : (
          <ProjectOverview
            items={formData.items}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItemFromOverview}
          />
        )}

        {/* Action Buttons - Hide when editing item */}
        {editingItemIndex === null && (
          <div className="flex justify-end gap-4 pt-6 mt-8">
            <Button
              onClick={() => setShowExportModal(true)}
              variant="outline"
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export to HTML
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={updateProject}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-blue-600"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* Export Project Modal */}
      {showExportModal && (
        <ExportProjectModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={async (options) => {
            setShowExportModal(false)
            await exportToPowerPoint(formData, options)
          }}
          onOpenVisualEditor={() => {}}
          projectTitle={formData.title}
        />
      )}

      {/* Export Progress */}
      <ExportProgress
        isVisible={isExporting}
        currentStep={currentStep}
        progress={progress}
        error={exportError || undefined}
        onClose={resetExport}
      />
    </div>
  )
}