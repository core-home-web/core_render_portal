# Chapter 21: UI Component Library

This chapter documents all base UI components used throughout the application.

---

## Component Overview

The UI layer consists of:
- **shadcn/ui components** - Pre-built, accessible components
- **Custom components** - Application-specific UI elements
- **Themed components** - Team color-aware variants

---

## Button Component

```typescript
// File: components/ui/button.tsx

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

---

## Input Component

```typescript
// File: components/ui/input.tsx

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

---

## Card Component

```typescript
// File: components/ui/card.tsx

import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
```

---

## Themed Button Component

```typescript
// File: components/ui/themed-button.tsx

'use client'

import { forwardRef } from 'react'
import { useTheme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const { colors } = useTheme()
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    }
    
    const getStyles = () => {
      if (disabled) {
        return { backgroundColor: '#4b5563', color: '#9ca3af' }
      }
      
      switch (variant) {
        case 'primary':
          return { backgroundColor: colors.primary, color: 'white' }
        case 'secondary':
          return { backgroundColor: colors.primaryLight, color: colors.primary }
        case 'outline':
          return { 
            backgroundColor: 'transparent', 
            borderWidth: '1px', 
            borderColor: colors.primary, 
            color: colors.primary 
          }
        default:
          return { backgroundColor: colors.primary, color: 'white' }
      }
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        style={getStyles()}
        disabled={disabled}
        onMouseEnter={(e) => {
          if (!disabled && variant === 'primary') {
            e.currentTarget.style.backgroundColor = colors.primaryHover
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && variant === 'primary') {
            e.currentTarget.style.backgroundColor = colors.primary
          }
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

ThemedButton.displayName = 'ThemedButton'
```

---

## File Upload Component

```typescript
// File: components/ui/file-upload.tsx

'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supaClient'
import { useAuth } from '@/lib/auth-context'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  bucket?: string
  accept?: string
  maxSize?: number
}

export function FileUpload({
  value,
  onChange,
  label,
  placeholder = 'Click or drag to upload',
  bucket = 'project-images',
  accept = 'image/*',
  maxSize = 50 * 1024 * 1024,
}: FileUploadProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > maxSize) {
      setError(`File too large. Max: ${maxSize / 1024 / 1024}MB`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      onChange(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [bucket, maxSize, onChange, user?.id])

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-white">{label}</label>}
      
      {value ? (
        <div className="relative group">
          <img src={value} alt="Uploaded" className="w-full h-32 object-cover rounded-lg" />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-xs text-gray-400">{placeholder}</span>
            </>
          )}
          <input
            type="file"
            accept={accept}
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
      
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
```

---

## Component Summary

| Component | File | Purpose |
|-----------|------|---------|
| Button | `ui/button.tsx` | Standard button with variants |
| Input | `ui/input.tsx` | Text input field |
| Card | `ui/card.tsx` | Container card with sections |
| ThemedButton | `ui/themed-button.tsx` | Team-themed button |
| FileUpload | `ui/file-upload.tsx` | Image upload with preview |
| Select | `ui/select.tsx` | Dropdown select |
| Checkbox | `ui/checkbox.tsx` | Checkbox input |
| Label | `ui/label.tsx` | Form label |

---

*Next: [Chapter 22: Layout Components](./chapter-22-layout-components.md) - Dashboard layout*
