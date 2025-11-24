/**
 * Date utility functions for safe date formatting
 * Handles null, undefined, and invalid dates gracefully
 */

import { parseISO, isValid, addDays, addWeeks, addMonths } from 'date-fns'

/**
 * Validates if a date string is valid
 */
export function isValidDate(date: string | null | undefined): boolean {
  if (!date) return false
  const parsed = parseISO(date)
  return isValid(parsed)
}

/**
 * Formats a date string for display
 * Returns "No date set" for invalid/null/undefined dates
 * Format: "MMM DD, YYYY" (e.g., "Dec 15, 2024")
 * Uses UTC to avoid timezone shifts
 */
export function formatDateForDisplay(date: string | null | undefined): string {
  if (!date || !isValidDate(date)) {
    return 'No date set'
  }
  
  try {
    const dateObj = parseISO(date)
    // Use UTC methods to avoid timezone shifts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = monthNames[dateObj.getUTCMonth()]
    const day = dateObj.getUTCDate()
    const year = dateObj.getUTCFullYear()
    return `${month} ${day}, ${year}`
  } catch (error) {
    return 'No date set'
  }
}

/**
 * Formats a date string with a shorter format
 * Format: "MM/DD/YYYY" (e.g., "12/15/2024")
 */
export function formatDateShort(date: string | null | undefined): string {
  if (!date || !isValidDate(date)) {
    return 'No date set'
  }
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (error) {
    return 'No date set'
  }
}

/**
 * Formats a date string with full format including time
 * Format: "MMM DD, YYYY, HH:MM AM/PM"
 */
export function formatDateWithTime(date: string | null | undefined): string {
  if (!date || !isValidDate(date)) {
    return 'No date set'
  }
  
  try {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  } catch (error) {
    return 'No date set'
  }
}

/**
 * Converts a date to ISO string format for form inputs
 * Returns empty string if date is invalid
 * Uses UTC to avoid timezone shifts
 */
export function formatDateForInput(date: string | null | undefined): string {
  if (!date || !isValidDate(date)) {
    return ''
  }
  
  try {
    const dateObj = parseISO(date)
    // Format as YYYY-MM-DD using UTC to avoid timezone shifts
    const year = dateObj.getUTCFullYear()
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch (error) {
    return ''
  }
}

/**
 * Converts a date input (YYYY-MM-DD) to ISO string for database storage
 * Uses UTC to avoid timezone shifts
 */
export function dateInputToISO(dateInput: string): string | null {
  if (!dateInput || !dateInput.trim()) {
    return null
  }
  
  try {
    // Parse YYYY-MM-DD and create UTC date at midnight
    const [year, month, day] = dateInput.split('-').map(Number)
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return null
    }
    
    // Create date in UTC to avoid timezone shifts
    const dateObj = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
    if (isNaN(dateObj.getTime())) {
      return null
    }
    
    return dateObj.toISOString()
  } catch (error) {
    return null
  }
}

/**
 * Calculates a default due date based on created_at date and user's default settings
 * @param createdAt - The project creation date (ISO string)
 * @param value - The number (1-99) from user's default setting
 * @param unit - The unit ('days', 'weeks', or 'months') from user's default setting
 * @returns ISO string of the calculated due date, or null if invalid
 */
export function calculateDefaultDueDate(
  createdAt: string | null | undefined,
  value: number,
  unit: 'days' | 'weeks' | 'months'
): string | null {
  if (!createdAt || !isValidDate(createdAt)) {
    return null
  }

  if (!value || value < 1 || value > 99) {
    return null
  }

  try {
    const baseDate = parseISO(createdAt)
    let futureDate: Date

    switch (unit) {
      case 'days':
        futureDate = addDays(baseDate, value)
        break
      case 'weeks':
        futureDate = addWeeks(baseDate, value)
        break
      case 'months':
        futureDate = addMonths(baseDate, value)
        break
      default:
        return null
    }

    return futureDate.toISOString()
  } catch (error) {
    return null
  }
}

/**
 * Gets the effective due date for a project
 * Returns the project's due_date if set, otherwise calculates from created_at + user defaults
 * @param project - Project object with due_date and created_at
 * @param userDefaultValue - User's default due date value (1-99)
 * @param userDefaultUnit - User's default due date unit ('days', 'weeks', 'months')
 * @returns ISO string of the effective due date, or null if cannot be determined
 */
export function getEffectiveDueDate(
  project: { due_date?: string | null; created_at?: string | null },
  userDefaultValue: number,
  userDefaultUnit: 'days' | 'weeks' | 'months'
): string | null {
  // If project has a due_date set, use it
  if (project.due_date && isValidDate(project.due_date)) {
    return project.due_date
  }

  // Otherwise, calculate from created_at + user defaults
  if (project.created_at && isValidDate(project.created_at)) {
    return calculateDefaultDueDate(project.created_at, userDefaultValue, userDefaultUnit)
  }

  return null
}

