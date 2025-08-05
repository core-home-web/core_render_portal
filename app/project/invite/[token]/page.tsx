'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProjectCollaboration } from '@/hooks/useProjectCollaboration'
import { supabase } from '@/lib/supaClient'
import { CheckCircle, XCircle, Loader2, Users } from 'lucide-react'

export default function InviteAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const { acceptInvitation, loading, error } = useProjectCollaboration()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'checking'>('checking')
  const [projectTitle, setProjectTitle] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const token = params.token as string
    if (!token) {
      setStatus('error')
      setErrorMessage('Invalid invitation link')
      return
    }

    handleInvitation(token)
  }, [params.token])

  const handleInvitation = async (token: string) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setStatus('error')
        setErrorMessage('Please log in to accept this invitation')
        return
      }

      // Accept the invitation
      const result = await acceptInvitation(token)
      
      if (result.success && result.projectId) {
        setStatus('success')
        // Get project title for display
        const { data: project } = await supabase
          .from('projects')
          .select('title')
          .eq('id', result.projectId)
          .single()
        
        if (project) {
          setProjectTitle(project.title)
        }
      } else {
        setStatus('error')
        setErrorMessage(result.error || 'Failed to accept invitation')
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleGoToProject = () => {
    // This would redirect to the project page
    // For now, go to dashboard
    router.push('/dashboard')
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Invitation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Please wait while we process your invitation...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {status === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span>
              {status === 'success' ? 'Invitation Accepted' : 'Invitation Error'}
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'success' ? (
            <>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to the project!
                </h3>
                {projectTitle && (
                  <p className="text-gray-600 mb-4">
                    You've been successfully added to <strong>"{projectTitle}"</strong>
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  You can now view and collaborate on this project.
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button onClick={handleGoToProject} className="flex-1">
                  View Project
                </Button>
                <Button variant="outline" onClick={handleGoToDashboard} className="flex-1">
                  Go to Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Invitation Error
                </h3>
                <p className="text-gray-600 mb-4">
                  {errorMessage}
                </p>
                <p className="text-sm text-gray-500">
                  Please contact the project owner for a new invitation.
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button onClick={handleGoToDashboard} className="flex-1">
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 