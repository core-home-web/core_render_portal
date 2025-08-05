'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supaClient'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function InviteAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [projectTitle, setProjectTitle] = useState('')

  useEffect(() => {
    const acceptInvitation = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setStatus('error')
          setMessage('You must be logged in to accept an invitation')
          return
        }

        // Accept the invitation
        const { data, error } = await supabase.rpc('accept_project_invitation', {
          p_token: token
        })

        if (error) {
          if (error.message.includes('expired')) {
            setStatus('expired')
            setMessage('This invitation has expired')
          } else if (error.message.includes('Invalid')) {
            setStatus('error')
            setMessage('Invalid invitation token')
          } else {
            setStatus('error')
            setMessage(error.message)
          }
          return
        }

        // Get project details for success message
        const { data: project } = await supabase
          .from('projects')
          .select('title')
          .eq('id', data)
          .single()

        setProjectTitle(project?.title || 'the project')
        setStatus('success')
        setMessage('Invitation accepted successfully!')

        // Redirect to project after 2 seconds
        setTimeout(() => {
          router.push(`/project/${data}`)
        }, 2000)

      } catch (err) {
        console.error('Error accepting invitation:', err)
        setStatus('error')
        setMessage('Failed to accept invitation')
      }
    }

    if (token) {
      acceptInvitation()
    }
  }, [token, router])

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing Invitation</h2>
            <p className="text-gray-600">Please wait while we verify your invitation...</p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invitation Accepted!</h2>
            <p className="text-gray-600 mb-4">
              You have successfully joined <strong>{projectTitle}</strong>.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to the project...
            </p>
          </div>
        )

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invitation Error</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        )

      case 'expired':
        return (
          <div className="text-center">
            <XCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invitation Expired</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500 mb-4">
              Please ask the project owner to send you a new invitation.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Project Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          {getStatusContent()}
        </CardContent>
      </Card>
    </div>
  )
} 