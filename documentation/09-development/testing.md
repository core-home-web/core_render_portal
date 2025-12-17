# Testing

How to write and run tests for the Core Render Portal.

## Testing Stack

- **Vitest** - Test runner
- **React Testing Library** - Component testing
- **jsdom** - DOM environment

## Running Tests

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage

# Run specific file
pnpm test src/components/Button.test.tsx

# Watch mode (re-run on changes)
pnpm test -- --watch
```

## Test File Location

Place tests next to the file being tested:

```
components/
├── ui/
│   ├── button.tsx
│   └── button.test.tsx
├── project/
│   ├── project-card.tsx
│   └── project-card.test.tsx
```

Or in a `tests/` folder:

```
tests/
├── setup.ts
├── components/
│   └── button.test.tsx
└── hooks/
    └── useProject.test.tsx
```

## Writing Tests

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Hook Tests

```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useProject } from './useProject'

// Mock Supabase
vi.mock('@/lib/supaClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: '1', title: 'Test' },
            error: null
          }))
        }))
      }))
    }))
  }
}))

describe('useProject', () => {
  it('fetches project data', async () => {
    const { result } = renderHook(() => useProject('1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.project?.title).toBe('Test')
  })
})
```

### Utility Function Tests

```typescript
import { describe, it, expect } from 'vitest'
import { formatDate, cn } from './utils'

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('Jan 15, 2024')
  })

  it('handles null', () => {
    expect(formatDate(null)).toBe('')
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', true && 'active')).toBe('base active')
    expect(cn('base', false && 'active')).toBe('base')
  })
})
```

## Mocking

### Mock Functions

```typescript
import { vi } from 'vitest'

const mockFn = vi.fn()
mockFn('arg1', 'arg2')

expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
```

### Mock Modules

```typescript
vi.mock('@/lib/supaClient', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    })
  }
}))
```

### Mock Implementations

```typescript
const mockFetch = vi.fn()

// Different returns for different calls
mockFetch
  .mockResolvedValueOnce({ data: 'first' })
  .mockResolvedValueOnce({ data: 'second' })
```

## Test Setup

### Global Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

## Test Patterns

### Arrange-Act-Assert

```typescript
it('saves project when form submitted', async () => {
  // Arrange
  const onSave = vi.fn()
  render(<ProjectForm onSave={onSave} />)

  // Act
  await userEvent.type(screen.getByLabelText('Title'), 'My Project')
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))

  // Assert
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'My Project' })
  )
})
```

### Testing Loading States

```typescript
it('shows loading state', () => {
  render(<ProjectList loading={true} projects={[]} />)
  expect(screen.getByText('Loading...')).toBeInTheDocument()
})

it('shows projects when loaded', () => {
  render(<ProjectList loading={false} projects={[mockProject]} />)
  expect(screen.getByText(mockProject.title)).toBeInTheDocument()
})
```

### Testing Error States

```typescript
it('shows error message on failure', async () => {
  vi.mocked(fetchProject).mockRejectedValue(new Error('Network error'))
  
  render(<ProjectView projectId="1" />)
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

## Coverage

### Run Coverage

```bash
pnpm test:coverage
```

### Coverage Goals

- Aim for 80%+ coverage on critical paths
- 100% coverage on utility functions
- Focus on behavior, not lines

### Coverage Report

```
File               | % Stmts | % Branch | % Funcs | % Lines
-------------------|---------|----------|---------|--------
components/        |   85.71 |    75.00 |   90.00 |   85.71
hooks/             |   92.30 |    83.33 |   88.88 |   92.30
lib/               |  100.00 |   100.00 |  100.00 |  100.00
```

## Best Practices

1. **Test behavior, not implementation**
2. **Keep tests focused** - One concept per test
3. **Use meaningful names** - Describe what's being tested
4. **Don't test library code** - Trust React, Supabase, etc.
5. **Clean up after tests** - Use cleanup utilities
6. **Mock external services** - Database, APIs, etc.

---

← [Coding Standards](./coding-standards.md) | Next: [Debugging](./debugging.md) →

