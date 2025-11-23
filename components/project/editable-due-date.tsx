'use client'

import { useState, useEffect } from 'react'
import { Clock, X, Calendar as CalendarIcon } from 'lucide-react'
import { supabase } from '@/lib/supaClient'
import { formatDateForDisplay, formatDateForInput, isValidDate, getEffectiveDueDate } from '@/lib/date-utils'
import { useTheme } from '@/lib/theme-context'
import { useUserDefaultDueDate } from '@/lib/user-settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Project } from '@/types'

interface EditableDueDateProps {
  project: Project
  currentUser: any
  onDateUpdated?: (updatedProject: Project) => void
}

export function EditableDueDate({
  project,
  currentUser,
  onDateUpdated,
}: EditableDueDateProps) {
  const { colors } = useTheme()
  const { defaultDueDate } = useUserDefaultDueDate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dateValue, setDateValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canEdit, setCanEdit] = useState(false)

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
        } else {
          setCanEdit(false)
        }
      } catch (err) {
        console.error('Error checking permissions:', err)
        setCanEdit(false)
      }
    }

    checkPermissions()
  }, [currentUser, project])

  // Initialize date value when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setDateValue(formatDateForInput(project.due_date))
      setError(null)
    }
  }, [isModalOpen, project.due_date])

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

      const previousDueDate = project.due_date
      const newDueDate = dateValue.trim() ? new Date(dateValue).toISOString() : null

      // Validate date if provided
      if (dateValue.trim() && !isValidDate(dateValue)) {
        throw new Error('Invalid date format')
      }

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
          .select()
          .single()

        if (directError) {
          throw directError
        }

        if (!directData) {
          throw new Error('No project data returned from update')
        }

        updatedProject = directData
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

      // Call callback with updated project
      if (onDateUpdated && updatedProject) {
        onDateUpdated(updatedProject as Project)
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

  // Use effective due date (calculated default if null)
  const effectiveDueDate = getEffectiveDueDate(
    project,
    defaultDueDate.value,
    defaultDueDate.unit
  )
  const displayDate = formatDateForDisplay(effectiveDueDate)
  const isClickable = canEdit

  return (
    <>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span
          onClick={() => isClickable && setIsModalOpen(true)}
          className={isClickable ? 'cursor-pointer hover:underline' : ''}
          title={isClickable ? 'Click to edit due date' : ''}
        >
          Due: {displayDate}
        </span>
      </div>

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

