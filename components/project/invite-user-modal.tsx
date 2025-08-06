'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProjectCollaboration } from '@/hooks/useProjectCollaboration'
import { InviteUserData } from '@/types'
import { X, Mail, Users, Shield } from 'lucide-react'

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
  onInviteSuccess 
}: InviteUserModalProps) {
  const { inviteUser, loading, error } = useProjectCollaboration()
  const [email, setEmail] = useState('')
  const [permissionLevel, setPermissionLevel] = useState<'view' | 'edit' | 'admin'>('view')
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [invitationToken, setInvitationToken] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) return

    const result = await inviteUser(projectId, {
      email: email.trim(),
      permission_level: permissionLevel
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <CardTitle>Invite to Project</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {inviteSuccess ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Invitation Sent!
              </h3>
              <p className="text-gray-600">
                An invitation has been sent to <strong>{email}</strong> to join "{projectTitle}".
              </p>
              <p className="text-sm text-gray-500 mt-2">
                They will receive an email with a link to accept the invitation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="permission">Permission Level</Label>
                <Select value={permissionLevel} onValueChange={(value: any) => setPermissionLevel(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                  {permissionLevel === 'view' && 'Can view project details and history'}
                  {permissionLevel === 'edit' && 'Can view and edit project details'}
                  {permissionLevel === 'admin' && 'Can view, edit, and manage collaborators'}
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