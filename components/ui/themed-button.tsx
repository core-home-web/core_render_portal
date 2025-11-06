'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { useTheme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'

interface ThemedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, style, ...props }, ref) => {
    const { colors } = useTheme()

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg',
    }

    const baseClasses = 'rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed'

    const variantStyles = {
      primary: {
        backgroundColor: colors.primary,
        color: 'white',
      },
      secondary: {
        backgroundColor: '#222a31',
        color: 'white',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: colors.primary,
      },
      outline: {
        backgroundColor: 'transparent',
        color: colors.primary,
        border: `2px solid ${colors.primary}`,
      },
    }

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant === 'primary' && !props.disabled) {
        e.currentTarget.style.backgroundColor = colors.primaryHover
      }
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant === 'primary' && !props.disabled) {
        e.currentTarget.style.backgroundColor = colors.primary
      }
    }

    return (
      <button
        ref={ref}
        className={cn(baseClasses, sizeClasses[size], className)}
        style={{ ...variantStyles[variant], ...style }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </button>
    )
  }
)

ThemedButton.displayName = 'ThemedButton'

