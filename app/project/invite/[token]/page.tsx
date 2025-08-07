'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supaClient'

interface InvitePageProps {
  params: {
    token: string
  }
}

interface InvitationDetails {
  invited_email: string
  project_id: string
  project_title: string
  permission_level: string
  expires_at: string
}

export default function InvitePage({ params }: InvitePageProps) {
  const { token } = params
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'unauthenticated'>('loading')
  const [message, setMessage] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    const handleInvitation = async () => {
      try {
        // First, get invitation details to show project info
        const { data: invitationData, error: invitationError } = await supabase.rpc('get_invitation_details', {
          p_token: token
        })

        if (invitationError || !invitationData || invitationData.length === 0) {
          setStatus('error')
          setMessage('Invalid or expired invitation link')
          return
        }

        const details = invitationData[0] as InvitationDetails
        setInvitationDetails(details)

        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        // Add debug information
        let debug = `Token: ${token}\n`
        debug += `Invited Email: ${details.invited_email}\n`
        debug += `Project: ${details.project_title}\n`
        debug += `Permission: ${details.permission_level}\n`
        debug += `Authenticated: ${!!session}\n`
        
        if (session) {
          debug += `User Email: ${session.user.email}\n`
          debug += `User ID: ${session.user.id}\n`
        }
        
        setDebugInfo(debug)
        
        if (!session) {
          // User is not authenticated - show signup/login options
          setStatus('unauthenticated')
          setMessage(`You've been invited to collaborate on "${details.project_title}" with ${details.permission_level} permissions`)
          return
        }

        // User is authenticated - try to accept invitation
        const { data, error } = await supabase.rpc('accept_project_invitation', {
          p_token: token
        })

        if (error) {
          console.error('Invitation error:', error)
          
          if (error.message.includes('expired')) {
            setStatus('expired')
            setMessage('This invitation has expired')
          } else if (error.message.includes('Email does not match')) {
            setStatus('error')
            setMessage('This invitation was sent to a different email address')
          } else if (error.message.includes('Already a collaborator')) {
            setStatus('success')
            setMessage('You are already a collaborator on this project!')
            setProjectId(details.project_id)
          } else {
            setStatus('error')
            setMessage(error.message || 'Failed to accept invitation')
          }
          return
        }

        // Success - redirect to project
        setStatus('success')
        setMessage('Invitation accepted successfully!')
        setProjectId(data)
        
        // Redirect to project page after a short delay
        setTimeout(() => {
          router.push(`/project/${data}`)
        }, 2000)

      } catch (err) {
        console.error('Error handling invitation:', err)
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    handleInvitation()
  }, [token, router])

  const handleSignUp = () => {
    // Redirect to signup page with invitation token and pre-filled email
    const emailParam = invitationDetails ? `&email=${encodeURIComponent(invitationDetails.invited_email)}` : ''
    router.push(`/auth/signup?invitation=${token}${emailParam}`)
  }

  const handleSignIn = () => {
    // Redirect to signin page with invitation token and pre-filled email
    const emailParam = invitationDetails ? `&email=${encodeURIComponent(invitationDetails.invited_email)}` : ''
    router.push(`/auth/login?invitation=${token}${emailParam}`)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Processing Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please wait while we process your invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Project Invitation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-600 font-medium">{message}</p>
            {invitationDetails && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Project:</strong> {invitationDetails.project_title}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Permission Level:</strong> {invitationDetails.permission_level}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Invited Email:</strong> {invitationDetails.invited_email}
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              To accept this invitation, you'll need to create an account or sign in with the email address that received the invitation.
            </p>
            <div className="space-y-2">
              <Button onClick={handleSignUp} className="w-full">
                Create Account
              </Button>
              <Button onClick={handleSignIn} variant="outline" className="w-full">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{message}</p>
            <Button onClick={() => router.push('/')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{message}</p>
            {debugInfo && (
              <details className="mt-4">
                <summary className="text-sm text-muted-foreground cursor-pointer">Debug Info</summary>
                <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto">
                  {debugInfo}
                </pre>
              </details>
            )}
            <Button onClick={() => router.push('/')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Accepted!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">{message}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Redirecting to project...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
} 