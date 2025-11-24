'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Users,
  FileText,
  Edit,
  ArrowLeft,
  Crown,
  UserPlus,
  Package,
  Calendar,
  Clock,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useProject } from '@/hooks/useProject'
import { EditProjectForm } from '@/components/project/edit-project-form'
import { ProjectLogs } from '@/components/project/project-logs'
import { CollaboratorsList } from '@/components/project/collaborators-list'
import { InviteUserModal } from '@/components/project/invite-user-modal'
import { ExportProjectModal } from '@/components/project/export-project-modal'
import { ExportProgress } from '@/components/project/export-progress'
import { VisualEditorModal } from '@/components/project/visual-editor-modal'
import { usePowerPointExport } from '@/hooks/usePowerPointExport'
import { Project } from '@/types'
import { supabase } from '@/lib/supaClient'
import { formatDateForDisplay } from '@/lib/date-utils'
import { EditableDueDate } from '@/components/project/editable-due-date'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { getProject, loading, error } = useProject()
  const [project, setProject] = useState<Project | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showVisualEditor, setShowVisualEditor] = useState(false)
  const {
    exportToPowerPoint,
    isExporting,
    progress,
    currentStep,
    error: exportError,
    resetExport,
  } = usePowerPointExport()

  useEffect(() => {
    const fetchProject = async () => {
      if (params.id) {
        const projectData = await getProject(params.id as string)
        if (projectData) {
          setProject(projectData)
        }
      }
    }
    fetchProject()
  }, [params.id, getProject])

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        setCurrentUser(session.user)
      }
    }
    getCurrentUser()
  }, [])

  const handleProjectUpdate = async (updatedProject: Project) => {
    setProject(updatedProject)
    setIsEditing(false)
    // Refresh project data to ensure all views are updated
    if (params.id) {
      const refreshedProject = await getProject(params.id as string)
      if (refreshedProject) {
        setProject(refreshedProject)
      }
    }
  }

  const handleProjectRestored = async () => {
    if (params.id) {
      const projectData = await getProject(params.id as string)
      setProject(projectData)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <DashboardLayout user={currentUser} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#38bdbb] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading project...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !project) {
    return (
      <DashboardLayout user={currentUser} onSignOut={handleSignOut}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error || 'Project not found'}</p>
            <Link href="/dashboard">
              <button className="px-6 py-3 bg-[#38bdbb] text-white rounded-lg hover:bg-[#2ea9a7] transition-colors">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={currentUser} onSignOut={handleSignOut}>
      <div className="p-8 lg:p-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#38bdbb] hover:text-[#2ea9a7] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-medium text-white mb-3">{project.title}</h1>
              <div className="flex items-center gap-6 text-[#595d60]">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Retailer: {project.retailer}</span>
                </div>
                <EditableDueDate
                  project={project}
                  currentUser={currentUser}
                  onDateUpdated={async (updatedProject) => {
                    // Update local state immediately
                    setProject(updatedProject)
                    // Also trigger full refresh to ensure consistency
                    handleProjectUpdate(updatedProject)
                  }}
                />
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDateForDisplay(project.created_at)}</span>
                </div>
                {project.updated_at !== project.created_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Updated: {formatDateForDisplay(project.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {currentUser && project && currentUser.id === project.user_id && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite Users</span>
                </button>
              )}
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Export to HTML</span>
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#38bdbb] text-white rounded-lg hover:bg-[#2ea9a7] transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Project</span>
              </button>
            </div>
          </div>
        </div>

        {isEditing ? (
          <EditProjectForm
            project={project}
            onUpdate={handleProjectUpdate}
            onCancel={handleCancelEdit}
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Content - Items */}
            <div className="xl:col-span-2 space-y-6">
              {/* Items Card */}
              <div className="bg-[#1a1e1f] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-medium text-white mb-2">
                      Items ({project.items?.length || 0})
                    </h2>
                    <p className="text-[#595d60]">Items to be rendered for this project</p>
                  </div>
                </div>

                {project.items && project.items.length > 0 ? (
                  <div className="space-y-6">
                    {project.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-[#0d1117] border border-gray-700 rounded-xl p-6"
                      >
                        {/* Item Header */}
                        <h3 className="text-xl font-medium text-white mb-4">
                          {item.name || `Item ${index + 1}`}
                        </h3>

                        {/* Hero Image */}
                        {item.hero_image && (
                          <div className="mb-6">
                            <p className="text-sm font-medium text-[#595d60] mb-3">Hero Image</p>
                            <div className="space-y-3">
                              <img
                                src={item.hero_image}
                                alt={`Hero image for ${item.name}`}
                                className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-700"
                              />
                              <p className="text-xs text-[#595d60] font-mono break-all bg-[#070e0e] p-2 rounded">
                                {item.hero_image}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Parts */}
                        {item.parts && item.parts.length > 0 && (
                          <div>
                            <h4 className="text-lg font-medium text-white mb-4">
                              Parts ({item.parts.length})
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              {item.parts.map((part, partIndex) => (
                                <div
                                  key={partIndex}
                                  className="bg-[#070e0e] border border-gray-800 rounded-lg p-4"
                                >
                                  <h5 className="font-medium text-white mb-3">
                                    {part.name || `Part ${partIndex + 1}`}
                                  </h5>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[#595d60]">Finish:</span>
                                      <span className="text-white">{part.finish || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[#595d60]">Color:</span>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="inline-block w-5 h-5 rounded border-2 border-gray-600"
                                          style={{ backgroundColor: part.color }}
                                          title={part.color}
                                        />
                                        <span className="text-white font-mono text-xs">
                                          {part.color}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[#595d60]">Texture:</span>
                                      <span className="text-white">{part.texture || 'N/A'}</span>
                                    </div>
                                    {part.files && part.files.length > 0 && (
                                      <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                                        <span className="text-[#595d60]">Files:</span>
                                        <span className="text-[#38bdbb]">{part.files.length}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(!item.parts || item.parts.length === 0) && (
                          <p className="text-[#595d60] text-sm text-center py-6 border-2 border-dashed border-gray-700 rounded-lg">
                            No parts configured for this item.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
                    <Package className="w-12 h-12 text-[#595d60] mx-auto mb-4" />
                    <p className="text-[#595d60]">No items configured for this project.</p>
                  </div>
                )}
              </div>

              {/* Project History */}
              <ProjectLogs projectId={project.id} onProjectRestored={handleProjectRestored} />
            </div>

            {/* Sidebar - Collaborators */}
            <div className="xl:col-span-1">
              {currentUser && project && (
                <div className="bg-[#1a1e1f] rounded-2xl p-6 sticky top-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="w-5 h-5 text-[#38bdbb]" />
                    <h2 className="text-xl font-medium text-white">Collaborators</h2>
                  </div>

                  {/* Project Owner */}
                  <div className="bg-[#38bdbb]/10 border border-[#38bdbb]/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-[#38bdbb]" />
                        <span className="text-white font-medium">Project Owner</span>
                      </div>
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-[#38bdbb]/20 text-[#38bdbb]">
                        Owner
                      </span>
                    </div>
                    <p className="text-sm text-[#595d60]">Full control over project</p>
                  </div>

                  {/* Collaborators List */}
                  <CollaboratorsList
                    projectId={project.id}
                    projectOwnerId={project.user_id || ''}
                    currentUserId={currentUser.id}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        {showInviteModal && project && (
          <InviteUserModal
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            projectId={project.id}
            projectTitle={project.title}
            onInviteSuccess={() => {}}
          />
        )}

        {showExportModal && project && (
          <ExportProjectModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExport={async (options) => {
              setShowExportModal(false)
              await exportToPowerPoint(project, options)
            }}
            onOpenVisualEditor={() => {
              setShowExportModal(false)
              setShowVisualEditor(true)
            }}
            projectTitle={project.title}
          />
        )}

        {showVisualEditor && project && (
          <VisualEditorModal
            isOpen={showVisualEditor}
            onClose={() => setShowVisualEditor(false)}
            project={project}
            onExport={(slides) => {
              setShowVisualEditor(false)
              console.log('Exporting custom slides:', slides)
            }}
          />
        )}

        <ExportProgress
          isVisible={isExporting}
          currentStep={currentStep}
          progress={progress}
          error={exportError || undefined}
          onClose={resetExport}
        />
      </div>
    </DashboardLayout>
  )
}

