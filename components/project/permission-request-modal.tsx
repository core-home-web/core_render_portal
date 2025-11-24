'use client'

import { useState } from 'react'
import { X, Shield, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-context'

interface PermissionRequestModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  projectOwnerId: string
  currentUserEmail?: string
  action?: string // e.g., "edit this project", "change the due date", "modify items"
}

export function PermissionRequestModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  projectOwnerId,
  currentUserEmail,
  action = 'make changes',
}: PermissionRequestModalProps) {
  const { colors } = useTheme()
  const [isRequesting, setIsRequesting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleRequestAccess = async () => {
    setIsRequesting(true)
    setError(null)

    try {
      const response = await fetch('/api/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          projectTitle,
          projectOwnerId,
          requesterEmail: currentUserEmail,
          action,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send access request')
      }

      setRequestSent(true)
    } catch (err) {
      console.error('Error requesting access:', err)
      setError(err instanceof Error ? err.message : 'Failed to send access request')
    } finally {
      setIsRequesting(false)
    }
  }

  const handleClose = () => {
    setRequestSent(false)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1e1f] rounded-2xl border border-gray-700 max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#595d60] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!requestSent ? (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#38bdbb]/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-[#38bdbb]" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-white mb-2 text-center">
              Editor Access Required
            </h2>

            {/* Message */}
            <p className="text-[#595d60] text-center mb-6">
              You need editor access to {action} on{' '}
              <span className="text-white font-medium">{projectTitle}</span>.
            </p>

            {/* Info box */}
            <div className="bg-[#0d1117] border border-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-[#595d60] mb-2">
                Your current permission level only allows you to view this project.
              </p>
              <p className="text-sm text-white">
                Would you like to request editor access from the project administrator?
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                variant="secondary"
                className="flex-1 bg-[#0d1117] text-white border-gray-700 hover:bg-[#1a1e1f]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestAccess}
                disabled={isRequesting}
                className="flex-1"
                style={{ backgroundColor: colors.primary, color: 'white' }}
              >
                {isRequesting ? (
                  <>
                    <Mail className="w-4 h-4 mr-2 animate-pulse" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Request Access
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-2 text-center">
              Request Sent!
            </h2>

            <p className="text-[#595d60] text-center mb-6">
              Your request for editor access has been sent to the project administrator.
              They will be notified via email and can update your permissions.
            </p>

            <Button
              onClick={handleClose}
              className="w-full"
              style={{ backgroundColor: colors.primary, color: 'white' }}
            >
              Close
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

