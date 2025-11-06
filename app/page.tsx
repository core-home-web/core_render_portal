'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show content immediately, redirect happens in useEffect
  // This prevents the "forever loading" issue
  return (
    <div className="min-h-screen bg-[#070e0e] flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="text-[#38bdbb] text-5xl font-bold mb-2">Core Home</div>
            <div className="h-1 bg-gradient-to-r from-[#38bdbb] to-[#f9903c] rounded-full"></div>
          </div>
          <h1 className="text-4xl font-medium text-white mb-4">
            Render Portal
          </h1>
          <p className="text-xl text-[#595d60]">
            Internal tool for managing 3D render projects
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1e1f] rounded-2xl p-8 hover:bg-[#222a31] transition-colors">
            <h2 className="text-2xl font-medium text-white mb-3">Sign In</h2>
            <p className="text-[#595d60] mb-6">
              Access your existing projects and create new ones
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full px-6 py-3 bg-[#38bdbb] text-white rounded-lg hover:bg-[#2ea9a7] transition-colors font-medium"
            >
              Sign In
            </button>
          </div>

          <div className="bg-[#1a1e1f] rounded-2xl p-8 hover:bg-[#222a31] transition-colors">
            <h2 className="text-2xl font-medium text-white mb-3">Create Account</h2>
            <p className="text-[#595d60] mb-6">
              Start managing your 3D render projects
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full px-6 py-3 bg-[#222a31] border border-[#38bdbb] text-[#38bdbb] rounded-lg hover:bg-[#38bdbb] hover:text-white transition-colors font-medium"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-[#595d60]">
            Professional 3D rendering workflow management
          </p>
        </div>
      </div>
    </div>
  )
}
