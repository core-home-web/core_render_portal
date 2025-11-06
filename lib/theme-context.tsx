'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-context'
import { supabase } from './supaClient'

type Team = 'product_development' | 'industrial_design' | null

interface ThemeColors {
  primary: string
  primaryHover: string
  primaryLight: string
  primaryDark: string
  teamName: string
}

interface ThemeContextType {
  team: Team
  setTeam: (team: Team) => void
  colors: ThemeColors
  loading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const teamColors: Record<Exclude<Team, null>, ThemeColors> = {
  product_development: {
    primary: '#38bdbb',
    primaryHover: '#2ea9a7',
    primaryLight: 'rgba(56, 189, 187, 0.1)',
    primaryDark: 'rgba(56, 189, 187, 0.2)',
    teamName: 'Product Development',
  },
  industrial_design: {
    primary: '#f9903c',
    primaryHover: '#e88030',
    primaryLight: 'rgba(249, 144, 60, 0.1)',
    primaryDark: 'rgba(249, 144, 60, 0.2)',
    teamName: 'Industrial Design',
  },
}

const defaultColors: ThemeColors = teamColors.product_development

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [team, setTeamState] = useState<Team>(null)
  const [loading, setLoading] = useState(true)

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
          .single()

        if (data && !error) {
          setTeamState(data.team as Team)
        }
      } catch (err) {
        console.error('Error loading user team:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserTeam()
  }, [user])

  const setTeam = (newTeam: Team) => {
    setTeamState(newTeam)
  }

  const colors = team && teamColors[team] ? teamColors[team] : defaultColors

  return (
    <ThemeContext.Provider value={{ team, setTeam, colors, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// CSS variable updater hook
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

