# Chapter 29: Testing

This chapter covers testing strategies and examples for the Core Render Portal.

---

## Testing Stack

- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing
- **jsdom** - Browser environment simulation

---

## Configuration

```typescript
// File: vitest.config.ts

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

---

## Test Setup

```typescript
// File: tests/setup.ts

import '@testing-library/jest-dom'
```

---

## Example Test

```typescript
// File: tests/example.test.ts

import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('combines class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })
})
```

---

## Running Tests

```bash
# Run tests once
pnpm test

# Watch mode
pnpm test -- --watch

# Coverage report
pnpm test -- --coverage
```

---

*Next: [Chapter 30: Troubleshooting](./chapter-30-troubleshooting.md)*
