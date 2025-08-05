import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createProjectSchema } from '@/types/schemas'

describe('Core Render Portal', () => {
  it('should validate project schema correctly', () => {
    const validProject = {
      title: 'Test Project',
      retailer: 'Test Retailer',
      items: [
        {
          name: 'Test Item',
          hero_image: 'https://example.com/image.jpg',
          parts: [
            {
              name: 'Test Part',
              finish: 'Matte',
              color: 'Red',
              texture: 'Smooth',
              files: [],
            },
          ],
        },
      ],
    }

    const result = createProjectSchema.safeParse(validProject)
    expect(result.success).toBe(true)
  })

  it('should reject invalid project data', () => {
    const invalidProject = {
      title: '', // Empty title should fail
      retailer: 'Test Retailer',
      items: [],
    }

    const result = createProjectSchema.safeParse(invalidProject)
    expect(result.success).toBe(false)
  })

  it('should require at least one item', () => {
    const projectWithoutItems = {
      title: 'Test Project',
      retailer: 'Test Retailer',
      items: [],
    }

    const result = createProjectSchema.safeParse(projectWithoutItems)
    expect(result.success).toBe(false)
  })
}) 