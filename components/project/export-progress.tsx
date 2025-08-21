import React from 'react'
import { Card } from '../ui/card'
import { FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface ExportProgressProps {
  isVisible: boolean
  currentStep: string
  progress: number
  error?: string
  onClose?: () => void
}

export function ExportProgress({
  isVisible,
  currentStep,
  progress,
  error,
  onClose
}: ExportProgressProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Generating PowerPoint</h3>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm text-gray-600 mt-2 text-center">
              {progress}% Complete
            </div>
          </div>

          {/* Current Step */}
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">Current Step:</div>
            <div className="text-sm font-medium text-gray-900">{currentStep}</div>
          </div>

          {/* Status */}
          {error ? (
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          ) : progress === 100 ? (
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">PowerPoint generated successfully!</span>
            </div>
          ) : null}

          {/* Actions */}
          {onClose && (error || progress === 100) && (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
