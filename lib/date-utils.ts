/**
 * Date utility functions for safe date formatting
 * Handles null, undefined, and invalid dates gracefully
 */

/**
 * Validates if a date string is valid
 */
export function isValidDate(date: string | null | undefined): boolean {
  if (!date) return false
  const parsed = new Date(date)
  return !isNaN(parsed.getTime())
}

/**
 * Formats a date string for display
 * Returns "No date set" for invalid/null/undefined dates
 * Format: "MMM DD, YYYY" (e.g., "Dec 15, 2024")
 */
export function formatDateForDisplay(date: string | null | undefined): string {
  if (!date || !isValidDate(date)) {
    return 'No date set'
  }
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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
 */
export function formatDateForInput(date: string | null | undefined): string {
  if (!date || !isValidDate(date)) {
    return ''
  }
  
  try {
    const dateObj = new Date(date)
    return dateObj.toISOString().split('T')[0] // Returns YYYY-MM-DD format
  } catch (error) {
    return ''
  }
}

