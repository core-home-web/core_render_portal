'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useProject } from '@/hooks/useProject'
import { Project } from '@/types'

export default function ProjectPage() {
  const params = useParams()
  const { getProject, loading, error } = useProject()
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (params.id) {
        const projectData = await getProject(params.id as string)
        setProject(projectData)
      }
    }
    fetchProject()
  }, [params.id]) // Remove getProject from dependencies

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
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
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

      <div className="space-y-6">
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
                      <div>
                        <h3 className="text-lg font-medium">
                          {item.name || `Item ${index + 1}`}
                        </h3>
                        {item.hero_image && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Hero Image: {item.hero_image}
                          </p>
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
                                <p><strong>Color:</strong> {part.color}</p>
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
      </div>
    </div>
  )
} 