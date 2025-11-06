'use client'

import Link from 'next/link'
import { useTheme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'

interface ThemedLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function ThemedLink({ href, children, className, onClick }: ThemedLinkProps) {
  const { colors } = useTheme()

  return (
    <Link
      href={href}
      className={cn('transition-colors', className)}
      style={{ color: colors.primary }}
      onMouseEnter={(e) => (e.currentTarget.style.color = colors.primaryHover)}
      onMouseLeave={(e) => (e.currentTarget.style.color = colors.primary)}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

