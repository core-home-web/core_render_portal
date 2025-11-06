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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!preFilledEmail}
              className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-[#595d60] focus:border-[#38bdbb] focus:ring-1 focus:ring-[#38bdbb] transition-colors disabled:opacity-50"
            />
            {preFilledEmail && (
              <p className="text-xs text-[#595d60] mt-1">
                Email pre-filled from invitation
              </p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white placeholder-[#595d60] focus:border-[#38bdbb] focus:ring-1 focus:ring-[#38bdbb] transition-colors"
              placeholder="Enter your password"
            />
          </div>
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-900/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#38bdbb] text-white rounded-lg hover:bg-[#2ea9a7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
    </div>
  )
}
