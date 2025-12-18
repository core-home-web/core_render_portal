# Chapter 14: Context Providers

This chapter covers the React Context providers that manage global application state, including authentication and theming.

---

## React Context Overview

React Context provides a way to share state across components without prop drilling:

```
App
├── AuthProvider      ← Provides auth state
│   └── ThemeProvider ← Provides theme state
│       ├── Dashboard (uses auth + theme)
│       ├── Project (uses auth + theme)
│       └── Settings (uses auth + theme)
```

---

## Theme Context Provider

The theme context manages team-based color theming.

### Complete Implementation

```typescript
// File: lib/theme-context.tsx

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-context'
import { supabase } from './supaClient'

/**
 * Team type representing department assignment
 * Each team has a distinct color theme
 */
type Team = 'product_development' | 'industrial_design' | null

/**
 * Theme colors interface
 * Defines all color values for a team's theme
 */
interface ThemeColors {
  /** Primary accent color (buttons, links) */
  primary: string
  /** Hover state for primary color */
  primaryHover: string
  /** Light variant for backgrounds */
  primaryLight: string
  /** Dark variant for shadows/borders */
  primaryDark: string
  /** Display name for the team */
  teamName: string
}

/**
 * Theme context type
 */
interface ThemeContextType {
  /** Current team (null if not set) */
  team: Team
  /** Update team selection */
  setTeam: (team: Team) => void
  /** Current theme colors based on team */
  colors: ThemeColors
  /** Loading state during team fetch */
  loading: boolean
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Color definitions for each team
 */
const teamColors: Record<Exclude<Team, null>, ThemeColors> = {
  product_development: {
    primary: '#38bdbb',          // Teal
    primaryHover: '#2ea9a7',
    primaryLight: 'rgba(56, 189, 187, 0.1)',
    primaryDark: 'rgba(56, 189, 187, 0.2)',
    teamName: 'Product Development',
  },
  industrial_design: {
    primary: '#f9903c',          // Orange
    primaryHover: '#e88030',
    primaryLight: 'rgba(249, 144, 60, 0.1)',
    primaryDark: 'rgba(249, 144, 60, 0.2)',
    teamName: 'Industrial Design',
  },
}

// Default colors (Product Development)
const defaultColors: ThemeColors = teamColors.product_development

/**
 * ThemeProvider component
 * 
 * Wraps the application and provides theme state based on user's team.
 * Automatically loads team from user profile on auth change.
 * 
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <AuthProvider>
 *   <ThemeProvider>
 *     {children}
 *   </ThemeProvider>
 * </AuthProvider>
 * ```
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [team, setTeamState] = useState<Team>(null)
  const [loading, setLoading] = useState(true)

  // Load user's team from profile when user changes
  useEffect(() => {
    const loadUserTeam = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('team')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) {
          // Table might not exist yet, use default
          console.warn('Could not load user team:', error.message)
          setTeamState('product_development')
        } else if (data) {
          setTeamState(data.team as Team)
        } else {
          // No profile yet, use default
          setTeamState('product_development')
        }
      } catch (err) {
        console.error('Error loading user team:', err)
        setTeamState('product_development')
      } finally {
        setLoading(false)
      }
    }

    loadUserTeam()
  }, [user])

  /**
   * Update team selection
   * Does NOT persist to database - use settings page for that
   */
  const setTeam = (newTeam: Team) => {
    setTeamState(newTeam)
  }

  // Get colors based on current team
  const colors = team && teamColors[team] ? teamColors[team] : defaultColors

  return (
    <ThemeContext.Provider value={{ team, setTeam, colors, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context
 * 
 * @throws Error if used outside ThemeProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { colors, team } = useTheme()
 *   
 *   return (
 *     <button style={{ backgroundColor: colors.primary }}>
 *       {team === 'product_development' ? 'PD Team' : 'ID Team'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * Hook to automatically update CSS custom properties
 * when theme changes
 * 
 * Call this in your root component to enable CSS variable theming
 * 
 * @example
 * ```tsx
 * function App() {
 *   useCSSVariables() // Updates CSS vars when theme changes
 *   return <div>...</div>
 * }
 * ```
 */
export function useCSSVariables() {
  const { colors } = useTheme()

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', colors.primary)
    root.style.setProperty('--color-primary-hover', colors.primaryHover)
    root.style.setProperty('--color-primary-light', colors.primaryLight)
    root.style.setProperty('--color-primary-dark', colors.primaryDark)
  }, [colors])
}
```

---

## Using Theme Colors

### Inline Styles

```typescript
function ThemedButton() {
  const { colors } = useTheme()
  
  return (
    <button
      style={{
        backgroundColor: colors.primary,
        color: 'white',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.primaryHover
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.primary
      }}
    >
      Click Me
    </button>
  )
}
```

### CSS Variables

```typescript
// Component using CSS variables
function ThemedComponent() {
  useCSSVariables() // Enable CSS variable updates
  
  return (
    <div className="themed-element">
      Content with theme colors
    </div>
  )
}

// CSS using variables
// styles.css
.themed-element {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
}
```

---

## Themed Component Wrapper

Reusable themed button component:

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
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const { colors } = useTheme()
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    }
    
    const baseClasses = cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses[size],
      className
    )
    
    // Variant-specific styles using theme colors
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: colors.primary,
        color: 'white',
      },
      secondary: {
        backgroundColor: colors.primaryLight,
        color: colors.primary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: '1px',
        borderColor: colors.primary,
        color: colors.primary,
      },
    }

    return (
      <button
        ref={ref}
        className={baseClasses}
        style={variantStyles[variant]}
        onMouseEnter={(e) => {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = colors.primaryHover
          }
        }}
        onMouseLeave={(e) => {
          if (variant === 'primary') {
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

## Provider Composition in Layout

```typescript
// File: app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { ThemeProvider } from '@/lib/theme-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Core Home Render Portal',
  description: 'Internal tool for managing 3D render projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Auth must wrap Theme because Theme uses auth state */}
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-background">
              {children}
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

## Context Best Practices

### 1. Keep Contexts Focused

Each context should manage one concern:
- AuthContext → Authentication only
- ThemeContext → Theming only

### 2. Avoid Over-rendering

Use memoization when needed:

```typescript
const value = useMemo(() => ({
  team,
  setTeam,
  colors,
  loading,
}), [team, colors, loading])

return (
  <ThemeContext.Provider value={value}>
    {children}
  </ThemeContext.Provider>
)
```

### 3. Handle Loading States

Always expose loading state for initial data fetch:

```typescript
const { colors, loading } = useTheme()

if (loading) {
  return <Skeleton /> // Show loading UI
}
```

### 4. Provide Defaults

Don't break if context value is missing:

```typescript
const colors = team && teamColors[team] 
  ? teamColors[team] 
  : defaultColors // Fallback
```

---

## Chapter Summary

Context providers manage global state:

1. **AuthProvider** - User authentication state and methods
2. **ThemeProvider** - Team-based color theming
3. **useCSSVariables** - Sync theme to CSS variables

Key patterns:
- Nest providers in correct order (auth before theme)
- Expose loading states for async operations
- Provide fallback/default values
- Keep context responsibilities focused

---

## Part 3 Complete

You now have:
- Authentication system with login/signup
- User profile management
- API routes for server operations
- Context providers for global state

---

*Continue to [Part 4: Frontend Features](../part-04-frontend-features/README.md) to build the main application features.*
