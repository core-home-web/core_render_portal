'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from '@/components/ui/file-upload'
import { ColorPicker } from '@/components/ui/color-picker'
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

             // Log the update
       const logData = {
         project_id: project.id,
         user_id: session.user.id,
         action: 'project_updated',
         details: {
           previous_data: project,
           new_data: updatedProject,
           changes: {
             title: project.title !== formData.title ? { from: project.title, to: formData.title } : null,
             retailer: project.retailer !== formData.retailer ? { from: project.retailer, to: formData.retailer } : null,
             items_count: project.items.length !== formData.items.length ? { from: project.items.length, to: formData.items.length } : null
           }
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="retailer">Retailer</Label>
            <Input
              id="retailer"
              value={formData.retailer}
              onChange={(e) => setFormData({ ...formData, retailer: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Items ({formData.items.length})</CardTitle>
            <Button onClick={addItem} variant="outline" size="sm">
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.items.map((item, itemIndex) => (
            <Card key={itemIndex} className="border-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(itemIndex, { ...item, name: e.target.value })}
                      className="text-lg font-semibold"
                    />
                  </div>
                  <Button
                    onClick={() => removeItem(itemIndex)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <FileUpload
                    value={item.hero_image}
                    onChange={(url) => updateItem(itemIndex, { ...item, hero_image: url })}
                    label="Hero Image"
                    placeholder="Upload hero image for this item"
                    onError={(error) => console.error('Upload error:', error)}
                  />
                </div>

                {/* Parts */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base font-medium">Parts ({item.parts.length})</Label>
                    <Button onClick={() => addPart(itemIndex)} variant="outline" size="sm">
                      Add Part
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {item.parts.map((part, partIndex) => (
                      <Card key={partIndex} className="p-3">
                        <div className="flex justify-between items-start mb-3">
                          <Input
                            value={part.name}
                            onChange={(e) => updatePart(itemIndex, partIndex, { ...part, name: e.target.value })}
                            className="font-medium"
                            placeholder="Part name"
                          />
                          <Button
                            onClick={() => removePart(itemIndex, partIndex)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 ml-2"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label className="text-sm">Finish</Label>
                            <Input
                              value={part.finish}
                              onChange={(e) => updatePart(itemIndex, partIndex, { ...part, finish: e.target.value })}
                              placeholder="Finish type"
                            />
                          </div>
                          <div>
                            <ColorPicker
                              value={part.color}
                              onChange={(color) => updatePart(itemIndex, partIndex, { ...part, color })}
                              label="Color"
                              placeholder="Enter color value"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Texture</Label>
                            <Input
                              value={part.texture}
                              onChange={(e) => updatePart(itemIndex, partIndex, { ...part, texture: e.target.value })}
                              placeholder="Texture"
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={updateProject} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
} 