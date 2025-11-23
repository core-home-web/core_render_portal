'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supaClient'
import { useAuth } from '@/lib/auth-context'

interface UserDefaultDueDate {
  value: number
  unit: 'days' | 'weeks' | 'months'
}

/**
 * Hook to fetch and manage user's default due date settings
 * Returns default of 30 days if not set
 */
export function useUserDefaultDueDate() {
  const { user } = useAuth()
  const [defaultDueDate, setDefaultDueDate] = useState<UserDefaultDueDate>({
    value: 30,
    unit: 'days',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserDefault = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('default_due_date_value, default_due_date_unit')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "not found" - that's okay, use defaults
          console.error('Error fetching user default due date:', error)
        }

        if (data) {
          setDefaultDueDate({
            value: data.default_due_date_value || 30,
            unit: (data.default_due_date_unit as 'days' | 'weeks' | 'months') || 'days',
          })
        }
      } catch (err) {
        console.error('Error in useUserDefaultDueDate:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserDefault()
  }, [user])

  return { defaultDueDate, loading }
}

/**
 * Utility function to get user's default due date settings
 * Can be used in non-hook contexts
 */
export async function getUserDefaultDueDate(userId: string): Promise<UserDefaultDueDate> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('default_due_date_value, default_due_date_unit')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user default due date:', error)
    }

    if (data) {
      return {
        value: data.default_due_date_value || 30,
        unit: (data.default_due_date_unit as 'days' | 'weeks' | 'months') || 'days',
      }
    }
  } catch (err) {
    console.error('Error in getUserDefaultDueDate:', err)
  }

  // Default fallback
  return { value: 30, unit: 'days' }
}
