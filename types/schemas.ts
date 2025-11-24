import { z } from 'zod'

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  retailer: z.string().min(1, 'Retailer is required'),
})

export const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  hero_image: z.string().optional(),
})

export const partSchema = z.object({
  name: z.string().min(1, 'Part name is required'),
  finish: z.string().min(1, 'Finish is required'),
  color: z.string().min(1, 'Color is required'),
  texture: z.string().min(1, 'Texture is required'),
  files: z.array(z.string()).default([]),
})

// Version schema for the new versions system
export const versionSchema = z.object({
  id: z.string(),
  versionNumber: z.number(),
  versionName: z.string().optional(),
  parts: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Part name is required'),
        finish: z.string().min(1, 'Finish is required'),
        color: z.string().min(1, 'Color is required'),
        texture: z.string().min(1, 'Texture is required'),
        files: z.array(z.string()).default([]),
        notes: z.string().optional(),
        annotation_data: z.object({
          x: z.number(),
          y: z.number(),
          id: z.string(),
        }).optional(),
      })
    )
    .default([]),
  created_at: z.string().optional(),
})

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  retailer: z.string().min(1, 'Retailer is required'),
  items: z
    .array(
      z.object({
        name: z.string().min(1, 'Item name is required'),
        hero_image: z.string().optional(),
        // Support both legacy parts and new versions format
        parts: z
          .array(
            z.object({
              id: z.string().optional(),
              name: z.string().min(1, 'Part name is required'),
              finish: z.string().min(1, 'Finish is required'),
              color: z.string().min(1, 'Color is required'),
              texture: z.string().min(1, 'Texture is required'),
              files: z.array(z.string()).default([]),
              notes: z.string().optional(),
              annotation_data: z.object({
                x: z.number(),
                y: z.number(),
                id: z.string(),
              }).optional(),
            })
          )
          .default([])
          .optional(),
        versions: z.array(versionSchema).optional(),
      })
    )
    .min(1, 'At least one item is required'),
})

export type ProjectFormData = z.infer<typeof createProjectSchema>
export type ItemFormData = z.infer<typeof itemSchema>
export type PartFormData = z.infer<typeof partSchema>
