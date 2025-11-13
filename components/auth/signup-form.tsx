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
import { supabase } from '@/lib/supaClient'

type Team = 'product_development' | 'industrial_design' | null

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [team, setTeam] = useState<Team>(null)
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

    // Create redirect URL for email verification
    const redirectTo = invitationToken 
      ? `${window.location.origin}/project/invite/${invitationToken}`
      : `${window.location.origin}/dashboard`

    // Sign up with custom redirect
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.user) {
      // Save team selection to user profile
      if (team) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: data.user.id,
            team: team,
            display_name: email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })

        if (profileError) {
          console.error('Error saving team:', profileError)
        }
      }

      if (!data.session) {
      // Email confirmation required
      setMessage('Account created! Please check your email to confirm your account before signing in.')
      setLoading(false)
      } else {
      // User is automatically signed in
      setMessage('Account created successfully! Redirecting...')
      setLoading(false)
      }
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

          {/* Team Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Select Your Team
            </label>
            <div className="space-y-3">
              {/* Product Development Team */}
              <div
                onClick={() => setTeam('product_development')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  team === 'product_development'
                    ? 'border-[#38bdbb] bg-[#38bdbb]/10'
                    : 'border-gray-700 bg-[#0d1117] hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#38bdbb]"></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">Product Development</h4>
                    <p className="text-xs text-[#595d60]">Manage renders and specifications</p>
                  </div>
                  {team === 'product_development' && (
                    <div className="w-5 h-5 bg-[#38bdbb] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Industrial Design Team */}
              <div
                onClick={() => setTeam('industrial_design')}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  team === 'industrial_design'
                    ? 'border-[#f9903c] bg-[#f9903c]/10'
                    : 'border-gray-700 bg-[#0d1117] hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#f9903c]"></div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">Industrial Design</h4>
                    <p className="text-xs text-[#595d60]">Execute renders and deliver assets</p>
                  </div>
                  {team === 'industrial_design' && (
                    <div className="w-5 h-5 bg-[#f9903c] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
