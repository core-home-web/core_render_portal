'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Home, Eye } from 'lucide-react'

export default function ProjectSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectTitle, setProjectTitle] = useState<string>('')

  useEffect(() => {
    const id = searchParams.get('id')
    const title = searchParams.get('title')
    if (id) {
      setProjectId(id)
      setProjectTitle(title || 'Your Project')
    }
  }, [searchParams])

  const handleViewProject = () => {
    if (projectId) {
      router.push(`/project/${projectId}`)
    }
  }

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  const handleCreateAnother = () => {
    router.push('/project/new')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Project Created Successfully!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Your project has been created and saved to your account.
            </p>
            {projectTitle && (
              <p className="font-medium text-gray-900">
                "{projectTitle}"
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleViewProject}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Project
            </Button>
            
            <Button 
              onClick={handleCreateAnother}
              variant="outline"
              className="w-full"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Create Another Project
            </Button>
            
            <Button 
              onClick={handleGoHome}
              variant="ghost"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Your project is now available in your dashboard and can be viewed, edited, or shared with others.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 