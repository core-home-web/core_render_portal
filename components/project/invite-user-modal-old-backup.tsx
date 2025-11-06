'use client'

import { useState } from 'react'
import { useTheme } from '@/lib/theme-context'
import { useProjectCollaboration } from '@/hooks/useProjectCollaboration'
import { InviteUserData } from '@/types'
import { X, Mail, Users, Shield, CheckCircle } from 'lucide-react'
import { ThemedButton } from '@/components/ui/themed-button'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  onInviteSuccess?: () => void
}

export function InviteUserModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  onInviteSuccess,
}: InviteUserModalProps) {
  const { inviteUser, loading, error } = useProjectCollaboration()
  const { colors } = useTheme()
  const [email, setEmail] = useState('')
  const [permissionLevel, setPermissionLevel] = useState<
    'view' | 'edit' | 'admin'
  >('view')
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [invitationToken, setInvitationToken] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) return

    const result = await inviteUser(projectId, {
      email: email.trim(),
      permission_level: permissionLevel,
    })

    if (result.success) {
      setInviteSuccess(true)
      setInvitationToken(result.token || '')
      setEmail('')
      setPermissionLevel('view')
      onInviteSuccess?.()

      // Auto-close after 5 seconds
      setTimeout(() => {
        setInviteSuccess(false)
        setInvitationToken('')
        onClose()
      }, 5000)
    }
  }

  const handleClose = () => {
    setEmail('')
    setPermissionLevel('view')
    setInviteSuccess(false)
    setInvitationToken('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-[#1a1e1f] rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" style={{ color: colors.primary }} />
            <h2 className="text-xl font-medium text-white">Invite to Project</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[#595d60] hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {inviteSuccess ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.primaryLight }}>
                <CheckCircle className="w-8 h-8" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Invitation Sent!
              </h3>
              <p className="text-[#595d60] mb-2">
                An invitation has been sent to <strong className="text-white">{email}</strong> to join "{projectTitle}".
              </p>
              <p className="text-sm text-[#595d60] mt-4">
                They will receive an email with a link to accept the invitation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#595d60]" />
                  <input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-[#595d60] transition-colors focus:ring-1"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.primary
                      e.currentTarget.style.boxShadow = `0 0 0 1px ${colors.primary}`
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#374151'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              {/* Permission Level */}
              <div>
                <label htmlFor="permission" className="block text-sm font-medium text-white mb-3">
                  Permission Level
                </label>
                <div className="space-y-2">
                    <SelectItem value="view">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>View Only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="edit">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Can Edit</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Admin</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {permissionLevel === 'view' &&
                    'Can view project details and history'}
                  {permissionLevel === 'edit' &&
                    'Can view and edit project details'}
                  {permissionLevel === 'admin' &&
                    'Can view, edit, and manage collaborators'}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="flex-1"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
