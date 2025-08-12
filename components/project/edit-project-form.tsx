'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { ColorPicker } from '@/components/ui/color-picker'
import { UnifiedImageViewport } from '@/components/image-annotation'
import { Project, Item, Part } from '@/types'
import { supabase } from '@/lib/supaClient'

interface EditProjectFormProps {
  project: Project
  onUpdate: (updatedProject: Project) => void
  onCancel: () => void
}

export function EditProjectForm({ project, onUpdate, onCancel }: EditProjectFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Project>(project)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProject = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get current session for auth
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      // Debug: Log the parameters being sent
      console.log('🔍 Attempting to update project with parameters:', {
        p_project_id: project.id,
        p_title: formData.title,
        p_retailer: formData.retailer,
        p_items: formData.items
      })

      // Debug: Log current user session
      console.log('👤 Current user session:', {
        user_id: session.user.id,
        email: session.user.email
      })

      let updatedProject

      // Try RPC function first, fallback to direct update if it fails
      try {
        // Update project using RPC function with access control
        const { data: updatedProjectData, error: projectError } = await supabase.rpc('update_user_project', {
          p_project_id: project.id,
          p_title: formData.title,
          p_retailer: formData.retailer,
          p_items: formData.items
        })

        console.log('📊 RPC Response:', { data: updatedProjectData, error: projectError })

        if (projectError) {
          console.error('❌ RPC Error details:', projectError)
          console.log('🔄 Falling back to direct database update...')
          throw projectError
        }

        if (!updatedProjectData || updatedProjectData.length === 0) {
          throw new Error('Failed to update project - no data returned')
        }

        // Convert the new column names back to the expected format
        const rawProject = updatedProjectData[0]
        updatedProject = {
          id: rawProject.project_id,
          title: rawProject.project_title,
          retailer: rawProject.project_retailer,
          items: rawProject.project_items,
          user_id: rawProject.project_user_id,
          created_at: rawProject.project_created_at,
          updated_at: rawProject.project_updated_at
        }
      } catch (rpcError: any) {
        console.log('🔄 RPC function failed:', rpcError)
        
        // Check if it's an access denied error
        if (rpcError.message && rpcError.message.includes('Access denied')) {
          throw new Error(`Access denied: You don't have permission to edit this project. Please contact the project owner.`)
        }
        
        // Check if it's an authentication error
        if (rpcError.message && rpcError.message.includes('not authenticated')) {
          throw new Error('Authentication required. Please log in again.')
        }
        
        console.log('🔄 Trying direct database update as fallback...')
        
        // Fallback to direct database update
        const { data: directUpdateData, error: directError } = await supabase
          .from('projects')
          .update({
            title: formData.title,
            retailer: formData.retailer,
            items: formData.items,
            updated_at: new Date().toISOString()
          })
          .eq('id', project.id)
          .select()
          .single()

        if (directError) {
          console.error('❌ Direct update error:', directError)
          throw directError
        }

        updatedProject = directUpdateData
      }

             // Enhanced change detection for comprehensive logging
             const changes: any = {
               title: project.title !== formData.title ? { from: project.title, to: formData.title } : null,
               retailer: project.retailer !== formData.retailer ? { from: project.retailer, to: formData.retailer } : null,
               items_count: project.items.length !== formData.items.length ? { from: project.items.length, to: formData.items.length } : null
             }

             // Track item changes
             if (project.items.length === formData.items.length) {
               project.items.forEach((oldItem, index) => {
                 const newItem = formData.items[index]
                 if (newItem) {
                   // Track item name changes
                   if (oldItem.name !== newItem.name) {
                     changes[`item_${index}_name`] = { from: oldItem.name, to: newItem.name }
                   }
                   
                   // Track hero image changes
                   if (oldItem.hero_image !== newItem.hero_image) {
                     changes[`item_${index}_hero_image`] = { from: oldItem.hero_image || 'None', to: newItem.hero_image || 'None' }
                   }
                   
                   // Track part changes
                   if (oldItem.parts.length !== newItem.parts.length) {
                     changes[`item_${index}_parts_count`] = { from: oldItem.parts.length, to: newItem.parts.length }
                   } else {
                     // Track individual part changes
                     oldItem.parts.forEach((oldPart, partIndex) => {
                       const newPart = newItem.parts[partIndex]
                       if (newPart) {
                         if (oldPart.name !== newPart.name) {
                           changes[`item_${index}_part_${partIndex}_name`] = { from: oldPart.name, to: newPart.name }
                         }
                         if (oldPart.finish !== newPart.finish) {
                           changes[`item_${index}_part_${partIndex}_finish`] = { from: oldPart.finish, to: newPart.finish }
                         }
                         if (oldPart.color !== newPart.color) {
                           changes[`item_${index}_part_${partIndex}_color`] = { from: oldPart.color, to: newPart.color }
                         }
                         if (oldPart.texture !== newPart.texture) {
                           changes[`item_${index}_part_${partIndex}_texture`] = { from: oldPart.texture, to: newPart.texture }
                         }
                         if (oldPart.groupId !== newPart.groupId) {
                           changes[`item_${index}_part_${partIndex}_group`] = { from: oldPart.groupId || 'None', to: newPart.groupId || 'None' }
                         }
                       }
                     })
                   }
                   
                   // Track group changes
                   const oldGroups = oldItem.groups || []
                   const newGroups = newItem.groups || []
                   if (oldGroups.length !== newGroups.length) {
                     changes[`item_${index}_groups_count`] = { from: oldGroups.length, to: newGroups.length }
                   } else {
                     // Track individual group changes
                     oldGroups.forEach((oldGroup, groupIndex) => {
                       const newGroup = newGroups[groupIndex]
                       if (newGroup) {
                         if (oldGroup.name !== newGroup.name) {
                           changes[`item_${index}_group_${groupIndex}_name`] = { from: oldGroup.name, to: newGroup.name }
                         }
                         if (oldGroup.color !== newGroup.color) {
                           changes[`item_${index}_group_${groupIndex}_color`] = { from: oldGroup.color || 'None', to: newGroup.color || 'None' }
                         }
                       }
                     })
                   }
                 }
               })
             }

             // Log the update
             const logData = {
               project_id: project.id,
               user_id: session.user.id,
               action: 'project_updated',
               details: {
                 previous_data: project,
                 new_data: updatedProject,
                 changes: changes
               },
               timestamp: new Date().toISOString()
             }

       console.log('Attempting to log update:', logData)

       const { error: logError } = await supabase
         .from('project_logs')
         .insert([logData])

       // Send email notifications to collaborators (temporarily disabled)
       // try {
       //   const changes = []
       //   if (project.title !== formData.title) changes.push(`Title: "${project.title}" → "${formData.title}"`)
       //   if (project.retailer !== formData.retailer) changes.push(`Retailer: "${project.retailer}" → "${formData.retailer}"`)
       //   if (project.items.length !== formData.items.length) changes.push(`Items: ${project.items.length} → ${formData.items.length}`)

       //   if (changes.length > 0) {
       //     await fetch('/api/notify-collaborators', {
       //       method: 'POST',
       //       headers: { 'Content-Type': 'application/json' },
       //       body: JSON.stringify({
       //         projectId: project.id,
       //         projectTitle: formData.title,
       //         action: 'Project Updated',
       //         details: changes.join(', '),
       //         changedBy: session.user.email || 'Unknown User',
       //         changedByEmail: session.user.email || ''
       //       })
       //     })
       //   }
       // } catch (notificationError) {
       //   console.error('Failed to send notifications:', notificationError)
       // }

       if (logError) {
         console.error('Failed to log update:', logError)
       } else {
         console.log('Successfully logged update')
       }

      onUpdate(updatedProject)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = (itemIndex: number, updatedItem: Item) => {
    const newItems = [...formData.items]
    newItems[itemIndex] = updatedItem
    setFormData({ ...formData, items: newItems })
  }

  const updatePart = (itemIndex: number, partIndex: number, updatedPart: Part) => {
    const newItems = [...formData.items]
    newItems[itemIndex].parts[partIndex] = updatedPart
    setFormData({ ...formData, items: newItems })
  }

  const addItem = () => {
    const newItem: Omit<Item, 'id'> = {
      name: `New Item ${formData.items.length + 1}`,
      hero_image: '',
      parts: []
    }
    setFormData({ ...formData, items: [...formData.items, newItem as Item] })
  }

  const addPart = (itemIndex: number) => {
    const newPart: Omit<Part, 'id'> = {
      name: `New Part ${formData.items[itemIndex].parts.length + 1}`,
      finish: '',
      color: '',
      texture: '',
      files: []
    }
    const newItems = [...formData.items]
    newItems[itemIndex].parts.push(newPart as Part)
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (itemIndex: number) => {
    const newItems = formData.items.filter((_, index) => index !== itemIndex)
    setFormData({ ...formData, items: newItems })
  }

  const removePart = (itemIndex: number, partIndex: number) => {
    const newItems = [...formData.items]
    newItems[itemIndex].parts = newItems[itemIndex].parts.filter((_, index) => index !== partIndex)
    setFormData({ ...formData, items: newItems })
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Left Column - Sticky Image View */}
        <div className="xl:sticky xl:top-6 xl:h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Project Preview</CardTitle>
              <CardDescription>
                Current project image and visual reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                {formData.items?.[0]?.hero_image ? (
                  <img
                    src={formData.items[0].hero_image}
                    alt="Project preview"
                    className="max-w-full max-h-full object-contain rounded"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-lg font-medium">No Image Selected</p>
                    <p className="text-sm">Upload an image in the details section</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Project Details & Forms */}
        <div className="space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                  Project Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter project title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retailer" className="text-sm font-medium text-gray-700">
                  Retailer
                </Label>
                <Input
                  id="retailer"
                  value={formData.retailer}
                  onChange={(e) => setFormData({ ...formData, retailer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter retailer name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold">Items ({formData.items.length})</CardTitle>
                <Button 
                  onClick={addItem} 
                  variant="outline" 
                  size="sm"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
          {formData.items.map((item, itemIndex) => (
            <Card key={itemIndex} className="border border-gray-200 bg-gray-50/50">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(itemIndex, { ...item, name: e.target.value })}
                      className="text-lg font-semibold border-0 bg-transparent p-0 focus:ring-0 focus:border-0"
                      placeholder="Item name"
                    />
                  </div>
                  <Button
                    onClick={() => removeItem(itemIndex)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-0">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Hero Image</Label>
                  <FileUpload
                    value={item.hero_image}
                    onChange={(url) => updateItem(itemIndex, { ...item, hero_image: url })}
                    label="Hero Image"
                    placeholder="Upload hero image for this item"
                    onError={(error) => console.error('Upload error:', error)}
                  />
                </div>

                {/* Parts */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-medium text-gray-700">Parts ({item.parts.length})</Label>
                    <Button 
                      onClick={() => addPart(itemIndex)} 
                      variant="outline" 
                      size="sm"
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 text-sm"
                    >
                      Add Part
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {item.parts.map((part, partIndex) => (
                      <Card key={partIndex} className="p-4 border border-gray-200 bg-white">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Part Name</Label>
                            <Input
                              value={part.name}
                              onChange={(e) => updatePart(itemIndex, partIndex, { ...part, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Enter part name"
                            />
                          </div>
                          <Button
                            onClick={() => removePart(itemIndex, partIndex)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 ml-3"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Finish</Label>
                            <Input
                              value={part.finish}
                              onChange={(e) => updatePart(itemIndex, partIndex, { ...part, finish: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Enter finish type"
                            />
                          </div>
                          <div className="space-y-2">
                            <ColorPicker
                              value={part.color}
                              onChange={(color) => updatePart(itemIndex, partIndex, { ...part, color })}
                              label="Color"
                              placeholder="Enter color value"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Texture</Label>
                            <Input
                              value={part.texture}
                              onChange={(e) => updatePart(itemIndex, partIndex, { ...part, texture: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Enter texture"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

          {/* Unified Image Viewport */}
          <UnifiedImageViewport
            projectImage={formData.items?.[0]?.hero_image}
            existingParts={formData.items?.[0]?.parts?.map(part => ({
              id: part.id || `part-${Date.now()}-${Math.random()}`,
              x: part.x || 100, // Use stored position or default
              y: part.y || 100,
              name: part.name,
              finish: part.finish,
              color: part.color,
              texture: part.texture,
              notes: part.notes || ''
            })) || []}
            existingGroups={formData.items?.[0]?.groups || []}
            onImageUpdate={(imageUrl) => {
              // Update the first item's hero image
              if (formData.items && formData.items.length > 0) {
                const updatedItems = [...formData.items]
                updatedItems[0] = { ...updatedItems[0], hero_image: imageUrl }
                setFormData({ ...formData, items: updatedItems })
              }
            }}
            onPartsUpdate={(parts) => {
              // Convert parts to the existing parts structure
              if (formData.items && formData.items.length > 0) {
                const updatedItems = [...formData.items]
                updatedItems[0] = { 
                  ...updatedItems[0], 
                  parts: parts.map(part => ({
                    id: part.id,
                    name: part.name,
                    finish: part.finish,
                    color: part.color,
                    texture: part.texture,
                    files: [],
                    // Preserve position data
                    x: part.x,
                    y: part.y,
                    notes: part.notes || '',
                    groupId: part.groupId
                  }))
                }
                setFormData({ ...formData, items: updatedItems })
              }
            }}
            onGroupsUpdate={(groups) => {
              // Update groups in the first item
              if (formData.items && formData.items.length > 0) {
                const updatedItems = [...formData.items]
                updatedItems[0] = { 
                  ...updatedItems[0], 
                  groups: groups
                }
                setFormData({ ...formData, items: updatedItems })
                
                // Debug logging
                console.log('🔄 Groups updated in form data:', groups)
                console.log('🔄 Updated items structure:', updatedItems[0])
              }
            }}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
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
        </div>
      </div>
    </div>
  )
} 