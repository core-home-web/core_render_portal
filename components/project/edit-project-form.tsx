'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, ArrowLeft, Trash2, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import { ProjectOverview } from '@/components/ui/project-overview'
import { ItemEditor } from '@/components/ui/item-editor'
import { useNotification } from '@/components/ui/notification'
import { ExportProjectModal } from './export-project-modal'
import { ExportProgress } from './export-progress'
import { usePowerPointExport } from '@/hooks/usePowerPointExport'
import { useTheme } from '@/lib/theme-context'
import { ThemedButton } from '@/components/ui/themed-button'
import { Project, Item, hasVersions, getAllItemParts } from '@/types'
import { supabase } from '@/lib/supaClient'
import { getUserDefaultDueDate } from '@/lib/user-settings'
import { calculateDefaultDueDate, formatDateForInput } from '@/lib/date-utils'

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
  const { colors } = useTheme()
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
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No session found')
      }

      console.log('🔍 Updating project:', project.id)

      // Convert date input (YYYY-MM-DD) to ISO string, or null if empty
      let dueDate: string | null = null
      if (formData.due_date && formData.due_date.trim()) {
        // Date input returns YYYY-MM-DD format, convert to ISO
        const dateObj = new Date(formData.due_date + 'T00:00:00')
        if (!isNaN(dateObj.getTime())) {
          dueDate = dateObj.toISOString()
        }
      }
      
      // If due_date is being cleared or is null, calculate from user's default
      if (!dueDate && project.created_at) {
        const userDefault = await getUserDefaultDueDate(session.user.id)
        dueDate = calculateDefaultDueDate(
          project.created_at,
          userDefault.value,
          userDefault.unit
        )
      }

      let updatedProject

      try {
        const rpcParams = {
          p_project_id: project.id,
          p_title: formData.title,
          p_retailer: formData.retailer,
          p_due_date: dueDate,
          p_items: formData.items,
        }

        const { data: updatedProjectData, error: projectError } =
          await supabase.rpc('update_user_project', rpcParams)

        if (projectError) {
          throw projectError
        }

        if (!updatedProjectData || updatedProjectData.length === 0) {
          throw new Error('No project data returned from RPC')
        }

        updatedProject = updatedProjectData[0]
      } catch (rpcError) {
        console.error('RPC failed, trying direct update:', rpcError)

        const { data: directUpdateData, error: directUpdateError } =
          await supabase
            .from('projects')
            .update({
              title: formData.title,
              retailer: formData.retailer,
              due_date: dueDate,
              items: formData.items,
            })
            .eq('id', project.id)
            .eq('user_id', session.user.id)
            .select()

        if (directUpdateError) {
          throw directUpdateError
        }

        if (!directUpdateData || directUpdateData.length === 0) {
          throw new Error('No project data returned from direct update')
        }

        updatedProject = directUpdateData[0]
      }

      console.log('✅ Project update successful')
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
    <div className="min-h-screen bg-[#070e0e]">
      {/* Header with gradient */}
      <div className="border-b border-gray-800" style={{ background: 'linear-gradient(to bottom, #0d1117, #070e0e)' }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Back Button */}
          <button
            onClick={onCancel}
            className="flex items-center gap-2 mb-6 transition-colors"
            style={{ color: colors.primary }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.primaryHover}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.primary}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Overview</span>
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {editingItemIndex !== null ? formData.items[editingItemIndex].name : 'Edit Project'}
              </h1>
              <p className="text-[#595d60]">
                {editingItemIndex !== null
                  ? (() => {
                      const item = formData.items[editingItemIndex]
                      const itemWithVersions = item as Item
                      const parts = hasVersions(itemWithVersions)
                        ? getAllItemParts(itemWithVersions)
                        : (item.parts || [])
                      const partsCount = parts.length
                      return `${partsCount} part${partsCount !== 1 ? 's' : ''}`
                    })()
                  : `${formData.items.length} item${formData.items.length !== 1 ? 's' : ''} in this project`}
              </p>
            </div>

            {/* Action Buttons */}
            {editingItemIndex === null && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="px-6 py-3 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors font-medium flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export to HTML
                </button>
                <ThemedButton
                  onClick={updateProject}
                  disabled={loading}
                  variant="primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </ThemedButton>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Project Basic Details - Only show when not editing an item */}
        {editingItemIndex === null && (
          <div className="mb-8 bg-[#1a1e1f] rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-[#595d60] transition-colors focus:ring-1"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.primary}`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#374151'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Retailer */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Retailer
                </label>
                <input
                  type="text"
                  value={formData.retailer}
                  onChange={(e) => setFormData({ ...formData, retailer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-[#595d60] transition-colors focus:ring-1"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.primary}`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#374151'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formatDateForInput(formData.due_date)}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0d1117] border border-gray-700 rounded-lg text-white transition-colors focus:ring-1"
                  style={{ colorScheme: 'dark' }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary
                    e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.primary}`
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#374151'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Save Failed</h4>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Progress Steps - Only show in overview mode */}
        {editingItemIndex === null && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              {[
                { id: 1, title: 'Project Details' },
                { id: 2, title: 'Add Items' },
                { id: 3, title: 'Project Overview' },
                { id: 4, title: 'Review' },
              ].map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all ${
                      step.id === 3 ? 'scale-110' : ''
                    }`}
                    style={
                      step.id === 3
                        ? { backgroundColor: colors.primary, color: '#ffffff' }
                        : { backgroundColor: '#222a31', color: '#595d60' }
                    }
                  >
                    {step.id}
                  </div>
                  {index < 3 && (
                    <div
                      className="w-24 h-1 mx-4 rounded-full"
                      style={{ backgroundColor: step.id === 3 ? colors.primary : '#222a31' }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <h2 className="text-xl font-medium text-white">Project Overview</h2>
              <p className="text-[#595d60]">Manage and edit items</p>
            </div>
          </div>
        )}

        {/* Content Area */}
        {editingItemIndex !== null ? (
          <ItemEditor
            item={formData.items[editingItemIndex]}
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

      {/* Notification Container */}
      {NotificationContainer}
    </div>
  )
}

