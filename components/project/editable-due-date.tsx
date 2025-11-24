'use client'

import { useState, useEffect } from 'react'
import { Clock, X, Calendar as CalendarIcon } from 'lucide-react'
import { supabase } from '@/lib/supaClient'
import { formatDateForDisplay, formatDateForInput, isValidDate, dateInputToISO } from '@/lib/date-utils'
import { useTheme } from '@/lib/theme-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Project } from '@/types'
import { PermissionRequestModal } from './permission-request-modal'

interface EditableDueDateProps {
  project: Project
  currentUser: any
  onDateUpdated?: (updatedProject: Project) => void
  readOnly?: boolean // If true, date is display-only and cannot be edited inline
}

export function EditableDueDate({
  project,
  currentUser,
  onDateUpdated,
  readOnly = false,
}: EditableDueDateProps) {
  const { colors } = useTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dateValue, setDateValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [userPermission, setUserPermission] = useState<'view' | 'edit' | 'admin' | 'owner'>('view')

  // Check if user can edit
  useEffect(() => {
    const checkPermissions = async () => {
      if (!currentUser || !project) {
        setCanEdit(false)
        return
      }

      // Check if user is owner
      if (currentUser.id === project.user_id) {
        setCanEdit(true)
        return
      }

      // Check if user has edit/admin permission as collaborator
      try {
        const { data, error } = await supabase
          .from('project_collaborators')
          .select('permission_level')
          .eq('project_id', project.id)
          .eq('user_id', currentUser.id)
          .single()

        if (!error && data) {
          const hasEditPermission = data.permission_level === 'edit' || data.permission_level === 'admin'
          setCanEdit(hasEditPermission)
          setUserPermission(data.permission_level as 'view' | 'edit' | 'admin')
        } else {
          setCanEdit(false)
          setUserPermission('view')
        }
      } catch (err) {
        console.error('Error checking permissions:', err)
        setCanEdit(false)
        setUserPermission('view')
      }
    }

    checkPermissions()
  }, [currentUser, project])

  // Initialize date value when modal opens - use actual due_date, not calculated
  useEffect(() => {
    if (isModalOpen) {
      // Use the actual saved due_date, not the calculated default
      const actualDueDate = project.due_date || null
      setDateValue(formatDateForInput(actualDueDate))
      setError(null)
    }
  }, [isModalOpen, project.due_date])

  // Ensure component updates when project.due_date changes
  // This helps catch any prop updates that might not trigger re-render
  useEffect(() => {
    // Force a re-render check by logging (in development) or ensuring state is in sync
    // The displayDate calculation below will automatically use the new value
  }, [project.due_date])

  const handleSave = async () => {
    if (!canEdit) {
      setError('You do not have permission to edit this project')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      // Fetch current project state to ensure we have the actual previous due_date
      // This ensures we log the correct previous date even if the prop is stale
      const { data: currentProject, error: fetchError } = await supabase
        .from('projects')
        .select('due_date')
        .eq('id', project.id)
        .single()
      
      const previousDueDate = currentProject?.due_date || project.due_date || null
      
      // Convert date input (YYYY-MM-DD) to ISO string using UTC to avoid timezone shifts
      const newDueDate = dateInputToISO(dateValue)

      // Update project due_date - try RPC first, fallback to direct update
      let updatedProject

      try {
        // Try using RPC function (handles permissions better)
        const rpcParams = {
          p_project_id: project.id,
          p_title: project.title,
          p_retailer: project.retailer,
          p_due_date: newDueDate,
          p_items: project.items || [],
        }

        const { data: rpcData, error: rpcError } = await supabase.rpc('update_user_project', rpcParams)

        if (rpcError) {
          console.log('RPC failed, trying direct update:', rpcError)
          throw rpcError // Will be caught by outer catch
        }

        if (rpcData && rpcData.length > 0) {
          updatedProject = rpcData[0]
        } else {
          throw new Error('No data returned from RPC')
        }
      } catch (rpcError) {
        console.log('RPC failed, trying direct update:', rpcError)
        
        // Fallback to direct update (for owners)
        // Check if user is owner first
        if (currentUser.id !== project.user_id) {
          throw new Error('You do not have permission to update this project')
        }

        const { data: directData, error: directError } = await supabase
          .from('projects')
          .update({
            due_date: newDueDate,
            updated_at: new Date().toISOString(),
          })
          .eq('id', project.id)
          .eq('user_id', currentUser.id)
          .select('*')
          .single()

        if (directError) {
          console.error('Direct update error:', directError)
          throw directError
        }

        if (!directData) {
          throw new Error('No project data returned from update')
        }

        // Ensure due_date is included in the response
        updatedProject = {
          ...directData,
          due_date: newDueDate, // Explicitly set the due_date
        }
      }

      // Log the date change
      const { error: logError } = await supabase.from('project_logs').insert({
        project_id: project.id,
        user_id: session.user.id,
        action: 'due_date_updated',
        details: {
          previous_due_date: previousDueDate,
          new_due_date: newDueDate,
          changed_by: session.user.email || session.user.id,
        },
        timestamp: new Date().toISOString(),
      })

      if (logError) {
        console.error('Error logging date change:', logError)
        // Don't throw - the update succeeded, logging is secondary
      }

      // Call callback with updated project - ensure due_date is included
      if (onDateUpdated && updatedProject) {
        // Make sure the updated project has the due_date field
        const projectWithDueDate = {
          ...updatedProject,
          due_date: newDueDate,
        } as Project
        onDateUpdated(projectWithDueDate)
      }

      setIsModalOpen(false)
    } catch (err) {
      console.error('Error updating due date:', err)
      setError(err instanceof Error ? err.message : 'Failed to update due date')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setDateValue('')
  }

  // Display the actual saved due_date (not calculated default)
  const displayDate = formatDateForDisplay(project.due_date)
  const isClickable = canEdit && !readOnly // Disable clicking if readOnly is true

  const handleDateClick = () => {
    if (readOnly) return
    
    if (!canEdit) {
      // Show permission request modal
      setShowPermissionModal(true)
      return
    }
    
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span
          onClick={handleDateClick}
          className={isClickable ? 'cursor-pointer hover:underline' : ''}
          title={isClickable ? 'Click to edit due date' : ''}
        >
          Due: {displayDate}
        </span>
      </div>

      {/* Permission Request Modal */}
      <PermissionRequestModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        projectId={project.id}
        projectTitle={project.title}
        projectOwnerId={project.user_id}
        currentUserEmail={currentUser?.email}
        action="change the due date"
      />

      {/* Permission Request Modal */}
      <PermissionRequestModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        projectId={project.id}
        projectTitle={project.title}
        projectOwnerId={project.user_id}
        currentUserEmail={currentUser?.email}
        action="change the due date"
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-[#1a1e1f] border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5" style={{ color: colors.primary }} />
                  <CardTitle className="text-white">Edit Due Date</CardTitle>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-[#595d60] hover:text-white transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                    className="bg-[#0d1117] border-gray-700 text-white"
                    placeholder="Select a date"
                    style={{ colorScheme: 'dark' }}
                  />
                  <p className="text-xs text-[#595d60] mt-1">
                    Leave empty to remove the due date
                  </p>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={loading}
                    className="border-gray-700 text-white hover:bg-[#222a31]"
                  >
                    Cancel
                  </Button>
                  {dateValue && (
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      disabled={loading}
                      className="border-gray-700 text-white hover:bg-[#222a31]"
                    >
                      Clear
                    </Button>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                      backgroundColor: colors.primary,
                      color: 'white',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primaryHover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary
                    }}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

