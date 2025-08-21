import React from 'react'
import { Button } from './button'
import { Download, FileText } from 'lucide-react'

interface ExportButtonProps {
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

export function ExportButton({
  onClick,
  loading = false,
  disabled = false,
  variant = 'default',
  size = 'md',
  children
}: ExportButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className="gap-2"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          Generating...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4" />
          {children || 'Export to PowerPoint'}
        </>
      )}
    </Button>
  )
}
