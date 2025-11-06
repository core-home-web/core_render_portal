'use client'

import { useTheme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'

interface ThemedBadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}

export function ThemedBadge({ children, variant = 'primary', className }: ThemedBadgeProps) {
  const { colors } = useTheme()

  const styles = variant === 'primary' 
    ? {
        backgroundColor: colors.primaryLight,
        color: colors.primary,
      }
    : {
        backgroundColor: 'rgba(249, 144, 60, 0.1)',
        color: '#f9903c',
      }

  return (
    <span
      className={cn('inline-flex px-3 py-1 rounded-full text-xs font-medium', className)}
      style={styles}
    >
      {children}
    </span>
  )
}

