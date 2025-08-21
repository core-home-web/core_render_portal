'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Users, Plus, FileText } from 'lucide-react'


export default function ProjectPage() {
  const params = useParams()
  const { getProject, loading, error } = useProject()
  const [project, setProject] = useState<Project | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showVisualEditor, setShowVisualEditor] = useState(false)
  const { exportToPowerPoint, isExporting, progress, currentStep, error: exportError, resetExport } = usePowerPointExport()

  useEffect(() => {
    const fetchProject = async () => {
      if (params.id) {
        const projectData = await getProject(params.id as string)
        setProject(projectData)
      }
    }
    fetchProject()
  }, [params.id]) // Remove getProject from dependencies

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setCurrentUser(session.user)
      }
    }
    getCurrentUser()
  }, [])

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject)
    setIsEditing(false)
  }

  const handleProjectRestored = async () => {
    // Refresh project data after restore
    if (params.id) {
      const projectData = await getProject(params.id as string)
      setProject(projectData)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive">
            {error || 'Project not found'}
          </p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <p className="text-xl text-muted-foreground">
              Retailer: {project.retailer}
            </p>
          </div>
          <div className="flex gap-2">
            {currentUser && project && currentUser.id === project.user_id && (
              <Button onClick={() => setShowInviteModal(true)}>
                <Users className="w-4 h-4 mr-2" />
                Invite Users
              </Button>
            )}
            <Button onClick={() => setShowExportModal(true)} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export to HTML
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              Edit Project
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Created: {new Date(project.created_at).toLocaleDateString()}
          {project.updated_at !== project.created_at && (
            <span className="ml-4">
              Updated: {new Date(project.updated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {isEditing ? (
        <EditProjectForm
          project={project}
          onUpdate={handleProjectUpdate}
          onCancel={handleCancelEdit}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">


            <Card>
              <CardHeader>
                <CardTitle>Items ({project.items?.length || 0})</CardTitle>
                <CardDescription>
                  Items to be rendered for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.items && project.items.length > 0 ? (
                  <div className="space-y-6">
                    {project.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium">
                              {item.name || `Item ${index + 1}`}
                            </h3>
                            {item.hero_image && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                  Hero Image:
                                </p>
                                <div className="space-y-2">
                                  <img 
                                    src={item.hero_image} 
                                    alt={`Hero image for ${item.name}`}
                                    className="w-48 h-32 object-cover rounded-md border"
                                  />
                                  <p className="text-xs text-muted-foreground font-mono break-all">
                                    {item.hero_image}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {item.parts && item.parts.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-3">
                              Parts ({item.parts.length})
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              {item.parts.map((part, partIndex) => (
                                <div
                                  key={partIndex}
                                  className="border rounded-md p-3 bg-muted/50"
                                >
                                  <h5 className="font-medium mb-2">
                                    {part.name || `Part ${partIndex + 1}`}
                                  </h5>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Finish:</strong> {part.finish}</p>
                                    <p><strong>Color:</strong> 
                                      <span 
                                        className="inline-block w-4 h-4 rounded border ml-2"
                                        style={{ backgroundColor: part.color }}
                                        title={part.color}
                                      />
                                      <span className="ml-1">{part.color}</span>
                                    </p>
                                    <p><strong>Texture:</strong> {part.texture}</p>
                                    {part.files && part.files.length > 0 && (
                                      <p><strong>Files:</strong> {part.files.length}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(!item.parts || item.parts.length === 0) && (
                          <p className="text-muted-foreground text-sm">
                            No parts configured for this item.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No items configured for this project.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Project History */}
            <ProjectLogs projectId={project.id} onProjectRestored={handleProjectRestored} />
          </div>

          {/* Collaboration Sidebar */}
          <div className="xl:col-span-2">
            {currentUser && project && (
              <CollaboratorsList
                projectId={project.id}
                projectOwnerId={project.user_id || ''}
                currentUserId={currentUser.id}
              />
            )}
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && project && (
        <InviteUserModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          projectId={project.id}
          projectTitle={project.title}
          onInviteSuccess={() => {
            // Refresh collaborators list
            // This will be handled by the CollaboratorsList component
          }}
        />
      )}

      {/* Export Project Modal */}
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

      {/* Visual Editor Modal */}
      {showVisualEditor && project && (
        <VisualEditorModal
          isOpen={showVisualEditor}
          onClose={() => setShowVisualEditor(false)}
          project={project}
          onExport={(slides) => {
            setShowVisualEditor(false)
            // TODO: Export the custom slides
            console.log('Exporting custom slides:', slides)
          }}
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