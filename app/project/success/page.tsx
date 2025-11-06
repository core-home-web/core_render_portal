'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowRight, Home, Eye, Sparkles } from 'lucide-react'

export default function ProjectSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectTitle, setProjectTitle] = useState<string>('')

  useEffect(() => {
    const id = searchParams.get('id')
    const title = searchParams.get('title')
    if (id) {
      setProjectId(id)
      setProjectTitle(title || 'Your Project')
    }
  }, [searchParams])

  const handleViewProject = () => {
    if (projectId) {
      router.push(`/project/${projectId}`)
    }
  }

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  const handleCreateAnother = () => {
    router.push('/project/new')
  }

  return (
    <div className="min-h-screen bg-[#070e0e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-[#38bdbb]/20 rounded-full flex items-center justify-center relative">
            <CheckCircle className="w-12 h-12 text-[#38bdbb]" />
            <Sparkles className="w-5 h-5 text-[#38bdbb] absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-3xl font-medium text-white mb-3">
            Project Created Successfully!
          </h1>
          <p className="text-[#595d60]">
              Your project has been created and saved to your account.
            </p>
        </div>

        {/* Project Title */}
            {projectTitle && (
          <div className="bg-[#1a1e1f] rounded-xl p-6 mb-6 text-center">
            <p className="text-sm text-[#595d60] mb-2">Project Name:</p>
            <p className="text-xl font-medium text-white">"{projectTitle}"</p>
          </div>
        )}

        {/* Action Buttons */}
          <div className="space-y-3">
          <button
              onClick={handleViewProject}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#38bdbb] text-white rounded-lg hover:bg-[#2ea9a7] transition-colors font-medium"
            >
            <Eye className="w-4 h-4" />
            <span>View Project</span>
          </button>

          <button
              onClick={handleCreateAnother}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#222a31] text-white rounded-lg hover:bg-[#2a3239] transition-colors"
            >
            <ArrowRight className="w-4 h-4" />
            <span>Create Another Project</span>
          </button>

          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-[#595d60] hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </button>
          </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-xs text-[#595d60] text-center">
            Your project is now available in your dashboard and can be viewed, edited, or shared with collaborators.
            </p>
          </div>
      </div>
    </div>
  )
}
