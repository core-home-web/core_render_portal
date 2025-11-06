'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { SignupForm } from '@/components/auth/signup-form'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070e0e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="text-[#38bdbb] text-4xl font-bold mb-2">Core Home</div>
            <div className="h-1 bg-gradient-to-r from-[#38bdbb] to-[#f9903c] rounded-full"></div>
          </div>
          <h1 className="text-3xl font-medium text-white mb-3">Render Portal</h1>
          <p className="text-[#595d60]">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1a1e1f] rounded-2xl p-8">
          {isLogin ? <LoginForm /> : <SignupForm />}
        </div>

        {/* Toggle Link */}
        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-[#38bdbb] hover:text-[#2ea9a7] transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
