# Chapter 27: Utility Functions

This chapter documents utility functions and helpers.

---

## cn() - Class Name Utility

Combines Tailwind classes with conditional support:

```typescript
// File: lib/utils.ts

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Date Utilities

```typescript
// File: lib/date-utils.ts

export function formatDateForDisplay(date: string | undefined | null): string
export function formatDateForInput(date: string | undefined | null): string
export function dateInputToISO(dateInput: string): string | null
export function calculateDefaultDueDate(
  createdAt: string, 
  offsetValue: number, 
  offsetUnit: 'days' | 'weeks' | 'months'
): string
```

*See Chapter 12 for complete implementations.*

---

## Part 5 Complete

This concludes the components and code deep dive. Refer to specific feature chapters for complete code implementations.

---

*Continue to [Part 6: Deployment](../part-06-deployment/README.md)*
