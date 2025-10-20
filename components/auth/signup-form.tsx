'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { signUp, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationToken = searchParams.get('invitation')
  const preFilledEmail = searchParams.get('email')

  // Pre-fill email if provided in URL parameters
  useEffect(() => {
    if (preFilledEmail) {
      setEmail(preFilledEmail)
    }
  }, [preFilledEmail])

  // Show invitation-specific message
  useEffect(() => {
    if (invitationToken) {
      setMessage('Create an account to accept your project invitation')
    }
  }, [invitationToken])

  // Handle redirect when user becomes authenticated
  useEffect(() => {
    if (user && !authLoading && message.includes('Account created successfully!')) {
      setTimeout(() => {
        if (invitationToken) {
          router.push(`/project/invite/${invitationToken}`)
        } else {
          router.push('/dashboard')
        }
      }, 1000)
    }
  }, [user, authLoading, message, invitationToken, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { data, error } = await signUp(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user && !data.session) {
      // Email confirmation required
      setMessage('Account created! Please check your email to confirm your account before signing in.')
      setLoading(false)
    } else if (data.user && data.session) {
      // User is automatically signed in
      setMessage('Account created successfully! Redirecting...')
      setLoading(false)
    } else {
      setMessage('Account created successfully!')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          {invitationToken
            ? 'Create an account to accept your project invitation'
            : 'Sign up to start managing your 3D render projects'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!preFilledEmail} // Disable if pre-filled
            />
            {preFilledEmail && (
              <p className="text-xs text-muted-foreground mt-1">
                Email pre-filled from invitation
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
