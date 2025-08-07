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

export default function InvitePage({ params }: InvitePageProps) {
  const { token } = params
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'unauthenticated'>('loading')
  const [message, setMessage] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [invitationEmail, setInvitationEmail] = useState<string>('')

  useEffect(() => {
    const handleInvitation = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          // User is not authenticated - show signup/login options
          setStatus('unauthenticated')
          setMessage('Please sign up or log in to accept this invitation')
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
    // Redirect to signup page with invitation token
    router.push(`/auth/signup?invitation=${token}`)
  }

  const handleSignIn = () => {
    // Redirect to signin page with invitation token
    router.push(`/auth/login?invitation=${token}`)
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
            <p>You've been invited to collaborate on a project!</p>
            <p className="text-sm text-muted-foreground">
              To accept this invitation, you'll need to create an account or sign in.
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