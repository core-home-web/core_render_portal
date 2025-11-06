'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-context'

interface AnimatedProgressBarProps {
  steps: Array<{ id: number; title: string; description: string }>
  currentStep: number
  className?: string
}

export function AnimatedProgressBar({
  steps,
  currentStep,
  className,
}: AnimatedProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState<number[]>([])
  const { colors } = useTheme()

  useEffect(() => {
    // Animate progress when step changes
    const newProgress = steps.map((step, index) => {
      if (step.id < currentStep) return 100 // Complete
      if (step.id === currentStep) return 50 // In progress
      return 0 // Not started
    })

    // Smooth animation
    const timeout = setTimeout(() => {
      setAnimatedProgress(newProgress)
    }, 100)

    return () => clearTimeout(timeout)
  }, [currentStep, steps])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex-1 relative">
            {/* Segment Background */}
            <div className="h-3 bg-[#222a31] rounded-full overflow-hidden">
              {/* Animated Fill */}
              <div
                className="h-full transition-all duration-700 ease-out rounded-full"
                style={{
                  width: `${animatedProgress[index] || 0}%`,
                  backgroundColor: step.id <= currentStep ? colors.primary : '#222a31',
                  transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>

            {/* Step Number Badge */}
            <div
              className={cn(
                'absolute -top-8 left-1/2 transform -translate-x-1/2',
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300',
                step.id < currentStep
                  ? 'text-white scale-100'
                  : step.id === currentStep
                  ? 'text-white scale-110 ring-4'
                  : 'bg-[#222a31] text-[#595d60] scale-95'
              )}
              style={step.id <= currentStep ? {
                backgroundColor: colors.primary,
                boxShadow: step.id === currentStep ? `0 0 0 4px ${colors.primaryLight}` : 'none'
              } : {}}
            >
              {step.id}
            </div>
          </div>
        ))}
      </div>

      {/* Step Info */}
      <div className="text-center">
        <h2 className="text-2xl font-medium text-white mb-2">
          {steps[currentStep - 1]?.title}
        </h2>
        <p className="text-[#595d60]">{steps[currentStep - 1]?.description}</p>
      </div>
    </div>
  )
}

