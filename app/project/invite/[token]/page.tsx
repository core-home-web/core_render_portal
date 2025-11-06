'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supaClient'
import { Mail, CheckCircle, XCircle, AlertTriangle, Clock, ArrowRight } from 'lucide-react'
import { ThemedButton } from '@/components/ui/themed-button'

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
  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'expired' | 'unauthenticated' | 'email_mismatch'
  >('loading')
  const [message, setMessage] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)

  useEffect(() => {
    const handleInvitation = async () => {
      try {
        // Get invitation details
        const { data: invitationData, error: invitationError } = await supabase.rpc(
          'get_invitation_details',
          { p_token: token }
        )

        if (invitationError || !invitationData || invitationData.length === 0) {
          setStatus('error')
          setMessage('Invalid or expired invitation link')
          return
        }

        const details = invitationData[0] as InvitationDetails
        setInvitationDetails(details)

        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          // User is not authenticated
          setStatus('unauthenticated')
          setMessage(
            `You've been invited to collaborate on "${details.project_title}" with ${details.permission_level} permissions`
          )
          return
        }

        // User is authenticated - accept invitation
        const { data, error } = await supabase.rpc('accept_project_invitation', {
          p_token: token,
        })

        if (error) {
          if (error.message.includes('expired')) {
            setStatus('expired')
            setMessage('This invitation has expired')
          } else if (error.message.includes('Email does not match')) {
            setStatus('email_mismatch')
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
    const emailParam = invitationDetails
      ? `&email=${encodeURIComponent(invitationDetails.invited_email)}`
      : ''
    router.push(`/auth/login?invitation=${token}${emailParam}`)
  }

  const handleSignIn = () => {
    const emailParam = invitationDetails
      ? `&email=${encodeURIComponent(invitationDetails.invited_email)}`
      : ''
    router.push(`/auth/login?invitation=${token}${emailParam}`)
  }

  // Loading State
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#070e0e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1e1f] rounded-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#38bdbb] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-medium text-white mb-2">Processing Invitation</h2>
            <p className="text-[#595d60]">Please wait while we process your invitation...</p>
          </div>
        </div>
      </div>
    )
  }

  // Unauthenticated State
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#070e0e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1e1f] rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#38bdbb]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-[#38bdbb]" />
            </div>
            <h2 className="text-2xl font-medium text-white mb-3">Project Invitation</h2>
            <p className="text-[#38bdbb]">{message}</p>
          </div>

          {invitationDetails && (
            <div className="bg-[#0d1117] border border-gray-700 rounded-xl p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#595d60]">Project:</span>
                  <span className="text-white font-medium">{invitationDetails.project_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#595d60]">Permission:</span>
                  <span className="text-white font-medium capitalize">{invitationDetails.permission_level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#595d60]">Invited Email:</span>
                  <span className="text-[#38bdbb] font-medium text-xs">{invitationDetails.invited_email}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-[#595d60] mb-6 text-center">
            To accept this invitation, create an account or sign in with the email that received the invitation.
          </p>

          <div className="space-y-3">
            <ThemedButton onClick={handleSignUp} variant="primary" className="w-full">
              Create Account
            </ThemedButton>
            <button
              onClick={handleSignIn}
              className="w-full px-6 py-3 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success State
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#070e0e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1e1f] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-medium text-white mb-3">Invitation Accepted!</h2>
          <p className="text-green-400 mb-6">{message}</p>
          <p className="text-sm text-[#595d60]">Redirecting to project...</p>
        </div>
      </div>
    )
  }

  // Expired State
  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-[#070e0e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1e1f] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-medium text-white mb-3">Invitation Expired</h2>
          <p className="text-red-400 mb-6">{message}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Email Mismatch State
  if (status === 'email_mismatch') {
    return (
      <div className="min-h-screen bg-[#070e0e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1e1f] rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-medium text-white mb-3">Email Mismatch</h2>
            <p className="text-yellow-400">{message}</p>
          </div>

          {invitationDetails && (
            <div className="bg-[#0d1117] border border-gray-700 rounded-xl p-4 mb-6">
              <p className="text-sm text-[#595d60] mb-3">Invitation Details:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#595d60]">Project:</span>
                  <span className="text-white font-medium">{invitationDetails.project_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#595d60]">Invited Email:</span>
                  <span className="text-[#38bdbb] font-medium text-xs">{invitationDetails.invited_email}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-[#595d60] mb-6 text-center">
            Sign in with the email address that received the invitation.
          </p>

          <div className="space-y-3">
            <ThemedButton onClick={handleSignIn} variant="primary" className="w-full">
              Sign In as {invitationDetails?.invited_email}
            </ThemedButton>
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#070e0e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a1e1f] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-medium text-white mb-3">Invitation Error</h2>
          <p className="text-red-400 mb-6">{message}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return null
}

