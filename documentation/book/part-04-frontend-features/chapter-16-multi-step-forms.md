# Chapter 16: Multi-Step Forms

This chapter covers implementing the multi-step project creation form with progress tracking and validation.

---

## Form Wizard Architecture

The project creation uses a 4-step wizard:

```
Step 1: Project Details    → Title, retailer, due date
Step 2: Add Items          → Upload images, name items
Step 3: Project Overview   → Review items, edit parts
Step 4: Review & Submit    → Final confirmation
```

---

## Step Configuration

```typescript
// Step definitions
const steps = [
  { id: 1, title: 'Project Details', description: 'Basic project information' },
  { id: 2, title: 'Add Items', description: 'Add items to be rendered' },
  { id: 3, title: 'Project Overview', description: 'Manage and edit items' },
  { id: 4, title: 'Review', description: 'Review and submit project' },
]
```

---

## Form State Management

```typescript
// File: app/project/new/page.tsx (state management portion)

const [currentStep, setCurrentStep] = useState(1)
const [formData, setFormData] = useState({
  title: '',
  retailer: '',
  due_date: '',
  items: [] as any[],
})

// Navigation handlers
const handleNext = () => {
  if (currentStep < steps.length) {
    setCurrentStep(currentStep + 1)
  }
}

const handlePrevious = () => {
  if (currentStep > 1) {
    setCurrentStep(currentStep - 1)
  }
}

// Step completion validation
const isStepComplete = (step: number) => {
  switch (step) {
    case 1:
      return formData.title && formData.retailer
    case 2:
      return formData.items.length > 0 && formData.items.every(item => item.name)
    case 3:
      return formData.items.length > 0
    case 4:
      return formData.title && formData.retailer && formData.items.length > 0
    default:
      return false
  }
}
```

---

## Progress Bar Component

```typescript
// File: components/ui/animated-progress-bar.tsx

'use client'

import { useTheme } from '@/lib/theme-context'

interface Step {
  id: number
  title: string
  description: string
}

interface AnimatedProgressBarProps {
  steps: Step[]
  currentStep: number
}

export function AnimatedProgressBar({ steps, currentStep }: AnimatedProgressBarProps) {
  const { colors } = useTheme()
  
  return (
    <div className="w-full">
      {/* Progress line */}
      <div className="relative flex justify-between mb-8">
        {/* Background line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-700" />
        
        {/* Progress line */}
        <div 
          className="absolute top-5 left-0 h-0.5 transition-all duration-500"
          style={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            backgroundColor: colors.primary
          }}
        />
        
        {/* Step indicators */}
        {steps.map((step) => (
          <div 
            key={step.id}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Circle */}
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                font-medium transition-all duration-300
                ${step.id <= currentStep 
                  ? 'text-white' 
                  : 'bg-gray-700 text-gray-400'
                }
              `}
              style={{
                backgroundColor: step.id <= currentStep ? colors.primary : undefined
              }}
            >
              {step.id < currentStep ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            
            {/* Label */}
            <div className="mt-3 text-center">
              <p className={`text-sm font-medium ${
                step.id <= currentStep ? 'text-white' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
              <p className="text-xs text-gray-500 hidden sm:block">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Step 1: Project Details

```typescript
function ProjectDetailsStep({ formData, setFormData, colors }: any) {
  const retailers = ['Amazon', 'Walmart', 'Target', 'Best Buy', 'Home Depot']

  return (
    <div className="space-y-6">
      {/* Project Title */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Project Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white"
          placeholder="Enter project title"
        />
      </div>

      {/* Retailer */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Retailer <span className="text-red-400">*</span>
        </label>
        <select
          value={formData.retailer}
          onChange={(e) => setFormData({ ...formData, retailer: e.target.value })}
          className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white"
        >
          <option value="">Select a retailer</option>
          {retailers.map((retailer) => (
            <option key={retailer} value={retailer}>{retailer}</option>
          ))}
        </select>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Due Date <span className="text-gray-500">(Optional)</span>
        </label>
        <input
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          className="w-full px-4 py-3 bg-[#0d1117] border border-gray-700 rounded-lg text-white"
          style={{ colorScheme: 'dark' }}
        />
      </div>
    </div>
  )
}
```

---

## Step 2: Add Items

```typescript
function ItemsStep({ formData, setFormData, colors }: any) {
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', hero_image: '' }],
    })
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_: any, i: number) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium text-white">Items to Render</h3>
        <button
          onClick={addItem}
          className="px-4 py-2 rounded-lg font-medium"
          style={{ backgroundColor: colors.primary }}
        >
          Add Item
        </button>
      </div>

      {formData.items.map((item: any, index: number) => (
        <div key={index} className="bg-[#0d1117] border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-white">Item {index + 1}</h4>
            <button
              onClick={() => removeItem(index)}
              className="text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white mb-2">Item Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                className="w-full px-4 py-3 bg-[#070e0e] border border-gray-700 rounded-lg text-white"
                placeholder="Enter item name"
              />
            </div>
            <div>
              <label className="block text-sm text-white mb-2">Hero Image</label>
              <FileUpload
                value={item.hero_image}
                onChange={(url) => updateItem(index, 'hero_image', url)}
              />
            </div>
          </div>
        </div>
      ))}

      {formData.items.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-xl">
          <p className="text-gray-400 mb-4">No items added yet</p>
          <button
            onClick={addItem}
            className="px-6 py-3 rounded-lg"
            style={{ backgroundColor: colors.primary }}
          >
            Add Your First Item
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## Form Submission

```typescript
const handleSubmit = async () => {
  try {
    // Prepare data
    const cleanData = {
      title: formData.title,
      retailer: formData.retailer,
      due_date: formData.due_date ? dateInputToISO(formData.due_date) : null,
      items: formData.items.map((item: any) => ({
        id: crypto.randomUUID(),
        name: item.name,
        hero_image: item.hero_image || '',
        parts: (item.parts || []).map((part: any) => ({
          id: crypto.randomUUID(),
          name: part.name,
          finish: part.finish,
          color: part.color || '',
          texture: part.texture,
          files: part.files || [],
        })),
      })),
    }

    const project = await createProject(cleanData)
    
    if (project) {
      router.push(`/project/success?id=${project.id}&title=${encodeURIComponent(project.title)}`)
    }
  } catch (err) {
    console.error('Failed to create project:', err)
    setError('Failed to create project')
  }
}
```

---

## Zod Validation

```typescript
// File: types/schemas.ts

import { z } from 'zod'

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  retailer: z.string().min(1, 'Retailer is required'),
  due_date: z.string().optional(),
  items: z.array(
    z.object({
      name: z.string().min(1, 'Item name is required'),
      hero_image: z.string().optional(),
      parts: z.array(
        z.object({
          name: z.string().min(1, 'Part name is required'),
          finish: z.string().min(1, 'Finish is required'),
          color: z.string(),
          texture: z.string().min(1, 'Texture is required'),
          files: z.array(z.string()).default([]),
        })
      ).default([]),
    })
  ).min(1, 'At least one item is required'),
})

export type ProjectFormData = z.infer<typeof createProjectSchema>
```

---

## Chapter Summary

Multi-step forms include:

1. **Step configuration** - Define wizard steps
2. **Progress bar** - Visual progress indicator
3. **Step components** - Individual form sections
4. **Validation** - Per-step and final validation
5. **State management** - Track form data across steps

Key patterns:
- Validate each step before allowing next
- Persist form state across step navigation
- Support going back without losing data
- Show clear progress indication

---

*Next: [Chapter 17: Image Annotation](./chapter-17-image-annotation.md) - Canvas system and markers*
