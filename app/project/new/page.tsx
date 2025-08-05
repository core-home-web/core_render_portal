'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormStep } from '@/types'

const steps: FormStep[] = [
  {
    id: 1,
    title: 'Project Details',
    description: 'Basic project information',
    isComplete: false,
  },
  {
    id: 2,
    title: 'Items',
    description: 'Add items to render',
    isComplete: false,
  },
  {
    id: 3,
    title: 'Parts',
    description: 'Configure parts for each item',
    isComplete: false,
  },
  {
    id: 4,
    title: 'Review',
    description: 'Review and submit',
    isComplete: false,
  },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    retailer: '',
    items: [],
  })

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

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const project = await response.json()
        router.push('/dashboard')
      } else {
        console.error('Failed to create project')
      }
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ProjectDetailsStep formData={formData} setFormData={setFormData} />
      case 2:
        return <ItemsStep formData={formData} setFormData={setFormData} />
      case 3:
        return <PartsStep formData={formData} setFormData={setFormData} />
      case 4:
        return <ReviewStep formData={formData} />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-muted-foreground">
            Set up a new 3D render project
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current step title */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            onClick={currentStep === steps.length ? handleSubmit : handleNext}
            disabled={currentStep === steps.length && (!formData.title || !formData.retailer || formData.items.length === 0)}
          >
            {currentStep === steps.length ? 'Submit' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProjectDetailsStep({ formData, setFormData }: any) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Project Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded-md"
          placeholder="Enter project title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Retailer</label>
        <input
          type="text"
          value={formData.retailer}
          onChange={(e) => setFormData({ ...formData, retailer: e.target.value })}
          className="w-full p-2 border rounded-md"
          placeholder="Enter retailer name"
        />
      </div>
    </div>
  )
}

function ItemsStep({ formData, setFormData }: any) {
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Items</h3>
        <Button onClick={addItem} size="sm">
          Add Item
        </Button>
      </div>
      
      {formData.items.map((item: any, index: number) => (
        <div key={index} className="border rounded-md p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Item {index + 1}</h4>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeItem(index)}
            >
              Remove
            </Button>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Item Name</label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter item name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Hero Image URL</label>
            <input
              type="text"
              value={item.hero_image}
              onChange={(e) => updateItem(index, 'hero_image', e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter image URL"
            />
          </div>
        </div>
      ))}
      
      {formData.items.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          No items added yet. Click "Add Item" to get started.
        </p>
      )}
    </div>
  )
}

function PartsStep({ formData, setFormData }: any) {
  const addPart = (itemIndex: number) => {
    const newItems = [...formData.items]
    if (!newItems[itemIndex].parts) {
      newItems[itemIndex].parts = []
    }
    newItems[itemIndex].parts.push({
      name: '',
      finish: '',
      color: '',
      texture: '',
      files: [],
    })
    setFormData({ ...formData, items: newItems })
  }

  const updatePart = (itemIndex: number, partIndex: number, field: string, value: string) => {
    const newItems = [...formData.items]
    newItems[itemIndex].parts[partIndex] = {
      ...newItems[itemIndex].parts[partIndex],
      [field]: value,
    }
    setFormData({ ...formData, items: newItems })
  }

  const removePart = (itemIndex: number, partIndex: number) => {
    const newItems = [...formData.items]
    newItems[itemIndex].parts = newItems[itemIndex].parts.filter(
      (_: any, i: number) => i !== partIndex
    )
    setFormData({ ...formData, items: newItems })
  }

  return (
    <div className="space-y-6">
      {formData.items.map((item: any, itemIndex: number) => (
        <div key={itemIndex} className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{item.name || `Item ${itemIndex + 1}`}</h3>
            <Button onClick={() => addPart(itemIndex)} size="sm">
              Add Part
            </Button>
          </div>
          
          {item.parts && item.parts.map((part: any, partIndex: number) => (
            <div key={partIndex} className="border rounded-md p-4 mb-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Part {partIndex + 1}</h4>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removePart(itemIndex, partIndex)}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Part Name</label>
                  <input
                    type="text"
                    value={part.name}
                    onChange={(e) => updatePart(itemIndex, partIndex, 'name', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter part name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Finish</label>
                  <input
                    type="text"
                    value={part.finish}
                    onChange={(e) => updatePart(itemIndex, partIndex, 'finish', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter finish"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <input
                    type="text"
                    value={part.color}
                    onChange={(e) => updatePart(itemIndex, partIndex, 'color', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter color"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Texture</label>
                  <input
                    type="text"
                    value={part.texture}
                    onChange={(e) => updatePart(itemIndex, partIndex, 'texture', e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter texture"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(!item.parts || item.parts.length === 0) && (
            <p className="text-muted-foreground text-center py-4">
              No parts added yet. Click "Add Part" to get started.
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function ReviewStep({ formData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Project Details</h3>
        <div className="space-y-2">
          <p><strong>Title:</strong> {formData.title}</p>
          <p><strong>Retailer:</strong> {formData.retailer}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Items ({formData.items.length})</h3>
        {formData.items.map((item: any, index: number) => (
          <div key={index} className="border rounded-md p-4 mb-4">
            <h4 className="font-medium">{item.name || `Item ${index + 1}`}</h4>
            {item.hero_image && (
              <p className="text-sm text-muted-foreground">Hero Image: {item.hero_image}</p>
            )}
            {item.parts && item.parts.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium">Parts ({item.parts.length}):</p>
                <ul className="text-sm text-muted-foreground ml-4">
                  {item.parts.map((part: any, partIndex: number) => (
                    <li key={partIndex}>
                      {part.name} - {part.finish}, {part.color}, {part.texture}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 